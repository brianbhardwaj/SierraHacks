import { productBrief } from '../server/unsprayApi'

export default async function handler(
  req: { method?: string; body?: unknown },
  res: { status: (n: number) => { json: (b: unknown) => void } },
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })
  const raw = req.body
  const parsed =
    typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : ((raw ?? {}) as Record<string, unknown>)
  const out = await productBrief({
    product: (parsed.product ?? {}) as Record<string, unknown>,
    crop: typeof parsed.crop === 'string' ? parsed.crop : undefined,
    chemicals: Array.isArray(parsed.chemicals) ? parsed.chemicals.map(String) : undefined,
    organic: Boolean(parsed.organic),
  })
  return res.status(out.status).json(out.body)
}
