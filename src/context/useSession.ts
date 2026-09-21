import { useContext } from 'react'
import { SessionContext } from './session-context'

export function useSession() {
  const contexto = useContext(SessionContext)
  if (!contexto) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>')
  }
  return contexto
}
