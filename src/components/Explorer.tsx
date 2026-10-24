import { useState } from 'react'
import counties from '../data/counties.json'
import { statewideCrops, ID } from '../data/facts'
import { Cite } from './Cite'

type Mode = 'crops' | 'counties'

const fmt = (n: number) => `${(n / 1_000_000).toFixed(1)}M lb`

const leaderboard = [...counties.counties]
  .sort((a, b) => b.lbs - a.lbs)
  .map((c) => ({ name: `${c.name}`, lbs: c.lbs }))

export function Explorer() {
  const [mode, setMode] = useState<Mode>('crops')
  const [hover, setHover] = useState<string | null>(null)

  const rows =
    mode === 'crops'
      ? statewideCrops.map((c) => ({ name: c.name, lbs: c.lbs }))
      : leaderboard
  const max = Math.max(...rows.map((r) => r.lbs))
  const active = rows.find((r) => r.name === hover) ?? rows[0]

  return (
    <div className="soft-card explorer">
      <div className="toggle" role="tablist" aria-label="Chart view">
        <button
          role="tab"
          aria-selected={mode === 'crops'}
          className={mode === 'crops' ? 'on' : ''}
          onClick={() => {
            setMode('crops')
            setHover(null)
          }}
        >
          Crops, statewide
        </button>
        <button
          role="tab"
          aria-selected={mode === 'counties'}
          className={mode === 'counties' ? 'on' : ''}
          onClick={() => {
            setMode('counties')
            setHover(null)
          }}
        >
          Central Valley counties
        </button>
      </div>

      <p className="readout" aria-live="polite">
        <strong>{active.name}</strong>: {active.lbs.toLocaleString()} pounds of
        pesticide active ingredients applied in 2023
        <Cite n={mode === 'crops' ? [ID.dprReport2023, ID.dprCrops] : [ID.dprCounty]} />
      </p>

      <ul className="bars">
        {rows.map((r) => (
          <li
            key={r.name}
            className={hover === r.name ? 'bar hot' : 'bar'}
            onMouseEnter={() => setHover(r.name)}
            onFocus={() => setHover(r.name)}
            onClick={() => setHover(r.name)}
            tabIndex={0}
          >
            <span className="bar-name">{r.name}</span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{ ['--w' as string]: `${(r.lbs / max) * 100}%` }}
              />
            </span>
            <span className="bar-val">{fmt(r.lbs)}</span>
          </li>
        ))}
      </ul>
      <p className="note">
        Pounds of active ingredient reported to DPR. Tap or hover a bar. This
        shows where use is concentrated, not how hazardous it is.
      </p>
    </div>
  )
}
