import { useState } from 'react'
import SelectorCatalogo from './SelectorCatalogo'
import { normalizarTexto, type ItemCatalogo, type SeleccionCatalogo } from './catalogo'
import { esTipoAbierto, glifoDeTipo } from './tipos'
import type { PreguntaEncuesta } from '../../services/armado'
import type { Opcion, TipoRespuesta } from '../../types/catalogos'

interface Props {
  item: PreguntaEncuesta
  indice: number
  total: number
  editable: boolean
  ocupada: boolean
  arrastrando: boolean
  tipos: TipoRespuesta[]
  sugerenciasPreguntas: ItemCatalogo[]
  sugerenciasOpciones: ItemCatalogo[]
  /** undefined mientras se cargan; [] cuando la pregunta no tiene ninguna. */
  opciones: Opcion[] | undefined
  onCambiarTexto: (item: PreguntaEncuesta, seleccion: SeleccionCatalogo) => void
  onCambiarTipo: (item: PreguntaEncuesta, idTipoRespuesta: number) => void
  onMover: (desde: number, hasta: number) => void
  onQuitar: (item: PreguntaEncuesta) => void
  onAgregarOpcion: (
    item: PreguntaEncuesta,
    seleccion: SeleccionCatalogo,
    peso: number | null,
  ) => void
  onQuitarOpcion: (item: PreguntaEncuesta, idOpcion: number) => void
  onEditarOpcion: (
    item: PreguntaEncuesta,
    opcion: Opcion,
    texto: string,
    peso: number | null,
  ) => Promise<boolean>
  onDragStart: (indice: number, event: React.DragEvent) => void
  onDragEnter: (indice: number) => void
  onDragEnd: () => void
}

const CLASE_ICONO =
  'shrink-0 rounded-lg p-1.5 bg-transparent border-0 cursor-pointer transition-colors ' +
  'disabled:opacity-30 disabled:cursor-not-allowed'

