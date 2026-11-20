import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, CreditCard, Gift, ArrowRight, CheckCircle2, X } from 'lucide-react';
import './BienvenidaSocioModal.css';
import './BienvenidaSocioModal.mobile.css';

export default function BienvenidaSocioModal({ isOpen, usuario, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !usuario) return null;

  const nombreCompleto = `${usuario.tratamiento || ''} ${usuario.nombres || 'Socio'} ${usuario.apellidos || ''}`.trim();
  const folioFr = usuario.fiesta_rewards_id || `FR-${Math.floor(100000 + Math.random() * 900000)}`;
  const nivel = (usuario.nivel_socio || 'Titanium Privilege').toUpperCase();

  const irAReservar = () => {
    onClose();
    navigate('/habitaciones');
  };

  const irAPerfil = () => {
    onClose();
    navigate('/perfil-socio');
  };

  return (
    <div className="bienvenida-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bienvenida-card" onClick={(e) => e.stopPropagation()}>
        <button className="bienvenida-close-btn" onClick={onClose} aria-label="Cerrar bienvenida">
          <X size={20} />
        </button>

        {/* Encabezado de Gala */}
        <div className="bienvenida-hero">
          <div className="bienvenida-crown-ring">
            <Crown size={30} color="#d4af37" />
          </div>
          <span className="bienvenida-kicker">
            <Sparkles size={13} /> MEMBRESÍA ACTIVADA • GRUPO POSADAS
          </span>
          <h2 className="bienvenida-title">
            ¡Bienvenido a Grand Fiesta Americana, <br />
            <span>{nombreCompleto}</span>!
          </h2>
          <p className="bienvenida-subtitle">
            Tu expediente de hospitalidad de ultra lujo en <strong>Riviera Cancún</strong> ha sido creado y sincronizado en SQL Server.
          </p>
        </div>

        {/* Tarjeta Digital de Bienvenida */}
        <div className="bienvenida-vip-pass">
          <div className="vip-pass-top">
            <div>
              <span className="vip-pass-brand">FIESTA REWARDS • {nivel}</span>
              <strong className="vip-pass-folio">{folioFr}</strong>
            </div>
            <span className="vip-pass-status">
              <CheckCircle2 size={14} /> ACTIVA
            </span>
          </div>

          <div className="vip-pass-metrics">
            <div className="vip-metric">
              <CreditCard size={16} color="#d4af37" />
              <div>
                <small>CRÉDITO INSTITUCIONAL</small>
                <strong>$50,000.00 MXN</strong>
              </div>
            </div>
            <div className="vip-metric">
              <Gift size={16} color="#d4af37" />
              <div>
                <small>BONO DE BIENVENIDA</small>
                <strong>2,500 PTS + 2 Noches</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficios Desbloqueados */}
        <div className="bienvenida-perks-grid">
          <div className="perk-pill">
            <span>🥂</span>
            <div>
              <strong>20% en Gastronomía &amp; Cavas</strong>
              <small>Cortesía directa en restaurantes de autor</small>
            </div>
          </div>
          <div className="perk-pill">
            <span>🧖</span>
            <div>
              <strong>20% en Feel Harmony Spa</strong>
              <small>Rituales holísticos e hidroterapia VIP</small>
            </div>
          </div>
          <div className="perk-pill">
            <span>🛎️</span>
            <div>
              <strong>Concierge 24/7 &amp; Lounge VIP</strong>
              <small>Check-in privado con acceso RFID</small>
            </div>
          </div>
        </div>

        {/* Acciones Principales */}
        <div className="bienvenida-actions">
          <button type="button" className="btn-bienvenida-primary" onClick={irAReservar}>
            <span>Explorar Suites y Reservar</span>
            <ArrowRight size={17} />
          </button>
          <button type="button" className="btn-bienvenida-secondary" onClick={irAPerfil}>
            Ver mi Fiesta Card y Billetera
          </button>
        </div>
      </div>
    </div>
  );
}