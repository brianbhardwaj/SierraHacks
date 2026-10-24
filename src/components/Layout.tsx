import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Backdrop, type BackdropMode } from './Backdrop'
import { SourcesDrawer } from './SourcesDrawer'

export const pages: {
  to: string
  label: string
  icon: string
  mode: BackdropMode
  theme: string
}[] = [
  { to: '/', label: 'Home', icon: '🌿', mode: 'meadow', theme: 'meadow' },
  { to: '/ecosystem', label: 'Ecosystem', icon: '🦋', mode: 'wetland', theme: 'wetland' },
  { to: '/data', label: 'Data', icon: '📊', mode: 'field', theme: 'field' },
  { to: '/email', label: 'Email', icon: '✉️', mode: 'letters', theme: 'letters' },
  { to: '/report', label: 'Report', icon: '📣', mode: 'alert', theme: 'alert' },
  { to: '/plant', label: 'Plant', icon: '🌼', mode: 'garden', theme: 'garden' },
  { to: '/ask', label: 'Ask', icon: '💬', mode: 'chat', theme: 'chat' },
]

export function Layout() {
  const { pathname } = useLocation()
  const page = pages.find((p) => p.to === pathname) ?? pages[0]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="shell" data-theme={page.theme}>
      <Backdrop key={page.mode} mode={page.mode} />
      <header className="nav">
        <NavLink to="/" className="brand" aria-label="Unspray home">
          <span className="brand-leaf" aria-hidden="true">🍃</span>
          Unspray
        </NavLink>
        <nav aria-label="Main">
          {pages.map((p) => (
            <NavLink key={p.to} to={p.to} end className={({ isActive }) => (isActive ? 'on' : '')}>
              <span aria-hidden="true">{p.icon}</span> {p.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main key={pathname} className="page">
        <Outlet />
      </main>
      <footer className="foot">
        <p>
          Unspray is a SierraHacks 2026 student project. It is not legal or medical advice and is not
          affiliated with any agency. For emergencies call 911.
        </p>
      </footer>
      <SourcesDrawer key={pathname} />
    </div>
  )
}
