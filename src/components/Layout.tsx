import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LogoFESAcatlan, LogoUNAM } from './Logos'

export function Encabezado({ children }: { children?: ReactNode }) {
  return (
    <header className="bg-unam-azul text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" aria-label="Inicio">
          <LogoUNAM />
        </Link>
        {children}
        <LogoFESAcatlan />
      </div>
    </header>
  )
}

export function PieDePagina() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-5 text-center text-xs text-slate-500">
        <p>Universidad Nacional Autónoma de México · Facultad de Estudios Superiores Acatlán</p>
        <p className="mt-1">Sistema de Encuestas de Satisfacción</p>
      </div>
    </footer>
  )
}

export function Pagina({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-superficie">
      <Encabezado />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      <PieDePagina />
    </div>
  )
}
