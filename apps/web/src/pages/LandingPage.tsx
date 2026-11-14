import { Link } from 'react-router';
import { ServiceStatus } from '../components/ServiceStatus';

export function LandingPage() {
  return (
    <main className="landing">
      <h1>Accidentes Personales</h1>
      <p>Registre sus accidentes personales y consulte su estado en un solo lugar.</p>
      <nav className="landing__actions" aria-label="Acciones principales">
        <Link className="button button--primary" to="/accidentes/nuevo">
          Registrar un accidente
        </Link>
        <Link className="button" to="/ingresar">
          Ingresar para consultar mis accidentes
        </Link>
      </nav>
      <ServiceStatus />
    </main>
  );
}
