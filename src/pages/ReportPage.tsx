import { Cite } from '../components/Cite'
import { Reveal } from '../components/Motion'
import { ReportBuilder } from '../components/ReportBuilder'
import { ID } from '../data/facts'

const steps = [
  { n: 1, t: 'Stay safe', d: 'Leave the area. If anyone has trouble breathing, call 911. For first-aid advice, call Poison Control at 1-800-222-1222.' },
  { n: 2, t: 'Write it down now', d: 'Time, place, smell, wind, equipment, who was nearby. Take photos. Use the builder below so nothing is forgotten.' },
  { n: 3, t: 'Report it', d: 'Call 1-87PestLine (1-877-378-5463) to be connected to your County Agricultural Commissioner, or use the CASPIR app.' },
  { n: 4, t: 'Follow up', d: 'Ask which pesticide was used and request a copy of the final report. You can ask to stay anonymous.' },
]

export function ReportPage() {
  return (
    <>
      <Reveal as="section" className="page-head">
        <p className="eyebrow">File a complaint</p>
        <h1>See spraying that hurt something? Say so.</h1>
        <p className="sub">
          California’s pesticide rules are enforced locally, and enforcement starts with a report. You can
          report harm to people, bees, fish, plants, or water<Cite n={[ID.dprReportPage]} />.
        </p>
      </Reveal>

      <Reveal className="soft-card emergency" >
        <strong>🚨 Emergency?</strong> Call <a href="tel:911">911</a> first. For poisoning advice call
        Poison Control <a href="tel:18002221222">1-800-222-1222</a><Cite n={[ID.dprReportPage]} />.
      </Reveal>

      <section className="steps">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 90} className="soft-card step-card">
            <span className="step big">{s.n}</span>
            <h4>{s.t}</h4>
            <p>{s.d}</p>
          </Reveal>
        ))}
      </section>

      <Reveal>
        <h2 className="h2">Build your report</h2>
        <ReportBuilder />
      </Reveal>

      <section className="rights">
        <Reveal className="soft-card">
          <h4>Your rights</h4>
          <ul>
            <li>You can report anonymously<Cite n={[ID.dprHowTo, ID.dprReportPage]} />.</li>
            <li>Your County Agricultural Commissioner follows up, typically within a business day<Cite n={[ID.dprCaspir]} />.</li>
            <li>You can ask for a copy of the final report<Cite n={[ID.dprCaspir]} />.</li>
          </ul>
        </Reveal>
        <Reveal className="soft-card" delay={100}>
          <h4>Other official tools</h4>
          <ul>
            <li>
              <a href="https://www.cdpr.ca.gov/report-a-pesticide-incident/" target="_blank" rel="noreferrer">DPR: Report a Pesticide Incident ↗</a>
              <Cite n={[ID.dprReportPage]} />
            </li>
            <li>
              <a href="https://spraydays.cdpr.ca.gov/" target="_blank" rel="noreferrer">SprayDays: free alerts before restricted sprays ↗</a>
              <Cite n={[ID.sprayDays, ID.sprayDays2]} />
            </li>
          </ul>
        </Reveal>
      </section>
    </>
  )
}
