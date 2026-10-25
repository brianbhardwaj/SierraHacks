import type { IncomingMessage, ServerResponse } from 'node:http'
import { apiHandler } from './api.ts'

export default function run(req: IncomingMessage, res: ServerResponse) {
  return apiHandler(req, res, () => {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'not-found' }))
  })
}