function TarjetaPregunta({
  item,
  indice,
  total,
  editable,
  ocupada,
  arrastrando,
  tipos,
  sugerenciasPreguntas,
  sugerenciasOpciones,
  opciones,
  onCambiarTexto,
  onCambiarTipo,
  onMover,
  onQuitar,
  onAgregarOpcion,
  onQuitarOpcion,
  onEditarOpcion,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: Props) {
  const abierta = esTipoAbierto(item.tipoRespuesta.tipoRespuesta)
  // El tipo guardado puede estar fuera del catálogo de activos; se conserva
  // como botón para no perderlo de vista.
  const tiposVisibles = tipos.some(
    (tipo) => tipo.idTipoRespuesta === item.tipoRespuesta.idTipoRespuesta,
  )
    ? tipos
    : [...tipos, item.tipoRespuesta]

  return (
    // La tarjeta entera recibe el soltado, pero arrastrar solo se inicia desde
    // su encabezado (FE-44): con el <li> arrastrable, seleccionar texto con el
    // raton dentro de un campo arrancaba un arrastre en vez de seleccionar.
    <li
      onDragEnter={() => onDragEnter(indice)}
      onDragOver={(event) => {
        if (arrastrando) event.preventDefault()
      }}
      className={`rounded-xl border bg-surface p-4 sm:p-5 transition-[opacity,border-color] ${
        arrastrando ? 'opacity-60 border-azul-unam' : 'border-outline'
      }`}
    >
      <div
        draggable={editable && !ocupada}
        onDragStart={(event) => onDragStart(indice, event)}
        onDragEnd={onDragEnd}
        className={`flex items-center gap-2 ${editable ? 'cursor-grab' : ''}`}
      >
        {editable && (
          <span
            className="select-none text-lg opacity-40 cursor-grab"
            title="Arrastrar para reordenar"
            aria-hidden
          >
            ⠿
          </span>
        )}
        <span className="text-xs font-bold opacity-60 w-6 text-center shrink-0">
          {indice + 1}
        </span>
        <span className="flex-1" />
        {editable && (
          <>
            <button
              type="button"
              onClick={() => onMover(indice, indice - 1)}
              disabled={ocupada || indice === 0}
              title="Subir"
              aria-label={`Subir la pregunta ${indice + 1}`}
              className={`${CLASE_ICONO} text-azul-unam hover:bg-accent-soft`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMover(indice, indice + 1)}
              disabled={ocupada || indice === total - 1}
              title="Bajar"
              aria-label={`Bajar la pregunta ${indice + 1}`}
              className={`${CLASE_ICONO} text-azul-unam hover:bg-accent-soft`}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => onQuitar(item)}
              disabled={ocupada}
              title="Quitar de la encuesta"
              aria-label={`Quitar la pregunta ${indice + 1}`}
              className={`${CLASE_ICONO} text-red-600 hover:bg-red-100`}
            >
              ✕
            </button>
          </>
        )}
      </div>

      <div className="mt-2">
        {editable ? (
          <SelectorCatalogo
            etiqueta={`Texto de la pregunta ${indice + 1}`}
            placeholder="Escribe la pregunta…"
            sugerencias={sugerenciasPreguntas}
            valorInicial={item.pregunta.pregunta}
            disabled={ocupada}
            onConfirmar={(seleccion) => onCambiarTexto(item, seleccion)}
          />
        ) : (
          <p className="m-0 text-base font-bold text-ink [overflow-wrap:anywhere]">
            {item.pregunta.pregunta}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tiposVisibles.map((tipo) => {
          const activo = tipo.idTipoRespuesta === item.tipoRespuesta.idTipoRespuesta
          return (
            <button
              key={tipo.idTipoRespuesta}
              type="button"
              disabled={!editable || ocupada}
              aria-pressed={activo}
              onClick={() => onCambiarTipo(item, tipo.idTipoRespuesta)}
              className={`flex items-center gap-2 text-sm font-bold rounded-lg border px-3 py-1.5 cursor-pointer transition-colors
                disabled:cursor-not-allowed disabled:opacity-60 ${
                  activo
                    ? 'bg-azul-unam text-white border-azul-unam'
                    : 'bg-transparent text-azul-unam border-outline hover:bg-accent-soft'
                }`}
            >
              <span aria-hidden>{glifoDeTipo(tipo.tipoRespuesta)}</span>
              {tipo.tipoRespuesta}
            </button>
          )
        })}
      </div>

      {abierta ? (
        <p className="mt-3 text-sm opacity-70">
          Se responde escribiendo: esta pregunta no lleva opciones.
        </p>
      ) : (
        <div className="mt-4">
          <p className="m-0 text-sm font-bold text-ink">
            Opciones{' '}
            <span className="font-normal opacity-70">
              (de lo más negativo a lo más positivo, según su peso)
            </span>
          </p>

          {opciones === undefined ? (
            <p className="mt-2 text-sm opacity-70">Cargando opciones…</p>
          ) : opciones.length === 0 ? (
            <p className="mt-2 px-[14px] py-[10px] rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam">
              A esta pregunta le falta su configuración: agrega al menos una
              opción antes de publicar la encuesta.
            </p>
          ) : (
            <ol className="m-0 mt-2 p-0 list-none flex flex-col gap-1.5">
              {opciones.map((opcion) => (
                <li
                  key={opcion.idOpcion}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline bg-surface-alt text-sm text-ink"
                >
                  {editable ? (
                    <EditorOpcion
                      opcion={opcion}
                      indicePregunta={indice}
                      ocupada={ocupada}
                      onGuardar={(texto, peso) =>
                        onEditarOpcion(item, opcion, texto, peso)
                      }
                    />
                  ) : (
                    <>
                      <span className="flex-1 [overflow-wrap:anywhere]">
                        {opcion.opcion}
                      </span>
                      <span className="shrink-0 text-xs opacity-70">
                        peso {opcion.peso ?? '—'}
                      </span>
                    </>
                  )}
                  {editable && (
                    <button
                      type="button"
                      onClick={() => onQuitarOpcion(item, opcion.idOpcion)}
                      disabled={ocupada || opciones.length <= 1}
                      title={
                        opciones.length <= 1
                          ? 'La pregunta usa opciones: conserva al menos una'
                          : `Quitar la opción ${opcion.opcion}`
                      }
                      className={`${CLASE_ICONO} text-red-600 hover:bg-red-100`}
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ol>
          )}

          {editable && (
            <AgregarOpcion
              item={item}
              indice={indice}
              ocupada={ocupada}
              sugerencias={sugerenciasOpciones}
              onAgregar={onAgregarOpcion}
            />
          )}
        </div>
      )}
    </li>
  )
}

const CLASE_CAMPO_OPCION =
  'font-normal text-sm px-2.5 py-1.5 rounded-md border border-outline bg-surface text-ink box-border ' +
  'transition-[border-color,box-shadow] duration-200 ' +
  'focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)] disabled:opacity-60'

interface PropsEditorOpcion {
  opcion: Opcion
  indicePregunta: number
  ocupada: boolean
  /** Resuelve false si no se guardó, para regresar los campos a lo guardado. */
  onGuardar: (texto: string, peso: number | null) => Promise<boolean>
}

/**
 * Texto y peso de una opción ya agregada. Se guarda al salir del campo o con
 * Enter; Escape regresa a lo guardado. La fila se monta por idOpcion, así que
 * al volver del API con el renglón nuevo los campos toman sus valores.
 */
function EditorOpcion({
  opcion,
  indicePregunta,
  ocupada,
  onGuardar,
}: PropsEditorOpcion) {
  const textoGuardado = opcion.opcion
  const pesoGuardado = opcion.peso === null ? '' : String(opcion.peso)
  const [texto, setTexto] = useState(textoGuardado)
  const [peso, setPeso] = useState(pesoGuardado)

  function restaurar(): void {
    setTexto(textoGuardado)
    setPeso(pesoGuardado)
  }

  function guardar(): void {
    const textoLimpio = normalizarTexto(texto)
    const pesoEscrito = peso.trim()
    const pesoNumero = pesoEscrito === '' ? null : Number(pesoEscrito)
    if (!textoLimpio || (pesoNumero !== null && !Number.isFinite(pesoNumero))) {
      restaurar()
      return
    }
    if (textoLimpio === textoGuardado && pesoNumero === opcion.peso) return
    void onGuardar(textoLimpio, pesoNumero).then((ok) => {
      if (!ok) restaurar()
    })
  }

  function teclas(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    } else if (event.key === 'Escape') {
      restaurar()
    }
  }

  return (
    <>
      <input
        type="text"
        value={texto}
        disabled={ocupada}
        onChange={(event) => setTexto(event.target.value)}
        onBlur={guardar}
        onKeyDown={teclas}
        aria-label={`Texto de la opción «${textoGuardado}» de la pregunta ${indicePregunta + 1}`}
        className={`${CLASE_CAMPO_OPCION} flex-1 min-w-0`}
      />
      <input
        type="number"
        step="0.01"
        value={peso}
        disabled={ocupada}
        onChange={(event) => setPeso(event.target.value)}
        onBlur={guardar}
        onKeyDown={teclas}
        aria-label={`Peso de la opción «${textoGuardado}» de la pregunta ${indicePregunta + 1}`}
        title="Peso"
        placeholder="Peso"
        className={`${CLASE_CAMPO_OPCION} w-[88px] shrink-0`}
      />
    </>
  )
}

interface PropsAgregar {
  item: PreguntaEncuesta
  indice: number
  ocupada: boolean
  sugerencias: ItemCatalogo[]
  onAgregar: (
    item: PreguntaEncuesta,
    seleccion: SeleccionCatalogo,
    peso: number | null,
  ) => void
}

/**
 * Alta de una opción: el texto se busca en el catálogo o se escribe, y el peso
 * es lo que la coloca entre lo negativo y lo positivo. Una opción que ya está
 * en el catálogo entra con el peso que ya tiene; el campo de peso es para las
 * que se escriben aquí, y vacío toma el siguiente de la pregunta.
 */
function AgregarOpcion({
  item,
  indice,
  ocupada,
  sugerencias,
  onAgregar,
}: PropsAgregar) {
  const [peso, setPeso] = useState('')

  return (
    <div className="mt-3 flex flex-col min-[560px]:flex-row gap-2 items-start">
      <div className="flex-1 min-w-0 w-full">
        <SelectorCatalogo
          etiqueta={`Agregar una opción a la pregunta ${indice + 1}`}
          placeholder="Agregar opción…"
          sugerencias={sugerencias}
          disabled={ocupada}
          limpiarAlConfirmar
          onConfirmar={(seleccion) => {
            const escrito = peso.trim()
            const numero = escrito === '' ? null : Number(escrito)
            onAgregar(
              item,
              seleccion,
              numero !== null && Number.isFinite(numero) ? numero : null,
            )
            setPeso('')
          }}
        />
      </div>
      <input
        type="number"
        step="0.01"
        value={peso}
        disabled={ocupada}
        onChange={(event) => setPeso(event.target.value)}
        aria-label={`Peso de la opción nueva de la pregunta ${indice + 1}`}
        placeholder="Peso"
        title="Solo para una opción nueva; vacío toma el siguiente peso"
        className="w-full min-[560px]:w-[104px] font-normal px-[14px] py-2.5 rounded-lg border border-outline bg-surface text-ink box-border
          transition-[border-color,box-shadow] duration-200 placeholder:text-outline
          focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)] disabled:opacity-60"
      />
    </div>
  )
}

export default TarjetaPregunta
