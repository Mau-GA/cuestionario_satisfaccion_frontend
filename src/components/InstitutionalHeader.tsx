import { Link } from 'react-router-dom'

function InstitutionalHeader() {
  return (
    <header className="bg-azul-unam border-b-[5px] border-oro-unam">
      <div
        className="mx-auto max-w-[1120px] px-6 py-3 grid grid-cols-[1fr_auto] items-center gap-2
          [grid-template-areas:'left_right'_'titles_titles']
          min-[720px]:grid-cols-[1fr_auto_1fr] min-[720px]:gap-4
          min-[720px]:[grid-template-areas:'left_titles_right']"
      >
        <Link
          to="/"
          className="[grid-area:left] justify-self-start flex items-center no-underline"
          aria-label="Inicio"
        >
          <img
            src="/logo-unam.png"
            alt="UNAM"
            className="h-[39px] min-[720px]:h-[50px] w-auto block"
          />
        </Link>

        <div className="[grid-area:titles] flex flex-col items-center gap-[3px] text-center text-white">
          <strong className="text-[15px] min-[720px]:text-[17px] tracking-[0.2px]">
            Universidad Nacional Autónoma de México
          </strong>
          <small className="text-[12.5px] min-[720px]:text-sm opacity-85 tracking-[0.3px]">
            Por mi raza hablará el espíritu
          </small>
        </div>

        <div className="[grid-area:right] justify-self-end flex items-center">
          <img
            src="/logo-fesa-acatlan.png"
            alt="FES Acatlán"
            className="h-[39px] min-[720px]:h-[50px] w-auto block"
          />
        </div>
      </div>
    </header>
  )
}

export default InstitutionalHeader
