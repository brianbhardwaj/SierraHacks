type ChatTurn = { role: 'system' | 'user' | 'assistant'; content: string }

export type AiConfig = {
  key: string
  base: string
  model: string
}

export function aiConfig(): AiConfig | null {
  if (process.env.GROQ_API_KEY) {
    return {
      key: process.env.GROQ_API_KEY,
      base: 'https://api.groq.com/openai/v1',
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
    }
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      key: process.env.OPENAI_API_KEY,
      base: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.UNSPRAY_MODEL || 'gpt-4o-mini',
    }
  }
  return null
}

export async function completeChat(opts: {
  system: string
  messages: ChatTurn[]
  json?: boolean
  maxTokens?: number
  temperature?: number
}): Promise<string | null> {
  const cfg = aiConfig()
  if (!cfg) return null
  const r = await fetch(`${cfg.base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.key}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 500,
      max_completion_tokens: opts.maxTokens ?? 500,
      ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
      messages: [{ role: 'system', content: opts.system }, ...opts.messages],
    }),
  })
  if (!r.ok) {
    const err = await r.text()
    console.error('AI upstream', r.status, err.slice(0, 800))
    return null
  }
  const j = (await r.json()) as {
    choices?: { message?: { content?: string | { type?: string; text?: string }[]; reasoning?: string } }[]
  }
  const msg = j.choices?.[0]?.message
  const text = messageText(msg)
  if (!text) console.error('AI empty payload', JSON.stringify(j).slice(0, 800))
  return text
}

function messageText(msg?: { content?: string | { type?: string; text?: string }[]; reasoning?: string }): string | null {
  const content = msg?.content
  if (typeof content === 'string' && content.trim()) return content.trim()
  if (Array.isArray(content)) {
    const joined = content.map((p) => (typeof p === 'string' ? p : p.text || '')).join('').trim()
    if (joined) return joined
  }
  if (typeof msg?.reasoning === 'string' && msg.reasoning.trim()) return msg.reasoning.trim()
  return null
}

export function parseJsonObject<T>(raw: string): T | null {
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    return JSON.parse(stripped) as T
  } catch {
    const markers = ['{"description"', '{"summary"', '{ "description"', '{ "summary"']
    let start = -1
    for (const m of markers) {
      const i = stripped.lastIndexOf(m)
      if (i > start) start = i
    }
    if (start < 0) start = stripped.indexOf('{')
    const end = stripped.lastIndexOf('}')
    if (start < 0 || end <= start) return null
    try {
      return JSON.parse(stripped.slice(start, end + 1)) as T
    } catch {
      return null
    }
  }
}
