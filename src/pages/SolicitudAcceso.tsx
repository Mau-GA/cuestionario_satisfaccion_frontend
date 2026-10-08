import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import InstitutionalHeader from '../components/InstitutionalHeader'
import InstitutionalFooter from '../components/InstitutionalFooter'
import { listUnidadesActivasPublic, solicitarAcceso, type UnidadResponsable } from '../services/solicitudAcceso'

function SolicitudAcceso() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [idUnidadResponsable, setIdUnidadResponsable] = useState<number | ''>('')
  const setIdUnidad = (value: string) => setIdUnidadResponsable(value === '' ? '' : Number(value))
  const [unidades, setUnidades] = useState<UnidadResponsable[]>([])
  const [loadingUnidades, setLoadingUnidades] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadUnidades() {
      try {
        const data = await listUnidadesActivasPublic()
        setUnidades(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las unidades responsables')
      } finally {
        setLoadingUnidades(false)
      }
    }
    loadUnidades()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !idUnidadResponsable) {
      setError('Completa todos los campos')
      return
    }

    setSubmitting(true)
    try {
      await solicitarAcceso({
        correoElectronico: email.trim(),
        idUnidadResponsable: Number(idUnidadResponsable),
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-svh flex flex-col">
        <InstitutionalHeader />
        <div className="flex-1 grid place-items-center p-6 box-border bg-azul-unam">
          <main className="w-full max-w-[400px] box-border pt-10 px-8 pb-7 rounded-2xl bg-surface border border-outline shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
            <header className="text-center mb-7">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="m-0 mb-2 text-[26px] tracking-[-0.4px] text-ink">Solicitud enviada</h1>
              <p className="text-[15px] text-gray-600">Tu solicitud de acceso ha sido registrada correctamente</p>
            </header>

            <div className="p-4 rounded-lg bg-green-50 border border-green-200 mb-6">
              <p className="m-0 text-sm text-green-800">
                <strong>Queda en revisión.</strong> El administrador evaluará tu solicitud y, si es aprobada,
                recibirás un correo con las credenciales de acceso.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="font-semibold px-4 py-[13px] rounded-lg text-white bg-accent cursor-pointer w-full
                transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99]"
            >
              Volver al inicio de sesión
            </button>
          </main>
        </div>
        <InstitutionalFooter />
      </div>
    )
  }

  return (
    <div className="min-h-svh flex flex-col">
      <InstitutionalHeader />
      <div className="flex-1 grid place-items-center p-6 box-border bg-azul-unam">
        <main className="w-full max-w-[400px] box-border pt-10 px-8 pb-7 rounded-2xl bg-surface border border-outline shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
          <header className="text-center mb-7">
            <h1 className="m-0 mb-2 text-[26px] tracking-[-0.4px] text-ink">Solicitar acceso</h1>
            <p className="text-[15px]">Completa el formulario para solicitar una cuenta</p>
          </header>

          <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-[6px] text-sm font-semibold">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tucorreo@dominio.com"
                required
                disabled={submitting}
                className="font-normal px-[14px] py-3 rounded-lg border border-outline bg-surface text-ink box-border
                  transition-[border-color,box-shadow] duration-200
                  placeholder:text-outline
                  focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)]
                  disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </label>

            <label className="flex flex-col gap-[6px] text-sm font-semibold">
              <span>Unidad responsable</span>
              <select
                value={idUnidadResponsable}
                onChange={(event) => setIdUnidad(event.target.value)}
                required
                disabled={submitting || loadingUnidades}
                className="font-normal px-[14px] py-3 rounded-lg border border-outline bg-surface text-ink box-border
                  transition-[border-color,box-shadow] duration-200
                  focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)]
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Selecciona una unidad</option>
                {unidades.map((unidad) => (
                  <option key={unidad.idUnidadResponsable} value={unidad.idUnidadResponsable}>
                    {unidad.nombre}
                  </option>
                ))}
              </select>
            </label>

            {error && (
              <p
                className="m-0 px-[14px] py-[10px] rounded-lg text-sm bg-[#fee2e2] text-[#b91c1c] dark:bg-[#450a0a] dark:text-[#fecaca]"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || loadingUnidades}
              className="font-semibold px-4 py-[13px] rounded-lg text-white bg-accent cursor-pointer
                transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99]
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </form>

          <p className="mt-[22px] text-center text-xs opacity-70">
            ¿Ya tienes cuenta? <Link to="/login" className="text-accent hover:underline font-medium">Inicia sesión</Link>
          </p>
        </main>
      </div>
      <InstitutionalFooter />
    </div>
  )
}

export default SolicitudAcceso