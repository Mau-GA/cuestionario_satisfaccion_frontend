import { AreaUsuario } from '../components/AreaUsuario'
import { Tarjeta } from '../components/ui'

/** Pendiente: el circuito de solicitudes de acceso todavía no está construido. */
export default function Solicitudes() {
  return (
    <AreaUsuario>
      <h1 className="mb-6 text-2xl font-semibold text-unam-azul">Solicitudes de acceso</h1>
      <Tarjeta titulo="Todavía no disponible">
        <p className="text-sm text-slate-600">
          Aquí se revisarán las solicitudes de quien pide entrar al sistema, para aprobarlas o
          rechazarlas con un motivo.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Mientras tanto, las cuentas se dan de alta desde <strong>Usuarios</strong>.
        </p>
      </Tarjeta>
    </AreaUsuario>
  )
}
