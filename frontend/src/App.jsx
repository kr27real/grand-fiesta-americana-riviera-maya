import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageLoader from './components/PageLoader/PageLoader';
import ScrollToTopButton from './components/ScrollToTopButton/ScrollToTopButton';
import { AuthProvider, useAuth } from './context/AuthContext';
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

// Componente de protección amigable con llamado a la acción
function RutaProtegida({ children, mensaje = "Para acceder a esta sección exclusiva, inicia sesión con tu membresía Fiesta Rewards." }) {
  const { estaAutenticado, abrirLogin } = useAuth();

  if (!estaAutenticado) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(20, 16, 26, 0.85)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          padding: '3rem 2.5rem',
          maxWidth: '520px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#d4af37', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Acceso para Socios
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            {mensaje}
          </p>
          <button
            onClick={abrirLogin}
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #aa8212 100%)',
              color: '#060508',
              border: 'none',
              padding: '0.9rem 2rem',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              boxShadow: '0 6px 20px rgba(212, 175, 55, 0.35)'
            }}
          >
            Iniciar Sesión Fiesta Rewards
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <PageLoader />

        <div className="app-container" style={{ backgroundColor: '#060508', minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column' }}>
          <Navbar />

          <div style={{ flex: 1 }}>
            <Routes>
              {/* Páginas Públicas */}
              <Route path="/" element={<Inicio />} />
              <Route path="/habitaciones" element={<Habitaciones />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/experiencias" element={<Experiencias />} />
              <Route path="/ofertas" element={<Ofertas />} />
              <Route path="/restaurantes" element={<Restaurantes />} />
              <Route path="/galeria" element={<Galeria />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/concierge" element={<ConciergeVirtual />} />
              <Route path="/busqueda-reserva" element={<BusquedaReserva />} />
              <Route path="/disponibilidad" element={<Navigate to="/habitaciones" replace />} />

              {/* Rutas Privadas / Transaccionales Protegidas */}
              <Route 
                path="/checkout" 
                element={
                  <RutaProtegida mensaje="Para formalizar tu reservación y acceder a tarifas de socio, ingresa a tu cuenta Fiesta Rewards.">
                    <Checkout />
                  </RutaProtegida>
                } 
              />
              <Route 
                path="/perfil" 
                element={
                  <RutaProtegida mensaje="Tu estado de cuenta, billetera digital y facturas CFDI están resguardadas en tu bóveda de socio.">
                    <PerfilSocio />
                  </RutaProtegida>
                } 
              />
              <Route 
                path="/perfil-socio" 
                element={
                  <RutaProtegida mensaje="Tu estado de cuenta, billetera digital y facturas CFDI están resguardadas en tu bóveda de socio.">
                    <PerfilSocio />
                  </RutaProtegida>
                } 
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          <ScrollToTopButton />
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}





