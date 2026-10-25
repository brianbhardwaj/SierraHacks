import type { IncomingMessage, ServerResponse } from 'node:http'
import { knowledge } from '../src/data/facts.ts'
import { aiConfig, completeChat, parseJsonObject } from './groq.ts'

type Msg = { role: 'user' | 'assistant'; content: string }
type NodeReq = IncomingMessage & { body?: unknown; query?: Record<string, string | string[] | undefined> }

const SYSTEM = `You are Sprout, a warm, plain-language guide on a website about pesticides in California's Central Valley agriculture.
Rules:
- Use ONLY the facts in KNOWLEDGE. Never invent statistics, chemical health claims, laws, phone numbers, or links.
- If the answer is not in KNOWLEDGE, say you do not have a sourced answer and suggest the county chart, the FAQ, or calling the County Agricultural Commissioner via 1-87PestLine.
- Give 2-4 concrete steps tailored to the user's situation. Keep it under 160 words. Be kind, never alarmist.
- Cite sources with bracket numbers like [13] exactly as they appear in KNOWLEDGE.
- You are not a doctor or lawyer. For emergencies say to call 911.`

const PRODUCT_SYSTEM = `You help shoppers understand a packaged food in California’s Central Valley.
Reply with a single JSON object, no markdown, no extra text:
{"description":"2-4 sentences","healthier":[{"name":"short name","why":"one sentence","query":"search terms"}]}
Rules:
- Describe what the product likely is from the name, brand, barcode, ingredients, or QR text.
- Never claim this site lab-tested the package. Never invent a pesticide reading for this barcode.
- Give 3 healthier alternatives: organic versions of the same food, less processed options, or produce typically easier to wash/peel. query must be a grocery search phrase.
- Keep description under 90 words. Be practical, not alarmist.`

const ZIP_SYSTEM = `You are Sprout summarizing a California zip for a pesticide-awareness site.
Reply with a single JSON object, no markdown, no extra text:
{"summary":"3-5 sentences","shopping":["tip","tip","tip"],"askStores":"1-2 sentences"}
Rules:
- Use ONLY the county/crop/chemical numbers in the user message. Do not invent pounds, ranks, or chemicals.
- If the zip is outside the site’s Central Valley counties, say so and still give general grocery questions.
- shopping: 3 concrete healthier-shopping tips tied to the crops grown there when possible.
- You are not a doctor. Do not claim a store or brand is pesticide-free.`

const knowledgeText = knowledge.map((k) => `- ${k.text}`).join('\n')

function send(res: ServerResponse, status: number, json: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(json))
}

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

async function readJson(req: NodeReq): Promise<unknown> {
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }
  const raw = await readBody(req)
  return raw ? JSON.parse(raw) : {}
}

function queryOf(req: NodeReq, url: string): URLSearchParams {
  const fromUrl = new URL(url, 'http://local').searchParams
  if (fromUrl.toString()) return fromUrl
  const q = req.query ?? {}
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(q)) {
    if (typeof v === 'string') params.set(k, v)
    else if (Array.isArray(v) && v[0]) params.set(k, v[0])
  }
  return params
}

const OFF_HEADERS = { 'User-Agent': 'Unspray/1.0 (SierraHacks student project)', Accept: 'application/json' }

