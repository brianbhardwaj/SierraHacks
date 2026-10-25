import { useMemo, useState } from 'react'

type Kind = 'drift' | 'bees' | 'water' | 'school' | 'work'

const kinds: Record<Kind, { label: string; mark: string }> = {
  drift: { label: 'Spray drift near my home', mark: '*' },
  bees: { label: 'Bees or wildlife harmed', mark: '+' },
  water: { label: 'Fish or water affected', mark: '#' },
  school: { label: 'Near a school or child care', mark: '/' },
  work: { label: 'Exposure at work', mark: '&' },
}

const equipmentOpts = ['Tractor / ground rig', 'Backpack or hand sprayer', 'Airplane or helicopter', 'Not sure']
const effectOpts = ['Skin irritation', 'Eye irritation', 'Trouble breathing or cough', 'Headache or nausea', 'Strong chemical smell', 'Dead or sick bees', 'Dead fish', 'Damaged plants or crops']

export function ReportBuilder() {
  const [kind, setKind] = useState<Kind>('drift')
  const [when, setWhen] = useState('')
  const [where, setWhere] = useState('')
  const [what, setWhat] = useState('')
  const [equip, setEquip] = useState<string[]>([])
  const [effects, setEffects] = useState<string[]>([])
  const [product, setProduct] = useState('')
  const [weather, setWeather] = useState('')
  const [copied, setCopied] = useState(false)

  const flip = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const script = useMemo(() => {
    const L: string[] = []
    L.push(`I would like to report a possible pesticide incident: ${kinds[kind].label.toLowerCase()}.`)
    L.push(`When: ${when ? new Date(when).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '[date and time]'}`)
    L.push(`Where: ${where.trim() || '[address, nearest cross streets, or field location]'}`)
    L.push(`What I saw, smelled, or felt: ${what.trim() || '[describe: spray cloud, odor, machinery, who was nearby]'}`)
    if (equip.length) L.push(`Application method: ${equip.join(', ')}`)
    if (effects.length) L.push(`Effects noticed: ${effects.join(', ')}`)
    if (weather.trim()) L.push(`Weather / wind: ${weather.trim()}`)
    if (product.trim()) L.push(`Product or company, if known: ${product.trim()}`)
    L.push('Please let me know the name of the pesticide and send me a copy of the final report.')
    return L.join('\n')
  }, [kind, when, where, what, equip, effects, weather, product])

  async function copy() {
    try {
      await navigator.clipboard.writeText(script)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = script
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="emailer">
      <div className="soft-card builder">
        <h3><span className="step">1</span> What happened?</h3>
        <div className="chips">
          {(Object.keys(kinds) as Kind[]).map((k) => (
            <button key={k} type="button" className={kind === k ? 'chip on' : 'chip'} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {kinds[k].mark} {kinds[k].label}
            </button>
          ))}
        </div>

        <h3><span className="step">2</span> Details inspectors ask about</h3>
        <div className="fields">
          <label>When<input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></label>
          <label>Where<input value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Near Main St & Yosemite Ave" /></label>
        </div>
        <label className="block">What you saw, smelled, or felt
          <textarea rows={3} value={what} onChange={(e) => setWhat(e.target.value)} placeholder="A white mist drifted from the orchard toward our yard…" />
        </label>

        <p className="mini">How was it applied?</p>
        <div className="chips">
          {equipmentOpts.map((o) => (
            <button key={o} type="button" className={equip.includes(o) ? 'chip on' : 'chip'} aria-pressed={equip.includes(o)} onClick={() => flip(equip, setEquip, o)}>{o}</button>
          ))}
        </div>
        <p className="mini">Any effects?</p>
        <div className="chips">
          {effectOpts.map((o) => (
            <button key={o} type="button" className={effects.includes(o) ? 'chip on' : 'chip'} aria-pressed={effects.includes(o)} onClick={() => flip(effects, setEffects, o)}>{o}</button>
          ))}
        </div>
        <div className="fields">
          <label>Weather / wind <small>(optional)</small><input value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="Windy, blowing toward us" /></label>
          <label>Product or company <small>(optional)</small><input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Unknown" /></label>
        </div>
      </div>

      <div className="soft-card letter">
        <div className="letter-head">
          <span className="dot r" /><span className="dot y" /><span className="dot g" />
          <strong>Your report script</strong>
        </div>
        <pre className="letter-body" aria-live="polite">{script}</pre>
        <div className="hero-cta">
          <a className="btn" href="tel:18773785463">Call 1-87PestLine</a>
          <button type="button" className="btn ghost" onClick={copy}>{copied ? '* Copied' : 'Copy script'}</button>
        </div>
        <p className="note">
          This tool does not file anything for you. Read the script on the phone, paste it into the CASPIR
          app, or email it to your County Agricultural Commissioner. Photos, bottles, and labels help.
        </p>
      </div>
    </div>
  )
}
