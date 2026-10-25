import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { chatPlugin } from './chatPlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY
  if (env.GROQ_API_KEY) process.env.GROQ_API_KEY = env.GROQ_API_KEY
  if (env.OPENAI_BASE_URL) process.env.OPENAI_BASE_URL = env.OPENAI_BASE_URL
  if (env.UNSPRAY_MODEL) process.env.UNSPRAY_MODEL = env.UNSPRAY_MODEL

  return {
    plugins: [react(), chatPlugin()],
  }
})
