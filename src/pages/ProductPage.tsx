import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { Cite } from '../components/Cite'
import { Reveal } from '../components/Motion'
import data from '../data/counties.json'
import { flagged13D, ID } from '../data/facts'
import { matchFood, type FoodMatch } from '../lib/foodMatch'

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
  const [scanNote, setScanNote] = useState('')
  const [scanning, setScanning] = useState(false)
  const [beam, setBeam] = useState(22)
  const [holding, setHolding] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  const stopRef = useRef<(() => void) | null>(null)
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0 })

  useEffect(() => () => stopRef.current?.(), [])

  useEffect(() => {
    if (holding) return
    let y = beam
    let dir = 1
    let frame = 0
    const tick = () => {
      y += dir * 0.38
      if (y >= 86) dir = -1
      if (y <= 12) dir = 1
      setBeam(y)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [holding])

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

  async function choose(product: OffProduct) {
    const blob = [product.product_name, product.brands, product.categories, product.ingredients_text].filter(Boolean).join(' ')
    const match = matchFood(blob)
    const organic = (product.labels_tags ?? []).some((t) => t.includes('organic'))
    setHit({ product, organic, match, fromCatalog: true })
    setChoices([])
    const altTerm = match.kind === 'crop' ? `organic ${match.label}` : `organic ${product.product_name ?? ''}`.trim()
    const altRes = await fetch(`/api/product?q=${encodeURIComponent(altTerm)}`)
    if (altRes.ok) {
      const body = (await altRes.json()) as { products?: OffProduct[] }
      setAlts((body.products ?? []).filter((p) => p.code !== product.code).slice(0, 4))
    }
    if (/^\d{5}$/.test(zip.trim())) await loadPlace(zip.trim())
  }

  async function lookup(raw: string) {
    const text = raw.trim()
    if (text.length < 2) {
      setError('Type a product name or a barcode.')
      return
    }
    setBusy(true)
    setError('')
    setHit(null)
    setAlts([])
    setStores([])
    setCountyName('')
    const digits = text.replace(/\D/g, '')
    const isBarcode = digits.length >= 8 && digits.length <= 14 && digits === text.replace(/\s/g, '')
    try {
      const res = await fetch(isBarcode ? `/api/product?barcode=${digits}` : `/api/product?q=${encodeURIComponent(text)}`)
      if (!res.ok) {
        if (!isBarcode) {
          setHit({
            product: { product_name: text },
            organic: /organic/i.test(text),
            match: matchFood(text),
            fromCatalog: false,
          })
          if (/^\d{5}$/.test(zip.trim())) await loadPlace(zip.trim())
        } else {
          setError('No answer for that barcode. The product catalog may be busy. Try the name on the package.')
        }
        setBusy(false)
        return
      }
      const body = (await res.json()) as { status?: number; product?: OffProduct; products?: OffProduct[] }
      if (isBarcode) {
        const product = body.status === 1 ? asProduct(body.product) : null
        if (!product) setError('No public record for that barcode. Try the name on the package.')
        else await choose(product)
      } else {
        const products = (body.products ?? []).map(asProduct).filter((p): p is OffProduct => Boolean(p))
        if (products.length === 0) {
          setHit({
            product: { product_name: text },
            organic: /organic/i.test(text),
            match: matchFood(text),
            fromCatalog: false,
          })
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
      setScanNote('This browser can’t scan barcodes. Type the number under the barcode instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      setScanning(true)
      setScanNote('Point the camera at the barcode.')
      const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] })
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
            setQuery(value)
            stopScan()
            void lookup(value)
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
          A barcode identifies the package. It does not list pesticides. This page reads the public Open
          Food Facts record, then shows California crop-spray records only when the food maps to a crop
          we have data for<Cite n={[ID.dprTop5]} />.
        </p>
      </Reveal>

      <div className="product-layout">
        <Reveal className="soft-card builder">
          <form onSubmit={onSubmit}>
            <label htmlFor="product">Product name or barcode</label>
            <input id="product" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Whole Foods parmesan, or 012345678905" />
            <label htmlFor="pzip">Zip, for nearby stores <small>(optional)</small></label>
            <input id="pzip" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="95336" maxLength={5} />
            <div className="hero-cta">
              <button className="btn" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Check product'}</button>
              <button className="btn ghost" type="button" onClick={() => (scanning ? stopScan() : void startScan())}>
                {scanning ? 'Stop camera' : 'Scan barcode'}
              </button>
            </div>
          </form>
          <div
            ref={scanRef}
            className={`scan-stage${scanning ? ' live' : ''}${holding ? ' hold' : ''}`}
            style={{ ['--beam' as string]: `${beam}%` }}
            role="button"
            tabIndex={0}
            aria-label={scanning ? 'Live scanner. Drag the beam, or click to stop the camera.' : 'Scanner. Click to open the camera. Drag the beam to aim it.'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                if (scanning) stopScan()
                else void startScan()
              }
            }}
            onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
              if ((e.target as HTMLElement).closest('button')) return
              dragRef.current = { active: true, moved: false, startX: e.clientX, startY: e.clientY }
              setHolding(true)
              e.currentTarget.setPointerCapture(e.pointerId)
              const box = scanRef.current
              if (!box) return
              const r = box.getBoundingClientRect()
              setBeam(Math.min(88, Math.max(10, ((e.clientY - r.top) / r.height) * 100)))
            }}
            onPointerMove={(e: ReactPointerEvent<HTMLDivElement>) => {
              if (!dragRef.current.active) return
              if (Math.abs(e.clientX - dragRef.current.startX) + Math.abs(e.clientY - dragRef.current.startY) > 6) {
                dragRef.current.moved = true
              }
              const box = scanRef.current
              if (!box) return
              const r = box.getBoundingClientRect()
              setBeam(Math.min(88, Math.max(10, ((e.clientY - r.top) / r.height) * 100)))
            }}
            onPointerUp={() => {
              const wasDrag = dragRef.current.moved
              dragRef.current.active = false
              setHolding(false)
              if (!wasDrag) {
                if (scanning) stopScan()
                else void startScan()
              }
            }}
            onPointerCancel={() => {
              dragRef.current.active = false
              setHolding(false)
            }}
          >
            <video ref={videoRef} className={scanning ? 'scanner on' : 'scanner'} muted playsInline />
            <div className="scan-frame" aria-hidden="true" />
            <div className="scan-beam" aria-hidden="true" />
            <p className="scan-hint">
              {scanning ? 'Drag the beam to aim. Click to stop.' : 'Click to scan. Drag the beam to preview.'}
            </p>
          </div>
          {scanNote && <p className="note">{scanNote}</p>}
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
          {!hit && <p>Results show up here. Try a cheese, a bag of almonds, or grapes.</p>}
          {hit && (
            <>
              {!hit.fromCatalog && (
                <p className="note">The product catalog didn’t return a package for that name, so this uses your words plus California crop records. It is not a test of a specific brand.</p>
              )}
              <div className="product-head">
                {hit.product.image_front_small_url && <img src={hit.product.image_front_small_url} alt="" />}
                <div>
                  <h2>{hit.product.product_name}</h2>
                  <p>{hit.product.brands} {hit.product.code && <small>· {hit.product.code}</small>}</p>
                </div>
              </div>
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

      {(alts.length > 0 || stores.length > 0) && (
        <section className="split-results">
          {alts.length > 0 && (
            <div className="soft-card">
              <h2>Other products in the public catalog</h2>
              <p className="note">These are search hits for an organic version. They are not a cleanliness score, and stock near you isn’t published.</p>
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
            </div>
          )}
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
      )}
    </>
  )
}
