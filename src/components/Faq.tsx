import { faq } from '../data/facts'
import { Cite } from './Cite'

export function Faq() {
  return (
    <div className="faq">
      {faq.map((f) => (
        <details key={f.q} className="soft-card">
          <summary>{f.q}</summary>
          <p>
            {f.a}
            <Cite n={f.cite} />
          </p>
        </details>
      ))}
    </div>
  )
}
