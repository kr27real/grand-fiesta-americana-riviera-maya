import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buscarReservacionPorFolioApi } from '../../services/api';
import { 
  Printer, Search, CheckCircle2, ArrowLeft, ShieldCheck, 
  Mail, Calendar, MapPin, Building2, User, AlertCircle, 
  Sparkles, CreditCard, Loader2 
} from 'lucide-react';
import './BusquedaReserva.css';

export default function BusquedaReserva() {
  const [folioInput, setFolioInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [reserva, setReserva] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Formateador robusto para fechas de SQL Server
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    if (fechaStr.includes('/')) {
      return fechaStr.split(' ')[0];
    }
    const d = new Date(fechaStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return fechaStr;
  };

  const calcularDiasRestantes = (fechaLlegadaStr) => {
    if (!fechaLlegadaStr) return null;
    let fecha;
    if (fechaLlegadaStr.includes('/')) {
      const parts = fechaLlegadaStr.split(' ')[0].split('/');
      fecha = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T15:00:00`);
    } else {
      fecha = new Date(fechaLlegadaStr);
    }
    const hoy = new Date();
    const diffTime = fecha - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setCargando(true);
    setReserva(null);

    try {
      const resp = await buscarReservacionPorFolioApi(folioInput.trim(), emailInput.trim());
      const info = resp.data || resp;

      if (info && (info.folio_confirmacion || info.reservacion_id)) {
        setReserva(info);
      } else {
        setErrorMsg('No se localizó ninguna reservación con los datos proporcionados.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const diasRestantes = reserva ? calcularDiasRestantes(reserva.fecha_llegada) : null;

  return (
    <div className="busqueda-page-root">
      <div className="busqueda-wrapper">

        {/* 1. FORMULARIO DE BÚSQUEDA */}
        {!reserva && (
          <div className="busqueda-form-card">
            <div className="busqueda-form-icon">
              <Search size={40} />
            </div>
            
            <h1 className="busqueda-form-title">Localizador de Reserva</h1>
            <p className="busqueda-form-subtitle">
              Ingresa el folio de confirmación y el correo o apellido registrado para acceder a tu Voucher Oficial y Check-in digital.
            </p>

            {errorMsg && (
              <div className="busqueda-alert-box">
                <AlertCircle size={18} className="alert-icon-svg" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleBuscar} className="busqueda-form-layout">
              <div className="busqueda-field-wrapper">
                <Building2 size={16} className="field-adornment-icon" />
                <input 
                  type="text"
                  placeholder="Folio de Confirmación (ej. GFA-110619)"
                  required
                  value={folioInput}
                  onChange={(e) => setFolioInput(e.target.value.toUpperCase())}
                />
              </div>

              <div className="busqueda-field-wrapper">
                <Mail size={16} className="field-adornment-icon" />
                <input 
                  type="text"
                  placeholder="Correo o Apellido registrado"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={cargando}
                className="btn-submit-busqueda"
              >
                {cargando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Consultando SQL Server...</span>
                  </>
                ) : (
                  'Consultar Reservación'
                )}
              </button>
            </form>
          </div>
        )}

        {/* 2. VOUCHER OFICIAL */}
        {reserva && (
          <div className="voucher-master-card">
            
            {/* Barra de Acciones */}
            <div className="voucher-top-bar no-print">
              <button 
                type="button"
                onClick={() => setReserva(null)}
                className="btn-back-search"
              >
                <ArrowLeft size={16} /> Buscar otro folio
              </button>
              
              <button 
                type="button"
                onClick={() => window.print()}
                className="btn-print-voucher"
              >
                <Printer size={15} /> Imprimir / Guardar PDF
              </button>
            </div>

            {/* Cabecera Luxury */}
            <div 
              className="voucher-hero-banner"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(6,5,8,0.95) 40%, rgba(6,5,8,0.78) 100%), url("${reserva.foto_principal || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'}")`
              }}
            >
              <div className="voucher-hero-content">
                <div className="hotel-meta">
                  <h3>Grand Fiesta Americana</h3>
                  <span className="hotel-sub">Riviera Cancún Resort & Spa</span>
                  <p className="hotel-address">
                    <MapPin size={14} /> Carretera Cancún-Tulum Km 335, Bahía Petempich, Quintana Roo
                  </p>
                </div>
                
                <div className="voucher-folio-box">
                  <span className="folio-label">Folio de Confirmación</span>
                  <strong className="folio-number">{reserva.folio_confirmacion}</strong>
                  <div className="folio-status">
                    <CheckCircle2 size={13} /> {reserva.estatus_reservacion || 'Confirmada'}
                  </div>
                </div>
              </div>
            </div>

            {/* Matriz de Datos */}
            <div className="voucher-inner-body">
              
              <div className="voucher-matrix-grid">
                
                <div className="matrix-card gold-border">
                  <span className="matrix-label">
                    <User size={13} /> Huésped Titular
                  </span>
                  <strong className="matrix-title">
                    {reserva.nombres} {reserva.apellidos}
                  </strong>
                  <span className="matrix-sub">{reserva.email}</span>
                  <span className="matrix-hint">Tel: {reserva.telefono || 'No registrado'}</span>
                </div>

                <div className="matrix-card gold-border">
                  <span className="matrix-label">
                    <Building2 size={13} /> Suite Asignada
                  </span>
                  <strong className="matrix-title highlight-gold">
                    {reserva.nombre_suite || 'Suite Luxury'}
                  </strong>
                  <span className="matrix-sub">{reserva.tipo_cama}</span>
                  <span className="matrix-hint">{reserva.categoria_suite}</span>
                </div>

                <div className="matrix-card blue-border">
                  <span className="matrix-label">
                    <Calendar size={13} /> Período de Estancia
                  </span>
                  <strong className="matrix-date">
                    Llegada: {formatearFecha(reserva.fecha_llegada)} (15:00 hrs)
                  </strong>
                  <strong className="matrix-date">
                    Salida: {formatearFecha(reserva.fecha_salida)} (12:00 hrs)
                  </strong>
                  <span className="matrix-badge-blue">Duración: {reserva.noches} Noche(s)</span>
                </div>

                <div className="matrix-card blue-border">
                  <span className="matrix-label">
                    <CreditCard size={13} /> Aforo y Pago
                  </span>
                  <strong className="matrix-title">
                    {reserva.adultos} Adultos {Number(reserva.ninos) > 0 ? `• ${reserva.ninos} Niños` : ''}
                  </strong>
                  <span className="matrix-sub">Método: Liquidado vía {reserva.terminacion_tarjeta || 'Tarjeta'}</span>
                  <span className="matrix-badge-green">Emisión: {formatearFecha(reserva.creado_en)}</span>
                </div>

              </div>

              {/* Peticiones y Servicios Adicionales */}
              {reserva.peticiones_especiales && (
                <div className="concierge-requests-box">
                  <span className="requests-label">
                    <Sparkles size={14} /> Servicios & Peticiones Concierge
                  </span>
                  <p className="requests-text">
                    {reserva.peticiones_especiales}
                  </p>
                </div>
              )}

              {/* Cuenta Maestra Tributaria (SAT MXN) */}
              <div className="financial-breakdown-card">
                <div className="financial-card-header">
                  <strong>Desglose Maestro Fiscal y Tributario (MXN)</strong>
                </div>
                
                <div className="financial-card-body">
                  <table className="financial-table">
                    <tbody>
                      <tr>
                        <td>Hospedaje All-Inclusive & Paquetes Exclusivos</td>
                        <td className="text-right">${Number(reserva.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td>Impuesto al Valor Agregado (IVA 16%)</td>
                        <td className="text-right">${Number(reserva.iva || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td>Impuesto Sobre Hospedaje Estatal (ISH 5%)</td>
                        <td className="text-right">${Number(reserva.ishe || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td>Derecho de Saneamiento Ambiental Municipal (Quintana Roo)</td>
                        <td className="text-right">${Number(reserva.saneamiento_ambiental || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="total-highlight-row">
                        <td className="total-label">MONTO TOTAL LIQUIDADO:</td>
                        <td className="total-amount-val">
                          ${Number(reserva.total_general || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QR y Validación Front Desk */}
              <div className="qr-validation-banner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=GFA-RESERVA:${reserva.folio_confirmacion}`}
                  alt="QR Acceso"
                  className="qr-code-img"
                />
                <div className="qr-validation-text">
                  <div className="validation-status">
                    <ShieldCheck size={18} /> Validación Verificada en SQL Server (ID: {reserva.reservacion_id})
                  </div>
                  <p className="validation-instruction">
                    Presenta este comprobante (físico o digital) al momento de tu llegada para entrega inmediata de brazalete RFID y llave de suite.
                    {diasRestantes !== null && (
                      <span className="days-counter">
                        Faltan {diasRestantes} días para tu llegada.
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        )}

      </div>
    </div>
  );
}