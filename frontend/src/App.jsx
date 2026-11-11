import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageLoader from './components/PageLoader/PageLoader';
import ScrollToTopButton from './components/ScrollToTopButton/ScrollToTopButton';
import { AuthProvider, useAuth } from './context/AuthContext';

// Módulos del Embudo de Reserva Oficial (Posadas / Amadeus BE5)
import Inicio from './pages/Inicio/Inicio';
import Habitaciones from './pages/Habitaciones/Habitaciones';
import Disponibilidad from './pages/Disponibilidad/Disponibilidad';
import Checkout from './pages/Checkout/Checkout';
import BusquedaReserva from './pages/BusquedaReserva/BusquedaReserva';
import PerfilSocio from './pages/PerfilSocio/PerfilSocio';

// Módulos de Experiencias y Resort
import Ofertas from './pages/Ofertas/Ofertas';
import Restaurantes from './pages/Restaurantes/Restaurantes';
import Spa from './pages/Spa/Spa';
import Galeria from './pages/Galeria/Galeria';
import Experiencias from './pages/Experiencias/Experiencias';
import Eventos from './pages/Eventos/Eventos';
import Contacto from './pages/Contacto/Contacto';
import ConciergeVirtual from './pages/ConciergeVirtual/ConciergeVirtual';
import NotFound from './pages/NotFound/NotFound';

import './index.css';

// Componente de protección amigable con llamado a la acción
function RutaProtegida({ children, mensaje = "Para acceder a esta sección exclusiva, inicia sesión con tu membresía Fiesta Rewards." }) {
  const { estaAutenticado, abrirLogin } = useAuth();

  if (!estaAutenticado) {
    return (
      <div style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(20, 16, 26, 0.9)',
          border: '1px solid rgba(199, 175, 139, 0.35)',
          borderRadius: '12px',
          padding: '3rem 2.5rem',
          maxWidth: '520px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 45px rgba(0,0,0,0.7)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#f3e5ab', marginBottom: '0.8rem', fontSize: '2rem', fontWeight: 600 }}>
            Acceso para Socios
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            {mensaje}
          </p>
          <button
            type="button"
            onClick={abrirLogin}
            style={{
              background: '#c7af8b',
              color: '#060508',
              border: 'none',
              padding: '0.9rem 2.2rem',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              boxShadow: '0 8px 25px rgba(199, 175, 139, 0.35)',
              transition: 'background 0.2s'
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
              
              {/* Embudo Comercial Conectado */}
              <Route path="/habitaciones" element={<Habitaciones />} />
              <Route path="/disponibilidad" element={<Disponibilidad />} />
              
              {/* Módulos Informativos y Experiencias */}
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/experiencias" element={<Experiencias />} />
              <Route path="/spa" element={<Spa />} />
              <Route path="/ofertas" element={<Ofertas />} />
              <Route path="/restaurantes" element={<Restaurantes />} />
              <Route path="/galeria" element={<Galeria />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/concierge" element={<ConciergeVirtual />} />
              <Route path="/busqueda-reserva" element={<BusquedaReserva />} />

              {/* Rutas Protegidas / Transaccionales */}
              <Route 
                path="/checkout" 
                element={
                  <RutaProtegida mensaje="Para formalizar tu reservación con tarifas de socio y garantía bancaria, ingresa a tu cuenta Fiesta Rewards.">
                    <Checkout />
                  </RutaProtegida>
                } 
              />
              <Route 
                path="/perfil" 
                element={<Navigate to="/perfil-socio" replace />} 
              />
              <Route 
                path="/perfil-socio" 
                element={
                  <RutaProtegida mensaje="Tu estado de cuenta, billetera digital, noches acumuladas y facturas CFDI están resguardadas en tu bóveda de socio.">
                    <PerfilSocio />
                  </RutaProtegida>
                } 
              />

              {/* 404 Not Found */}
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