export async function apiHandler(req: NodeReq, res: ServerResponse, next: () => void) {
  const url = req.url ?? ''
  const path = url.split('?')[0] ?? ''

  if (path === '/api/geo' && req.method === 'GET') {
    const q = queryOf(req, url).get('q')?.trim() ?? ''
    if (q.length < 3 || q.length > 80) return send(res, 400, { error: 'bad-query' })
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`,
        { headers: { 'User-Agent': 'Unspray/1.0 (SierraHacks student project)', Accept: 'application/json' } },
      )
      if (!r.ok) return send(res, 502, { error: 'geo' })
      const hits = (await r.json()) as {
        lat?: string
        lon?: string
        display_name?: string
        address?: { county?: string; city?: string; town?: string; village?: string; state?: string; postcode?: string }
      }[]
      const hit = hits[0]
      if (!hit?.lat || !hit.lon) return send(res, 404, { error: 'none' })
      const a = hit.address ?? {}
      return send(res, 200, {
        lat: Number(hit.lat),
        lon: Number(hit.lon),
        display: hit.display_name ?? '',
        county: (a.county ?? '').replace(/ County$/i, ''),
        city: a.city || a.town || a.village || '',
        state: a.state ?? '',
        zip: a.postcode ?? '',
      })
    } catch {
      return send(res, 502, { error: 'geo' })
    }
  }

  if (path === '/api/stores' && req.method === 'GET') {
    const q = queryOf(req, url).get('q')?.trim().slice(0, 80) ?? ''
    if (q.length < 2) return send(res, 400, { error: 'bad-query' })
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=12&countrycodes=us&q=${encodeURIComponent(`supermarket in ${q}`)}`,
        { headers: { 'User-Agent': 'Unspray/1.0 (SierraHacks student project)', Accept: 'application/json' } },
      )
      if (!r.ok) return send(res, 502, { error: 'stores' })
      const hits = (await r.json()) as { name?: string; type?: string; display_name?: string }[]
      const seen = new Set<string>()
      const stores = hits
        .map((h) => ({ name: h.name || '', kind: h.type || 'shop', where: h.display_name || '' }))
        .filter((s) => {
          if (!s.name || seen.has(s.name)) return false
          seen.add(s.name)
          return true
        })
      return send(res, 200, { stores })
    } catch {
      return send(res, 502, { error: 'stores' })
    }
  }

  if (path === '/api/product' && req.method === 'GET') {
    const params = queryOf(req, url)
    const barcode = (params.get('barcode') ?? '').replace(/\D/g, '')
    const q = (params.get('q') ?? '').trim().slice(0, 80)
    try {
      if (barcode) {
        const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, { headers: OFF_HEADERS })
        if (!r.ok) return send(res, 502, { error: 'product' })
        return send(res, 200, await r.json())
      }
      if (q.length >= 2) {
        const r = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=6&fields=code,product_name,brands,image_front_small_url,categories,labels_tags,ingredients_text`,
          { headers: OFF_HEADERS },
        )
        if (!r.ok) return send(res, 502, { error: 'product' })
        return send(res, 200, await r.json())
      }
      return send(res, 400, { error: 'bad-query' })
    } catch {
      return send(res, 502, { error: 'product' })
    }
  }

  if ((path === '/api/chat/status' || (path === '/api/chat' && req.method === 'GET'))) {
    return send(res, 200, { ai: Boolean(aiConfig()) })
  }

  if (path === '/api/sprout' && req.method === 'POST') {
    if (!aiConfig()) return send(res, 503, { error: 'no-key' })
    try {
      const parsed = (await readJson(req)) as {
        kind?: string
        product?: { name?: string; brands?: string; code?: string; categories?: string; ingredients?: string; qr?: string }
        match?: { kind?: string; label?: string }
        place?: {
          zip?: string
          city?: string
          county?: string
          state?: string
          lbs?: number
          rank?: number
          crops?: { name: string; chems: { name: string; lbs: number }[] }[]
        }
      }
      if (parsed.kind === 'product') {
        const p = parsed.product ?? {}
        const user = [
          `Name: ${p.name || 'unknown'}`,
          `Brand: ${p.brands || 'unknown'}`,
          `Barcode: ${p.code || 'none'}`,
          `Categories: ${p.categories || 'unknown'}`,
          `Ingredients: ${(p.ingredients || 'unknown').slice(0, 400)}`,
          `QR or scan text: ${p.qr || 'none'}`,
          `Crop match on this site: ${parsed.match?.kind === 'crop' ? parsed.match.label : parsed.match?.kind || 'unknown'}`,
        ].join('\n')
        const raw = await completeChat({
          system: PRODUCT_SYSTEM,
          messages: [{ role: 'user', content: user }],
          maxTokens: 900,
        })
        const body = raw
          ? parseJsonObject<{ description?: string; healthier?: { name?: string; why?: string; query?: string }[] }>(raw)
          : null
        if (!body?.description && !raw) return send(res, 502, { error: 'empty' })
        if (!body?.description) {
          return send(res, 200, { description: raw.slice(0, 800), healthier: [] })
        }
        return send(res, 200, {
          description: String(body.description).slice(0, 800),
          healthier: (body.healthier ?? [])
            .filter((a) => a?.name && a.why)
            .slice(0, 4)
            .map((a) => ({
              name: String(a.name).slice(0, 80),
              why: String(a.why).slice(0, 220),
              query: String(a.query || a.name).slice(0, 80),
            })),
        })
      }
      if (parsed.kind === 'zip') {
        const place = parsed.place ?? {}
        const cropLines = (place.crops ?? [])
          .slice(0, 5)
          .map((c) => {
            const chems = (c.chems ?? []).slice(0, 5).map((x) => `${x.name} (${x.lbs} lb)`).join('; ')
            return `- ${c.name}: ${chems}`
          })
          .join('\n')
        const user = [
          `Zip ${place.zip || 'unknown'}, city ${place.city || 'unknown'}, ${place.county || 'unknown'} County, ${place.state || 'unknown'}.`,
          place.lbs != null
            ? `DPR 2023: ${place.lbs} lb applied, rank #${place.rank} among California counties.`
            : 'This zip is outside the site’s 15 Central Valley county charts.',
          cropLines ? `Top crops and their top chemicals:\n${cropLines}` : 'No crop list for this county on this site.',
        ].join('\n')
        const raw = await completeChat({
          system: ZIP_SYSTEM,
          messages: [{ role: 'user', content: user }],
          maxTokens: 900,
        })
        const body = raw
          ? parseJsonObject<{ summary?: string; shopping?: string[]; askStores?: string }>(raw)
          : null
        if (!body?.summary && !raw) return send(res, 502, { error: 'empty' })
        if (!body?.summary) {
          return send(res, 200, { summary: raw.slice(0, 900), shopping: [], askStores: '' })
        }
        return send(res, 200, {
          summary: String(body.summary).slice(0, 900),
          shopping: (body.shopping ?? []).filter((t) => typeof t === 'string').slice(0, 4).map((t) => t.slice(0, 220)),
          askStores: String(body.askStores || '').slice(0, 400),
        })
      }
      return send(res, 400, { error: 'bad-kind' })
    } catch {
      return send(res, 500, { error: 'server' })
    }
  }

  if (!path.startsWith('/api/chat') || req.method !== 'POST') return next()
  if (!aiConfig()) return send(res, 503, { error: 'no-key' })

  try {
    const parsed = (await readJson(req)) as { messages?: Msg[] }
    const messages = (parsed.messages ?? [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }))
    if (messages.length === 0) return send(res, 400, { error: 'no-messages' })

    const reply = await completeChat({
      system: `${SYSTEM}\n\nKNOWLEDGE:\n${knowledgeText}`,
      messages,
      maxTokens: 400,
    })
    if (!reply) return send(res, 502, { error: 'empty' })
    return send(res, 200, { reply })
  } catch {
    return send(res, 500, { error: 'server' })
  }
}
