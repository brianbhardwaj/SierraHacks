import { useEffect, useMemo, useState } from 'react'
import { ID, SOURCES } from '../data/facts'
import { Cite } from './Cite'

type ProviderKey = 'grocery' | 'market' | 'farmer' | 'restaurant' | 'school'

const providers: Record<ProviderKey, { label: string; icon: string; greeting: string; relation: string; farm: boolean }> = {
  grocery: { label: 'Grocery store', icon: '🛒', greeting: 'Dear Store Manager,', relation: 'I shop at your store', farm: false },
  market: { label: 'Farmers market or farm stand', icon: '🥕', greeting: 'Hello,', relation: 'I buy from you at the market', farm: true },
  farmer: { label: 'Farm or CSA', icon: '🚜', greeting: 'Hello,', relation: 'I buy produce from your farm', farm: true },
  restaurant: { label: 'Restaurant or café', icon: '🍽️', greeting: 'Dear Owner,', relation: 'I’m a regular customer', farm: false },
  school: { label: 'School nutrition office', icon: '🏫', greeting: 'Dear Nutrition Director,', relation: 'I’m part of our school community', farm: false },
}

type AskKey = 'transparency' | 'pollinators' | 'habitat' | 'sourcing'

const asks: Record<AskKey, { label: string; text: (farm: boolean) => string }> = {
  transparency: {
    label: 'Tell me how it’s grown',
    text: (farm) =>
      farm
        ? 'Could you tell me which pest-management practices you use, such as integrated pest management or reduced-spray methods, and which products you apply?'
        : 'Could you tell me which growers supply your produce, and whether they use integrated pest management or reduced-spray practices?',
  },
  pollinators: {
    label: 'Protect pollinators',
    text: (farm) =>
      farm
        ? 'Would you avoid spraying bee-toxic products while crops are in bloom, or apply them at night when bees are not foraging?'
        : 'Would you prefer suppliers who avoid spraying bee-toxic products while crops are in bloom, or who apply them at night when bees are not foraging?',
  },
  habitat: {
    label: 'Support habitat',
    text: (farm) =>
      farm
        ? 'Would you consider planting native flowers or a hedgerow along field edges, which gives pollinators food and shelter?'
        : 'Would you encourage your growers to plant native flowers or hedgerows along field edges, which gives pollinators food and shelter?',
  },
  sourcing: {
    label: 'Label low-spray options',
    text: () =>
      'Would you consider labeling or featuring produce from growers with certified organic or other low-pesticide practices, so shoppers can choose them?',
  },
}

type FactKey = 'none' | 'milkweed' | 'monarch' | 'water' | 'bees'

const facts: Record<FactKey, { label: string; text: string; src: number } | null> = {
  none: null,
  milkweed: {
    label: 'Milkweed pesticides',
    text: 'Scientists found 64 different pesticides on Central Valley milkweed, the only plant monarch caterpillars eat.',
    src: ID.monarch2025,
  },
  monarch: {
    label: 'Monarch decline',
    text: 'Western monarchs fell from millions in the 1980s to 12,260 counted in 2025.',
    src: ID.monarch2026,
  },
  water: {
    label: 'Waterway toxicity',
    text: 'In a Central Valley survey, 42% of sampled farm-waterway locations were toxic to a test invertebrate, and pyrethroid insecticides were in 75% of samples.',
    src: ID.sediment,
  },
  bees: {
    label: 'Almond-bloom bees',
    text: 'Almond bloom needs about 2 million honey bee colonies, and a peer-reviewed analysis found bee-toxic products are still commonly applied during bloom.',
    src: ID.almondLabel,
  },
}

type Tone = 'friendly' | 'firm'

