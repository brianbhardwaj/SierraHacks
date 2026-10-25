import type { Plugin } from 'vite'
import { apiHandler } from './server/api.ts'

export function chatPlugin(): Plugin {
  return {
    name: 'unspray-chat',
    configureServer(server) {
      server.middlewares.use(apiHandler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiHandler)
    },
  }
}
