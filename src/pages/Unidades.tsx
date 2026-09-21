import { useState } from 'react'
import type { FormEvent } from 'react'
import { AreaUsuario } from '../components/AreaUsuario'
import { Aviso, Boton, Campo, Insignia, Tabla, Tarjeta } from '../components/ui'
import { useCargar } from '../hooks'
import { ApiError } from '../services/http'
import { actualizarUnidad, crearUnidad, listarUnidades } from '../services/admin'
import type { Unidad } from '../types/admin'

export default function Unidades() {
  // soloActivos=false: la administración necesita ver también las dadas de baja.
  const unidades = useCargar<Unidad[]>(() => listarUnidades(false))
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function alta(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await crearUnidad(nombre)
      setNombre('')
      await unidades.recargar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la unidad')
    } finally {
      setEnviando(false)
    }
  }

  async function alternar(unidad: Unidad) {
    setError(null)
    try {
      await actualizarUnidad(unidad.idUnidadResponsable, { activo: !unidad.activo })
      await unidades.recargar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cambiar el estado')
    }
  }

  return (
    <AreaUsuario>
      <h1 className="mb-6 text-2xl font-semibold text-unam-azul">Unidades responsables</h1>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Tarjeta titulo="Agregar" descripcion="El área o dependencia a la que se adscribe una cuenta.">
          <form onSubmit={alta} className="space-y-4">
            <Campo
              etiqueta="Nombre"
              required
              maxLength={200}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <Aviso tipo="error">{error}</Aviso>
            <Boton type="submit" disabled={enviando} className="w-full">
              {enviando ? 'Guardando…' : 'Agregar'}
            </Boton>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Registradas">
          {unidades.cargando && <p className="text-sm text-slate-500">Cargando…</p>}
          <Aviso tipo="error">{unidades.error}</Aviso>
          {unidades.datos && (
            <Tabla columnas={['Unidad', 'Estado', '']}>
              {unidades.datos.map((u) => (
                <tr key={u.idUnidadResponsable}>
                  <td className="px-2 py-2.5">{u.unidadResponsable}</td>
                  <td className="px-2 py-2.5">
                    <Insignia activo={u.activo} />
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <Boton variante="secundario" onClick={() => void alternar(u)}>
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </Boton>
                  </td>
                </tr>
              ))}
            </Tabla>
          )}
        </Tarjeta>
      </div>
    </AreaUsuario>
  )
}
