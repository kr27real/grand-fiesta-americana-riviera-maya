import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Key, User, Phone, LogOut, Award, MessageSquare, Search, Receipt } from 'lucide-react';
import LoginModal from '../LoginModal/LoginModal';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(() => {
    return JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user') || 'null');
  });

  // Sincronizar estado de sesión en cada cambio de vista y eventos de storage
  useEffect(() => {
    const sincronizarSesion = () => {
      const sesionGuardada = JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user') || 'null');
      setUsuario(sesionGuardada);
    };

    sincronizarSesion();
    window.addEventListener('storage', sincronizarSesion);
    window.addEventListener('gfa_sesion_cambiada', sincronizarSesion);

    return () => {
      window.removeEventListener('storage', sincronizarSesion);
      window.removeEventListener('gfa_sesion_cambiada', sincronizarSesion);
    };
  }, [location.pathname]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleBotonReservar = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token_gfa') || localStorage.getItem('token');
    const sesion = usuario || JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user') || 'null');

    if (!token || !sesion) {
      setModalAbierto(true);
      return;
    }

    navigate('/disponibilidad');
  };
  const sincronizarUsuario = () => {
    const raw = localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user');
    if (raw) {
      try {
        setUsuario(JSON.parse(raw));
      } catch (e) {
        setUsuario(null);
      }
    } else {
      setUsuario(null);
    }
  };

    useEffect(() => {
    const sincronizarUsuario = () => {
      try {
        const guardado = localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user');
        setUsuario(guardado ? JSON.parse(guardado) : null);
      } catch {
        setUsuario(null);
      }
    };

    sincronizarUsuario();
    window.addEventListener('storage', sincronizarUsuario);
    window.addEventListener('gfa_auth_cambio', sincronizarUsuario);

    return () => {
      window.removeEventListener('storage', sincronizarUsuario);
      window.removeEventListener('gfa_auth_cambio', sincronizarUsuario);
    };
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario_gfa');
    localStorage.removeItem('gfa_user');
    setUsuario(null);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`gfa-navbar-container ${scrolled ? 'scrolled' : ''}`}>
      
      {/* 1. Franja Superior Dorada */}
      <div className="top-bar">
        <div className="top-bar-left">
          <a 
            href="https://autos.fiestamericanatravelty.com/es/" 
            target="_blank" 
            rel="noreferrer" 
            className="top-bar-item"
          >
            <Key size={13} />
            <span>Renta tu auto con Hertz</span>
          </a>

          <a 
            href="https://api.whatsapp.com/send?phone=5214431378728&text=Hola,%20solicito%20asistencia%20en%20Grand%20Fiesta%20Americana%20Riviera%20Cancun" 
            target="_blank" 
            rel="noreferrer" 
            className="top-bar-item"
          >
            <MessageSquare size={13} />
            <span>WhatsApp Concierge: +52 1 443 137 8728</span>
          </a>

          <a 
            href="tel:+524433108137" 
            className="top-bar-item"
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
                  Socio FR: <strong>{usuario.nombre || 'Socio'}</strong> ({usuario.numero_socio_rewards || 'FR-946469'})
                </span>
                <span className="user-pts-tag">{usuario.saldo_puntos ?? 500} pts</span>
              </Link>

              <button onClick={handleCerrarSesion} className="btn-nav-logout" title="Cerrar Sesión">
                <LogOut size={12} />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <button onClick={() => setModalAbierto(true)} className="top-bar-item">
              <User size={13} />
              <span>Iniciar Sesión / Unirse a Fiesta Rewards</span>
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
          <li>
            <Link to="/" className={`nav-link-item ${isActive('/') ? 'active' : ''}`}>
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/habitaciones" className={`nav-link-item ${isActive('/habitaciones') ? 'active' : ''}`}>
              Suites
            </Link>
          </li>
          <li>
            <Link to="/eventos" className={`nav-link-item ${isActive('/eventos') ? 'active' : ''}`}>
              Eventos
            </Link>
          </li>
          <li>
            <Link to="/experiencias" className={`nav-link-item ${isActive('/experiencias') ? 'active' : ''}`}>
              Experiencias
            </Link>
          </li>
          <li>
            <Link to="/ofertas" className={`nav-link-item ${isActive('/ofertas') ? 'active' : ''}`}>
              Ofertas
            </Link>
          </li>
          <li>
            <Link to="/restaurantes" className={`nav-link-item ${isActive('/restaurantes') ? 'active' : ''}`}>
              Restaurantes
            </Link>
          </li>
          <li>
            <Link to="/galeria" className={`nav-link-item ${isActive('/galeria') ? 'active' : ''}`}>
              Galería
            </Link>
          </li>
          <li>
            <Link to="/contacto" className={`nav-link-item ${isActive('/contacto') ? 'active' : ''}`}>
              Contacto
            </Link>
          </li>
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

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/busqueda-reserva"
            title="Consultar reservación y emitir Factura CFDI 4.0"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#f3e5ab',
              padding: '0.55rem 0.95rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.25s ease'
            }}
          >
            <Receipt size={14} color="#d4af37" />
            <span>Mi Reserva / Factura</span>
          </Link>
          <button
            type="button"
            onClick={handleBotonReservar}
            className="btn-reservar-gold"
            style={{ cursor: 'pointer', border: 'none' }}
          >
            Reservar
          </button>
        </div>

      </nav>

      <LoginModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onLoginSuccess={(user) => setUsuario(user)}
      />

    </header>
  );
}