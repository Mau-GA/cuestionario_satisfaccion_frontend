import AppLayout from '../components/AppLayout'
import EncuestasPublicas from '../components/EncuestasPublicas'

function Home() {
  return (
    <AppLayout>
      <section className="rounded-xl bg-azul-unam text-white flex flex-col items-center text-center gap-[10px] px-8 py-12">
        <span className="text-oro-unam font-bold tracking-[0.3px]">
          Universidad Nacional Autónoma de México
        </span>
        <h1>Cuestionario de satisfacción</h1>
        <p>Sistema de atención a usuarios de los servicios universitarios.</p>
      </section>

      <EncuestasPublicas />
    </AppLayout>
  )
}

export default Home