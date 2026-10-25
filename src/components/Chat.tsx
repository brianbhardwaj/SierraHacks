import { useEffect, useRef, useState, type FormEvent } from 'react'
import { localReply, type ChatMessage } from '../lib/helper'
import { LinkedText } from './Cite'

const starters = [
  'I have two kids in a school near orchards',
  'I rent a home on a private well',
  'I work in the fields',
  'I want to protect bees and monarchs in my yard',
  'How do I ask my grocery store about pesticides?',
]

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi, I’m Sprout. Tell me your situation (where you live, who you look after, what you eat or do for work) and I’ll suggest ways to help protect Central Valley ecosystems from pesticide harm. I only use the sourced facts on this site.',
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [ai, setAi] = useState<boolean | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/chat/status')
      .then((r) => (r.ok ? r.json() : { ai: false }))
      .then((j: { ai: boolean }) => setAi(Boolean(j.ai)))
      .catch(() => setAi(false))
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages, busy])

  async function send(text: string) {
    const clean = text.trim()
    if (!clean || busy) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: clean }]
    setMessages(next)
    setInput('')
    setBusy(true)
    let reply = ''
    if (ai) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next.slice(-8) }),
        })
        if (res.ok) {
          reply = ((await res.json()) as { reply: string }).reply
        }
      } catch {
        /* fall through to offline helper */
      }
    }
    if (!reply) reply = localReply(clean)
    setMessages([...next, { role: 'assistant', content: reply }])
    setBusy(false)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void send(input)
  }

  return (
    <div className="soft-card chat">
      <div className="chat-top">
        <span className="avatar" aria-hidden="true">S</span>
        <div>
          <strong>Sprout, your action guide</strong>
          <small>
            {ai === null
              ? 'Connecting…'
              : ai
                ? 'AI mode: answers use only this site’s sourced facts'
                : 'Built-in guide mode: no AI key set, answers use this site’s sourced facts'}
          </small>
        </div>
      </div>

      <div className="log" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content.split('\n\n').map((p, j) => (
              <p key={j}>
                <LinkedText text={p} />
              </p>
            ))}
          </div>
        ))}
        {busy && <div className="msg assistant typing">Thinking…</div>}
        <div ref={endRef} />
      </div>

      <div className="chips starters">
        {starters.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => void send(s)}>
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="chat-form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your situation…"
          aria-label="Describe your situation"
        />
        <button type="submit" className="btn" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
      <p className="note">
        Sprout is not a doctor or a lawyer. For emergencies call 911.
      </p>
    </div>
  )
}
