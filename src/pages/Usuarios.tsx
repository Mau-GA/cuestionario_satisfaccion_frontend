import { useState } from 'react'
import type { FormEvent } from 'react'
import { AreaUsuario } from '../components/AreaUsuario'
import { Aviso, Boton, Campo, Insignia, Selector, Tabla, Tarjeta } from '../components/ui'
import { useCargar } from '../hooks'
import { ApiError } from '../services/http'
import {
  actualizarUsuario,
  crearUsuario,
  listarUnidades,
  listarUsuarios,
} from '../services/admin'
import type { Unidad, UsuarioAdmin } from '../types/admin'

/** Ids de rol: se resuelven desde el usuario listado, no se queman en el código. */
function idsDeRol(usuarios: UsuarioAdmin[]) {
  const mapa = new Map<string, number>()
  for (const u of usuarios) if (u.rol && u.idRol) mapa.set(u.rol, u.idRol)
  return mapa
}

export default function Usuarios() {
  const usuarios = useCargar<UsuarioAdmin[]>(listarUsuarios)
  const unidades = useCargar<Unidad[]>(() => listarUnidades(true))

  const [correo, setCorreo] = useState('')
  const [rol, setRol] = useState('administrador_encuestas')
  const [idUnidad, setIdUnidad] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const roles = idsDeRol(usuarios.datos ?? [])

  async function alta(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setOk(null)
    const idRol = roles.get(rol)
    if (!idRol) {
      setError('Todavía no se conoce el id de ese rol. Recarga la página.')
      return
    }
    setEnviando(true)
    try {
      await crearUsuario({
        correoElectronico: correo,
        idRol,
        idUnidadResponsable: idUnidad ? Number(idUnidad) : undefined,
        contrasena: contrasena || undefined,
      })
      setOk(`Cuenta creada para ${correo}`)
      setCorreo('')
      setContrasena('')
      await usuarios.recargar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la cuenta')
    } finally {
      setEnviando(false)
    }
  }

  async function alternar(usuario: UsuarioAdmin) {
    setError(null)
    try {
      await actualizarUsuario(usuario.idUsuario, { activo: !usuario.activo })
      await usuarios.recargar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cambiar el estado')
    }
  }

  return (
    <AreaUsuario>
      <h1 className="mb-6 text-2xl font-semibold text-unam-azul">Usuarios</h1>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Tarjeta titulo="Dar de alta" descripcion="La contraseña es opcional: se puede definir después.">
          <form onSubmit={alta} className="space-y-4">
            <Campo
              etiqueta="Correo electrónico"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <Selector etiqueta="Rol" value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="administrador_encuestas">Administrador de encuestas</option>
              <option value="administrador">Administrador</option>
            </Selector>
            {rol === 'administrador_encuestas' && (
              <Selector
                etiqueta="Unidad responsable"
                required
                value={idUnidad}
                onChange={(e) => setIdUnidad(e.target.value)}
              >
                <option value="">Selecciona una…</option>
                {(unidades.datos ?? []).map((u) => (
                  <option key={u.idUnidadResponsable} value={u.idUnidadResponsable}>
                    {u.unidadResponsable}
                  </option>
                ))}
              </Selector>
            )}
            <Campo
              etiqueta="Contraseña (opcional)"
              type="password"
              minLength={8}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
            <Aviso tipo="error">{error}</Aviso>
            <Aviso tipo="ok">{ok}</Aviso>
            <Boton type="submit" disabled={enviando} className="w-full">
              {enviando ? 'Creando…' : 'Crear cuenta'}
            </Boton>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Cuentas registradas">
          {usuarios.cargando && <p className="text-sm text-slate-500">Cargando…</p>}
          <Aviso tipo="error">{usuarios.error}</Aviso>
          {usuarios.datos && (
            <Tabla columnas={['Correo', 'Rol', 'Unidad', 'Contraseña', 'Estado', '']}>
              {usuarios.datos.map((u) => (
                <tr key={u.idUsuario}>
                  <td className="px-2 py-2.5">{u.correoElectronico}</td>
                  <td className="px-2 py-2.5 text-slate-600">{u.rolNombre ?? '—'}</td>
                  <td className="px-2 py-2.5 text-slate-600">{u.unidadResponsable ?? '—'}</td>
                  <td className="px-2 py-2.5 text-slate-600">
                    {u.tieneContrasena ? 'Sí' : 'Sin definir'}
                  </td>
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
