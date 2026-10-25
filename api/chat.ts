import { chatReply } from '../server/unsprayApi'

export default async function handler(
  req: { method?: string; body?: unknown },
  res: { status: (n: number) => { json: (b: unknown) => void } },
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })
  const raw = req.body
  const parsed =
    typeof raw === 'string' ? (JSON.parse(raw) as { messages?: { role: 'user' | 'assistant'; content: string }[] }) : ((raw ?? {}) as { messages?: { role: 'user' | 'assistant'; content: string }[] })
  const out = await chatReply(parsed)
  return res.status(out.status).json(out.body)
}
