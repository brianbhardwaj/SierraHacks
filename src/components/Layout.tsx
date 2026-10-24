import { useEffect } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { Backdrop, type BackdropMode } from './Backdrop'
import { SourcesDrawer } from './SourcesDrawer'

export const pages: {
  to: string
  label: string
  mode: BackdropMode
  theme: string
}[] = [
  { to: '/', label: 'Home', mode: 'meadow', theme: 'meadow' },
  { to: '/ecosystem', label: 'Problem', mode: 'wetland', theme: 'wetland' },
  { to: '/data', label: 'Data', mode: 'field', theme: 'field' },
  { to: '/near', label: 'Your zip', mode: 'field', theme: 'field' },
  { to: '/product', label: 'Check food', mode: 'garden', theme: 'garden' },
  { to: '/email', label: 'Email', mode: 'letters', theme: 'letters' },
  { to: '/report', label: 'Report', mode: 'alert', theme: 'alert' },
  { to: '/plant', label: 'Plant', mode: 'garden', theme: 'garden' },
  { to: '/ask', label: 'Ask', mode: 'chat', theme: 'chat' },
]

export function Layout() {
  const { pathname } = useLocation()
  const page = pages.find((p) => p.to === pathname) ?? pages[0]
  const index = Math.max(0, pages.findIndex((p) => p.to === pathname))
  const prev = pages[(index - 1 + pages.length) % pages.length]
  const next = pages[(index + 1) % pages.length]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="shell" data-theme={page.theme}>
      <Backdrop key={page.mode} mode={page.mode} />
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Unspray home" end>
          Unspray
        </NavLink>
        <nav className="top-nav" aria-label="Main">
          {pages.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              end
              className={({ isActive }) =>
                [isActive ? 'on' : '', p.to === '/product' ? 'glow-link' : ''].filter(Boolean).join(' ')
              }
            >
              {p.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className="stage">
        <main className="page">
          <Outlet />
          <nav className="pager" aria-label="Change page">
            <Link to={prev.to}>← {prev.label}</Link>
            <Link to={next.to}>{next.label} →</Link>
          </nav>
        </main>
        <footer className="foot">
          <p>
            Unspray is a SierraHacks 2026 student project. It is not legal or medical advice and is not
            affiliated with any agency. For emergencies call 911.
          </p>
        </footer>
        <SourcesDrawer key={pathname} />
      </div>
    </div>
  )
}
