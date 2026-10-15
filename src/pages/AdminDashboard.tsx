import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../services/auth'
import InstitutionalHeader from '../components/InstitutionalHeader'
import InstitutionalFooter from '../components/InstitutionalFooter'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()

  if (!session || session.user.rol !== 'administrador') {
    return <Navigate to="/login" replace />
  }

  const tabs = [
    { path: '/admin/usuarios', label: 'Usuarios' },
    { path: '/admin/unidades', label: 'Unidades Responsables' },
  ]

  return (
    <div className="min-h-svh flex flex-col bg-azul-unam">
      <InstitutionalHeader />
      <div className="flex-1 flex">
        <aside className="w-64 bg-surface border-r border-outline hidden lg:block">
          <div className="p-4 border-b border-outline">
            <h2 className="text-ink font-semibold text-lg">Administración</h2>
          </div>
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === tab.path ? 'bg-azul-unam text-white' : 'text-ink hover:bg-azul-unam/10'}`}
              >
                {tab.label === 'Usuarios' ? '👥' : '🏢'}
                <span>{tab.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">
          <header className="lg:hidden p-4 border-b border-outline bg-surface">
            <select
              value={location.pathname}
              onChange={(e) => navigate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-ink"
            >
              <option value="/admin/usuarios">Usuarios</option>
              <option value="/admin/unidades">Unidades Responsables</option>
            </select>
          </header>
          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <InstitutionalFooter />
    </div>
  )
}