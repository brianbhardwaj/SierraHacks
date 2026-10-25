import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Cite } from '../components/Cite'
import { Reveal } from '../components/Motion'
import data from '../data/counties.json'
import { flagged13D, ID } from '../data/facts'
import { matchFood, type FoodMatch } from '../lib/foodMatch'
import { interpretScan } from '../lib/scan'

type OffProduct = {
  code?: string
  product_name?: string
  brands?: string
  image_front_small_url?: string
  categories?: string
  labels_tags?: string[]
  ingredients_text?: string
}

type Store = { name: string; kind: string }

type Hit = {
  product: OffProduct
  organic: boolean
  match: FoodMatch
  fromCatalog: boolean
}

type SproutProduct = {
  description: string
  healthier: { name: string; why: string; query: string }[]
}

function asProduct(raw: OffProduct | undefined): OffProduct | null {
  if (!raw?.product_name && !raw?.code) return null
  return raw
}

export function ProductPage() {
  const [query, setQuery] = useState('')
  const [zip, setZip] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [choices, setChoices] = useState<OffProduct[]>([])
  const [hit, setHit] = useState<Hit | null>(null)
  const [countyName, setCountyName] = useState('')
  const [stores, setStores] = useState<Store[]>([])
  const [alts, setAlts] = useState<OffProduct[]>([])
  const [insight, setInsight] = useState<SproutProduct | null>(null)
  const [insightBusy, setInsightBusy] = useState(false)
  const [scanNote, setScanNote] = useState('')
  const [scanning, setScanning] = useState(false)
  const lastQr = useRef('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => () => stopRef.current?.(), [])

  function stopScan() {
    stopRef.current?.()
    stopRef.current = null
    setScanning(false)
  }

  async function loadPlace(zipCode: string) {
    if (!/^\d{5}$/.test(zipCode)) return
    const geoRes = await fetch(`/api/geo?q=${encodeURIComponent(zipCode)}`)
    if (!geoRes.ok) return
    const place = (await geoRes.json()) as { lat: number; lon: number; county: string; state: string }
    if (place.state && place.state !== 'California') return
    setCountyName(place.county)
    const storeRes = await fetch(`/api/stores?q=${encodeURIComponent(`${place.county || zipCode}, California`)}`)
    if (storeRes.ok) {
      const body = (await storeRes.json()) as { stores?: Store[] }
      setStores(body.stores ?? [])
    }
  }

  async function loadInsight(product: OffProduct, match: FoodMatch) {
    setInsight(null)
    setInsightBusy(true)
    try {
      const res = await fetch('/api/sprout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'product',
          product: {
            name: product.product_name,
            brands: product.brands,
            code: product.code,
            categories: product.categories,
            ingredients: product.ingredients_text,
            qr: lastQr.current,
          },
          match,
        }),
      })
      if (res.ok) setInsight((await res.json()) as SproutProduct)
    } catch {
      /* catalog result still stands */
    }
    setInsightBusy(false)
  }

  async function choose(product: OffProduct) {
    const blob = [product.product_name, product.brands, product.categories, product.ingredients_text].filter(Boolean).join(' ')
    const match = matchFood(blob)
    const organic = (product.labels_tags ?? []).some((t) => t.includes('organic'))
    setHit({ product, organic, match, fromCatalog: true })
    setChoices([])
    void loadInsight(product, match)
    const altTerm = match.kind === 'crop' ? `organic ${match.label}` : `organic ${product.product_name ?? ''}`.trim()
    const altRes = await fetch(`/api/product?q=${encodeURIComponent(altTerm)}`)
    if (altRes.ok) {
      const body = (await altRes.json()) as { products?: OffProduct[] }
      setAlts((body.products ?? []).filter((p) => p.code !== product.code).slice(0, 4))
    }
    if (/^\d{5}$/.test(zip.trim())) await loadPlace(zip.trim())
  }

  async function lookup(raw: string, scanned = false) {
    const text = raw.trim()
    if (text.length < 2) {
      setError('Type a product name, barcode, or scan a QR code.')
      return
    }
    const scan = scanned || /https?:\/\//i.test(text) ? interpretScan(text) : null
    lastQr.current = scan?.qr ?? ''
    const lookupText = scan?.barcode || scan?.query || text
    setBusy(true)
    setError('')
    setHit(null)
    setAlts([])
    setInsight(null)
    setStores([])
    setCountyName('')
    const digits = lookupText.replace(/\D/g, '')
    const isBarcode = Boolean(scan?.barcode) || (digits.length >= 8 && digits.length <= 14 && digits === lookupText.replace(/\s/g, ''))
    try {
      const res = await fetch(isBarcode ? `/api/product?barcode=${digits}` : `/api/product?q=${encodeURIComponent(lookupText)}`)
      if (!res.ok) {
        const fallback: OffProduct = { product_name: lookupText }
        const match = matchFood(lookupText)
        setHit({ product: fallback, organic: /organic/i.test(lookupText), match, fromCatalog: false })
        void loadInsight(fallback, match)
        if (/^\d{5}$/.test(zip.trim())) await loadPlace(zip.trim())
        setBusy(false)
        return
      }
      const body = (await res.json()) as { status?: number; product?: OffProduct; products?: OffProduct[] }
      if (isBarcode) {
        const product = body.status === 1 ? asProduct(body.product) : null
        if (!product) {
          const fallback: OffProduct = { product_name: lookupText, code: digits }
          const match = matchFood(lookupText)
          setHit({ product: fallback, organic: false, match, fromCatalog: false })
          void loadInsight(fallback, match)
        } else await choose(product)
      } else {
        const products = (body.products ?? []).map(asProduct).filter((p): p is OffProduct => Boolean(p))
        if (products.length === 0) {
          const fallback: OffProduct = { product_name: lookupText }
          const match = matchFood(lookupText)
          setHit({
            product: fallback,
            organic: /organic/i.test(lookupText),
            match,
            fromCatalog: false,
          })
          void loadInsight(fallback, match)
          if (/^\d{5}$/.test(zip.trim())) await loadPlace(zip.trim())
        }
        else if (products.length === 1) await choose(products[0])
        else setChoices(products)
      }
    } catch {
      setError('Product lookup needs the dev server running (`npm run dev`).')
    }
    setBusy(false)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void lookup(query)
  }

  async function startScan() {
    stopScan()
    const Detector = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setScanNote('This browser can’t scan barcodes or QR codes. Type the number under the barcode instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      setScanning(true)
      setScanNote('Point the camera at a food barcode or QR code.')
      const detector = new Detector({ formats: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] })
      let alive = true
      stopRef.current = () => {
        alive = false
        stream.getTracks().forEach((t) => t.stop())
        video.srcObject = null
      }
      const loop = async () => {
        if (!alive) return
        try {
          const codes = await detector.detect(video)
          const value = codes[0]?.rawValue
          if (value) {
            const parsed = interpretScan(value)
            setQuery(parsed.barcode || parsed.query || value)
            stopScan()
            void lookup(value, true)
            return
          }
        } catch {
          /* keep trying */
        }
        window.setTimeout(loop, 350)
      }
      void loop()
    } catch {
      setScanNote('Camera permission was blocked. Type the barcode instead.')
    }
  }

  const county = data.counties.find((c) => c.name.toLowerCase() === countyName.toLowerCase())
  const crop = hit?.match.kind === 'crop' && county
    ? county.crops.find((c) => c.name.toLowerCase().includes(hit.match.kind === 'crop' ? hit.match.needle : ''))
    : undefined

  return (
    <>
      <Reveal as="section" className="page-head lean-left">
        <p className="eyebrow">Check a product</p>
        <h1>Scan it, or type the name</h1>
        <p className="sub">
          A barcode or QR code identifies the package. Sprout looks it up online for a photo and
          description, then suggests healthier swaps. California crop-spray records appear only when
          the food maps to a crop we have data for<Cite n={[ID.dprTop5]} />.
        </p>
      </Reveal>

      <div className="product-layout">
        <Reveal className="soft-card builder">
          <form onSubmit={onSubmit}>
            <label htmlFor="product">Product name, barcode, or QR text</label>
            <input id="product" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Scan a QR, or try almonds / 012345678905" />
            <label htmlFor="pzip">Zip, for nearby stores <small>(optional)</small></label>
            <input id="pzip" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="95336" maxLength={5} />
            <div className="hero-cta">
              <button className="btn" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Check product'}</button>
              <button className="btn ghost" type="button" onClick={() => (scanning ? stopScan() : void startScan())}>
                {scanning ? 'Stop camera' : 'Scan barcode or QR'}
              </button>
            </div>
          </form>
          {scanNote && <p className="note">{scanNote}</p>}
          <video ref={videoRef} className={scanning ? 'scanner on' : 'scanner'} muted playsInline />
          {error && <p className="alert" role="alert">{error}</p>}
          {choices.length > 0 && (
            <ul className="choice-list">
              {choices.map((p) => (
                <li key={p.code}>
                  <button type="button" onClick={() => void choose(p)}>
                    {p.image_front_small_url && <img src={p.image_front_small_url} alt="" />}
                    <span><strong>{p.product_name}</strong><small>{p.brands}</small></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal className="soft-card letter" delay={60}>
          {!hit && <p>Results show up here. Scan a food QR, or try a cheese, a bag of almonds, or grapes.</p>}
          {hit && (
            <>
              {!hit.fromCatalog && (
                <p className="note">The public catalog didn’t return this exact package, so Sprout is working from the name or QR text plus California crop records. It is not a lab test of a specific brand.</p>
              )}
              <div className="product-head">
                {hit.product.image_front_small_url && <img src={hit.product.image_front_small_url} alt={hit.product.product_name || 'Product'} />}
                <div>
                  <h2>{hit.product.product_name}</h2>
                  <p>{hit.product.brands} {hit.product.code && <small>· {hit.product.code}</small>}</p>
                </div>
              </div>
              {insightBusy && <p className="note">Sprout is writing a description and healthier swaps…</p>}
              {insight?.description && <p className="ai-blurb">{insight.description}</p>}
              <p className={hit.organic ? 'ok' : 'alert'}>
                {hit.organic
                  ? 'This record is tagged organic in Open Food Facts. That is a label on the product file, not a lab test by this site.'
                  : 'This record is not tagged organic. That does not mean a lab found pesticides in this exact package.'}
              </p>
              {hit.match.kind === 'dairy' && (
                <p>
                  Cheese and other dairy foods are not sprayed as a crop. No public dataset lists the pesticides
                  inside this jar. Residues, if any, would come from animal feed and processing, and those tests
                  are not published per brand.
                </p>
              )}
              {hit.match.kind === 'unknown' && (
                <p>
                  This product doesn’t map to a Central Valley crop in our records, so there is no honest chemical
                  list to show for it.
                </p>
              )}
              {hit.match.kind === 'crop' && (
                <>
                  <p>
                    The closest public match is <strong>{hit.match.label}</strong>. Add a California zip to see the
                    top chemicals reported on that crop in your county<Cite n={[ID.dprTop5]} />.
                  </p>
                  {crop && (
                    <ul className="bars">
                      {crop.chems.map((c) => (
                        <li key={c.name} className={c.name.toLowerCase() === flagged13D ? 'bar flagged' : 'bar'}>
                          <span className="bar-name">{c.name}{c.name.toLowerCase() === flagged13D && <em className="flag">Prop 65 cancer list</em>}</span>
                          <span className="bar-val">{c.lbs.toLocaleString()} lb</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {county && !crop && (
                    <p className="note">{hit.match.label} is not in {county.name} County’s published top five crops, so this page won’t invent a chemical list.</p>
                  )}
                  {!county && <p className="note">No county selected yet. A zip in the form above adds it.</p>}
                </>
              )}
            </>
          )}
        </Reveal>
      </div>

      {(insight?.healthier.length || alts.length > 0 || stores.length > 0) ? (
        <section className="split-results">
          {(insight?.healthier.length || alts.length > 0) ? (
            <div className="soft-card">
              <h2>Healthier alternatives</h2>
              {insight?.healthier.length ? (
                <ul className="alt-list">
                  {insight.healthier.map((a) => (
                    <li key={a.name}>
                      <div>
                        <strong>{a.name}</strong>
                        <small>{a.why}</small>
                      </div>
                      <button type="button" className="btn small" onClick={() => { setQuery(a.query); void lookup(a.query) }}>Look up</button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {alts.length > 0 && (
                <>
                  <p className="note">Public catalog hits for an organic version. They are not a cleanliness score.</p>
                  <ul className="choice-list">
                    {alts.map((p) => (
                      <li key={p.code}>
                        <button type="button" onClick={() => void choose(p)}>
                          {p.image_front_small_url && <img src={p.image_front_small_url} alt="" />}
                          <span><strong>{p.product_name}</strong><small>{p.brands}</small></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : null}
          {stores.length > 0 && (
            <div className="soft-card">
              <h2>Ask a store near {zip}</h2>
              <ul className="store-list">
                {stores.slice(0, 6).map((s) => (
                  <li key={s.name}>
                    <strong>{s.name}</strong>
                    <Link className="btn small" to={`/email?store=${encodeURIComponent(s.name)}`}>Email</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : null}
    </>
  )
}
