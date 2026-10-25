import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Cite } from '../components/Cite'
import { Reveal } from '../components/Motion'
import data from '../data/counties.json'
import { ID } from '../data/facts'

type Geo = {
  lat: number
  lon: number
  display: string
  county: string
  city: string
  state: string
  zip: string
}

type Store = { name: string; kind: string; where?: string }

type ZipBrief = {
  summary: string
  healthyShops: string[]
  ask: string
}

export function NearPage() {
  const [zip, setZip] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [geo, setGeo] = useState<Geo | null>(null)
  const [stores, setStores] = useState<Store[] | null>(null)
  const [brief, setBrief] = useState<ZipBrief | null>(null)

  const county = data.counties.find((c) => c.name.toLowerCase() === (geo?.county ?? '').toLowerCase())

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const q = zip.trim()
    if (!/^\d{5}$/.test(q)) {
      setError('Enter a 5-digit US zip code, like 95336.')
      return
    }
    setBusy(true)
    setError('')
    setGeo(null)
    setStores(null)
    setBrief(null)
    try {
      const geoRes = await fetch(`/api/geo?q=${encodeURIComponent(q)}`)
      if (!geoRes.ok) {
        setError('That zip didn’t resolve. Try another, or pick a city on the Data page.')
        setBusy(false)
        return
      }
      const place = (await geoRes.json()) as Geo
      if (place.state && place.state !== 'California') {
        setError('That zip is outside California. This site’s pesticide records cover California.')
        setBusy(false)
        return
      }
      setGeo(place)
      const placeName = place.city || place.zip || q
      const storeRes = await fetch(`/api/stores?q=${encodeURIComponent(`${placeName}, California`)}`)
      let mapped: Store[] = []
      if (storeRes.ok) {
        const body = (await storeRes.json()) as { stores?: Store[] }
        mapped = body.stores ?? []
        setStores(mapped)
      } else {
        setStores([])
      }
      const matched = data.counties.find((c) => c.name.toLowerCase() === (place.county ?? '').toLowerCase())
      try {
        const aiRes = await fetch('/api/zip-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zip: place.zip || q,
            city: place.city,
            county: place.county,
            state: place.state,
            lbs: matched?.lbs,
            rank: matched?.rank,
            crops: matched?.crops.map((c) => ({ name: c.name, chems: c.chems })),
            stores: mapped.map((s) => ({ name: s.name, kind: s.kind })),
          }),
        })
        if (aiRes.ok) setBrief((await aiRes.json()) as ZipBrief)
      } catch {
        /* mapped shops still show */
      }
    } catch {
      setError('Lookup is unavailable right now. The Data page still works offline.')
    }
    setBusy(false)
  }

  const healthySet = new Set((brief?.healthyShops ?? []).map((n) => n.toLowerCase()))

  return (
    <>
      <Reveal as="section" className="page-head lean-left">
        <p className="eyebrow">Your zip</p>
        <h1>See the stores near you, then ask them</h1>
        <p className="sub">
          No public file names the distributor behind a grocery shelf. What is public: the shops
          mapped near a zip, including farmers markets and health-food stores, plus the county
          pesticide totals<Cite n={[ID.dprCounty, ID.nominatim]} />. Sprout flags names that look like healthier markets.
        </p>
      </Reveal>

      <Reveal className="soft-card lookup-form lean-right">
        <form onSubmit={onSubmit}>
          <label htmlFor="zip">Zip code</label>
          <div className="row">
            <input id="zip" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="95336" maxLength={5} />
            <button className="btn" type="submit" disabled={busy}>{busy ? 'Looking…' : 'Find stores'}</button>
          </div>
        </form>
        {error && <p className="alert" role="alert">{error}</p>}
      </Reveal>

      {geo && (
        <section className="split-results">
          <Reveal className="soft-card">
            <h2>{geo.city || geo.zip || 'This zip'}</h2>
            <p>{geo.display}</p>
            {county ? (
              <>
                <p>
                  <strong>{county.name} County</strong> reported <strong>{county.lbs.toLocaleString()} lb</strong> of
                  pesticide active ingredients in 2023, rank <strong>#{county.rank}</strong> of {data.countyCount}
                  <Cite n={[ID.dprCounty]} />.
                </p>
                <p>Top crops there by pounds: {county.crops.map((c) => c.name).join(', ')}.</p>
                <Link className="btn small" to="/data">Open the full county charts</Link>
              </>
            ) : (
              <p>That place is outside this site’s 15 Central Valley counties, so there is no county chart for it here.</p>
            )}
            {brief && (
              <>
                <p className="ai-blurb">{brief.summary}</p>
                {brief.ask && <p className="note">{brief.ask}</p>}
              </>
            )}
          </Reveal>

          <Reveal className="soft-card" delay={80}>
            <h2>Markets and shops mapped nearby</h2>
            <p className="note">
              Names come from OpenStreetMap. Farmers markets, health-food, and organic grocers are listed first when found. Email one and ask who grows the produce.
            </p>
            {stores === null && <p>Looking up shops…</p>}
            {stores && stores.length === 0 && <p>No named grocery shops were returned for this area. Try a neighboring zip.</p>}
            <ul className="store-list">
              {(stores ?? []).map((s) => (
                <li key={s.name} className={healthySet.has(s.name.toLowerCase()) ? 'healthy-shop' : undefined}>
                  <div>
                    <strong>{s.name}</strong>
                    <small>{s.kind}{healthySet.has(s.name.toLowerCase()) ? ' · healthier pick' : ''}</small>
                  </div>
                  <Link className="btn small" to={`/email?store=${encodeURIComponent(s.name)}`}>Email them</Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}
    </>
  )
}
