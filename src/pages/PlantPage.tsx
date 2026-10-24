import { Cite } from '../components/Cite'
import { Reveal } from '../components/Motion'
import { ID } from '../data/facts'

const cards = [
  {
    img: '/img/plant-hedgerow.jpg',
    title: 'Hedgerow Farms',
    tag: 'Seeds · Winters, CA',
    url: 'https://www.hedgerowfarms.com/',
    cite: ID.hedgerow,
    desc: 'A Central Valley native-seed grower. Home of the California Central Valley Pollinator Mix and narrowleaf milkweed, with retail-friendly seed for projects under two acres.',
  },
  {
    img: '/img/plant-payne.jpg',
    title: 'Theodore Payne Foundation Seed Store',
    tag: 'Seeds · nonprofit',
    url: 'https://store.theodorepayne.org/collections/seeds-1',
    cite: ID.payne,
    desc: 'California native wildflower seed from about $7 a packet, including California poppy, milkweed, and a butterfly mix. Sow in gardens, not in wild preserves.',
  },
  {
    img: '/img/plant-milkweed.jpg',
    title: 'Xerces Milkweed Finder',
    tag: 'Directory · milkweed',
    url: 'https://www.xerces.org/milkweed/milkweed-seed-finder',
    cite: ID.xercesMilkweed,
    desc: 'Find vendors of native milkweed seed and plants near you. Always ask a vendor where seed came from, and note that some listed vendors sell wholesale only.',
  },
  {
    img: '/img/plant-nursery.jpg',
    title: 'Calscape Native Plant Nurseries',
    tag: 'Directory · plants',
    url: 'https://www.calscape.com/cnps/nurseries.php',
    cite: ID.calscape,
    desc: 'California Native Plant Society’s map of nurseries that sell native plants, so you can buy local, in-person, and ready to plant.',
  },
  {
    img: '/img/plant-xerces.jpg',
    title: 'Xerces Pollinator Resources: California',
    tag: 'Guides · seed mixes',
    url: 'https://xerces.org/pollinator-resource-center/california',
    cite: ID.xercesRes,
    desc: 'Planting guides, a Central Valley pollinator seed mix, and a directory of native plant, seed, and service providers for farms, yards, and field edges.',
  },
  {
    img: '/img/plant-ss.jpg',
    title: 'S&S Seeds',
    tag: 'Seeds · larger projects',
    url: 'https://nativeseedgroup.com/who-we-are/ss-seeds',
    cite: ID.ssSeeds,
    desc: 'California native seed supplier since 1975, with custom mixes for larger restoration and hedgerow plantings.',
  },
]

const rules = [
  { icon: '🌱', t: 'Pick natives', d: 'Xerces recommends regionally appropriate native flowers and native milkweeds.' },
  { icon: '🚫', t: 'Skip tropical milkweed', d: 'Stick with native milkweed species suited to California.' },
  { icon: '🧪', t: 'Go insecticide-free', d: 'Xerces’ first monarch action is avoiding pesticides, especially insecticides.' },
  { icon: '🔍', t: 'Ask about seed origin', d: 'Good vendors can tell you where seed was grown and whether plants were treated.' },
]

export function PlantPage() {
  return (
    <>
      <Reveal as="section" className="page-head">
        <p className="eyebrow">Plant for pollinators</p>
        <h1>Turn a corner of the Valley back into habitat</h1>
        <p className="sub">
          Native flowers feed bees and butterflies, and restoring farm-edge habitat could reconnect the
          Central Valley for pollinators<Cite n={[ID.plos, ID.monarch2026]} />. These are real places to
          buy seeds and plants. We link to them for information; Unspray earns nothing.
        </p>
      </Reveal>

      <section className="rules">
        {rules.map((r, i) => (
          <Reveal key={r.t} delay={i * 80} className="soft-card tip">
            <span aria-hidden="true">{r.icon}</span>
            <h4>{r.t}</h4>
            <p>{r.d}</p>
          </Reveal>
        ))}
      </section>

      <Reveal>
        <p className="note center">
          Rules: <Cite n={[ID.monarch2026, ID.xercesMilkweed]} /> Prices and stock change; check each site.
        </p>
      </Reveal>

      <section className="plant-grid">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={(i % 3) * 100} as="article" className="soft-card plant-card">
            <div className="plant-img">
              <img src={c.img} alt="" loading="lazy" width={640} height={480} />
              <span className="pill">{c.tag}</span>
            </div>
            <div className="plant-body">
              <h3>{c.title} <Cite n={[c.cite]} /></h3>
              <p>{c.desc}</p>
              <a className="btn small" href={c.url} target="_blank" rel="noreferrer">
                Visit site ↗
              </a>
            </div>
          </Reveal>
        ))}
      </section>

      <Reveal className="soft-card honest">
        <h3>A realistic note</h3>
        <p>
          Planting helps, but Xerces says gardens alone cannot solve pesticide contamination or climate
          change<Cite n={[ID.monarch2025]} />. Pair planting with the Email and Report pages for bigger impact.
          Illustrations on this page are original artwork, not photos of these vendors.
        </p>
      </Reveal>
    </>
  )
}
