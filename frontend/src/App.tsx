// Definición de rutas de la aplicación
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Inicio from './pages/Inicio';
import MapaSIG from './pages/MapaSIG';
import RegistroImpactos from './pages/RegistroImpactos';
import Comparacion from './pages/Comparacion';
import Dashboard from './pages/Dashboard';
import ProyectoPagina from './pages/Proyecto';
import ArticuloPagina from './pages/Articulo';
import Reportes from './pages/Reportes';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthContext';
import type { ReactNode } from 'react';

// Protección de rutas: solo el administrador accede al panel
function SoloAdmin({ children }: { children: ReactNode }) {
  const { esAdministrador } = useAuth();
  return esAdministrador ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/mapa" element={<MapaSIG />} />
          <Route path="/registro-impactos" element={<RegistroImpactos />} />
          <Route path="/comparacion" element={<Comparacion />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/proyecto" element={<ProyectoPagina />} />
          <Route path="/articulo" element={<ArticuloPagina />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/admin" element={<SoloAdmin><Admin /></SoloAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
