import { NavLink, Outlet } from 'react-router-dom'

const tools = [
  { path: '/channel-flow', label: 'Channel Flow Calculator' },
  { path: '/stage-storage', label: 'Stage Storage Calculator' },
]

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">TRAPEZOID</div>
          <div className="sidebar-logo-sub">RAIN CONSULTING</div>
        </div>
        <NavLink to="/" end className="sidebar-back">
          ◄ All Tools
        </NavLink>
        <nav className="sidebar-nav">
          {tools.map((t) => (
            <NavLink
              key={t.path}
              to={t.path}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          Rain Consulting
          <br />
          Internal Tools
        </div>
      </aside>
      <main className="main-area">
        <Outlet />
      </main>
    </div>
  )
}
