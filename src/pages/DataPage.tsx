import { Cite } from '../components/Cite'
import { CountyLookup } from '../components/CountyLookup'
import { Explorer } from '../components/Explorer'
import { Reveal } from '../components/Motion'
import { ID } from '../data/facts'

export function DataPage() {
  return (
    <>
      <Reveal as="section" className="page-head">
        <p className="eyebrow">Data</p>
        <h1>Where the spraying is concentrated</h1>
        <p className="sub">
          Five counties (Fresno, Kern, Tulare, San Joaquin, and Monterey) account for half of California’s
          reported pesticide pounds<Cite n={[ID.dprReport2023]} />. Explore the crops and chemicals behind it.
        </p>
      </Reveal>

      <Reveal>
        <h2 className="h2">Crops and counties</h2>
        <Explorer />
      </Reveal>

      <Reveal>
        <h2 className="h2">Find your county</h2>
        <CountyLookup />
      </Reveal>

      <Reveal className="soft-card honest">
        <h3>About “what percent of my food has pesticides?”</h3>
        <p>
          We looked for it. No public dataset links a specific farm to the shelf where you shop, so any
          percentage would be made up. What is public is use by county and crop, shown above. To get real
          answers about your own food, use the Email page and ask your providers directly.
        </p>
      </Reveal>
    </>
  )
}
