import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { getSession } from '../services/auth'
import InstitutionalHeader from './InstitutionalHeader'
import InstitutionalFooter from './InstitutionalFooter'

export function AdminOnlyLayout() {
  const location = useLocation()
  const session = getSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!session || session.user.rol !== 'administrador') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const navItems = [
    { path: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
    { path: '/admin/unidades', label: 'Unidades Responsables', icon: '🏢' },
  ]

  const getLinkClass = (path: string) => {
    const base = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors'
    const active = location.pathname === path
    return `${base} ${active ? 'bg-azul-unam text-white' : 'text-ink hover:bg-azul-unam/10'}`
  }

  return (
    <div className="min-h-svh flex flex-col bg-azul-unam">
      <InstitutionalHeader />
      <div className="flex-1 flex">
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-outline transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-outline">
            <h2 className="text-ink font-semibold text-lg">Administración</h2>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={getLinkClass(item.path)}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className={`flex-1 lg:ml-64 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <header className="sticky top-0 z-30 bg-surface border-b border-outline px-4 py-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-ink hover:bg-azul-unam/10"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </header>
          <div className={`flex-1 lg:ml-64 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
            <main className="p-4 lg:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <InstitutionalFooter />
    </div>
  )
}

export default function AdminLayout() {
  const session = getSession()

  if (!session || session.user.rol !== 'administrador') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-svh flex flex-col bg-azul-unam">
      <InstitutionalHeader />
      <div className="flex-1 flex">
        <aside className="w-64 bg-surface border-r border-outline hidden lg:block">
          <div className="p-4 border-b border-outline">
            <h2 className="text-ink font-semibold text-lg">Administración</h2>
          </div>
          <nav className="p-4 space-y-2">
            <Link to="/admin/usuarios" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-azul-unam/10 transition-colors">
              <span>👥</span>
              <span>Usuarios</span>
            </Link>
            <Link to="/admin/unidades" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-azul-unam/10 transition-colors">
              <span>🏢</span>
              <span>Unidades Responsables</span>
            </Link>
          </nav>
        </aside>
        <div className="flex-1">
          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <InstitutionalFooter />
    </div>
  )
}