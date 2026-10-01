function InstitutionalFooter() {
  return (
    <footer className="mt-auto bg-azul-unam text-white">
      <div className="mx-auto max-w-[1120px] px-6 py-7 text-center">
        <p className="text-[14.5px] leading-[1.6] tracking-[0.25px] text-white/92">
          Hecho en México, todos los derechos reservados {new Date().getFullYear()}.
          Esta página puede ser reproducida con fines no lucrativos, siempre y
          cuando no se mutile, se cite la fuente completa y su dirección
          electrónica. De otra forma, requiere permiso previo por escrito de la
          institución.
        </p>
      </div>
    </footer>
  )
}

export default InstitutionalFooter
