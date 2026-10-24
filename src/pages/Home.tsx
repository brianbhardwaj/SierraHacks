import { Link } from 'react-router-dom'
import { Cite } from '../components/Cite'
import { Count, Reveal, Wave } from '../components/Motion'
import { ID } from '../data/facts'

const paths = [
  { to: '/ecosystem', icon: '🦋', title: 'See the harm', body: 'Monarchs, almond-bloom bees, and Central Valley waterways, with the studies behind each number.' },
  { to: '/email', icon: '✉️', title: 'Email your food provider', body: 'Pick who you buy from, pick what to ask, and get a polite email you can send in a minute.' },
  { to: '/report', icon: '📣', title: 'File a complaint', body: 'Saw spraying that hurt bees, fish, or people? Build a clear report and get the exact numbers to call.' },
  { to: '/plant', icon: '🌼', title: 'Plant for pollinators', body: 'Verified places to buy native seeds, milkweed, and plants for your yard or field edge.' },
  { to: '/data', icon: '📊', title: 'Check your county', body: 'Type your address and see which crops and chemicals dominate pesticide use where you live.' },
  { to: '/ask', icon: '💬', title: 'Ask Sprout', body: 'Describe your situation and get steps matched to it. Plus answers to common questions.' },
]

export function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow pop">Central Valley · ecosystems · agriculture</p>
        <h1>
          <Wave text="Unspray" />
        </h1>
        <p className="lead pop" style={{ animationDelay: '0.6s' }}>
          Know what’s sprayed. Fight back, gently.
        </p>
        <p className="sub pop" style={{ animationDelay: '0.8s' }}>
          The Central Valley grows a quarter of the nation’s food<Cite n={[ID.xercesCV]} />. The same
          fields are home to bees, butterflies, and waterways that are showing signs of harm. Move your
          mouse and click the background; then pick a path below.
        </p>
        <div className="hero-cta pop" style={{ animationDelay: '1s' }}>
          <Link to="/email" className="btn">Email your food provider</Link>
          <Link to="/ecosystem" className="btn ghost">See the evidence</Link>
        </div>
      </section>

      <section className="stat-row" aria-label="Worrying numbers">
        <Reveal className="soft-card stat" delay={0}>
          <b><Count to={64} /></b>
          <span>different pesticides found on Central Valley milkweed, the only food monarch caterpillars eat<Cite n={[ID.monarch2025]} /></span>
        </Reveal>
        <Reveal className="soft-card stat" delay={120}>
          <b><Count to={12260} /></b>
          <span>western monarchs counted in 2025, compared with millions in the 1980s<Cite n={[ID.monarch2026]} /></span>
        </Reveal>
        <Reveal className="soft-card stat" delay={240}>
          <b><Count to={42} suffix="%" /></b>
          <span>of sampled Central Valley farm-waterway locations were toxic to at least one aquatic invertebrate<Cite n={[ID.sediment]} /></span>
        </Reveal>
      </section>

      <Reveal as="section" className="section-head">
        <h2>Pick a path</h2>
        <p>Each page does one job. Awareness is only the first step.</p>
      </Reveal>

      <section className="paths">
        {paths.map((p, i) => (
          <Reveal key={p.to} delay={i * 80}>
            <Link to={p.to} className="soft-card path">
              <span className="path-icon" aria-hidden="true">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </Reveal>
        ))}
      </section>

      <Reveal className="soft-card honest">
        <h3>What we do and don’t claim</h3>
        <p>
          Pesticides are one of several pressures on wildlife here, alongside habitat loss and climate.
          Public data shows pesticide use by county and crop, not by the farm that supplies your store, so
          this site never guesses that link. Studies are cited with their limits on every page.
        </p>
      </Reveal>
    </>
  )
}
