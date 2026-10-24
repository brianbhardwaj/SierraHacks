import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { Cite } from '../components/Cite'
import { Reveal } from '../components/Motion'
import data from '../data/counties.json'
import { flagged13D, ID } from '../data/facts'
import { matchFood, type FoodMatch } from '../lib/foodMatch'
import { parseScanned } from '../lib/scanCode'

type OffProduct = {
  code?: string
  product_name?: string
  generic_name?: string
  brands?: string
  quantity?: string
  image_front_small_url?: string
  image_front_url?: string
  image_url?: string
  categories?: string
  labels?: string
  labels_tags?: string[]
  ingredients_text?: string
  packaging?: string
}

type Brief = { description: string; practices: string; alternatives: string }

type Store = { name: string; kind: string }

type Hit = {
  product: OffProduct
  organic: boolean
  match: FoodMatch
  fromCatalog: boolean
}

function asProduct(raw: OffProduct | undefined): OffProduct | null {
  if (!raw?.product_name && !raw?.generic_name && !raw?.code) return null
  return raw
}

function photo(p: OffProduct) {
  return p.image_front_url || p.image_url || p.image_front_small_url
}

function dbg(hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
  // #region agent log
  fetch('http://127.0.0.1:7932/ingest/4238acb4-ba8e-4c4c-857a-52471d1bd69a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9d36b3'},body:JSON.stringify({sessionId:'9d36b3',runId:'post-fix',hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
  const [brief, setBrief] = useState<Brief | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  const stopRef = useRef<(() => void) | null>(null)
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0 })

  useEffect(() => () => stopRef.current?.(), [])

  function stopScan() {
    stopRef.current?.()
    stopRef.current = null
    setScanning(false)
  }

  async function loadPlace(zipCode: string) {
    if (!/^\d{5}$/.test(zipCode)) return ''
    const geoRes = await fetch(`/api/geo?q=${encodeURIComponent(zipCode)}`)
    if (!geoRes.ok) return ''
    const place = (await geoRes.json()) as { lat: number; lon: number; county: string; state: string }
    if (place.state && place.state !== 'California') return ''
    setCountyName(place.county)
    const storeRes = await fetch(`/api/stores?q=${encodeURIComponent(`${place.county || zipCode}, California`)}`)
    if (storeRes.ok) {
      const body = (await storeRes.json()) as { stores?: Store[] }
      setStores(body.stores ?? [])
    }
    return place.county
  }

  async function loadBrief(product: OffProduct, match: FoodMatch, organic: boolean, chemicals: string[]) {
    try {
      const res = await fetch('/api/product-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            name: product.product_name,
            generic: product.generic_name,
            brands: product.brands,
            quantity: product.quantity,
            categories: product.categories,
            labels: product.labels,
            ingredients: product.ingredients_text,
            packaging: product.packaging,
            code: product.code,
          },
          crop: match.kind === 'crop' ? match.label : match.kind,
          chemicals,
          organic,
        }),
      })
      // #region agent log
      dbg('D', 'ProductPage.tsx:loadBrief', 'product-brief response', {
        ok: res.ok,
        status: res.status,
        contentType: res.headers.get('content-type'),
        host: location.host,
      })
      // #endregion
      if (!res.ok) return
      const body = (await res.json()) as Brief
      setBrief({
        description: body.description ?? '',
        practices: body.practices ?? '',
        alternatives: body.alternatives ?? '',
      })
    } catch {
      /* key unset or offline: the page still shows catalog fields */
    }
  }

  async function choose(product: OffProduct) {
    const blob = [product.product_name, product.generic_name, product.brands, product.categories, product.ingredients_text].filter(Boolean).join(' ')
    const match = matchFood(blob)
    const organic = (product.labels_tags ?? []).some((t) => t.includes('organic')) || /organic/i.test(product.labels ?? '')
    setHit({ product, organic, match, fromCatalog: true })
    setChoices([])
    const altTerm = match.kind === 'crop' ? `organic ${match.label}` : `organic ${product.product_name ?? ''}`.trim()
    const altRes = await fetch(`/api/product?q=${encodeURIComponent(altTerm)}`)
    if (altRes.ok) {
      const body = (await altRes.json()) as { products?: OffProduct[] }
      setAlts((body.products ?? []).filter((p) => p.code !== product.code).slice(0, 4))
    }
    let chemicals: string[] = []
    if (/^\d{5}$/.test(zip.trim())) {
      const county = await loadPlace(zip.trim())
      const row = data.counties.find((c) => c.name.toLowerCase() === county.toLowerCase())
      const cropRow =
        match.kind === 'crop'
          ? row?.crops.find((c) => c.name.toLowerCase().includes(match.needle))
          : undefined
      chemicals = cropRow?.chems.map((c) => `${c.name} (${c.lbs.toLocaleString()} lb in ${row?.name} County, 2023)`) ?? []
    }
    await loadBrief(product, match, organic, chemicals)
  }

  async function lookup(raw: string) {
    const scanned = parseScanned(raw)
    const barcode = scanned.barcode
    const text = (scanned.query ?? raw).trim()
    if (!barcode && text.length < 2) {
      setError('Type a product name or a barcode, or scan a QR / ID code.')
      return
    }
    setBusy(true)
    setError('')
    setHit(null)
    setBrief(null)
    setAlts([])
    setStores([])
    setCountyName('')
    try {
      const res = await fetch(
        barcode ? `/api/product?barcode=${barcode}` : `/api/product?q=${encodeURIComponent(text)}`,
      )
      // #region agent log
      dbg('A', 'ProductPage.tsx:lookup', 'product lookup response', {
        ok: res.ok,
        status: res.status,
        contentType: res.headers.get('content-type'),
        hasBarcode: Boolean(barcode),
        barcodeLen: barcode?.length ?? 0,
        host: location.host,
        path: barcode ? '/api/product?barcode' : '/api/product?q',
      })
      // #endregion
      if (!res.ok) {
        if (!barcode) {
          setHit({
            product: { product_name: text },
            organic: /organic/i.test(text),
            match: matchFood(text),
            fromCatalog: false,
          })
          if (/^\d{5}$/.test(zip.trim())) await loadPlace(zip.trim())
        } else {
          setError('No answer for that code. The product catalog may be busy. Try the name on the package.')
        }
        setBusy(false)
        return
      }
      const body = (await res.json()) as { status?: number; product?: OffProduct; products?: OffProduct[] }
      if (barcode) {
        const product = body.status === 1 ? asProduct(body.product) : null
        if (!product) setError('No public record for that code. Try the name on the package.')
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
    } catch (err) {
      // #region agent log
      dbg('A', 'ProductPage.tsx:lookup', 'product lookup threw', {
        name: err instanceof Error ? err.name : 'unknown',
        message: err instanceof Error ? err.message.slice(0, 120) : String(err).slice(0, 120),
        host: location.host,
      })
      // #endregion
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
    type DetectorAPI = {
      getSupportedFormats?: () => Promise<string[]>
      new (opts: { formats: string[] }): { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> }
    }
    const Detector = (window as unknown as { BarcodeDetector?: DetectorAPI }).BarcodeDetector
    // #region agent log
    dbg('B', 'ProductPage.tsx:startScan', 'scan capabilities', {
      host: location.host,
      protocol: location.protocol,
      isSecureContext: window.isSecureContext,
      hasDetector: Boolean(Detector),
      hasGum: Boolean(navigator.mediaDevices?.getUserMedia),
    })
    // #endregion
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      // #region agent log
      dbg('B', 'ProductPage.tsx:startScan', 'missing detector or camera API', {
        hasDetector: Boolean(Detector),
        hasGum: Boolean(navigator.mediaDevices?.getUserMedia),
        host: location.host,
      })
      // #endregion
      setScanNote('This browser can’t scan codes. Type the number under the barcode, or the text in the QR.')
      return
    }
    try {
      setScanning(true)
      setScanNote('Point the camera at a barcode or a product QR.')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      const video = videoRef.current
      if (!video) {
        stream.getTracks().forEach((t) => t.stop())
        setScanning(false)
        return
      }
      video.srcObject = stream
      video.muted = true
      await video.play()
      // #region agent log
      dbg('C', 'ProductPage.tsx:startScan', 'camera started', {
        host: location.host,
        trackCount: stream.getVideoTracks().length,
        readyState: video.readyState,
      })
      // #endregion
      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          video.onloadeddata = () => resolve()
        })
      }
      const wanted = ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'data_matrix']
      let formats = wanted
      try {
        const supported = await Detector.getSupportedFormats?.()
        if (supported?.length) formats = wanted.filter((f) => supported.includes(f))
      } catch {
        formats = ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
      }
      const detector = new Detector({ formats: formats.length ? formats : wanted })
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
            setScanNote('Code read. Looking up the package…')
            stopScan()
            void lookup(value)
            return
          }
        } catch {
          /* keep trying */
        }
        window.setTimeout(loop, 280)
      }
      void loop()
    } catch (err) {
      // #region agent log
      dbg('C', 'ProductPage.tsx:startScan', 'camera start failed', {
        name: err instanceof Error ? err.name : 'unknown',
        message: err instanceof Error ? err.message.slice(0, 120) : String(err).slice(0, 120),
        host: location.host,
        isSecureContext: window.isSecureContext,
      })
      // #endregion
      setScanning(false)
      setScanNote('Camera permission was blocked. Type the barcode or QR text instead.')
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
            <video ref={videoRef} className="scanner" muted playsInline autoPlay />
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
                    {photo(p) && <img src={photo(p)} alt="" />}
                    <span><strong>{p.product_name || p.generic_name}</strong><small>{p.brands}</small></span>
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
                {photo(hit.product) && <img src={photo(hit.product)} alt="" />}
                <div>
                  <h2>{hit.product.product_name || hit.product.generic_name}</h2>
                  <p>{hit.product.brands} {hit.product.quantity} {hit.product.code && <small>· {hit.product.code}</small>}</p>
                </div>
              </div>
              {(hit.product.generic_name || hit.product.ingredients_text) && (
                <p className="product-desc">
                  {hit.product.generic_name ? <><strong>{hit.product.generic_name}.</strong> </> : null}
                  {hit.product.ingredients_text}
                </p>
              )}
              {hit.product.labels && <p className="note">Labels in the catalog: {hit.product.labels}</p>}
              {brief?.description && <p>{brief.description}</p>}
              {brief?.practices && <p>{brief.practices}</p>}
              {brief?.alternatives && <p>{brief.alternatives}</p>}
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
                      {photo(p) && <img src={photo(p)} alt="" />}
                      <span><strong>{p.product_name || p.generic_name}</strong><small>{p.brands}</small></span>
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
