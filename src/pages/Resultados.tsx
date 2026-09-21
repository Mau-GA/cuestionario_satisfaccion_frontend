import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AreaUsuario } from '../components/AreaUsuario'
import { Aviso, Boton, Tarjeta } from '../components/ui'
import { Distribucion } from '../components/Distribucion'
import { useCargar } from '../hooks'
import { comentariosDeEncuesta, resultadosDeEncuesta } from '../services/admin'
import { marcaDeSatisfaccion } from '../utils/escala'
import { fecha } from '../utils/fechas'
import type { Comentarios, Resultados as Datos } from '../types/admin'

export default function Resultados() {
  const { id } = useParams<{ id: string }>()
  const idEncuesta = Number(id)
  const [pagina, setPagina] = useState(1)

  const datos = useCargar<Datos>(() => resultadosDeEncuesta(idEncuesta))

  // Los comentarios no usan useCargar: su carga depende de `pagina`, y useCargar
  // guarda el cargador en un ref que se actualiza hasta después del render, así
  // que pedir la recarga desde el clic traería otra vez la página anterior.
  const [comentarios, setComentarios] = useState<Comentarios | null>(null)
  const [cargandoComentarios, setCargandoComentarios] = useState(true)

  useEffect(() => {
    let vigente = true
    void (async () => {
      try {
        const d = await comentariosDeEncuesta(idEncuesta, pagina, 10)
        if (vigente) setComentarios(d)
      } catch {
        if (vigente) setComentarios(null)
      } finally {
        if (vigente) setCargandoComentarios(false)
      }
    })()
    return () => {
      vigente = false
    }
  }, [idEncuesta, pagina])

  if (datos.cargando) {
    return (
      <AreaUsuario>
        <p className="text-sm text-slate-500">Cargando…</p>
      </AreaUsuario>
    )
  }
  if (!datos.datos) {
    return (
      <AreaUsuario>
        <Aviso tipo="error">{datos.error ?? 'No se encontró la encuesta'}</Aviso>
      </AreaUsuario>
    )
  }

  const { encuesta, participacion, preguntas } = datos.datos
  const conEscala = preguntas.filter((p) => p.satisfaccion !== null)
  // Promedio simple entre preguntas: cada una pesa igual, sin importar cuánta
  // gente la contestó. Ponderar por respuestas dejaría que una sola pregunta
  // muy contestada mandara sobre el resto.
  const general = conEscala.length
    ? Math.round((conEscala.reduce((a, p) => a + (p.satisfaccion ?? 0), 0) / conEscala.length) * 10) / 10
    : null

  return (
    <AreaUsuario>
      <Link to={`/usuario/encuestas/${idEncuesta}`} className="text-sm text-unam-azul hover:underline">
        ← Volver a la encuesta
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-unam-azul">{encuesta.titulo}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Periodo: {fecha(encuesta.fechaInicioVigencia)} → {fecha(encuesta.fechaFinVigencia)}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cifra valor={participacion.envios} etiqueta="Envíos recibidos" />
        <Cifra valor={participacion.completos} etiqueta="Completos" />
        <Cifra
          valor={participacion.incompletos}
          etiqueta="Incompletos"
          nota="Dejaron preguntas sin contestar"
        />
        <Cifra
          valor={general === null ? '—' : `${general}%`}
          etiqueta="Satisfacción general"
          nota="Promedio de las preguntas con escala"
          marca={general === null ? undefined : marcaDeSatisfaccion(general)}
        />
      </div>

      <div className="mt-8 space-y-4">
        {preguntas.map((p) => (
          <Tarjeta key={p.idEncuestaPregunta} titulo={`${p.orden}. ${p.pregunta}`}>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>{p.tipoRespuesta}</span>
              <span>{p.respuestas} respuestas</span>
              {p.satisfaccion !== null && (
                <span className="ml-auto flex items-center gap-2">
                  <span
                    aria-hidden
                    style={{ background: marcaDeSatisfaccion(p.satisfaccion) }}
                    className="inline-block size-2.5 rounded-full"
                  />
                  <span className="text-xl font-semibold text-slate-900">{p.satisfaccion}%</span>
                  <span className="text-slate-500">de satisfacción</span>
                  <span className="text-xs text-slate-400">(promedio {p.promedio})</span>
                </span>
              )}
            </div>

            {p.esTextoLibre ? (
              <p className="text-sm text-slate-500">
                Respuestas de texto libre. Se listan más abajo.
              </p>
            ) : (
              <Distribucion distribucion={p.distribucion} />
            )}
          </Tarjeta>
        ))}
      </div>

      <div className="mt-8">
        <Tarjeta
          titulo="Comentarios"
          descripcion={comentarios ? `${comentarios.total} en total` : undefined}
        >
          {cargandoComentarios && <p className="text-sm text-slate-500">Cargando…</p>}
          {comentarios?.data.length === 0 && (
            <p className="text-sm text-slate-500">Todavía no hay comentarios.</p>
          )}
          <ul className="space-y-3">
            {(comentarios?.data ?? []).map((c, i) => (
              <li key={i} className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-800">{c.respuesta}</p>
                <p className="mt-1 text-xs text-slate-400">{c.pregunta}</p>
              </li>
            ))}
          </ul>

          {(comentarios?.totalPaginas ?? 0) > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Boton
                variante="secundario"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => p - 1)}
              >
                ← Anteriores
              </Boton>
              <span className="text-sm text-slate-500">
                Página {comentarios?.pagina} de {comentarios?.totalPaginas}
              </span>
              <Boton
                variante="secundario"
                disabled={pagina >= (comentarios?.totalPaginas ?? 1)}
                onClick={() => setPagina((p) => p + 1)}
              >
                Siguientes →
              </Boton>
            </div>
          )}
        </Tarjeta>
      </div>
    </AreaUsuario>
  )
}

function Cifra({
  valor,
  etiqueta,
  nota,
  marca,
}: {
  valor: number | string
  etiqueta: string
  nota?: string
  /** Punto de color al lado de la cifra; el número siempre va en tinta. */
  marca?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
        {marca && (
          <span aria-hidden style={{ background: marca }} className="inline-block size-3 rounded-full" />
        )}
        {valor}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">{etiqueta}</p>
      {nota && <p className="mt-0.5 text-xs text-slate-400">{nota}</p>}
    </div>
  )
}
