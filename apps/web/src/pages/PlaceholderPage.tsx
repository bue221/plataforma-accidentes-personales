import { Link } from 'react-router';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="placeholder">
      <h1>{title}</h1>
      <p>Esta sección estará disponible próximamente.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  );
}
