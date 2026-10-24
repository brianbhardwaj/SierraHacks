import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { chatPlugin } from './chatPlugin.ts'
import { knowledge } from './src/data/facts.ts'

const knowledgeText = knowledge.map((k) => `- ${k.text}`).join('\n')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), chatPlugin(knowledgeText)],
})
