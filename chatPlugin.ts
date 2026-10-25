import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import {
  chatReply,
  chatStatus,
  geoLookup,
  productBrief,
  productLookup,
  storeLookup,
  zipBrief,
  type ApiResult,
} from './server/unsprayApi.ts'

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

function send(res: ServerResponse, result: ApiResult) {
  res.statusCode = result.status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result.body))
}

export function chatPlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url ?? ''
    const path = url.split('?')[0]

    if (path === '/api/geo' && req.method === 'GET') {
      const q = new URL(url, 'http://local').searchParams.get('q')?.trim() ?? ''
      return send(res, await geoLookup(q))
    }

    if (path === '/api/stores' && req.method === 'GET') {
      const q = new URL(url, 'http://local').searchParams.get('q')?.trim() ?? ''
      return send(res, await storeLookup(q))
    }

    if (path === '/api/product' && req.method === 'GET') {
      const params = new URL(url, 'http://local').searchParams
      return send(res, await productLookup(params.get('barcode') ?? '', params.get('q') ?? ''))
    }

    if (path === '/api/product-brief' && req.method === 'POST') {
      try {
        return send(res, await productBrief(JSON.parse(await readBody(req))))
      } catch {
        return send(res, { status: 500, body: { error: 'server' } })
      }
    }

    if (path === '/api/zip-brief' && req.method === 'POST') {
      try {
        return send(res, await zipBrief(JSON.parse(await readBody(req))))
      } catch {
        return send(res, { status: 500, body: { error: 'server' } })
      }
    }

    if ((path === '/api/chat' && req.method === 'GET') || path === '/api/chat/status') {
      return send(res, chatStatus())
    }
    if (!url.startsWith('/api/chat') || req.method !== 'POST') return next()
    try {
      return send(res, await chatReply(JSON.parse(await readBody(req))))
    } catch {
      return send(res, { status: 500, body: { error: 'server' } })
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
