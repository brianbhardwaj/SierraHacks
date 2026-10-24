import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

// Optional AI backend. Set OPENAI_API_KEY in .env.local (and optionally
// OPENAI_BASE_URL / UNSPRAY_MODEL). Groq keys use
// OPENAI_BASE_URL=https://api.groq.com/openai/v1. Without a key the site
// falls back to its built-in, source-grounded guide.

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
    const path = url.split('?')[0]

    if (path === '/api/geo' && req.method === 'GET') {
      const q = new URL(url, 'http://local').searchParams.get('q')?.trim() ?? ''
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
      const q = new URL(url, 'http://local').searchParams.get('q')?.trim().slice(0, 80) ?? ''
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
      const params = new URL(url, 'http://local').searchParams
      const barcode = (params.get('barcode') ?? '').replace(/\D/g, '')
      const q = (params.get('q') ?? '').trim().slice(0, 80)
      const headers = { 'User-Agent': 'Unspray/1.0 (SierraHacks student project)', Accept: 'application/json' }
      const fields =
        'code,product_name,generic_name,brands,quantity,image_front_small_url,image_front_url,image_url,categories,labels,labels_tags,ingredients_text,packaging'
      try {
        if (barcode) {
          const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, { headers })
          if (!r.ok) return send(res, 502, { error: 'product' })
          return send(res, 200, await r.json())
        }
        if (q.length >= 2) {
          const r = await fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8&fields=${fields}`,
            { headers },
          )
          if (!r.ok) return send(res, 502, { error: 'product' })
          return send(res, 200, await r.json())
        }
        return send(res, 400, { error: 'bad-query' })
      } catch {
        return send(res, 502, { error: 'product' })
      }
    }

    if (path === '/api/product-brief' && req.method === 'POST') {
      if (!key) return send(res, 503, { error: 'no-key' })
      try {
        const parsed = JSON.parse(await readBody(req)) as {
          product?: Record<string, unknown>
          crop?: string
          chemicals?: string[]
          organic?: boolean
        }
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
        const base = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'
        const r = await fetch(`${base}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: process.env.UNSPRAY_MODEL ?? 'gpt-4o-mini',
            temperature: 0.2,
            max_tokens: 420,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: `${briefSystem}\n\nKNOWLEDGE:\n${knowledge}` },
              { role: 'user', content: payload.slice(0, 4000) },
            ],
          }),
        })
        if (!r.ok) return send(res, 502, { error: 'upstream' })
        const j = (await r.json()) as { choices?: { message?: { content?: string } }[] }
        const text = j.choices?.[0]?.message?.content?.trim()
        if (!text) return send(res, 502, { error: 'empty' })
        const brief = JSON.parse(text) as { description?: string; practices?: string; alternatives?: string }
        return send(res, 200, {
          description: String(brief.description ?? '').slice(0, 800),
          practices: String(brief.practices ?? '').slice(0, 800),
          alternatives: String(brief.alternatives ?? '').slice(0, 800),
        })
      } catch {
        return send(res, 500, { error: 'server' })
      }
    }

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
