import { Link } from 'react-router-dom'
import { Cite } from '../components/Cite'
import { Count, Reveal } from '../components/Motion'
import { ID } from '../data/facts'

const tools = [
  { to: '/product', index: '01', title: 'Name or scan a product', body: 'The main tool. A barcode or a name, matched only to public records.', hot: true },
  { to: '/near', index: '02', title: 'Markets near a zip', body: 'Grocery shops mapped around that zip, plus the county spray total.', hot: false },
  { to: '/data', index: '03', title: 'See the data', body: 'County charts, and cities you can open.', hot: false },
  { to: '/email', index: '04', title: 'Email a store', body: 'A short note asking how the food was grown.', hot: false },
  { to: '/report', index: '05', title: 'File a complaint', body: 'A script for 1-87PestLine when spraying causes harm.', hot: false },
  { to: '/plant', index: '06', title: 'Plant habitat', body: 'Native seed and milkweed sources for a yard or field edge.', hot: false },
]

export function Home() {
  return (
    <>
      <section className="landing landing-focus">
        <p className="kicker">Start here</p>
        <h1>Know what’s sprayed.</h1>
        <p className="product-call">Check one product.</p>
        <p className="sub">
          Type a name or scan a barcode. The Central Valley grows a quarter of the nation’s food
          <Cite n={[ID.xercesCV]} />, and the spray record is not printed on the package.
        </p>
        <div className="hero-cta">
          <Link to="/product" className="btn glow">Name it or scan it</Link>
          <Link to="/near" className="btn ghost">Markets near a zip</Link>
        </div>
      </section>

      <section className="metrics" aria-label="Worrying numbers">
        <Reveal className="metric">
          <b><Count to={64} /></b>
          <span>pesticides found on Central Valley milkweed, the only food monarch caterpillars eat<Cite n={[ID.monarch2025]} /></span>
        </Reveal>
        <Reveal className="metric" delay={80}>
          <b><Count to={12260} /></b>
          <span>western monarchs counted in 2025, against millions in the 1980s<Cite n={[ID.monarch2026]} /></span>
        </Reveal>
        <Reveal className="metric" delay={160}>
          <b><Count to={42} suffix="%" /></b>
          <span>of sampled farm-waterway sites were toxic to a test invertebrate<Cite n={[ID.sediment]} /></span>
        </Reveal>
      </section>

      <section className="story">
        <img src="/img/side-monarch.jpg" alt="A monarch butterfly with its wings open" />
        <div>
          <p className="kicker">The signal</p>
          <h2>The wildlife record is the worrying part.</h2>
          <p>
            Monarch counts, bees at almond bloom, and sediment in farm waterways all point the same
            direction. Pesticides are one pressure, alongside habitat loss and climate. The studies are
            on the next page, with their limits attached.
          </p>
          <Link className="text-link" to="/ecosystem">Read the evidence →</Link>
        </div>
      </section>

      <section className="tools">
        <div className="tools-head">
          <h2>Use the records</h2>
          <p>Each tool does one job. None of them invents a number.</p>
        </div>
        <div className="tool-grid">
          {tools.map((tool) => (
            <Link key={tool.to} to={tool.to} className={tool.hot ? 'tool hot' : 'tool'}>
              <span>{tool.index}</span>
              <strong>{tool.title}</strong>
              <p>{tool.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
