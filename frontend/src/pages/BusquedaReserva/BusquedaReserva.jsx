import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buscarReservacionPorFolioApi } from '../../services/api';
import { Printer, Search, CheckCircle2, ArrowLeft, ShieldCheck, Mail, Calendar, MapPin, Building2, User, AlertCircle, Sparkles, CreditCard } from 'lucide-react';
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
    // Si viene como "10/11/2026 12:00:00 a. m." o ISO
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
      // Formato DD/MM/YYYY
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
        setErrorMsg('No se localizó ninguna reservación con esos datos.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const diasRestantes = reserva ? calcularDiasRestantes(reserva.fecha_llegada) : null;

  return (
    <div style={{ backgroundColor: '#060508', minHeight: '100vh', color: '#ffffff', padding: '8rem 2rem 5rem', fontFamily: 'Montserrat, sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1050px' }}>

        {/* 1. FORMULARIO DE BÚSQUEDA */}
        {!reserva && (
          <div style={{ maxWidth: '520px', margin: '0 auto', background: '#110f17', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '12px', padding: '3rem 2.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', textAlign: 'center' }}>
            <Search size={42} color="#d4af37" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: '#f3e5ab', margin: '0 0 0.8rem' }}>Localizador de Reserva</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Ingresa el folio de confirmación y el correo o apellido registrado para acceder a tu Voucher Oficial y Check-in digital.
            </p>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleBuscar} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#d4af37' }} />
                <input 
                  type="text"
                  placeholder="Folio de Confirmación (ej. GFA-110619)"
                  required
                  value={folioInput}
                  onChange={(e) => setFolioInput(e.target.value.toUpperCase())}
                  style={{ width: '100%', background: '#181522', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '6px', padding: '0.9rem 1rem 0.9rem 2.6rem', color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#d4af37' }} />
                <input 
                  type="text"
                  placeholder="Correo o Apellido registrado"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{ width: '100%', background: '#181522', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '6px', padding: '0.9rem 1rem 0.9rem 2.6rem', color: '#fff', outline: 'none' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={cargando}
                style={{ width: '100%', background: 'linear-gradient(135deg, #d4af37, #aa8212)', color: '#060508', border: 'none', padding: '1rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.9rem', marginTop: '0.5rem', cursor: cargando ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}
              >
                {cargando ? 'Consultando SQL Server...' : 'Consultar Reservación'}
              </button>
            </form>
          </div>
        )}

        {/* 2. VOUCHER OFICIAL */}
        {reserva && (
          <div style={{ background: '#0e0c15', border: '1px solid #d4af37', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.95)' }}>
            
            {/* Barra de Acciones */}
            <div style={{ background: '#161420', padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
              <button 
                onClick={() => setReserva(null)}
                style={{ background: 'transparent', border: 'none', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
              >
                <ArrowLeft size={16} /> Buscar otro folio
              </button>
              
              <button 
                onClick={() => window.print()}
                style={{ background: '#d4af37', color: '#060508', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
              >
                <Printer size={15} /> Imprimir / Guardar PDF
              </button>
            </div>

            {/* Cabecera Luxury */}
            <div style={{ padding: '2.5rem', background: `linear-gradient(to right, rgba(6,5,8,0.95) 40%, rgba(6,5,8,0.8) 100%), url("${reserva.foto_principal || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'}") center/cover`, position: 'relative', borderBottom: '1px solid rgba(212,175,55,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: '#f3e5ab', margin: 0 }}>Grand Fiesta Americana</h3>
                  <span style={{ color: '#d4af37', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Riviera Cancún Resort & Spa</span>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} color="#d4af37" /> Carretera Cancún-Tulum Km 335, Bahía Petempich, Quintana Roo
                  </p>
                </div>
                
                <div style={{ textAlign: 'right', background: 'rgba(20, 18, 28, 0.85)', border: '1px solid #d4af37', padding: '1rem 1.6rem', borderRadius: '8px', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#f3e5ab', textTransform: 'uppercase', display: 'block', fontWeight: 700, letterSpacing: '1px' }}>Folio de Confirmación</span>
                  <strong style={{ fontSize: '1.6rem', color: '#fff', letterSpacing: '2px' }}>{reserva.folio_confirmacion}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', fontWeight: 700 }}>
                    <CheckCircle2 size={13} /> {reserva.estatus_reservacion || 'Confirmada'}
                  </div>
                </div>
              </div>
            </div>

            {/* Matriz de Datos */}
            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: '#161420', padding: '1.2rem', borderRadius: '8px', borderLeft: '3px solid #d4af37' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    <User size={13} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Huésped Titular
                  </span>
                  <strong style={{ color: '#fff', fontSize: '1.05rem', display: 'block' }}>
                    {reserva.nombres} {reserva.apellidos}
                  </strong>
                  <span style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'block' }}>{reserva.email}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Tel: {reserva.telefono || 'No registrado'}</span>
                </div>

                <div style={{ background: '#161420', padding: '1.2rem', borderRadius: '8px', borderLeft: '3px solid #d4af37' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    <Building2 size={13} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Suite Asignada
                  </span>
                  <strong style={{ color: '#f3e5ab', fontSize: '1.05rem', display: 'block' }}>
                    {reserva.nombre_suite || 'Suite Luxury'}
                  </strong>
                  <span style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'block' }}>{reserva.tipo_cama}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{reserva.categoria_suite}</span>
                </div>

                <div style={{ background: '#161420', padding: '1.2rem', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    <Calendar size={13} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Período de Estancia
                  </span>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>
                    Llegada: {formatearFecha(reserva.fecha_llegada)} (15:00 hrs)
                  </strong>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>
                    Salida: {formatearFecha(reserva.fecha_salida)} (12:00 hrs)
                  </strong>
                  <span style={{ color: '#38bdf8', fontSize: '0.78rem', fontWeight: 600 }}>Duración: {reserva.noches} Noche(s)</span>
                </div>

                <div style={{ background: '#161420', padding: '1.2rem', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    <CreditCard size={13} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Aforo y Pago
                  </span>
                  <strong style={{ color: '#fff', fontSize: '1rem', display: 'block' }}>
                    {reserva.adultos} Adultos {reserva.ninos > 0 ? `• ${reserva.ninos} Niños` : ''}
                  </strong>
                  <span style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'block' }}>Método: Liquidado vía {reserva.terminacion_tarjeta || 'Tarjeta'}</span>
                  <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>Emisión: {formatearFecha(reserva.creado_en)}</span>
                </div>
              </div>

              {/* Peticiones y Servicios Adicionales */}
              {reserva.peticiones_especiales && (
                <div style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.25)', padding: '1.2rem 1.5rem', borderRadius: '8px', marginBottom: '2.5rem' }}>
                  <span style={{ color: '#d4af37', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <Sparkles size={14} /> Servicios & Peticiones Concierge
                  </span>
                  <p style={{ color: '#e2e8f0', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                    {reserva.peticiones_especiales}
                  </p>
                </div>
              )}

              {/* Cuenta Maestra Tributaria (SAT MXN) */}
              <div style={{ border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', overflow: 'hidden', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(212,175,55,0.1)', padding: '0.8rem 1.5rem', borderBottom: '1px solid rgba(212,175,55,0.3)' }}>
                  <strong style={{ color: '#d4af37', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Desglose Maestro Fiscal y Tributario (MXN)
                  </strong>
                </div>
                <div style={{ padding: '1.5rem', background: '#14121a' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.6rem 0' }}>Hospedaje All-Inclusive & Paquetes Exclusivos</td>
                        <td style={{ textAlign: 'right', color: '#fff' }}>${Number(reserva.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.6rem 0' }}>Impuesto al Valor Agregado (IVA 16%)</td>
                        <td style={{ textAlign: 'right', color: '#fff' }}>${Number(reserva.iva || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.6rem 0' }}>Impuesto Sobre Hospedaje Estatal (ISH 5%)</td>
                        <td style={{ textAlign: 'right', color: '#fff' }}>${Number(reserva.ishe || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.6rem 0' }}>Derecho de Saneamiento Ambiental Municipal (Quintana Roo)</td>
                        <td style={{ textAlign: 'right', color: '#fff' }}>${Number(reserva.saneamiento_ambiental || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '1.2rem 0 0.5rem', fontWeight: 800, color: '#f3e5ab' }}>MONTO TOTAL LIQUIDADO:</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#f3e5ab', fontSize: '1.35rem', paddingTop: '1.2rem' }}>
                          ${Number(reserva.total_general || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QR y Validación Front Desk */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#161420', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #d4af37', flexWrap: 'wrap' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=GFA-RESERVA:${reserva.folio_confirmacion}`}
                  alt="QR Acceso"
                  style={{ width: '95px', height: '95px', background: '#fff', padding: '6px', borderRadius: '6px' }}
                />
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ color: '#22c55e', fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={18} /> Validación Verificada en SQL Server (ID: {reserva.reservacion_id})
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                    Presenta este comprobante (físico o digital) al momento de tu llegada para entrega inmediata de brazalete RFID y llave de suite.
                    {diasRestantes !== null && (
                      <span style={{ display: 'block', marginTop: '0.4rem', color: '#f3e5ab', fontWeight: 700 }}>
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