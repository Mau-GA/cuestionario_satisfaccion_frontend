import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AreaUsuario } from '../components/AreaUsuario'
import { Aviso, Boton, Campo, Tarjeta } from '../components/ui'
import { AgregarPregunta } from '../components/AgregarPregunta'
import { PanelInvitaciones } from '../components/PanelInvitaciones'
import { VistaPreviaEncuesta } from '../components/VistaPreviaEncuesta'
import { EstadoPill } from '../components/EstadoEncuesta'
import { useCargar } from '../hooks'
import { ApiError } from '../services/http'
import {
  actualizarEncuesta,
  detalleEncuesta,
  listarOpciones,
  listarPreguntas,
  listarTiposRespuesta,
  quitarPreguntaDeEncuesta,
  reordenarPreguntas,
} from '../services/admin'
import { aInputLocal, deInputLocal, fecha } from '../utils/fechas'
import type { EncuestaDetalle as Detalle, Opcion, Pregunta, TipoRespuesta } from '../types/admin'

export default function EncuestaDetalle() {
  const { id } = useParams<{ id: string }>()
  const idEncuesta = Number(id)

  const encuesta = useCargar<Detalle>(() => detalleEncuesta(idEncuesta))
  const catalogo = useCargar<Pregunta[]>(() => listarPreguntas(true))
  const tiposRespuesta = useCargar<TipoRespuesta[]>(() => listarTiposRespuesta(true))
  const catalogoOpciones = useCargar<Opcion[]>(() => listarOpciones(true))

  const [error, setError] = useState<string | null>(null)
  const d = encuesta.datos
  const editable = d?.editable ?? false

  async function intentar(accion: () => Promise<unknown>) {
    setError(null)
    try {
      await accion()
      await encuesta.recargar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo completar la operación')
    }
  }

  async function guardarDatos(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const form = new FormData(evento.currentTarget)
    await intentar(() =>
      actualizarEncuesta(idEncuesta, {
        titulo: String(form.get('titulo')),
        fechaInicioVigencia: deInputLocal(String(form.get('inicio') ?? '')),
        fechaFinVigencia: deInputLocal(String(form.get('fin') ?? '')),
        visibleEnInicio: form.get('visible') === 'on',
      }),
    )
  }

  function mover(indice: number, direccion: -1 | 1) {
    if (!d) return
    const ids = d.preguntas.map((p) => p.idEncuestaPregunta)
    const destino = indice + direccion
    if (destino < 0 || destino >= ids.length) return
    ;[ids[indice], ids[destino]] = [ids[destino], ids[indice]]
    void intentar(() => reordenarPreguntas(idEncuesta, ids))
  }

  if (encuesta.cargando) {
    return (
      <AreaUsuario>
        <p className="text-sm text-slate-500">Cargando…</p>
      </AreaUsuario>
    )
  }
  if (!d) {
    return (
      <AreaUsuario>
        <Aviso tipo="error">{encuesta.error ?? 'Encuesta no encontrada'}</Aviso>
        <Link to="/usuario" className="mt-4 inline-block text-sm text-unam-azul hover:underline">
          ← Volver a encuestas
        </Link>
      </AreaUsuario>
    )
  }

  const yaEnLaEncuesta = new Set(d.preguntas.map((p) => p.idPregunta))

  return (
    <AreaUsuario>
      <div className="flex items-center justify-between gap-4">
        <Link to="/usuario" className="text-sm text-unam-azul hover:underline">
          ← Encuestas
        </Link>
        <Link
          to={`/usuario/encuestas/${idEncuesta}/resultados`}
          className="text-sm font-medium text-unam-azul hover:underline"
        >
          Ver resultados →
        </Link>
      </div>

      <div className="mt-2 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-unam-azul">{d.titulo}</h1>
        <EstadoPill estado={d.estado} />
      </div>

      {!editable && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Esta encuesta ya no se puede modificar.</strong> Inició su periodo de aplicación
          el {fecha(d.fechaInicioVigencia)}, y a partir de ese momento queda fija para que todas
          las respuestas correspondan al mismo cuestionario. Si necesitas una versión distinta,
          duplícala desde el listado.
        </div>
      )}

      <Aviso tipo="error">{error}</Aviso>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* La encuesta primero: es lo que se está construyendo. */}
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Así se verá ({d.preguntas.length}{' '}
            {d.preguntas.length === 1 ? 'pregunta' : 'preguntas'})
          </h2>

          <VistaPreviaEncuesta
            preguntas={d.preguntas}
            editable={editable}
            onMover={mover}
            onQuitar={(idEncuestaPregunta) =>
              void intentar(() => quitarPreguntaDeEncuesta(idEncuesta, idEncuestaPregunta))
            }
          />

          {editable && (
            <div className="mt-4">
              <AgregarPregunta
                idEncuesta={idEncuesta}
                catalogo={catalogo.datos ?? []}
                yaEnLaEncuesta={yaEnLaEncuesta}
                tiposRespuesta={tiposRespuesta.datos ?? []}
                catalogoOpciones={catalogoOpciones.datos ?? []}
                onAgregada={async () => {
                  await encuesta.recargar()
                  await catalogo.recargar()
                  await catalogoOpciones.recargar()
                }}
              />
            </div>
          )}
        </section>

        <aside className="lg:order-last">
          <Tarjeta titulo="Datos de la encuesta">
            <form onSubmit={guardarDatos} className="space-y-4">
              <Campo
                etiqueta="Título"
                name="titulo"
                defaultValue={d.titulo}
                disabled={!editable}
                required
              />
              <Campo
                etiqueta="Inicio de vigencia"
                name="inicio"
                type="datetime-local"
                defaultValue={aInputLocal(d.fechaInicioVigencia)}
                disabled={!editable}
              />
              <Campo
                etiqueta="Cierre de vigencia"
                name="fin"
                type="datetime-local"
                defaultValue={aInputLocal(d.fechaFinVigencia)}
                disabled={!editable}
              />
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="visible"
                  defaultChecked={d.visibleEnInicio}
                  disabled={!editable}
                  className="mt-0.5"
                />
                <span className="text-slate-700">
                  Mostrar en la pantalla pública de inicio
                  <span className="block text-xs text-slate-500">
                    Si no, la única forma de llegar es con el enlace de invitación.
                  </span>
                </span>
              </label>
              {editable && (
                <Boton type="submit" className="w-full">
                  Guardar
                </Boton>
              )}
            </form>

            {d.tokenPublico && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Enlace para responder
                </p>
                <code className="mt-1 block overflow-x-auto rounded bg-slate-50 px-2 py-1.5 text-xs text-slate-700">
                  /responder/{d.tokenPublico}
                </code>
              </div>
            )}
          </Tarjeta>

          <div className="mt-6">
            <PanelInvitaciones idEncuesta={idEncuesta} />
          </div>
        </aside>
      </div>
    </AreaUsuario>
  )
}
