import { Route, Routes } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/ingresar" element={<PlaceholderPage title="Ingresar" />} />
      <Route
        path="/accidentes/nuevo"
        element={<PlaceholderPage title="Registrar un accidente" />}
      />
      <Route path="*" element={<PlaceholderPage title="Página no encontrada" />} />
    </Routes>
  );
}
