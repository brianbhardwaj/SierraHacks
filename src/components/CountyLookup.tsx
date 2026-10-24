import { useMemo, useState, type FormEvent } from 'react'
import data from '../data/counties.json'
import { flagged13D, ID } from '../data/facts'
import { Cite } from './Cite'

type County = (typeof data.counties)[number]

const maxLbs = Math.max(...data.counties.map((c) => c.lbs))
const byLbs = (a: { lbs: number }, b: { lbs: number }) => b.lbs - a.lbs

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; county: string; place: string }

export function CountyLookup() {
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [countyName, setCountyName] = useState<string>('San Joaquin')
  const [cropRank, setCropRank] = useState(1)

  const county: County =
    data.counties.find((c) => c.name === countyName) ?? data.counties[0]
  const crop = county.crops.find((c) => c.rank === cropRank) ?? county.crops[0]

  const stats = useMemo(() => {
    const chems = [...crop.chems].sort(byLbs)
    const cropsWithFlag = county.crops.filter((c) =>
      c.chems.some((x) => x.name.toLowerCase() === flagged13D),
    ).length
    const pctOfState = (county.lbs / data.countySumLbs) * 100
    return { chems, cropsWithFlag, pctOfState }
  }, [county, crop])

  async function lookup(e: FormEvent) {
    e.preventDefault()
    const q = address.trim()
    if (q.length < 5) {
      setStatus({ kind: 'error', message: 'Type a street address or city, like "1700 Thomas St, Manteca CA".' })
      return
    }
    setStatus({ kind: 'loading' })
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('lookup failed')
      const hits = (await res.json()) as {
        display_name: string
        address?: { county?: string; state?: string }
      }[]
      const hit = hits[0]
      if (!hit?.address) {
        setStatus({ kind: 'error', message: 'No match. Try adding the city, or pick your county below.' })
        return
      }
      if (hit.address.state !== 'California') {
        setStatus({ kind: 'error', message: 'That address is outside California. DPR data covers California only.' })
        return
      }
      const name = (hit.address.county ?? '').replace(/ County$/i, '')
      const found = data.counties.find((c) => c.name.toLowerCase() === name.toLowerCase())
      if (!found) {
        setStatus({
          kind: 'error',
          message: `${name || 'That county'} is outside this site’s Central Valley set. Pick a county from the list instead.`,
        })
        return
      }
      setCountyName(found.name)
      setCropRank(1)
      setStatus({ kind: 'ok', county: found.name, place: hit.display_name })
    } catch {
      setStatus({
        kind: 'error',
        message: 'Address lookup is unavailable right now. Pick your county below instead.',
      })
    }
  }

  const topChem = stats.chems[0]
  const max = Math.max(...stats.chems.map((c) => c.lbs), 1)

  return (
    <div className="soft-card lookup">
      <form onSubmit={lookup} className="lookup-form">
        <label htmlFor="addr">Your address or city</label>
        <div className="row">
          <input
            id="addr"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 1700 Thomas St, Manteca, CA"
            autoComplete="street-address"
          />
          <button type="submit" className="btn" disabled={status.kind === 'loading'}>
            {status.kind === 'loading' ? 'Finding…' : 'Find my county'}
          </button>
        </div>
        <p className="note">
          Your address is sent to OpenStreetMap’s Nominatim service only to find
          your county. It is not saved by this site<Cite n={[ID.nominatim]} />.
        </p>
        {status.kind === 'error' && (
          <p className="alert" role="alert">{status.message}</p>
        )}
        {status.kind === 'ok' && (
          <p className="ok" role="status">
            Matched <strong>{status.place}</strong> to <strong>{status.county} County</strong>.
          </p>
        )}
        <label htmlFor="county" className="alt">Or choose a county</label>
        <select
          id="county"
          value={countyName}
          onChange={(e) => {
            setCountyName(e.target.value)
            setCropRank(1)
          }}
        >
          {data.counties.map((c) => (
            <option key={c.name} value={c.name}>{c.name} County</option>
          ))}
        </select>
      </form>

      <div className="lookup-out">
        <header className="county-head">
          <h3>{county.name} County</h3>
          <p>
            <strong>{county.lbs.toLocaleString()}</strong> lb applied in 2023,
            ranked <strong>#{county.rank} of {data.countyCount}</strong> California
            counties, about <strong>{stats.pctOfState.toFixed(1)}%</strong> of
            the total across all county reports<Cite n={[ID.dprCounty]} />.
          </p>
          <div className="bar-track big" aria-hidden="true">
            <span className="bar-fill" style={{ ['--w' as string]: `${(county.lbs / maxLbs) * 100}%` }} />
          </div>
          <p className="note">
            {county.acres.toLocaleString()} cumulative acres treated and{' '}
            {county.apps.toLocaleString()} agricultural applications.
          </p>
        </header>

        <div className="ring-row">
          <div
            className="ring"
            style={{ ['--p' as string]: `${(stats.cropsWithFlag / county.crops.length) * 100}%` }}
            role="img"
            aria-label={`${stats.cropsWithFlag} of ${county.crops.length} top crops list a flagged chemical`}
          >
            <span>{stats.cropsWithFlag}/{county.crops.length}</span>
          </div>
          <p>
            of this county’s top {county.crops.length} crop categories list{' '}
            <strong>1,3-dichloropropene</strong> among their top five chemicals.
            That fumigant is on California’s Prop 65 cancer list<Cite n={[ID.dprTop5, ID.oehha13d, ID.dpr13d]} />.
            This counts the top-five lists DPR publishes, not every product used.
          </p>
        </div>

        <h4>Top crops by pounds, then their top chemicals</h4>
        <div className="chips">
          {county.crops.map((c) => (
            <button
              key={c.rank}
              type="button"
              className={c.rank === crop.rank ? 'chip on' : 'chip'}
              aria-pressed={c.rank === crop.rank}
              onClick={() => setCropRank(c.rank)}
            >
              {c.rank}. {c.name}
            </button>
          ))}
        </div>

        <ul className="bars">
          {stats.chems.map((c) => {
            const flagged = c.name.toLowerCase() === flagged13D
            return (
              <li key={c.name} className={flagged ? 'bar flagged' : 'bar'}>
                <span className="bar-name">
                  {c.name}
                  {flagged && <em className="flag">Prop 65 cancer list</em>}
                </span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ ['--w' as string]: `${(c.lbs / max) * 100}%` }} />
                </span>
                <span className="bar-val">{c.lbs.toLocaleString()} lb</span>
              </li>
            )
          })}
        </ul>
        <p className="note">
          Top chemical on {crop.name.toLowerCase()} here: <strong>{topChem.name}</strong>
          <Cite n={[ID.dprTop5]} />. Products like sulfur and mineral oil lead by weight on
          many crops; weight is not toxicity<Cite n={[ID.dprChem]} />.
        </p>
      </div>
    </div>
  )
}
