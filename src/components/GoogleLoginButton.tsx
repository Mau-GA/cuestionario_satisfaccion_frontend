import { useEffect, useRef } from 'react'

interface Props {
  onCredential: (idToken: string) => void
  onError: (message: string) => void
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GSI_SRC = 'https://accounts.google.com/gsi/client'

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: { credential: string }) => void
  }) => void
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('No se pudo cargar Google')),
      )
      return
    }
    const script = document.createElement('script')
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () =>
      reject(new Error('No se pudo cargar Google')),
    )
    document.head.appendChild(script)
  })
}

function GoogleLoginButton({ onCredential, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false
    loadGoogleScript()
      .then(() => {
        const container = containerRef.current
        const googleId = window.google?.accounts?.id
        if (cancelled || !container || !googleId) return
        googleId.initialize({
          client_id: CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        })
        googleId.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 336,
          text: 'signin_with',
          locale: 'es',
        })
      })
      .catch(() =>
        onError('No se pudo cargar el inicio de sesión con Google.'),
      )
    return () => {
      cancelled = true
    }
  }, [onCredential, onError])

  if (!CLIENT_ID) return null

  return <div ref={containerRef} className="flex justify-center" />
}

export default GoogleLoginButton
