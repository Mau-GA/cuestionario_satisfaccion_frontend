import { useState } from 'react'
import type { FormEvent } from 'react'
import { Aviso, Boton, Campo } from './ui'
import { ApiError } from '../services/http'
import { establecerContrasena } from '../services/auth'
import { useSession } from '../context/useSession'

interface Props {
  /** Si la cuenta ya tiene contraseña, hay que pedir la actual para cambiarla. */
  tieneContrasena: boolean
  onCerrar: () => void
}

/**
 * Crear o cambiar la contraseña de la cuenta propia.
 *
 * Es el mismo formulario para los dos casos, porque la diferencia es solo un
 * campo: sin contraseña previa no hay nada que verificar, así que el campo
 * "actual" ni se muestra.
 */
export function ModalContrasena({ tieneContrasena, onCerrar }: Props) {
  const { actualizarPerfil } = useSession()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)

    if (nueva !== confirmar) {
      setError('Las dos contraseñas no coinciden.')
      return
    }
    if (nueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setEnviando(true)
    try {
      await establecerContrasena(nueva, tieneContrasena ? actual : undefined)
      await actualizarPerfil()
      onCerrar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar la contraseña.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    // El fondo cierra el modal al hacer clic; el panel detiene ese clic para
    // no cerrarse al interactuar con el formulario.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-contrasena"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="titulo-modal-contrasena" className="text-lg font-semibold text-unam-azul">
          {tieneContrasena ? 'Cambiar contraseña' : 'Crear contraseña'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tieneContrasena
            ? 'Para cambiarla necesitas confirmar la actual.'
            : 'Con esto vas a poder entrar con correo y contraseña, sin depender de Google.'}
        </p>

        <form onSubmit={enviar} className="mt-4 space-y-4">
          {tieneContrasena && (
            <Campo
              etiqueta="Contraseña actual"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
            />
          )}
          <Campo
            etiqueta="Contraseña nueva"
            type="password"
            required
            autoFocus={!tieneContrasena}
            minLength={8}
            autoComplete="new-password"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
          />
          <Campo
            etiqueta="Confirmar contraseña nueva"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />

          <Aviso tipo="error">{error}</Aviso>

          <div className="flex gap-2">
            <Boton type="submit" disabled={enviando} className="flex-1">
              {enviando ? 'Guardando…' : 'Guardar'}
            </Boton>
            <Boton type="button" variante="secundario" onClick={onCerrar}>
              Cancelar
            </Boton>
          </div>
        </form>
      </div>
    </div>
  )
}
