import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const el = document.getElementById('root') as HTMLElement & { __unspray?: Root }
// A hot reload can run this file again. Unmount the old tree first so pages
// don't stack on top of each other.
el.__unspray?.unmount()
const root = createRoot(el)
el.__unspray = root
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
