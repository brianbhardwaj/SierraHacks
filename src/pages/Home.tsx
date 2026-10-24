import { Link } from 'react-router-dom'
import { Cite } from '../components/Cite'
import { ID } from '../data/facts'

const cards = [
  { to: '/product', name: 'Scan for pesticides', body: 'Barcode or name, then crop records' },
  { to: '/near', name: 'Clean choices around you', body: 'Markets mapped around your zip' },
  { to: '/data', name: 'Where the pounds land', body: 'County charts and city totals' },
  { to: '/ecosystem', name: 'What wildlife is showing', body: 'Evidence, with sources' },
  { to: '/email', name: 'Ask who sells your food', body: 'A polite note to a store or farm' },
  { to: '/report', name: 'Say something happened', body: 'A script for 1-87PestLine' },
  { to: '/plant', name: 'Put habitat back', body: 'Native seed and milkweed to buy' },
  { to: '/ask', name: 'Talk it through', body: 'Tell Sprout your situation' },
]

export function Home() {
  return (
    <div className="home-page">
      <style>{`
        .home-page { padding-bottom: 1rem; }
        .home-hero { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 2.8rem; align-items: center; padding: 1.6rem 0 2.4rem; }
        .home-hero h1 { font-size: clamp(4.6rem, 12vw, 8.6rem); letter-spacing: -0.06em; line-height: 0.82; margin: 0 0 0.35rem; color: #0c2418; }
        .home-hero .slogan { font-family: var(--display); font-size: clamp(1.35rem, 2.6vw, 1.85rem); font-weight: 500; color: var(--green-deep); margin: 0 0 0.9rem; }
        .home-hero .sub { max-width: 28rem; }
        .home-actions { display: flex; flex-wrap: wrap; gap: 0.7rem; margin: 1.1rem 0 0; }
        .home-glass { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
        .home-glass a { display: flex; flex-direction: column; justify-content: space-between; min-height: 7.2rem; padding: 1rem 1.05rem 0.95rem; text-decoration: none; color: #10281c; border-radius: 20px; background: rgba(255,255,255,0.38); border: 1px solid rgba(255,255,255,0.55); box-shadow: 0 8px 28px rgba(16,40,28,0.06); backdrop-filter: blur(16px); transition: transform 0.22s ease, background 0.22s ease; }
        .home-glass a:hover { transform: translateY(-4px); background: rgba(255,255,255,0.62); }
        .home-glass a:first-child { grid-column: 1 / -1; min-height: 5.6rem; flex-direction: row; align-items: center; gap: 1rem; background: rgba(47,158,99,0.18); }
        .home-glass strong { font-family: var(--display); font-size: 1.12rem; }
        .home-glass p { margin: 0.25rem 0 0; color: var(--mute); font-size: 0.9rem; }
        .home-glass span { margin-top: 0.7rem; font-family: var(--display); font-weight: 600; font-size: 0.82rem; color: var(--green-deep); }
        .home-glass a:first-child p { margin-top: 0.15rem; }
        .home-topic { display: grid; grid-template-columns: minmax(200px, 0.7fr) 1.2fr; gap: 1.6rem; align-items: center; margin: 0.4rem 0 2.1rem; padding: 0.2rem 0 0; }
        .home-topic.reverse { grid-template-columns: 1.2fr minmax(200px, 0.7fr); }
        .home-topic img { width: 100%; height: 220px; object-fit: cover; border-radius: 22px; display: block; }
        .home-topic h2 { margin: 0.15rem 0 0.7rem; letter-spacing: -0.03em; color: #10281c; }
        .home-topic p { color: var(--mute); max-width: 38rem; }
        @media (max-width: 860px) {
          .home-hero, .home-glass, .home-glass a:first-child { grid-template-columns: 1fr; }
          .home-glass a:first-child { flex-direction: column; align-items: flex-start; }
          .home-topic, .home-topic.reverse { grid-template-columns: 1fr; }
          .home-topic img { height: 180px; }
        }
      `}</style>

      <section className="home-hero">
        <div>
          <p className="kicker">Central Valley</p>
          <h1>Unspray</h1>
          <p className="slogan">Know what’s sprayed.</p>
          <p className="sub">
            Public pesticide records for Central Valley agriculture. The Valley grows a quarter of
            the nation’s food<Cite n={[ID.xercesCV]} />. Spray pounds are public by county and crop.
            They are not on the package.
          </p>
          <div className="home-actions">
            <Link className="btn glow" to="/product">Check a product</Link>
            <Link className="btn ghost" to="/near">Your zip</Link>
          </div>
        </div>
        <nav className="home-glass" aria-label="Pages">
          {cards.map((p) => (
            <Link key={p.to} to={p.to}>
              <div>
                <strong>{p.name}</strong>
                <p>{p.body}</p>
              </div>
              <span>Open →</span>
            </Link>
          ))}
        </nav>
      </section>

      <article className="home-topic">
        <img src="/img/side-monarch.jpg" alt="A monarch butterfly with its wings open" />
        <div>
          <p className="kicker">Wildlife</p>
          <h2>The issue</h2>
          <p>
            Western monarchs fell from millions in the 1980s to 12,260 counted in 2025
            <Cite n={[ID.monarch2026]} />. Central Valley milkweed, the only food monarch caterpillars
            eat, carried 64 different pesticides in one study<Cite n={[ID.monarch2025]} />. The counts
            are public. The chemicals on the leaf are public. They still sit far from most grocery
            aisles.
          </p>
          <Link className="text-link" to="/ecosystem">Read the evidence →</Link>
        </div>
      </article>

      <article className="home-topic reverse">
        <div>
          <p className="kicker">Central Valley</p>
          <h2>How the Valley feels it</h2>
          <p>
            Almond bloom needs about two million honey bee colonies
            <Cite n={[ID.almondLabel]} />. Sediment in Central Valley farm waterways has been toxic
            at 42% of sampled sites<Cite n={[ID.sediment]} />. Spray is one pressure, with habitat
            loss and climate. County records show where pounds pile up, not which farm filled a crate.
          </p>
          <Link className="text-link" to="/data">Open the county charts →</Link>
        </div>
        <img src="/img/side-almond.jpg" alt="Beekeepers checking hives in a California almond orchard" />
      </article>

      <article className="home-topic">
        <img src="/img/side-milkweed.jpg" alt="Narrowleaf milkweed flowers" />
        <div>
          <p className="kicker">What to do</p>
          <h2>From here</h2>
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
