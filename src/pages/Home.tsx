import { Link } from 'react-router-dom'
import { Cite } from '../components/Cite'
import { ID } from '../data/facts'

const tools = [
  { to: '/product', name: 'Check food', body: 'Scan a barcode or type a name', tone: 'glow', shape: 'wide' },
  { to: '/near', name: 'Your zip', body: 'See markets mapped around your zip', tone: 'mint', shape: 'indent' },
  { to: '/email', name: 'Email', body: 'Ask a store how the food is grown', tone: 'cream', shape: 'short' },
  { to: '/report', name: 'Report', body: 'File a complaint with a ready script', tone: 'warn', shape: 'indent' },
]

const learn = [
  { to: '/ecosystem', name: 'Problem', body: 'Wildlife evidence, with sources', tone: 'forest', shape: 'wide' },
  { to: '/data', name: 'Data', body: 'County charts and city totals', tone: 'mint', shape: 'short' },
  { to: '/plant', name: 'Plant', body: 'Native seed and milkweed to buy', tone: 'cream', shape: 'indent' },
  { to: '/ask', name: 'Ask', body: 'Tell Sprout your situation', tone: 'forest', shape: 'short' },
]

export function Home() {
  return (
    <div className="home-page">
      <style>{`
        .home-page { padding-bottom: 1rem; }
        .home-intro { padding: 2.4rem 0 1.8rem; }
        .home-intro-inner { max-width: 40rem; }
        .home-intro h1 { font-size: clamp(3.2rem, 8vw, 5.4rem); letter-spacing: -0.04em; line-height: 0.95; margin: 0 0 0.7rem; color: #0c2418; }
        .home-actions { display: flex; flex-wrap: wrap; gap: 0.7rem; margin: 1.2rem 0 0; }
        .home-group { margin: 0 0 1.6rem; }
        .home-group h2 { font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--green); margin: 0 0 0.65rem; }
        .home-bars { display: grid; gap: 0.55rem; }
        .home-bar { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0.9rem; text-decoration: none; color: inherit; min-height: 3.2rem; padding: 0.4rem 0.45rem 0.4rem 0.4rem; border-radius: 16px; border: 1px solid transparent; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .home-bar:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(16,40,28,0.1); }
        .home-bar .tab { display: inline-flex; align-items: center; justify-content: center; min-height: 2.25rem; padding: 0.35rem 0.85rem; border-radius: 999px; font-family: var(--display); font-weight: 600; font-size: 0.92rem; white-space: nowrap; }
        .home-bar p { margin: 0; font-size: 0.95rem; }
        .home-bar .go { font-family: var(--display); font-weight: 600; font-size: 0.86rem; padding: 0.38rem 0.8rem; border-radius: 999px; }
        .home-bar.wide { width: 100%; }
        .home-bar.indent { width: 92%; margin-left: 8%; }
        .home-bar.short { width: 86%; }
        .home-bar.glow { background: linear-gradient(90deg, #1a6b43, #2f9e63); color: #fff; }
        .home-bar.glow p, .home-bar.glow .go { color: #e8fff2; }
        .home-bar.glow .tab { background: rgba(255,255,255,0.18); color: #fff; }
        .home-bar.glow .go { background: rgba(255,255,255,0.16); }
        .home-bar.forest { background: #143528; color: #e8fff2; }
        .home-bar.forest p { color: #c5e4d2; }
        .home-bar.forest .tab { background: #2f9e63; color: #fff; }
        .home-bar.forest .go { background: rgba(255,255,255,0.1); color: #fff; }
        .home-bar.mint { background: #e7f6ee; }
        .home-bar.mint .tab { background: #2f9e63; color: #fff; }
        .home-bar.mint p { color: #1d6b45; }
        .home-bar.mint .go { background: #fff; color: #1d6b45; }
        .home-bar.cream { background: #fff8e8; }
        .home-bar.cream .tab { background: #c2762b; color: #fff; }
        .home-bar.cream p { color: #6b4a22; }
        .home-bar.cream .go { background: #fff; color: #8a4d12; }
        .home-bar.warn { background: #fff1e4; }
        .home-bar.warn .tab { background: #9a4a1e; color: #fff; }
        .home-bar.warn p { color: #8a4d12; }
        .home-bar.warn .go { background: #fff; color: #9a4a1e; }
        .home-topic { display: grid; grid-template-columns: minmax(200px, 0.7fr) 1.2fr; gap: 1.4rem; align-items: center; margin: 0 0 1.8rem; }
        .home-topic.reverse { grid-template-columns: 1.2fr minmax(200px, 0.7fr); }
        .home-topic img { width: 100%; height: 210px; object-fit: cover; border-radius: 18px; display: block; }
        .home-topic h2 { margin-top: 0; }
        .home-topic p { color: var(--mute); }
        @media (max-width: 760px) {
          .home-bar, .home-bar.indent, .home-bar.short { width: 100%; margin: 0; grid-template-columns: 1fr auto; }
          .home-bar p { grid-column: 1 / -1; padding: 0 0.45rem 0.35rem; }
          .home-topic, .home-topic.reverse { grid-template-columns: 1fr; }
          .home-topic img { height: 180px; }
        }
      `}</style>

      <section className="home-intro">
        <div className="home-intro-inner">
          <p className="kicker">Unspray · Central Valley</p>
          <h1>Know what’s sprayed.</h1>
          <p className="sub">
            Public pesticide records for Central Valley agriculture, plus tools to check a product,
            find stores near a zip, and ask the people who sell your food. The Valley grows a quarter
            of the nation’s food<Cite n={[ID.xercesCV]} />. Spray pounds are public by county and crop.
            They are not on the package.
          </p>
          <div className="home-actions">
            <Link className="btn glow" to="/product">Check a product</Link>
            <Link className="btn ghost" to="/near">Markets near a zip</Link>
          </div>
        </div>
      </section>

      <section className="home-group">
        <h2>Tools</h2>
        <div className="home-bars">
          {tools.map((p) => (
            <Link key={p.to} className={`home-bar ${p.tone} ${p.shape}`} to={p.to}>
              <span className="tab">{p.name}</span>
              <p>{p.body}</p>
              <span className="go">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-group">
        <h2>Learn</h2>
        <div className="home-bars">
          {learn.map((p) => (
            <Link key={p.to} className={`home-bar ${p.tone} ${p.shape}`} to={p.to}>
              <span className="tab">{p.name}</span>
              <p>{p.body}</p>
              <span className="go">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <article className="home-topic">
        <img src="/img/side-monarch.jpg" alt="A monarch butterfly with its wings open" />
        <div>
          <h2>Why we are doing this</h2>
          <p>
            Western monarchs fell from millions in the 1980s to 12,260 counted in 2025
            <Cite n={[ID.monarch2026]} />. Central Valley milkweed, the only food monarch caterpillars
            eat, carried 64 different pesticides in one study<Cite n={[ID.monarch2025]} />. Unspray
            exists so those numbers, and the tools to act on them, sit in one place.
          </p>
          <Link className="text-link" to="/ecosystem">Read the evidence →</Link>
        </div>
      </article>

      <article className="home-topic reverse">
        <div>
          <h2>What spraying does here</h2>
          <p>
            Almond bloom needs about two million honey bee colonies
            <Cite n={[ID.almondLabel]} />. Sediment in Central Valley farm waterways has been toxic
            at 42% of sampled sites<Cite n={[ID.sediment]} />. Pesticides are one pressure, with
            habitat loss and climate. The Data page shows where use is concentrated.
          </p>
          <Link className="text-link" to="/data">Open the county charts →</Link>
        </div>
        <img src="/img/side-almond.jpg" alt="Beekeepers checking hives in a California almond orchard" />
      </article>

      <article className="home-topic">
        <img src="/img/side-milkweed.jpg" alt="Narrowleaf milkweed flowers" />
        <div>
          <h2>What you can do today</h2>
          <p>
            Check a product, look up shops near your zip, email a store, or plant native milkweed.
            None of those tools invents a farm-to-shelf link. When spraying causes harm, the Report
            page builds a script for 1-87PestLine.
          </p>
          <Link className="text-link" to="/product">Start with a product →</Link>
        </div>
      </article>
    </div>
  )
}
