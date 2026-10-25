import { Link } from 'react-router-dom'
import type {
  EncuestaPublicaResumen,
  TarjetaPublica,
} from '../services/inicioPublico'
import { cierre } from './publico/fechas'

const CLASE_TARJETA =
  'flex flex-col gap-2 rounded-xl border border-outline bg-surface p-5 no-underline text-left ' +
  'shadow-[0_4px_12px_rgba(0,61,121,0.08)] transition-[transform,box-shadow] duration-150 ' +
  'hover:shadow-[0_6px_18px_rgba(0,61,121,0.16)] hover:-translate-y-0.5 focus-visible:outline-none ' +
  'focus-visible:shadow-[0_0_0_3px_var(--accent-bg)]'

const CLASE_OJIVA =
  'self-start rounded-full border border-oro-unam bg-oro-unam/20 px-2 py-0.5 text-xs font-bold text-azul-unam dark:text-oro-unam'


export function TarjetaEncuesta({
  encuesta,
}: {
  encuesta: EncuestaPublicaResumen
}) {
  return (
    <Link
      to={`/responder/${encuesta.tokenPublico}`}
      className={CLASE_TARJETA}
      aria-label={`Responder «${encuesta.titulo}», de ${encuesta.unidadResponsable}`}
    >
      <span className={CLASE_OJIVA}>{encuesta.tipoEncuesta}</span>
      <h2 className="m-0 text-lg text-azul-unam break-words">
        {encuesta.titulo}
      </h2>
      <p className="m-0 text-sm opacity-70">{encuesta.unidadResponsable}</p>
      <p className="m-0 text-xs opacity-60">{cierre(encuesta.fechaFinVigencia)}</p>
      <span className="mt-1 text-sm font-bold text-azul-unam">Responder →</span>
    </Link>
  )
}

/**
 * Una tarjeta de evento no lleva a responder: lleva a la pantalla del evento,
 * donde estan sus encuestas. Por eso dice cuantas trae, para que quien la ve
 * sepa que entra a una lista y no a un cuestionario.
 */
function TarjetaEvento({
  evento,
}: {
  evento: Extract<TarjetaPublica, { tipo: 'evento' }>
}) {
  return (
    <Link
      to={`/eventos/${evento.idEvento}`}
      className={CLASE_TARJETA}
      aria-label={`Ver las ${evento.encuestas} encuestas del evento «${evento.nombre}», de ${evento.unidadResponsable}`}
    >
      <span className={CLASE_OJIVA}>Evento</span>
      <h2 className="m-0 text-lg text-azul-unam break-words">{evento.nombre}</h2>
      <p className="m-0 text-sm opacity-70">{evento.unidadResponsable}</p>
      <p className="m-0 text-xs opacity-60">{cierre(evento.fechaFinVigencia)}</p>
      <span className="mt-1 text-sm font-bold text-azul-unam">
        {evento.encuestas === 1
          ? 'Ver 1 encuesta →'
          : `Ver ${evento.encuestas} encuestas →`}
      </span>
    </Link>
  )
}

export function Tarjetas({ tarjetas }: { tarjetas: TarjetaPublica[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tarjetas.map((tarjeta) =>
        tarjeta.tipo === 'evento' ? (
          <TarjetaEvento key={`evento-${tarjeta.idEvento}`} evento={tarjeta} />
        ) : (
          <TarjetaEncuesta
            key={`encuesta-${tarjeta.tokenPublico}`}
            encuesta={tarjeta}
          />
        ),
      )}
    </div>
  )
}
