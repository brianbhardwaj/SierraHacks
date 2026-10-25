import { zipBrief } from '../server/unsprayApi'

export default async function handler(
  req: { method?: string; body?: unknown },
  res: { status: (n: number) => { json: (b: unknown) => void } },
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })
  const raw = req.body
  const parsed =
    typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : ((raw ?? {}) as Record<string, unknown>)
  const crops = Array.isArray(parsed.crops) ? parsed.crops : []
  const stores = Array.isArray(parsed.stores) ? parsed.stores : []
  const out = await zipBrief({
    zip: typeof parsed.zip === 'string' ? parsed.zip : undefined,
    city: typeof parsed.city === 'string' ? parsed.city : undefined,
    county: typeof parsed.county === 'string' ? parsed.county : undefined,
    state: typeof parsed.state === 'string' ? parsed.state : undefined,
    lbs: typeof parsed.lbs === 'number' ? parsed.lbs : undefined,
    rank: typeof parsed.rank === 'number' ? parsed.rank : undefined,
    crops: crops as { name: string; chems: { name: string; lbs: number }[] }[],
    stores: stores as { name: string; kind: string }[],
  })
  return res.status(out.status).json(out.body)
}
