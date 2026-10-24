import { Link } from 'react-router-dom'
import { Cite } from '../components/Cite'
import { ID } from '../data/facts'

const pages = [
  { to: '/product', name: 'Check food', body: 'Scan a barcode or type a product name. Public package records, then county crop chemicals only when we can match them.' },
  { to: '/near', name: 'Your zip', body: 'Enter a zip to see grocery shops mapped nearby and the pesticide total for that county.' },
  { to: '/ecosystem', name: 'Problem', body: 'The wildlife evidence: monarchs, bees at almond bloom, and farm waterways, each with its source.' },
  { to: '/data', name: 'Data', body: 'County charts and cities you can tap. California publishes use by county and crop, not by store.' },
  { to: '/email', name: 'Email', body: 'Build a short note asking a store, farm, or school how food is grown.' },
  { to: '/report', name: 'Report', body: 'A script for 1-87PestLine when spraying harms people, bees, fish, or plants.' },
  { to: '/plant', name: 'Plant', body: 'Places to buy native seed and milkweed so a yard or field edge can feed pollinators.' },
  { to: '/ask', name: 'Ask', body: 'Tell Sprout your situation and get next steps from the sourced facts on this site.' },
]

export function Home() {
  return (
    <div className="home-page">
      <style>{`
        .home-page { padding-bottom: 1rem; }
        .home-intro { padding: 2.2rem 0 1.6rem; max-width: 42rem; }
        .home-intro h1 { font-size: clamp(3.2rem, 8vw, 5.4rem); letter-spacing: -0.04em; line-height: 0.95; margin: 0 0 0.7rem; color: #0c2418; }
        .home-jump { display: flex; flex-wrap: wrap; gap: 0.45rem; margin: 1.2rem 0 0; }
        .home-jump a { text-decoration: none; font-family: var(--display); font-weight: 600; font-size: 0.92rem; padding: 0.4rem 0.85rem; border-radius: 999px; background: #fff; border: 1px solid rgba(16,36,28,0.1); color: var(--green-deep); }
        .home-jump a.primary { background: #178a52; color: #fff; border-color: transparent; box-shadow: 0 0 18px rgba(47,158,99,0.55); }
        .home-pages { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.7rem; margin: 0.4rem 0 2.2rem; }
        .home-pages a { display: block; text-decoration: none; color: inherit; padding: 1rem 1.1rem; border-radius: 16px; background: rgba(255,255,255,0.8); border: 1px solid rgba(16,36,28,0.08); }
        .home-pages a strong { display: block; font-family: var(--display); color: #10281c; margin-bottom: 0.25rem; }
        .home-pages a p { margin: 0; color: var(--mute); font-size: 0.95rem; }
        .home-topic { display: grid; grid-template-columns: minmax(200px, 0.7fr) 1.2fr; gap: 1.4rem; align-items: center; margin: 0 0 1.8rem; }
        .home-topic.reverse { grid-template-columns: 1.2fr minmax(200px, 0.7fr); }
        .home-topic img { width: 100%; height: 210px; object-fit: cover; border-radius: 18px; display: block; }
        .home-topic h2 { margin-top: 0; }
        .home-topic p { color: var(--mute); }
        @media (max-width: 760px) {
          .home-pages, .home-topic, .home-topic.reverse { grid-template-columns: 1fr; }
          .home-topic img { height: 180px; }
        }
      `}</style>

      <section className="home-intro">
        <p className="kicker">Unspray</p>
        <h1>Know what’s sprayed.</h1>
        <p className="sub">
          Unspray is a map of public pesticide records for Central Valley agriculture, plus tools
          to check a product, find stores near a zip, and ask the people who sell your food. The
          Valley grows a quarter of the nation’s food<Cite n={[ID.xercesCV]} />. Spray pounds are
          public by county and crop. They are not on the package.
        </p>
        <nav className="home-jump" aria-label="Go to a page">
          <Link className="primary" to="/product">Check a product</Link>
          <Link to="/near">Markets near a zip</Link>
          <Link to="/ecosystem">Problem</Link>
          <Link to="/data">Data</Link>
          <Link to="/email">Email</Link>
          <Link to="/report">Report</Link>
          <Link to="/plant">Plant</Link>
          <Link to="/ask">Ask</Link>
        </nav>
      </section>

      <h2>Pages</h2>
      <section className="home-pages">
        {pages.map((p) => (
          <Link key={p.to} to={p.to}>
            <strong>{p.name}</strong>
            <p>{p.body}</p>
          </Link>
        ))}
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
