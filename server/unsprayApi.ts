import { knowledge } from '../src/data/facts.ts'

export type ApiResult = { status: number; body: unknown }

type Msg = { role: 'user' | 'assistant'; content: string }
type ChatJson = {
  choices?: { message?: { content?: string | { type?: string; text?: string }[]; reasoning?: string } }[]
}

const UA = { 'User-Agent': 'Unspray/1.0 (SierraHacks student project)', Accept: 'application/json' }

const SYSTEM = `You are Sprout, a warm, plain-language guide on a website about pesticides in California's Central Valley agriculture.
Rules:
- Use ONLY the facts in KNOWLEDGE. Never invent statistics, chemical health claims, laws, phone numbers, or links.
- If the answer is not in KNOWLEDGE, say you do not have a sourced answer and suggest the county chart, the FAQ, or calling the County Agricultural Commissioner via 1-87PestLine.
- Give 2-4 concrete steps tailored to the user's situation. Keep it under 160 words. Be kind, never alarmist.
- Cite sources with bracket numbers like [13] exactly as they appear in KNOWLEDGE.
- When the user asks about food or shopping, suggest USDA organic, California certified organic, farmers markets, and asking stores who grew the food. Never claim a brand is pesticide-free.
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

function looksLikeThought(text: string) {
  return /^(we need to|the user asked|according to rules|let's|i need to)/i.test(text.trim())
}

function messageText(msg?: { content?: string | { type?: string; text?: string }[]; reasoning?: string }) {
  const content = msg?.content
  if (typeof content === 'string' && content.trim() && !looksLikeThought(content)) return content.trim()
  if (Array.isArray(content)) {
    const joined = content.map((p) => (typeof p === 'string' ? p : p.text || '')).join('').trim()
    if (joined && !looksLikeThought(joined)) return joined
  }
  const reasoning = typeof msg?.reasoning === 'string' ? msg.reasoning.trim() : ''
  if (reasoning && !looksLikeThought(reasoning)) return reasoning
  if (typeof content === 'string' && content.trim()) return content.trim()
  return reasoning
}

function parseJsonObject<T>(raw: string): T | null {
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

async function complete(k: string, body: Record<string, unknown>) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${k}`,
    ...UA,
  }
  const tokens = typeof body.max_tokens === 'number' ? body.max_tokens : 500
  const post = (modelId: string) =>
    fetch(`${baseUrl()}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...body,
        model: modelId,
        max_completion_tokens: tokens,
        ...(groqHost() ? { reasoning_format: 'hidden' } : {}),
      }),
    })
  let r = await post(model())
  if (!r.ok && groqHost()) {
    const err = (await r.json().catch(() => null)) as { error?: { code?: string } } | null
    if (err?.error?.code === 'model_not_found') r = await post(GROQ_FALLBACK_MODEL)
    else return { ok: false as const, status: r.status, text: '', json: err }
  }
  const json = (await r.json()) as ChatJson
  return { ok: r.ok, status: r.status, text: messageText(json.choices?.[0]?.message), json }
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
  const searches = [
    { term: `farmers market in ${query}`, kind: 'farmers market' },
    { term: `health food in ${query}`, kind: 'healthy food' },
    { term: `organic grocery in ${query}`, kind: 'organic grocery' },
    { term: `supermarket in ${query}`, kind: 'grocery' },
  ]
  const seen = new Set<string>()
  const stores: { name: string; kind: string; where: string }[] = []
  try {
    for (const s of searches) {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&countrycodes=us&q=${encodeURIComponent(s.term)}`,
        { headers: UA },
      )
      if (!r.ok) continue
      const hits = (await r.json()) as { name?: string; type?: string; display_name?: string }[]
      for (const h of hits) {
        const name = h.name || ''
        if (!name || seen.has(name)) continue
        seen.add(name)
        stores.push({ name, kind: s.kind, where: h.display_name || '' })
      }
    }
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

export type HealthyAlt = { name: string; why: string; practice: string; query: string }

