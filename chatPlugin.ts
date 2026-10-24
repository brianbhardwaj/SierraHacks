import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

// Optional AI backend. Set OPENAI_API_KEY (and optionally OPENAI_BASE_URL /
// UNSPRAY_MODEL) before starting Vite. Without a key the site falls back to
// its built-in, source-grounded guide, so nothing breaks.

type Msg = { role: 'user' | 'assistant'; content: string }

const SYSTEM = `You are Sprout, a warm, plain-language guide on a website about pesticides in California's Central Valley agriculture.
Rules:
- Use ONLY the facts in KNOWLEDGE. Never invent statistics, chemical health claims, laws, phone numbers, or links.
- If the answer is not in KNOWLEDGE, say you do not have a sourced answer and suggest the county chart, the FAQ, or calling the County Agricultural Commissioner via 1-87PestLine.
- Give 2-4 concrete steps tailored to the user's situation. Keep it under 160 words. Be kind, never alarmist.
- Cite sources with bracket numbers like [13] exactly as they appear in KNOWLEDGE.
- You are not a doctor or lawyer. For emergencies say to call 911.`

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (c) => {
      body += c
      if (body.length > 50_000) reject(new Error('too large'))
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function send(res: ServerResponse, status: number, json: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(json))
}

export function chatPlugin(knowledge: string): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url ?? ''
    const key = process.env.OPENAI_API_KEY

    if (url.startsWith('/api/chat/status')) {
      return send(res, 200, { ai: Boolean(key) })
    }
    if (!url.startsWith('/api/chat') || req.method !== 'POST') return next()
    if (!key) return send(res, 503, { error: 'no-key' })

    try {
      const parsed = JSON.parse(await readBody(req)) as { messages?: Msg[] }
      const messages = (parsed.messages ?? [])
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }))
      if (messages.length === 0) return send(res, 400, { error: 'no-messages' })

      const base = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'
      const r = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.UNSPRAY_MODEL ?? 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 400,
          messages: [{ role: 'system', content: `${SYSTEM}\n\nKNOWLEDGE:\n${knowledge}` }, ...messages],
        }),
      })
      if (!r.ok) return send(res, 502, { error: 'upstream' })
      const j = (await r.json()) as { choices?: { message?: { content?: string } }[] }
      const reply = j.choices?.[0]?.message?.content?.trim()
      if (!reply) return send(res, 502, { error: 'empty' })
      return send(res, 200, { reply })
    } catch {
      return send(res, 500, { error: 'server' })
    }
  }

  return {
    name: 'unspray-chat',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}
