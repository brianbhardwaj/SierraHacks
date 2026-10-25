import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { chatPlugin } from './chatPlugin.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) process.env[k] = v
  }
  return {
    plugins: [react(), chatPlugin()],
  }
})