function asAlts(raw: unknown): HealthyAlt[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((a) => a && typeof a === 'object')
    .map((a) => a as Record<string, unknown>)
    .filter((a) => a.name && a.why)
    .slice(0, 4)
    .map((a) => ({
      name: String(a.name).slice(0, 80),
      why: String(a.why).slice(0, 240),
      practice: String(a.practice || '').slice(0, 180),
      query: String(a.query || a.name).slice(0, 80),
    }))
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
Give 3 healthier choices that usually mean less pesticide use: USDA organic, California certified organic, farmers-market produce, IPM growers, or a less-processed version. Never say a brand is pesticide-free.
Reply with one JSON object, no markdown:
{"description":"2-3 sentences","practices":"1-2 sentences","alternatives":[{"name":"short name","why":"why it is a healthier choice","practice":"organic / farmers market / IPM","query":"grocery search"}]}`
    const payload = JSON.stringify({
      product,
      crop: crop || null,
      countyCropChemicals: chemicals,
      organicLabel: Boolean(parsed.organic),
    })
    const r = await complete(k, {
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: 'system', content: `${briefSystem}\n\nKNOWLEDGE:\n${knowledgeText}` },
        { role: 'user', content: payload.slice(0, 4000) },
      ],
    })
    if (!r.ok || !r.text) return { status: 502, body: { error: r.ok ? 'empty' : 'upstream' } }
    const brief = parseJsonObject<{ description?: string; practices?: string; alternatives?: unknown }>(r.text)
    return {
      status: 200,
      body: {
        description: String(brief?.description || r.text).slice(0, 800),
        practices: String(brief?.practices ?? '').slice(0, 800),
        alternatives: asAlts(brief?.alternatives),
      },
    }
  } catch {
    return { status: 500, body: { error: 'server' } }
  }
}

export async function zipBrief(parsed: {
  zip?: string
  city?: string
  county?: string
  state?: string
  lbs?: number
  rank?: number
  crops?: { name: string; chems: { name: string; lbs: number }[] }[]
  stores?: { name: string; kind: string }[]
}): Promise<ApiResult> {
  const k = key()
  if (!k) return { status: 503, body: { error: 'no-key' } }
  try {
    const cropLines = (parsed.crops ?? [])
      .slice(0, 5)
      .map((c) => {
        const chems = (c.chems ?? []).slice(0, 5).map((x) => `${x.name} (${x.lbs} lb)`).join('; ')
        return `- ${c.name}: ${chems}`
      })
      .join('\n')
    const storeLines = (parsed.stores ?? []).slice(0, 12).map((s) => `- ${s.name} (${s.kind})`).join('\n')
    const user = [
      `Zip ${parsed.zip || 'unknown'}, city ${parsed.city || 'unknown'}, ${parsed.county || 'unknown'} County, ${parsed.state || 'unknown'}.`,
      parsed.lbs != null
        ? `DPR 2023: ${parsed.lbs} lb applied, rank #${parsed.rank} among California counties.`
        : 'This zip is outside the site’s 15 Central Valley county charts.',
      cropLines ? `Top crops and their top chemicals:\n${cropLines}` : 'No crop list for this county on this site.',
      storeLines ? `Mapped shops (OpenStreetMap names, not a supplier list):\n${storeLines}` : 'No shops mapped.',
    ].join('\n')
    const zipSystem = `You are Sprout helping someone find nearby markets that are more likely to carry healthier, lower-pesticide food.
Use ONLY the county numbers and shop names in the user message. Do not invent pounds, ranks, chemicals, or stores.
From the mapped names, pick shops that sound like farmers markets, health-food, organic grocers, or natural markets. Say OSM does not publish inventory.
Reply with one JSON object, no markdown:
{"summary":"3-5 sentences","healthyShops":["shop name","shop name"],"ask":"1-2 sentences on what to ask those shops"}`
    const r = await complete(k, {
      temperature: 0.3,
      max_tokens: 800,
      messages: [{ role: 'system', content: zipSystem }, { role: 'user', content: user }],
    })
    if (!r.ok || !r.text) return { status: 502, body: { error: r.ok ? 'empty' : 'upstream' } }
    const body = parseJsonObject<{ summary?: string; healthyShops?: string[]; ask?: string }>(r.text)
    return {
      status: 200,
      body: {
        summary: String(body?.summary || r.text).slice(0, 900),
        healthyShops: (body?.healthyShops ?? []).filter((t) => typeof t === 'string').slice(0, 6).map((t) => t.slice(0, 80)),
        ask: String(body?.ask || '').slice(0, 400),
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
    if (!r.text) return { status: 502, body: { error: 'empty' } }
    return { status: 200, body: { reply: r.text } }
  } catch {
    return { status: 500, body: { error: 'server' } }
  }
}
