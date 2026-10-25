import { Chat } from '../components/Chat'
import { Faq } from '../components/Faq'
import { Reveal } from '../components/Motion'

export function AskPage() {
  return (
    <>
      <Reveal as="section" className="page-head">
        <p className="eyebrow">Ask</p>
        <h1>Tell Sprout your situation</h1>
        <p className="sub">
          Where you live, who you look after, what you eat or grow. Sprout uses Groq AI plus this site’s
          sourced facts, then cites every number it uses.
        </p>
      </Reveal>
      <Reveal>
        <Chat />
      </Reveal>
      <Reveal as="section" className="section-head">
        <h2>Frequently asked questions</h2>
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
    </>
  )
}
