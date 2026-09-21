/**
 * Los dos archivos son las versiones en blanco, pensadas para el fondo azul
 * institucional. Se dimensionan por altura para que ambos escudos queden
 * ópticamente del mismo tamaño pese a tener proporciones distintas.
 */
export function LogoUNAM({ className = 'h-8' }: { className?: string }) {
  return (
    <img
      src="/logo-blanco-unam.webp"
      alt="Universidad Nacional Autónoma de México"
      className={`${className} w-auto`}
    />
  )
}

export function LogoFESAcatlan({ className = 'h-8' }: { className?: string }) {
  return (
    <img
      src="/logo-blanco-fes-a.png"
      alt="Facultad de Estudios Superiores Acatlán"
      className={`${className} w-auto`}
    />
  )
}
