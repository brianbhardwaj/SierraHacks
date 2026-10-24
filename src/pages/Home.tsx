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
        .home-page { padding-bottom: 0.4rem; }
        .home-hero { display: grid; grid-template-columns: minmax(17rem, 0.92fr) minmax(20rem, 1.18fr); gap: 3.2rem; align-items: start; padding: 2.2rem 0 2.8rem; }
        .home-hero h1 { font-size: clamp(4.4rem, 11vw, 8rem); letter-spacing: -0.06em; line-height: 0.84; margin: 0 0 0.4rem; color: #243028; }
        .home-hero .slogan { font-family: var(--display); font-size: clamp(1.3rem, 2.4vw, 1.75rem); font-weight: 500; color: var(--green-deep); margin: 0 0 1rem; }
        .home-hero .sub { max-width: 30rem; }
        .home-actions { display: flex; flex-wrap: wrap; gap: 0.7rem; margin: 1.25rem 0 0; }
        .home-glass { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
        .home-glass a { display: flex; flex-direction: column; justify-content: space-between; min-height: 7rem; padding: 1.05rem 1.1rem 1rem; text-decoration: none; color: #243028; border-radius: 20px; background: rgba(252,253,251,0.55); border: 1px solid rgba(255,255,255,0.7); box-shadow: 0 8px 28px rgba(45,71,48,0.05); backdrop-filter: blur(16px); transition: transform 0.22s ease, background 0.22s ease; }
        .home-glass a:hover { transform: translateY(-3px); background: rgba(252,253,251,0.88); }
        .home-glass strong { font-family: var(--display); font-size: 1.08rem; line-height: 1.2; }
        .home-glass p { margin: 0.3rem 0 0; color: var(--mute); font-size: 0.88rem; line-height: 1.45; }
        .home-glass span { margin-top: 0.85rem; font-family: var(--display); font-weight: 600; font-size: 0.8rem; color: var(--green-deep); }
        .home-topic { display: grid; grid-template-columns: minmax(220px, 0.78fr) 1.22fr; gap: 2.2rem; align-items: center; margin: 0.6rem 0 2.6rem; }
        .home-topic.reverse { grid-template-columns: 1.22fr minmax(220px, 0.78fr); }
        .home-topic img { width: 100%; height: 260px; object-fit: cover; border-radius: 24px; display: block; }
        .home-topic h2 { margin: 0.15rem 0 0.75rem; letter-spacing: -0.03em; color: #10281c; }
        .home-topic p { color: var(--mute); max-width: 38rem; }
        .home-split { display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem; margin: 0 0 2.8rem; align-items: stretch; }
        .home-split article { padding: 1.55rem 1.6rem 1.6rem; border-radius: 24px; background: rgba(252,253,251,0.62); border: 1px solid rgba(255,255,255,0.72); backdrop-filter: blur(16px); }
        .home-split h2 { margin: 0.15rem 0 0.75rem; letter-spacing: -0.03em; color: #10281c; }
        .home-split p { color: var(--mute); margin: 0 0 0.75rem; }
        .home-split p:last-child { margin: 0; }
        .home-who { display: grid; gap: 0.55rem; margin: 0.35rem 0 0; padding: 0; list-style: none; }
        .home-who li { color: var(--mute); padding: 0.2rem 0; line-height: 1.5; }
        .home-who strong { font-family: var(--display); font-weight: 600; color: #10281c; }
        @media (max-width: 860px) {
          .home-hero, .home-glass, .home-split { grid-template-columns: 1fr; }
          .home-hero { gap: 1.8rem; padding-top: 1.4rem; }
          .home-topic, .home-topic.reverse { grid-template-columns: 1fr; gap: 1rem; }
          .home-topic img { height: 200px; }
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

      <section className="home-split" aria-label="Purpose and who this is for">
        <article>
          <p className="kicker">Purpose</p>
          <h2>What Unspray does</h2>
          <p>
            Unspray puts public California pesticide records next to tools people in the Central Valley
            can actually use. The Valley grows a quarter of the nation’s food<Cite n={[ID.xercesCV]} />.
            Spray pounds are published by county and crop. They are not printed on the package, and no
            public dataset ties a farm to a store shelf.
          </p>
          <p>
            So this site does not guess that link. It lets you scan or name a product and see crop
            records, find markets near a zip, email the people who sell your food, report harm with a
            1-87PestLine script, plant native habitat, and ask Sprout what to do next.
          </p>
        </article>
        <article>
          <p className="kicker">Who it’s for</p>
          <h2>Who in the Valley</h2>
          <p>
            Built for people who live, work, shop, or garden in California’s Central Valley, especially
            the counties that publish the heaviest agricultural spray.
          </p>
          <ul className="home-who">
            <li><strong>Shoppers</strong> who want county crop records beside a barcode or a name.</li>
            <li><strong>Neighbors of orchards and fields</strong> who need SprayDays alerts and a way to report drift.</li>
            <li><strong>Parents and school communities</strong> who can ask nutrition offices how food is grown.</li>
            <li><strong>Farmworkers and field crews</strong> who can report harm and ask to stay anonymous.</li>
            <li><strong>Gardeners and beekeepers</strong> who want native milkweed and bloom-safe questions, not invented farm lists.</li>
          </ul>
        </article>
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
