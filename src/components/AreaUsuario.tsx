import type { ReactNode } from 'react'
import { BarraNavegacion } from './BarraNavegacion'
import { PieDePagina } from './Layout'

/** Marco de todo lo que vive detrás de la sesión. */
export function AreaUsuario({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-superficie">
      <BarraNavegacion />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      <PieDePagina />
    </div>
  )
}
