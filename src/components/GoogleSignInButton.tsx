import { useState } from 'react'
import { loginWithGoogleCredential } from '../services/auth'

function buildDemoCredential(email: string): string {
    const datos = JSON.stringify({ email })
    const datosBase64 = btoa(datos)
    return `encabezado.${datosBase64}.firma`
}

interface GoogleSignInButtonProps {
    onSuccess: () => void
    onError: (message: string) => void
}

function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
    const [loading, setLoading] = useState(false)

    async function handleClick(email: string) {
    setLoading(true)
    try {
        await loginWithGoogleCredential(buildDemoCredential(email))
        onSuccess()
    } catch (err) {
        onError((err as Error).message)
    } finally {
        setLoading(false)
    }
    }

    return (
    <div>
        <button
        type="button"
        disabled={loading}
        onClick={() => handleClick('admin@example.com')}
        >
        Simular acceso con Google (cuenta aprobada)
        </button>{' '}
        <button
        type="button"
        disabled={loading}
        onClick={() => handleClick('nuevo@example.com')}
        >
        Simular acceso con Google (cuenta no aprobada)
        </button>
    </div>
    )
}

export default GoogleSignInButton