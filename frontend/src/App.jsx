import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageLoader from './components/PageLoader/PageLoader';
import ScrollToTopButton from './components/ScrollToTopButton/ScrollToTopButton';
import Inicio from './pages/Inicio/Inicio';
import Habitaciones from './pages/Habitaciones/Habitaciones';
import Disponibilidad from './pages/Disponibilidad/Disponibilidad';
import Checkout from './pages/Checkout/Checkout';
import BusquedaReserva from './pages/BusquedaReserva/BusquedaReserva';
import NotFound from './pages/NotFound/NotFound';
import PerfilSocio from './pages/PerfilSocio/PerfilSocio';
import ConciergeVirtual from './pages/ConciergeVirtual/ConciergeVirtual';
import Ofertas from './pages/Ofertas/Ofertas';
import Restaurantes from './pages/Restaurantes/Restaurantes';
import Galeria from './pages/Galeria/Galeria';
import Experiencias from './pages/Experiencias/Experiencias';
import Eventos from './pages/Eventos/Eventos';
import Contacto from './pages/Contacto/Contacto';
import './index.css';

// Componente de protección para Checkout y Perfil de Socio
function RutaProtegida({ children }) {
  const token = localStorage.getItem('token_gfa') || localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user') || 'null');

  if (!token || !usuario) {
    return <Navigate to="/habitaciones" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <PageLoader />

      <div className="app-container" style={{ backgroundColor: '#060508', minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/habitaciones" element={<Habitaciones />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/experiencias" element={<Experiencias />} />
            <Route path="/ofertas" element={<Ofertas />} />
            <Route path="/restaurantes" element={<Restaurantes />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/disponibilidad" element={<Disponibilidad />} />
            <Route path="/checkout" element={<RutaProtegida><Checkout /></RutaProtegida>} />
            <Route path="/busqueda-reserva" element={<BusquedaReserva />} />
            <Route path="/perfil" element={<RutaProtegida><PerfilSocio /></RutaProtegida>} />
            <Route path="/perfil-socio" element={<RutaProtegida><PerfilSocio /></RutaProtegida>} />
            <Route path="/concierge" element={<ConciergeVirtual />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        <ScrollToTopButton />
        <Footer />
      </div>
    </Router>
  );
}