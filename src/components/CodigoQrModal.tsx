import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { esBaseLocal } from '../services/enlacesPublicos'

const LADO_QR = 288

interface Props {
  /** Encabezado del modal: de qué es el código. */
  titulo: string
  /** Lo que la persona reconoce: el título de la encuesta o el del evento. */
  nombre: string
  enlace: string
  /** Nombre del PNG que se descarga, sin extensión. */
  archivo: string
  onClose: () => void
}

const CLASE_BOTON =
  'text-sm font-bold rounded-lg border cursor-pointer px-[14px] py-2 ' +
  'transition-colors disabled:opacity-50 disabled:cursor-not-allowed ' +
  'bg-transparent text-azul-unam border-azul-unam hover:bg-accent-soft'

/**
 * El QR de una encuesta o de un evento, listo para pegarse en una mesa. Se
 * dibuja en el navegador: el enlace ya lo tiene el front, así que no hace
 * falta pedirle la imagen al API.
 */
function CodigoQrModal({ titulo, nombre, enlace, archivo, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // El PNG se guarda aparte del canvas porque lo usan la descarga y la
  // impresión, que corren mucho después de dibujarlo.
  const [png, setPng] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    QRCode.toCanvas(canvas, enlace, {
      width: LADO_QR,
      // Margen (zona de silencio) y corrección media: es lo que hace que el
      // código siga leyéndose impreso, fotocopiado o con un dedo encima.
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#003d79ff', light: '#ffffffff' },
    })
      .then(() => setPng(canvas.toDataURL('image/png')))
      .catch(() => setError('No se pudo generar el código QR.'))
  }, [enlace])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true)
      setError(null)
      window.setTimeout(() => setCopiado(false), 2500)
    } catch {
      setError('El navegador no dejó copiar; selecciona el enlace a mano.')
    }
  }

  function descargar(): void {
    if (!png) return
    const enlaceDescarga = document.createElement('a')
    enlaceDescarga.href = png
    enlaceDescarga.download = `${archivo}.png`
    enlaceDescarga.click()
  }

  function imprimir(): void {
    if (!png) return
    const ventana = window.open('', '_blank', 'width=640,height=760')
    if (!ventana) {
      setError(
        'El navegador bloqueó la ventana de impresión; descarga el PNG e imprímelo.',
      )
      return
    }

    // Se arma con el DOM y no escribiendo HTML: el título y el enlace son
    // texto de la base, y asi no hay forma de que rompan la pagina.
    const doc = ventana.document
    doc.title = archivo
    const estilo = doc.createElement('style')
    estilo.textContent =
      'body{font-family:system-ui,sans-serif;color:#003d79;text-align:center;padding:40px}' +
      'h1{font-size:22px;margin:0 0 4px}p{font-size:12px;word-break:break-all;margin:16px auto;max-width:420px}' +
      'img{width:320px;height:320px}'
    doc.head.appendChild(estilo)

    const encabezado = doc.createElement('h1')
    encabezado.textContent = nombre
    const bajada = doc.createElement('p')
    bajada.textContent = 'Escanea el código para responder la encuesta'
    const imagen = doc.createElement('img')
    imagen.alt = `Código QR de ${nombre}`
    const pie = doc.createElement('p')
    pie.textContent = enlace

    doc.body.append(encabezado, bajada, imagen, pie)
    // La impresión se dispara cuando la imagen ya está pintada; si no, sale
    // la hoja con el hueco en blanco.
    imagen.addEventListener('load', () => {
      ventana.focus()
      ventana.print()
    })
    imagen.src = png
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="codigo-qr-titulo"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] max-h-[92vh] overflow-y-auto rounded-2xl bg-surface border border-outline shadow-[0_20px_40px_rgba(0,0,0,0.3)] p-6 box-border"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4">
          <h2 id="codigo-qr-titulo" className="text-ink text-[20px]">
            {titulo}
          </h2>
          <p className="mt-1 text-sm opacity-70 break-words">{nombre}</p>
        </header>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={LADO_QR}
            height={LADO_QR}
            aria-label={`Código QR de ${nombre}`}
            className="rounded-lg border border-outline bg-white"
          />
        </div>

        <p className="mt-4 text-xs break-all opacity-80">{enlace}</p>

        {esBaseLocal() && (
          <p className="mt-3 px-[14px] py-[10px] rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam">
            Este código apunta a esta computadora: solo sirve para probar. Para
            imprimirlo hay que configurar <code>VITE_PUBLIC_BASE_URL</code> con
            la dirección pública del sistema.
          </p>
        )}

        {copiado && (
          <p
            className="mt-3 px-[14px] py-[10px] rounded-lg text-sm bg-green-50 border border-green-200 text-green-800"
            role="status"
          >
            Enlace copiado.
          </p>
        )}

        {error && (
          <p
            className="mt-3 px-[14px] py-[10px] rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => void copiar()} className={CLASE_BOTON}>
            Copiar enlace
          </button>
          <button
            type="button"
            onClick={descargar}
            disabled={!png}
            className={CLASE_BOTON}
          >
            Descargar PNG
          </button>
          <button
            type="button"
            onClick={imprimir}
            disabled={!png}
            className={CLASE_BOTON}
          >
            Imprimir
          </button>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="text-sm font-bold rounded-lg border cursor-pointer px-[14px] py-2 transition-[filter] bg-azul-unam text-white border-azul-unam hover:brightness-110"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default CodigoQrModal
