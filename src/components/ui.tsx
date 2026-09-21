import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export function Tarjeta({ titulo, descripcion, children }: {
  titulo: string
  descripcion?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-unam-azul">{titulo}</h2>
        {descripcion && <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Boton({ variante = 'primario', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'primario' | 'secundario'
}) {
  const estilos =
    variante === 'primario'
      ? 'bg-unam-azul text-white hover:bg-unam-azul-claro'
      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
  return (
    <button
      {...props}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${estilos} ${className}`}
    />
  )
}

export function Campo({ etiqueta, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{etiqueta}</span>
      <input
        {...props}
        className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-unam-azul-claro focus:ring-2 focus:ring-unam-azul-claro/20 ${className}`}
      />
    </label>
  )
}

export function Selector({ etiqueta, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & {
  etiqueta: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{etiqueta}</span>
      <select
        {...props}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-unam-azul-claro focus:ring-2 focus:ring-unam-azul-claro/20"
      >
        {children}
      </select>
    </label>
  )
}

export function Insignia({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

export function Aviso({ tipo, children }: { tipo: 'error' | 'ok'; children: ReactNode }) {
  if (!children) return null
  return (
    <p
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`rounded-lg px-3 py-2 text-sm ${
        tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
      }`}
    >
      {children}
    </p>
  )
}

export function Tabla({ columnas, children }: { columnas: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
            {columnas.map((c) => (
              <th key={c} className="px-2 py-2 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  )
}