export function Emailer({ storeHint = '' }: { storeHint?: string }) {
  const [provider, setProvider] = useState<ProviderKey>('grocery')
  const [storeName, setStoreName] = useState(storeHint)
  useEffect(() => {
    if (storeHint) setStoreName(storeHint)
  }, [storeHint])
  const [picked, setPicked] = useState<AskKey[]>(['transparency', 'pollinators'])
  const [fact, setFact] = useState<FactKey>('milkweed')
  const [tone, setTone] = useState<Tone>('friendly')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [to, setTo] = useState('')
  const [copied, setCopied] = useState(false)

  const toggle = (k: AskKey) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))

  const { subject, body } = useMemo(() => {
    const P = providers[provider]
    const who = name.trim() || '[Your name]'
    const where = city.trim() ? ` in ${city.trim()}` : ''
    const f = facts[fact]
    const src = f ? SOURCES.find((s) => s.id === f.src) : null
    const chosen = (Object.keys(asks) as AskKey[]).filter((k) => picked.includes(k))

    const lines: string[] = [
      P.greeting,
      '',
      `My name is ${who}. I live${where || ' in the Central Valley'}, and ${P.relation}${storeName.trim() ? ` (${storeName.trim()})` : ''}. I care about the Valley’s bees, monarch butterflies, and waterways, so I’m writing to ask for your help.`,
    ]
    if (f && src) {
      lines.push('', `One fact that stays with me: ${f.text} (Source: ${src.org}, ${src.url})`)
    }
    lines.push('', chosen.length === 1 ? 'I’d like to ask:' : 'I’d like to ask a few things:')
    chosen.forEach((k, i) => lines.push(`${chosen.length === 1 ? '•' : `${i + 1}.`} ${asks[k].text(P.farm)}`))
    lines.push(
      '',
      tone === 'friendly'
        ? 'I know this takes time, and I truly appreciate any information you can share. Choosing where to spend my money is one way I try to help the Valley I love.'
        : 'Where I spend my money depends on these answers, and I know other customers care too. I would appreciate a reply within two weeks.',
      '',
      'Thank you for your time.',
      '',
      who,
    )
    const subj =
      picked.includes('pollinators') || picked.includes('habitat')
        ? 'A customer question about pollinators and how your food is grown'
        : 'A customer question about how your food is grown'
    return { subject: subj, body: lines.join('\n') }
  }, [provider, picked, fact, tone, name, city, storeName])

  const canSend = picked.length > 0
  const mailto = `mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = `Subject: ${subject}\n\n${body}`
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
        <h3><span className="step">1</span> Who are you writing to?</h3>
        <div className="chips">
          {(Object.keys(providers) as ProviderKey[]).map((k) => (
            <button key={k} type="button" className={provider === k ? 'chip on' : 'chip'} aria-pressed={provider === k} onClick={() => setProvider(k)}>
              {providers[k].icon} {providers[k].label}
            </button>
          ))}
        </div>

        <h3><span className="step">2</span> What do you want to ask?</h3>
        <div className="chips">
          {(Object.keys(asks) as AskKey[]).map((k) => (
            <button key={k} type="button" className={picked.includes(k) ? 'chip on' : 'chip'} aria-pressed={picked.includes(k)} onClick={() => toggle(k)}>
              {picked.includes(k) ? '✓ ' : '+ '}{asks[k].label}
            </button>
          ))}
        </div>
        {!canSend && <p className="alert" role="alert">Pick at least one question to ask.</p>}

        <h3><span className="step">3</span> Add one sourced fact <small>(optional)</small></h3>
        <div className="chips">
          <button type="button" className={fact === 'none' ? 'chip on' : 'chip'} aria-pressed={fact === 'none'} onClick={() => setFact('none')}>No fact</button>
          {(Object.keys(facts) as FactKey[]).filter((k) => k !== 'none').map((k) => (
            <button key={k} type="button" className={fact === k ? 'chip on' : 'chip'} aria-pressed={fact === k} onClick={() => setFact(k)}>
              {facts[k]!.label}
            </button>
          ))}
        </div>
        {fact !== 'none' && (
          <p className="note">
            Source <Cite n={[facts[fact]!.src]} /> is included in the email so the reader can check it.
          </p>
        )}

        <h3><span className="step">4</span> Make it yours</h3>
        <div className="fields">
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" autoComplete="name" /></label>
          <label>Your city<input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Manteca" autoComplete="address-level2" /></label>
          <label>Store or farm name <small>(optional)</small><input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="The market on Yosemite Ave" /></label>
          <label>Their email <small>(optional)</small><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="manager@store.com" type="email" autoComplete="off" /></label>
        </div>
        <div className="toggle" role="group" aria-label="Tone">
          <button type="button" className={tone === 'friendly' ? 'on' : ''} onClick={() => setTone('friendly')}>Friendly</button>
          <button type="button" className={tone === 'firm' ? 'on' : ''} onClick={() => setTone('firm')}>Firm</button>
        </div>
      </div>

      <div className="soft-card letter">
        <div className="letter-head">
          <span className="dot r" /><span className="dot y" /><span className="dot g" />
          <strong>Your email</strong>
        </div>
        <p className="subject"><span>Subject</span> {subject}</p>
        <pre className="letter-body" aria-live="polite">{canSend ? body : 'Pick at least one question to see your email.'}</pre>
        <div className="hero-cta">
          <a className={`btn${canSend ? '' : ' disabled'}`} href={canSend ? mailto : undefined} aria-disabled={!canSend}>Open in my email app</a>
          <button type="button" className="btn ghost" onClick={copy} disabled={!canSend}>
            {copied ? '✓ Copied!' : 'Copy email'}
          </button>
        </div>
        <p className="note">
          Nothing is sent from this site. Your name and city stay in your browser. Review the email before you send it.
        </p>
      </div>
    </div>
  )
}
