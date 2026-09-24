import { useEffect, useRef, useState } from 'react'
import { GOOGLE_CLIENT_ID } from '../config'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (respuesta: { credential: string }) => void
          }) => void
          renderButton: (contenedor: HTMLElement, opciones: Record<string, unknown>) => void
        }
      }
    }
  }
}

/**
 * El botón oficial de Google Identity Services.
 *
 * Sin `VITE_GOOGLE_CLIENT_ID` no dibuja nada: es el mismo criterio que el
 * backend, que responde 503 en vez de fallar de forma confusa. Entrar con
 * correo y contraseña sigue funcionando siempre.
 */
export function BotonGoogle({ onCredential }: { onCredential: (credential: string) => void }) {
  const contenedor = useRef<HTMLDivElement>(null)
  const [listo, setListo] = useState(false)

  // El callback se guarda en un ref para no tener que meterlo en las
  // dependencias del efecto de abajo: Login lo define inline, así que su
  // identidad cambia en cada render, y renderButton() no debe volver a
  // dibujar el botón cada vez.
  const onCredentialRef = useRef(onCredential)
  useEffect(() => {
    onCredentialRef.current = onCredential
  })

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    // El script de Google se carga con `async defer`: puede no estar listo
    // todavía cuando este componente monta.
    let cancelado = false
    function esperar() {
      if (cancelado) return
      if (window.google?.accounts?.id) {
        setListo(true)
        return
      }
      setTimeout(esperar, 100)
    }
    esperar()
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (!listo || !contenedor.current || !window.google) return
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (respuesta) => onCredentialRef.current(respuesta.credential),
    })
    window.google.accounts.id.renderButton(contenedor.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      locale: 'es',
    })
  }, [listo])

  if (!GOOGLE_CLIENT_ID) return null

  return <div ref={contenedor} className="flex justify-center" />
}
