import { knowledge } from '../src/data/facts.ts'

export type ApiResult = { status: number; body: unknown }

type Msg = { role: 'user' | 'assistant'; content: string }

const UA = { 'User-Agent': 'Unspray/1.0 (SierraHacks student project)', Accept: 'application/json' }

const SYSTEM = `You are Sprout, a warm, plain-language guide on a website about pesticides in California's Central Valley agriculture.
Rules:
- Use ONLY the facts in KNOWLEDGE. Never invent statistics, chemical health claims, laws, phone numbers, or links.
- If the answer is not in KNOWLEDGE, say you do not have a sourced answer and suggest the county chart, the FAQ, or calling the County Agricultural Commissioner via 1-87PestLine.
- Give 2-4 concrete steps tailored to the user's situation. Keep it under 160 words. Be kind, never alarmist.
- Cite sources with bracket numbers like [13] exactly as they appear in KNOWLEDGE.
- You are not a doctor or lawyer. For emergencies say to call 911.`

export const knowledgeText = knowledge.map((k) => `- ${k.text}`).join('\n')

function key() {
  return process.env.OPENAI_API_KEY
}

function baseUrl() {
  return process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'
}

const GROQ_FALLBACK_MODEL = 'openai/gpt-oss-20b'

function groqHost() {
  return baseUrl().includes('api.groq.com')
}

function model() {
  const requested = process.env.UNSPRAY_MODEL
  if (groqHost() && (!requested || requested === 'llama-3.3-70b-versatile')) return GROQ_FALLBACK_MODEL
  return requested ?? 'gpt-4o-mini'
}

async function complete(k: string, body: Record<string, unknown>) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${k}`,
    ...UA,
  }
  const post = (modelId: string) =>
    fetch(`${baseUrl()}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...body, model: modelId }),
    })
  let r = await post(model())
  if (!r.ok && groqHost()) {
    const err = (await r.json().catch(() => null)) as { error?: { code?: string } } | null
    if (err?.error?.code === 'model_not_found') r = await post(GROQ_FALLBACK_MODEL)
    else return { ok: false as const, status: r.status, json: err }
  }
  return { ok: r.ok, status: r.status, json: await r.json() }
}

export async function geoLookup(q: string): Promise<ApiResult> {
  const query = q.trim()
  if (query.length < 3 || query.length > 80) return { status: 400, body: { error: 'bad-query' } }
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`,
      { headers: UA },
    )
    if (!r.ok) return { status: 502, body: { error: 'geo' } }
    const hits = (await r.json()) as {
      lat?: string
      lon?: string
      display_name?: string
      address?: { county?: string; city?: string; town?: string; village?: string; state?: string; postcode?: string }
    }[]
    const hit = hits[0]
    if (!hit?.lat || !hit.lon) return { status: 404, body: { error: 'none' } }
    const a = hit.address ?? {}
    return {
      status: 200,
      body: {
        lat: Number(hit.lat),
        lon: Number(hit.lon),
        display: hit.display_name ?? '',
        county: (a.county ?? '').replace(/ County$/i, ''),
        city: a.city || a.town || a.village || '',
        state: a.state ?? '',
        zip: a.postcode ?? '',
      },
    }
  } catch {
    return { status: 502, body: { error: 'geo' } }
  }
}

export async function storeLookup(q: string): Promise<ApiResult> {
  const query = q.trim().slice(0, 80)
  if (query.length < 2) return { status: 400, body: { error: 'bad-query' } }
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=12&countrycodes=us&q=${encodeURIComponent(`supermarket in ${query}`)}`,
      { headers: UA },
    )
    if (!r.ok) return { status: 502, body: { error: 'stores' } }
    const hits = (await r.json()) as { name?: string; type?: string; display_name?: string }[]
    const seen = new Set<string>()
    const stores = hits
      .map((h) => ({ name: h.name || '', kind: h.type || 'shop', where: h.display_name || '' }))
      .filter((s) => {
        if (!s.name || seen.has(s.name)) return false
        seen.add(s.name)
        return true
      })
    return { status: 200, body: { stores } }
  } catch {
    return { status: 502, body: { error: 'stores' } }
  }
}

