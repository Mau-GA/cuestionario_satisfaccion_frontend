import { Link } from 'react-router-dom'
import { Encabezado, PieDePagina } from '../components/Layout'
import { useCargar } from '../hooks'
import { encuestasEnInicio } from '../services/publico'
import { fecha } from '../utils/fechas'
import type { EncuestaEnInicio } from '../types/admin'

/** Pantalla abierta: no necesita cuenta ni sesión. */
export default function InicioPublico() {
  const encuestas = useCargar<EncuestaEnInicio[]>(encuestasEnInicio)

  return (
    <div className="flex min-h-full flex-col bg-superficie">
      <Encabezado />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold text-unam-azul">Encuestas abiertas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Puedes responder cualquiera de forma anónima, sin necesidad de cuenta.
        </p>

        {encuestas.cargando && <p className="mt-6 text-sm text-slate-500">Cargando…</p>}

        {encuestas.datos?.length === 0 && (
          <p className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
            En este momento no hay encuestas abiertas al público.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {(encuestas.datos ?? []).map((e) => (
            <Link
              key={e.token}
              to={`/responder/${e.token}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-unam-azul-claro hover:shadow-sm"
            >
              <h2 className="font-semibold text-slate-800">{e.titulo}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {e.unidadResponsable}
                {e.tipoEncuesta && ` · ${e.tipoEncuesta}`}
              </p>
              {e.fechaFinVigencia && (
                <p className="mt-2 text-xs text-slate-400">
                  Abierta hasta el {fecha(e.fechaFinVigencia)}
                </p>
              )}
            </Link>
          ))}
        </div>
      </main>
      <PieDePagina />
    </div>
  )
}
