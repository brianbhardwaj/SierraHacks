import { Link } from 'react-router-dom'
import { Cite } from '../components/Cite'
import { Count, Reveal } from '../components/Motion'
import { ID, monarchCounts } from '../data/facts'

const maxMonarch = Math.max(...monarchCounts.map((m) => m.n))

function Ring({ pct, label, tone = '' }: { pct: number; label: string; tone?: string }) {
  return (
    <div className={`ring ${tone}`} style={{ ['--p' as string]: `${pct}%` }} role="img" aria-label={`${pct}% ${label}`}>
      <span><Count to={pct} suffix="%" /></span>
    </div>
  )
}

export function Ecosystem() {
  return (
    <>
      <Reveal as="section" className="page-head">
        <p className="eyebrow">Ecosystem</p>
        <h1>The Valley’s wildlife is showing the strain</h1>
        <p className="sub">
          Pesticides are not the only pressure, but they are one the evidence keeps pointing to. Every card
          below links to its source. Tap a small number to open it.
        </p>
      </Reveal>

      {/* MONARCHS */}
      <Reveal as="section" className="topic">
        <div className="topic-text">
          <h2>Monarchs</h2>
          <p>
            The western monarch count fell from millions in the 1980s to about ten thousand in recent winters,
            a decline of roughly <strong>10% per year</strong><Cite n={[ID.monarch2026]} />. Habitat loss,
            climate change, and pesticides all play a part; Xerces lists pesticide contamination among the
            widespread issues that gardens alone cannot fix<Cite n={[ID.monarch2025]} />.
          </p>
          <p>
            In Central Valley milkweed, scientists found <strong>64 different pesticides</strong>, and one
            insecticide, methoxyfenozide, in <strong>96%</strong> of samples<Cite n={[ID.monarch2025]} />.
            Xerces notes that EPA’s routine testing covers honey bees, not butterflies<Cite n={[ID.monarch2025]} />.
          </p>
        </div>
        <div className="soft-card chart-card">
          <h3>Western monarchs counted each winter</h3>
          <ul className="bars">
            <li className="bar">
              <span className="bar-name">1980s</span>
              <span className="bar-track"><span className="bar-fill hatch" style={{ ['--w' as string]: '100%' }} /></span>
              <span className="bar-val">millions</span>
            </li>
            {monarchCounts.map((m) => (
              <li key={m.year} className="bar">
                <span className="bar-name">{m.year}</span>
                <span className="bar-track"><span className="bar-fill" style={{ ['--w' as string]: `${Math.max((m.n / maxMonarch) * 100, 1.5)}%` }} /></span>
                <span className="bar-val">{m.n.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <p className="note">
            Counts: 2020<Cite n={[ID.monarch2026]} />, 2023<Cite n={[ID.monarch2024]} />, 2024 and 2025
            <Cite n={[ID.monarch2026]} />. The 1980s bar is off this chart: Xerces describes millions but
            gives no exact count. 2023’s 233,394 was still about 5% of the 1980s level<Cite n={[ID.monarch2024]} />.
          </p>
        </div>
      </Reveal>

      {/* BEES */}
      <Reveal as="section" className="topic flip-topic">
        <div className="soft-card chart-card">
          <div className="big-stats">
            <div>
              <b><Count to={2} suffix="M" /></b>
              <span>honey bee colonies needed for almond bloom (2018), about 81% of US managed colonies<Cite n={[ID.almondLabel]} /></span>
            </div>
            <div>
              <b><Count to={80000} suffix="+" /></b>
              <span>hives reported damaged or dead by beekeepers after the 2014 bloom<Cite n={[ID.beeKill2014]} /></span>
            </div>
          </div>
          <p className="note">
            The 2014 figure comes from a beekeeper poll, not a government count. Colony losses have many
            causes, including mites and disease.
          </p>
        </div>
        <div className="topic-text">
          <h2>Almond-bloom bees</h2>
          <p>
            Every February, about two million hives are trucked into Central Valley almond orchards. A
            peer-reviewed analysis found that bee-toxic products lacking EPA precautionary language are
            still <strong>commonly applied during bloom</strong><Cite n={[ID.almondLabel]} />.
          </p>
          <p>
            In the lab, certain insecticide, fungicide, and spray-adjuvant mixes hurt adult bees more than
            expected<Cite n={[ID.almondTox2022]} />, and insecticide combinations reduced larval survival
            in a 2019 study<Cite n={[ID.almondBees2019]} />. The 2022 authors point to spraying at night as
            one way to lower risk<Cite n={[ID.almondTox2022]} />.
          </p>
        </div>
      </Reveal>

      {/* WATER */}
      <Reveal as="section" className="topic">
        <div className="topic-text">
          <h2>Waterways</h2>
          <p>
            Researchers tested 70 sediment samples from Central Valley water bodies in 10 counties. <strong>42%</strong>{' '}
            of locations were toxic to a test invertebrate, and <strong>14%</strong> were extremely
            toxic<Cite n={[ID.sediment]} />. Pyrethroid insecticides turned up in{' '}
            <strong>75%</strong> of samples<Cite n={[ID.sediment]} />.
          </p>
          <p>
            A later UC Davis study of more than 100 samples found about one quarter toxic, and pyrethroids
            above toxic thresholds in three quarters of the toxic ones<Cite n={[ID.sediment2013]} />. Small
            invertebrates sit at the base of the food web that fish and birds depend on.
          </p>
        </div>
        <div className="soft-card chart-card rings">
          <div><Ring pct={42} label="of sites toxic" tone="warn" /><small>sites toxic<br />(earlier study)</small></div>
          <div><Ring pct={14} label="extremely toxic" tone="warn" /><small>extremely toxic</small></div>
          <div><Ring pct={75} label="of samples had pyrethroids" /><small>samples with<br />pyrethroids</small></div>
        </div>
      </Reveal>

      {/* FARM EDGES */}
      <Reveal as="section" className="topic flip-topic">
        <div className="soft-card chart-card">
          <div className="big-stats three">
            <div><b><Count to={8} /></b><span>insecticides</span></div>
            <div><b><Count to={13} /></b><span>herbicides</span></div>
            <div><b><Count to={12} /></b><span>fungicides</span></div>
          </div>
          <p className="note">
            Types detected in bees, flowers, soil, and air at eight Yolo and Colusa County farms, plus 4
            breakdown products<Cite n={[ID.usgsBees]} />.
          </p>
        </div>
        <div className="topic-text">
          <h2>Wildflower borders</h2>
          <p>
            Farm-edge flower strips are meant to be safe havens. A USGS study checked eight farms with
            pollinator-friendly borders and still detected a mix of pesticides across bees, flowers, soil,
            and air<Cite n={[ID.usgsBees]} />. Wild pollinators are worth an estimated{' '}
            <strong>$937 million to $2.4 billion per year</strong> to California agriculture<Cite n={[ID.plos]} />.
          </p>
        </div>
      </Reveal>

      <Reveal className="soft-card cta">
        <h3>There is a way forward, and you can start today</h3>
        <p>
          Studies suggest that restoring field margins and reducing pesticide loads can reconnect
          pollinator habitat across the Central Valley<Cite n={[ID.plos, ID.xercesCV]} />.
        </p>
        <div className="hero-cta">
          <Link to="/email" className="btn">Email your food provider</Link>
          <Link to="/plant" className="btn ghost">Plant for pollinators</Link>
          <Link to="/report" className="btn ghost">File a complaint</Link>
        </div>
      </Reveal>
    </>
  )
}
