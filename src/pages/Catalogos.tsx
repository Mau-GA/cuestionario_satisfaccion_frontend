import { useState } from 'react'
import type { FormEvent } from 'react'
import { Pagina } from '../components/Layout'
import { Aviso, Boton, Campo, Insignia, Tabla, Tarjeta } from '../components/ui'
import { useCargar } from '../hooks'
import { useSession } from '../context/useSession'
import { ApiError } from '../services/http'
import { ROL } from '../types/auth'
import {
  actualizarOpcion,
  actualizarPregunta,
  actualizarTipoEncuesta,
  actualizarTipoRespuesta,
  crearOpcion,
  crearPregunta,
  crearTipoEncuesta,
  crearTipoRespuesta,
  listarOpciones,
  listarPreguntas,
  listarTiposEncuesta,
  listarTiposRespuesta,
} from '../services/admin'
import type { Opcion, Pregunta, TipoEncuesta, TipoRespuesta } from '../types/admin'

export default function Catalogos() {
  const { sesion } = useSession()
  const esAdmin = sesion?.usuario.rol === ROL.ADMINISTRADOR

  const preguntas = useCargar<Pregunta[]>(() => listarPreguntas(false))
  const opciones = useCargar<Opcion[]>(() => listarOpciones(false))
  const tiposEncuesta = useCargar<TipoEncuesta[]>(() => listarTiposEncuesta(false))
  const tiposRespuesta = useCargar<TipoRespuesta[]>(() => listarTiposRespuesta(false))

  const [error, setError] = useState<string | null>(null)
  const [textoPregunta, setTextoPregunta] = useState('')
  const [textoOpcion, setTextoOpcion] = useState('')
  const [pesoOpcion, setPesoOpcion] = useState('')
  const [textoTipoEnc, setTextoTipoEnc] = useState('')
  const [textoTipoResp, setTextoTipoResp] = useState('')

  async function intentar(accion: () => Promise<unknown>, recargar: () => Promise<void>) {
    setError(null)
    try {
      await accion()
      await recargar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo completar la operación')
    }
  }

  const enviar = (accion: () => Promise<unknown>, recargar: () => Promise<void>) => (e: FormEvent) => {
    e.preventDefault()
    void intentar(accion, recargar)
  }

  return (
    <Pagina>
      <h1 className="text-2xl font-semibold text-unam-azul">Catálogos</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Las preguntas se comparten entre encuestas. Corregir una que ya se usó guarda una versión
        nueva, para que las encuestas ya aplicadas conserven el texto que la gente respondió.
      </p>

      <Aviso tipo="error">{error}</Aviso>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Preguntas" descripcion="Catálogo compartido.">
          <form
            onSubmit={enviar(
              () => crearPregunta(textoPregunta).then(() => setTextoPregunta('')),
              preguntas.recargar,
            )}
            className="mb-4 flex gap-2"
          >
            <Campo
              etiqueta="Nueva pregunta"
              required
              maxLength={500}
              value={textoPregunta}
              onChange={(e) => setTextoPregunta(e.target.value)}
              className="flex-1"
            />
            <Boton type="submit" className="self-end">
              Agregar
            </Boton>
          </form>
          <Tabla columnas={['Pregunta', 'Estado', '']}>
            {(preguntas.datos ?? []).map((p) => (
              <tr key={p.idPregunta}>
                <td className="px-2 py-2.5">{p.pregunta}</td>
                <td className="px-2 py-2.5">
                  <Insignia activo={p.activo} />
                </td>
                <td className="px-2 py-2.5 text-right">
                  <Boton
                    variante="secundario"
                    onClick={() =>
                      void intentar(
                        () => actualizarPregunta(p.idPregunta, { activo: !p.activo }),
                        preguntas.recargar,
                      )
                    }
                  >
                    {p.activo ? 'Desactivar' : 'Activar'}
                  </Boton>
                </td>
              </tr>
            ))}
          </Tabla>
        </Tarjeta>

        <Tarjeta
          titulo="Opciones"
          descripcion="El peso da el orden y la polaridad: el más bajo es lo más negativo."
        >
          <form
            onSubmit={enviar(
              () =>
                crearOpcion(textoOpcion, pesoOpcion ? Number(pesoOpcion) : undefined).then(() => {
                  setTextoOpcion('')
                  setPesoOpcion('')
                }),
              opciones.recargar,
            )}
            className="mb-4 flex gap-2"
          >
            <Campo
              etiqueta="Nueva opción"
              required
              maxLength={255}
              value={textoOpcion}
              onChange={(e) => setTextoOpcion(e.target.value)}
              className="flex-1"
            />
            <Campo
              etiqueta="Peso"
              type="number"
              step="0.01"
              value={pesoOpcion}
              onChange={(e) => setPesoOpcion(e.target.value)}
              className="w-24"
            />
            <Boton type="submit" className="self-end">
              Agregar
            </Boton>
          </form>
          <Tabla columnas={['Opción', 'Peso', 'Estado', '']}>
            {(opciones.datos ?? []).map((o) => (
              <tr key={o.idOpcion}>
                <td className="px-2 py-2.5">{o.opcion}</td>
                <td className="px-2 py-2.5 text-slate-600">{o.peso ?? '—'}</td>
                <td className="px-2 py-2.5">
                  <Insignia activo={o.activo} />
                </td>
                <td className="px-2 py-2.5 text-right">
                  <Boton
                    variante="secundario"
                    onClick={() =>
                      void intentar(
                        () => actualizarOpcion(o.idOpcion, { activo: !o.activo }),
                        opciones.recargar,
                      )
                    }
                  >
                    {o.activo ? 'Desactivar' : 'Activar'}
                  </Boton>
                </td>
              </tr>
            ))}
          </Tabla>
        </Tarjeta>

        <Tarjeta
          titulo="Tipos de encuesta"
          descripcion={esAdmin ? undefined : 'Solo el administrador puede modificarlos.'}
        >
          {esAdmin && (
            <form
              onSubmit={enviar(
                () => crearTipoEncuesta(textoTipoEnc).then(() => setTextoTipoEnc('')),
                tiposEncuesta.recargar,
              )}
              className="mb-4 flex gap-2"
            >
              <Campo
                etiqueta="Nuevo tipo"
                required
                maxLength={100}
                value={textoTipoEnc}
                onChange={(e) => setTextoTipoEnc(e.target.value)}
                className="flex-1"
              />
              <Boton type="submit" className="self-end">
                Agregar
              </Boton>
            </form>
          )}
          <Tabla columnas={['Tipo', 'Estado', '']}>
            {(tiposEncuesta.datos ?? []).map((t) => (
              <tr key={t.idTipoEncuesta}>
                <td className="px-2 py-2.5">{t.tipoEncuesta}</td>
                <td className="px-2 py-2.5">
                  <Insignia activo={t.activo} />
                </td>
                <td className="px-2 py-2.5 text-right">
                  {esAdmin && (
                    <Boton
                      variante="secundario"
                      onClick={() =>
                        void intentar(
                          () => actualizarTipoEncuesta(t.idTipoEncuesta, { activo: !t.activo }),
                          tiposEncuesta.recargar,
                        )
                      }
                    >
                      {t.activo ? 'Desactivar' : 'Activar'}
                    </Boton>
                  )}
                </td>
              </tr>
            ))}
          </Tabla>
        </Tarjeta>

        <Tarjeta
          titulo="Tipos de respuesta"
          descripcion="Definen qué componente se pinta: caritas, estrellas, barra o texto."
        >
          {esAdmin && (
            <form
              onSubmit={enviar(
                () => crearTipoRespuesta(textoTipoResp).then(() => setTextoTipoResp('')),
                tiposRespuesta.recargar,
              )}
              className="mb-4 flex gap-2"
            >
              <Campo
                etiqueta="Nuevo tipo"
                required
                maxLength={100}
                value={textoTipoResp}
                onChange={(e) => setTextoTipoResp(e.target.value)}
                className="flex-1"
              />
              <Boton type="submit" className="self-end">
                Agregar
              </Boton>
            </form>
          )}
          <Tabla columnas={['Tipo', 'Estado', '']}>
            {(tiposRespuesta.datos ?? []).map((t) => (
              <tr key={t.idTipoRespuesta}>
                <td className="px-2 py-2.5">{t.tipoRespuesta}</td>
                <td className="px-2 py-2.5">
                  <Insignia activo={t.activo} />
                </td>
                <td className="px-2 py-2.5 text-right">
                  {esAdmin && (
                    <Boton
                      variante="secundario"
                      onClick={() =>
                        void intentar(
                          () => actualizarTipoRespuesta(t.idTipoRespuesta, { activo: !t.activo }),
                          tiposRespuesta.recargar,
                        )
                      }
                    >
                      {t.activo ? 'Desactivar' : 'Activar'}
                    </Boton>
                  )}
                </td>
              </tr>
            ))}
          </Tabla>
        </Tarjeta>
      </div>
    </Pagina>
  )
}
