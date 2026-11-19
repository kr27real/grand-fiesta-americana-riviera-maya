import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Key, User, Phone, LogOut, Award, MessageSquare, Receipt, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../LoginModal/LoginModal';
import './Navbar.css';
import './Navbar.mobile.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, estaAutenticado, cerrarSesion, abrirLogin, loginModalAbierto, cerrarLogin, iniciarSesion } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [puntosReales, setPuntosReales] = useState(null);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setMenuMovilAbierto(false);
  }, [location.pathname]);

  // Sincronizar puntos reales desde TarjetasFiestaCard en SQL Server
  useEffect(() => {
    const uid = usuario?.usuario_id || usuario?.id;
    const token =
      localStorage.getItem('gfa_jwt_token') ||
      localStorage.getItem('token_gfa') ||
      localStorage.getItem('token');

    if (!uid || !token || token === 'null' || token === 'undefined' || token === 'session_token_valid') {
      setPuntosReales(null);
      return;
    }

    fetch(`/api/billetera/${uid}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('gfa_jwt_token');
          localStorage.removeItem('token_gfa');
          localStorage.removeItem('token');
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then(data => {
        const pts = data?.fiesta_card?.puntos_rewards_acumulados ?? data?.puntos_rewards_acumulados;
        if (pts !== undefined && pts !== null) {
          setPuntosReales(pts);
        }
      })
      .catch(() => {});
  }, [usuario, location.pathname]);

  const handleBotonReservar = (e) => {
    e.preventDefault();
    setMenuMovilAbierto(false);
    if (!estaAutenticado) {
      if (abrirLogin) abrirLogin();
      return;
    }
    navigate('/disponibilidad');
  };

  const handleCerrarSesion = () => {
    setMenuMovilAbierto(false);
    localStorage.removeItem('gfa_jwt_token');
    localStorage.removeItem('token_gfa');
    localStorage.removeItem('token');
    cerrarSesion();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const nombreMostrar = usuario?.nombres || usuario?.nombre || 'Socio';
  const folioRewardsMostrar = usuario?.fiesta_rewards_id || usuario?.numero_socio_rewards || 'FR-964612';
  const puntosMostrar = puntosReales ?? usuario?.puntos_rewards_acumulados ?? usuario?.saldo_puntos ?? 2500;

  return (
    <header className={`gfa-navbar-container ${scrolled ? 'scrolled' : ''}`}>
      
      {/* 1. Franja Superior Dorada */}
      <div className="top-bar">
        <div className="top-bar-left">
          <a 
            href="https://autos.fiestamericanatravelty.com/es/" 
            target="_blank" 
            rel="noreferrer" 
            className="top-bar-item hide-on-mobile"
          >
            <Key size={13} />
            <span>Renta tu auto con Hertz</span>
          </a>

          <a 
            href="https://api.whatsapp.com/send?phone=5214431378728&text=Hola,%20solicito%20asistencia%20en%20Grand%20Fiesta%20Americana%20Riviera%20Cancun" 
            target="_blank" 
            rel="noreferrer" 
            className="top-bar-item hide-on-mobile"
          >
            <MessageSquare size={13} />
            <span>WhatsApp Concierge: +52 1 443 137 8728</span>
          </a>

          <a 
            href="tel:+524433108137" 
            className="top-bar-item hide-on-tablet"
            title="Call Center y Reservaciones"
          >
            <Phone size={13} />
            <span>Call Center: +52 (443) 310 81 37</span>
          </a>
        </div>

        <div className="top-bar-right">
          {usuario ? (
            <div className="user-logged-box">
              <Link to="/perfil-socio" className="user-badge-chip" title="Ver mi cuenta de socio">
                <Award size={14} color="#08060c" />
                <span>
                  <span className="hide-on-mobile">Socio FR: </span>
                  <strong>{nombreMostrar}</strong>
                  <span className="hide-on-mobile"> ({folioRewardsMostrar})</span>
                </span>
                <span className="user-pts-tag">{puntosMostrar} pts</span>
              </Link>

              <button onClick={handleCerrarSesion} className="btn-nav-logout" title="Cerrar Sesión">
                <LogOut size={12} />
                <span className="hide-on-mobile">Salir</span>
              </button>
            </div>
          ) : (
            <button onClick={abrirLogin} className="top-bar-item">
              <User size={13} />
              <span>Iniciar Sesión / Fiesta Rewards</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Barra Principal de Navegación */}
      <nav className="main-nav">
        <Link to="/" className="nav-brand">
          <span className="brand-title">Grand Fiesta Americana</span>
          <span className="brand-subtitle">Riviera Cancún Resort & Spa</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/" className={`nav-link-item ${isActive('/') ? 'active' : ''}`}>Inicio</Link></li>
          <li><Link to="/habitaciones" className={`nav-link-item ${isActive('/habitaciones') ? 'active' : ''}`}>Suites</Link></li>
          <li><Link to="/eventos" className={`nav-link-item ${isActive('/eventos') ? 'active' : ''}`}>Eventos</Link></li>
          <li><Link to="/experiencias" className={`nav-link-item ${isActive('/experiencias') ? 'active' : ''}`}>Experiencias</Link></li>
          <li><Link to="/ofertas" className={`nav-link-item ${isActive('/ofertas') ? 'active' : ''}`}>Ofertas</Link></li>
          <li><Link to="/restaurantes" className={`nav-link-item ${isActive('/restaurantes') ? 'active' : ''}`}>Restaurantes</Link></li>
          <li><Link to="/galeria" className={`nav-link-item ${isActive('/galeria') ? 'active' : ''}`}>Galería</Link></li>
          <li><Link to="/contacto" className={`nav-link-item ${isActive('/contacto') ? 'active' : ''}`}>Contacto</Link></li>
          {usuario && (
            <li>
              <Link 
                to="/perfil-socio" 
                className={`nav-link-item ${isActive('/perfil-socio') ? 'active' : ''}`}
                style={{ color: '#d4af37' }}
              >
                Mi Perfil
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          <Link
            to="/busqueda-reserva"
            title="Consultar reservación y emitir Factura CFDI 4.0"
            className="btn-factura-nav"
          >
            <Receipt size={14} color="#d4af37" />
            <span>Mi Reserva</span>
          </Link>

          <button
            type="button"
            onClick={handleBotonReservar}
            className="btn-reservar-gold"
          >
            Reservar
          </button>

          <button
            type="button"
            className="btn-mobile-toggle"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            aria-label="Abrir menú de navegación"
          >
            {menuMovilAbierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* 3. Menú Desplegable Móvil / Tablet */}
      {menuMovilAbierto && (
        <div className="mobile-drawer">
          <ul className="mobile-nav-list">
            <li><Link to="/" className={isActive('/') ? 'active' : ''}>Inicio</Link></li>
            <li><Link to="/habitaciones" className={isActive('/habitaciones') ? 'active' : ''}>Suites & Habitaciones</Link></li>
            <li><Link to="/disponibilidad" className={isActive('/disponibilidad') ? 'active' : ''}>Cotizar Disponibilidad</Link></li>
            <li><Link to="/ofertas" className={isActive('/ofertas') ? 'active' : ''}>Ofertas Exclusivas</Link></li>
            <li><Link to="/experiencias" className={isActive('/experiencias') ? 'active' : ''}>Experiencias & Spa</Link></li>
            <li><Link to="/restaurantes" className={isActive('/restaurantes') ? 'active' : ''}>Gastronomía & Bares</Link></li>
            <li><Link to="/eventos" className={isActive('/eventos') ? 'active' : ''}>Eventos & Bodas</Link></li>
            <li><Link to="/galeria" className={isActive('/galeria') ? 'active' : ''}>Galería</Link></li>
            <li><Link to="/contacto" className={isActive('/contacto') ? 'active' : ''}>Contacto & Concierge</Link></li>
            {usuario && (
              <li>
                <Link to="/perfil-socio" className="mobile-perfil-link">
                  Mi Cuenta Fiesta Rewards ({puntosMostrar} pts)
                </Link>
              </li>
            )}
          </ul>

          <div className="mobile-drawer-actions">
            <Link to="/busqueda-reserva" className="mobile-btn-outline">
              <Receipt size={16} /> Localizar Reserva / Factura CFDI
            </Link>
            <button type="button" onClick={handleBotonReservar} className="mobile-btn-gold">
              Reservar Suite Ahora
            </button>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={loginModalAbierto}
        onClose={cerrarLogin}
        onLoginSuccess={(user, token) => {
          if (token) iniciarSesion(user, token);
        }}
      />

    </header>
  );
}