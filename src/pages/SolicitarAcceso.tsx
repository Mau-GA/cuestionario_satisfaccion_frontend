import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Encabezado, PieDePagina } from '../components/Layout'
import { Aviso, Boton, Campo, Selector } from '../components/ui'
import { useCargar } from '../hooks'
import { ApiError } from '../services/http'
import { listarUnidadesPublicas, solicitarAcceso } from '../services/publico'

interface Unidad {
  idUnidadResponsable: number
  unidadResponsable: string
}

export default function SolicitarAcceso() {
  const unidades = useCargar<Unidad[]>(listarUnidadesPublicas)

  const [correo, setCorreo] = useState('')
  const [idUnidad, setIdUnidad] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await solicitarAcceso(correo, Number(idUnidad))
      setEnviada(true)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo enviar la solicitud. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-superficie">
      <Encabezado />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          {enviada ? (
            <>
              <h1 className="text-xl font-semibold text-unam-azul">Solicitud enviada</h1>
              <p className="mt-2 text-sm text-slate-600">
                Un administrador la revisará. Si la aprueba, recibirás acceso con el correo que
                dejaste.
              </p>
              <Link to="/" className="mt-6 inline-block text-sm text-unam-azul hover:underline">
                ← Volver al inicio
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-unam-azul">Solicitar acceso</h1>
              <p className="mt-1 text-sm text-slate-500">
                Para armar y aplicar encuestas de tu área.
              </p>

              <form onSubmit={enviar} className="mt-6 space-y-4" noValidate>
                <Campo
                  etiqueta="Correo electrónico"
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
                <Selector
                  etiqueta="Unidad responsable"
                  required
                  value={idUnidad}
                  onChange={(e) => setIdUnidad(e.target.value)}
                >
                  <option value="">Selecciona la tuya…</option>
                  {(unidades.datos ?? []).map((u) => (
                    <option key={u.idUnidadResponsable} value={u.idUnidadResponsable}>
                      {u.unidadResponsable}
                    </option>
                  ))}
                </Selector>

                <Aviso tipo="error">{error}</Aviso>

                <Boton type="submit" disabled={enviando} className="w-full">
                  {enviando ? 'Enviando…' : 'Enviar solicitud'}
                </Boton>
              </form>

              <p className="mt-4 text-center text-sm text-slate-500">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-unam-azul hover:underline">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
      <PieDePagina />
    </div>
  )
}
