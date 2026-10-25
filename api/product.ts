import { productLookup } from '../server/unsprayApi'

function qstr(v: unknown) {
  if (Array.isArray(v)) return String(v[0] ?? '')
  return String(v ?? '')
}

export default async function handler(req: { method?: string; query?: Record<string, unknown> }, res: { status: (n: number) => { json: (b: unknown) => void } }) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method' })
  const out = await productLookup(qstr(req.query?.barcode), qstr(req.query?.q))
  return res.status(out.status).json(out.body)
}
