import { useSearchParams } from 'react-router-dom'
import { Emailer } from '../components/Emailer'
import { Reveal } from '../components/Motion'

const tips = [
  { icon: '🎯', t: 'Ask, don’t accuse', d: 'You don’t know their practices yet. A curious question gets answers; a charge gets silence.' },
  { icon: '🧾', t: 'Be specific', d: 'One or two clear asks are far more likely to be answered than a long list.' },
  { icon: '🤝', t: 'Bring a friend', d: 'Providers notice when several customers ask the same thing. Share this page.' },
  { icon: '🔁', t: 'Follow up kindly', d: 'If there’s no reply in two weeks, ask once more in person or by phone.' },
]

export function EmailPage() {
  const [params] = useSearchParams()
  return (
    <>
      <Reveal as="section" className="page-head">
        <p className="eyebrow">Email your local food provider</p>
        <h1>Ask the people who sell you food</h1>
        <p className="sub">
          No public data links a farm to your store shelf, so the most direct way to learn how your food is
          grown is to ask. Build a polite, specific email in four quick steps.
        </p>
      </Reveal>

      <Reveal>
        <Emailer storeHint={params.get('store') ?? ''} />
      </Reveal>

      <section className="tips">
        {tips.map((t, i) => (
          <Reveal key={t.t} delay={i * 90} className="soft-card tip">
            <span aria-hidden="true">{t.icon}</span>
            <h4>{t.t}</h4>
            <p>{t.d}</p>
          </Reveal>
        ))}
      </section>
    </>
  )
}
