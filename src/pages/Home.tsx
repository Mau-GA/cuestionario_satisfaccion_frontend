import { Link } from 'react-router-dom'

function Home() {
  return (
    <main>
      <h1>Cuestionario de satisfacción</h1>
      <nav>
        <Link to="/dashboard">Panel de encuestas</Link>
        <Link to="/admin">Administración</Link>
      </nav>
    </main>
  )
}

export default Home