export async function productLookup(barcodeRaw: string, qRaw: string): Promise<ApiResult> {
  const barcode = barcodeRaw.replace(/\D/g, '')
  const q = qRaw.trim().slice(0, 80)
  const fields =
    'code,product_name,generic_name,brands,quantity,image_front_small_url,image_front_url,image_url,categories,labels,labels_tags,ingredients_text,packaging'
  try {
    if (barcode) {
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, { headers: UA })
      if (!r.ok) return { status: 502, body: { error: 'product' } }
      return { status: 200, body: await r.json() }
    }
    if (q.length >= 2) {
      const r = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8&fields=${fields}`,
        { headers: UA },
      )
      if (!r.ok) return { status: 502, body: { error: 'product' } }
      return { status: 200, body: await r.json() }
    }
    return { status: 400, body: { error: 'bad-query' } }
  } catch {
    return { status: 502, body: { error: 'product' } }
  }
}

export async function productBrief(parsed: {
  product?: Record<string, unknown>
  crop?: string
  chemicals?: string[]
  organic?: boolean
}): Promise<ApiResult> {
  const k = key()
  if (!k) return { status: 503, body: { error: 'no-key' } }
  try {
    const product = parsed.product ?? {}
    const crop = typeof parsed.crop === 'string' ? parsed.crop.slice(0, 80) : ''
    const chemicals = Array.isArray(parsed.chemicals) ? parsed.chemicals.slice(0, 8).map(String) : []
    const briefSystem = `You write a short shopper note for Unspray, a Central Valley pesticide site.
Use ONLY the product fields and crop notes provided. Never invent a farm, a brand spray list, a residue test, or a health diagnosis.
If a crop match and chemical list are given, say they are California county/crop totals, not this package.
If organic is true, say that is a catalog label, not a lab test by this site.
If you lack a fact, say so in one clause.
Return JSON only: {"description":"","practices":"","alternatives":""}
Each value is 1-3 sentences, plain language.`
    const payload = JSON.stringify({
      product,
      crop: crop || null,
      countyCropChemicals: chemicals,
      organicLabel: Boolean(parsed.organic),
    })
    const r = await complete(k, {
      temperature: 0.2,
      max_tokens: 420,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${briefSystem}\n\nKNOWLEDGE:\n${knowledgeText}` },
        { role: 'user', content: payload.slice(0, 4000) },
      ],
    })
    if (!r.ok) return { status: 502, body: { error: 'upstream' } }
    const j = r.json as { choices?: { message?: { content?: string } }[] }
    const text = j.choices?.[0]?.message?.content?.trim()
    if (!text) return { status: 502, body: { error: 'empty' } }
    const brief = JSON.parse(text) as { description?: string; practices?: string; alternatives?: string }
    return {
      status: 200,
      body: {
        description: String(brief.description ?? '').slice(0, 800),
        practices: String(brief.practices ?? '').slice(0, 800),
        alternatives: String(brief.alternatives ?? '').slice(0, 800),
      },
    }
  } catch {
    return { status: 500, body: { error: 'server' } }
  }
}

export function chatStatus(): ApiResult {
  return { status: 200, body: { ai: Boolean(key()) } }
}

export async function chatReply(parsed: { messages?: Msg[] }): Promise<ApiResult> {
  const k = key()
  if (!k) return { status: 503, body: { error: 'no-key' } }
  try {
    const messages = (parsed.messages ?? [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }))
    if (messages.length === 0) return { status: 400, body: { error: 'no-messages' } }
    const r = await complete(k, {
      temperature: 0.3,
      max_tokens: 400,
      messages: [{ role: 'system', content: `${SYSTEM}\n\nKNOWLEDGE:\n${knowledgeText}` }, ...messages],
    })
    if (!r.ok) return { status: 502, body: { error: 'upstream' } }
    const j = r.json as { choices?: { message?: { content?: string } }[] }
    const reply = j.choices?.[0]?.message?.content?.trim()
    if (!reply) return { status: 502, body: { error: 'empty' } }
    return { status: 200, body: { reply } }
  } catch {
    return { status: 500, body: { error: 'server' } }
  }
}
