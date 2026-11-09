import { generarYDescargarCFDI40XML } from '../../utils/cfdiXmlGenerator';
import CFDI40Impresion from '../../components/CFDI/CFDI40Impresion';
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { fetchReservationByFolio } from '../../services/api';
import { Printer, Download, Search, CheckCircle2, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import './BusquedaReserva.css';

export default function BusquedaReserva() {
  // Cálculo dinámico de días restantes hasta el check-in
  const calcularDiasRestantes = (fechaLlegadaStr) => {
    if (!fechaLlegadaStr) return null;
    const fechaLlegada = new Date(fechaLlegadaStr + 'T15:00:00');
    const hoy = new Date();
    const diffTime = fechaLlegada - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const [modalFactura, setModalFactura] = useState(false);
  const [facturaEmitida, setFacturaEmitida] = useState(null);
  const [facturaExito, setFacturaExito] = useState(null);
  const [verPdfFactura, setVerPdfFactura] = useState(false);
  const [cargandoFactura, setCargandoFactura] = useState(false);
  const [formFiscal, setFormFiscal] = useState({
    rfc: 'RASK010218ABC',
    razonSocial: 'KEVIN RAMIREZ SORIA',
    codigoPostal: '54980',
    regimenFiscal: '612',
    usoCFDI: 'G03'
  });

  const handleEmitirFactura = async (e) => {
    e.preventDefault();
    setCargandoFactura(true);
    try {
      const resp = await fetch('http://localhost:5000/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folio_confirmacion: reserva.folio_confirmacion,
          rfc_receptor: formFiscal.rfc,
          razon_social_receptor: formFiscal.razonSocial,
          codigo_postal_fiscal: formFiscal.codigoPostal,
          regimen_fiscal_receptor: formFiscal.regimenFiscal,
          uso_cfdi: formFiscal.usoCFDI
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al emitir CFDI');
      setFacturaEmitida(data.factura);
      setModalFactura(false);
      setFacturaExito(data.factura); setFacturaEmitida(data.factura);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setCargandoFactura(false);
    }
  };
    const [eliminandoFactura, setEliminandoFactura] = useState(false);

  const handleEliminarFactura = async () => {
    if (!reserva?.folio_confirmacion) return;
    const seguro = window.confirm(
      `¿Deseas cancelar y eliminar la factura CFDI emitida para el folio ${reserva.folio_confirmacion}?\n\nEsta acción revocará el comprobante fiscal y te permitirá generar uno nuevo.`
    );
    if (!seguro) return;

    setEliminandoFactura(true);
    try {
      const resp = await fetch(`http://localhost:5000/api/facturas/${encodeURIComponent(reserva.folio_confirmacion)}`, {
        method: 'DELETE'
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al eliminar la factura');
      
      setFacturaEmitida(null);
      setFacturaExito(null);
      alert('✓ Comprobante fiscal cancelado y eliminado correctamente.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setEliminandoFactura(false);
    }
  };

  const location = useLocation();
  const [folioInput, setFolioInput] = useState(location.state?.folio || '');
  const [emailInput, setEmailInput] = useState(location.state?.email || '');
  const [reserva, setReserva] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Si vino con folio desde Checkout, buscarlo automáticamente
  useEffect(() => {
    if (location.state?.folio) {
      consultarReserva(location.state.folio, location.state.email);
    }
  }, [location.state]);

  const consultarReserva = async (f, e) => {
    if (!f) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const data = await fetchReservationByFolio(f, e);
      if (data && data.folio_confirmacion) {
        setReserva(data);
      } else {
        setErrorMsg('No se encontró una reservación confirmada con los datos ingresados.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al consultar el folio en SQL Server.');
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    consultarReserva(folioInput, emailInput);
  };

  const handleImprimir = () => {
    window.print();
  };

  const [cancelando, setCancelando] = useState(false);
  const handleCancelar = async () => {
    if (!reserva || !reserva.reservacion_id) return;
    const seguro = window.confirm(`¿Estás seguro de que deseas cancelar la reservación con folio ${reserva.folio_confirmacion}? Esta acción liberará tu habitación en SQL Server.`);
    if (!seguro) return;

    setCancelando(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reservaciones/${reserva.reservacion_id}/cancelar`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cancelar la reservación');
      
      alert(data.mensaje || 'Reservación cancelada con éxito.');
      setReserva(prev => ({ ...prev, estatus_reservacion: 'CANCELADA' }));
    } catch (err) {
      alert(`Error al cancelar: ${err.message}`);
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="voucher-screen-wrapper">
      
      {/* Buscador si no tiene folio activo */}
      {!reserva && (
        <div style={{ maxWidth: '600px', width: '100%', background: '#110f17', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px', padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>
            Localizador de Reservación Oficial
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginBottom: '1.8rem' }}>
            Ingresa tu clave de confirmación oficial (GFA-XXXXXX) para consultar o reimprimir tu baucher.
          </p>

          <form onSubmit={handleBuscar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Folio de Confirmación (ej. GFA-510809)"
              required
              value={folioInput}
              onChange={(e) => setFolioInput(e.target.value.toUpperCase())}
              style={{ background: '#181522', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0.8rem 1rem', color: '#ffffff', outline: 'none' }}
            />
            <input 
              type="email" 
              placeholder="Correo electrónico registrado"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              style={{ background: '#181522', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0.8rem 1rem', color: '#ffffff', outline: 'none' }}
            />
            <button type="submit" disabled={cargando} className="btn-voucher-action" style={{ justifyContent: 'center' }}>
              <Search size={16} /> Consultar Reservación
            </button>
          </form>

          {errorMsg && (
            <div style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '1.2rem' }}>
              {errorMsg}
            </div>
          )}
        </div>
      )}

      {/* Renderizado Formal del Voucher */}
      {reserva && (
        <>
          <div className="voucher-actions-bar">
            <Link to="/habitaciones" className="btn-voucher-action btn-voucher-secondary">
              <ArrowLeft size={16} /> Regresar a Suites
            </Link>
            <button onClick={handleImprimir} className="btn-voucher-action" style={{ background: '#161420', border: '1px solid #d4af37', color: '#f3e5ab', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Printer size={16} /> Imprimir Comprobante Oficial (PDF)
            </button>
            {reserva.estatus_reservacion !== 'CANCELADA' && (
              <button 
                type="button"
                onClick={() => setModalFactura(true)}
                style={{ background: 'linear-gradient(135deg, #d4af37 0%, #aa8212 100%)', border: 'none', color: '#060508', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}
              >
                📄 Solicitar Factura CFDI 4.0
              </button>
            )}
            {reserva.estatus_reservacion !== 'CANCELADA' && (
              <button 
                onClick={handleCancelar} 
                disabled={cancelando}
                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: cancelando ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {cancelando ? 'Cancelando...' : 'Cancelar Reservación'}
              </button>
            )}
          </div>

          <div className="voucher-sheet">
            
            {/* 1. Header Oficial */}
                      {/* ================================================================= */}
          {/* BARRA DE EXPERIENCIA VIP: CUENTA REGRESIVA, CLIMA Y PASE EXPRÉS */}
          {/* ================================================================= */}
          {reserva.estatus_reservacion !== 'CANCELADA' && (
            <div style={{
              background: 'linear-gradient(135deg, #181523 0%, #0d0b13 50%, #1c1724 100%)',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              borderRadius: '8px',
              padding: '1.2rem 1.6rem',
              marginBottom: '1.4rem',
              boxShadow: '0 15px 35px rgba(0,0,0,0.6), 0 0 20px rgba(212,175,55,0.1)',
              color: '#f8fafc',
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr',
              gap: '1.2rem',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: '#f3e5ab',
                    border: '1px solid #d4af37',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '1.5px',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '3px',
                    textTransform: 'uppercase'
                  }}>
                    Pase de Huésped Distinguido
                  </span>
                  <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 700 }}>
                    ● Confirmada & Garantizada
                  </span>
                </div>

                <h3 style={{ margin: '0 0 0.3rem 0', fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: '#fef08a' }}>
                  {(() => {
                    const dias = calcularDiasRestantes(reserva.fecha_llegada);
                    if (dias === null) return '¡Bienvenido a Riviera Maya!';
                    if (dias > 1) return `¡Faltan ${dias} días para tu llegada al paraíso!`;
                    if (dias === 1) return '¡Mañana comienza tu estancia en Riviera Maya!';
                    if (dias === 0) return '¡Hoy es tu llegada! Te esperamos en el lobby.';
                    return 'Esperamos que hayas disfrutado tu estancia.';
                  })()}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <span>☀️ Riviera Maya: <strong>28°C Soleado</strong></span>
                  <span style={{ color: '#64748b' }}>|</span>
                  <span>Check-in: <strong>{reserva.fecha_llegada}</strong> (15:00 hrs)</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Mi Reservación en Grand Fiesta Americana:\nFolio: ${reserva.folio_confirmacion}\nCheck-in: ${reserva.fecha_llegada}`)}`)}
                    style={{ background: '#128C7E', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    📲 Compartir WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Concierge Notificado para el folio ${reserva.folio_confirmacion}. Coordinaremos amenidades especiales para tu llegada.`)}
                    style={{ background: 'transparent', color: '#d4af37', border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🛎️ Concierge Privado
                  </button>
                </div>
              </div>

              {/* Lado derecho: QR Check-in Express */}
              <div style={{
                background: 'rgba(6, 5, 8, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '6px',
                padding: '0.8rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem'
              }}>
                <div style={{ background: '#fff', padding: '5px', borderRadius: '4px', flexShrink: 0 }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent(`GFA-CHECKIN:${reserva.folio_confirmacion}`)}`}
                    alt="QR Check-in"
                    style={{ width: '70px', height: '70px', display: 'block' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.66rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 800, display: 'block' }}>
                    Check-in Digital Exprés
                  </span>
                  <p style={{ margin: '3px 0', fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.25 }}>
                    Muestra este código al llegar para entrega inmediata de brazalete.
                  </p>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.76rem', color: '#f3e5ab', fontWeight: 700 }}>
                    {reserva.folio_confirmacion}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="v-header">
              <div className="v-brand">
                <span>Grupo Posadas de México</span>
                <h1>Grand Fiesta Americana</h1>
                <p>
                  Riviera Cancún Resort & Spa • Carretera Cancún-Tulum Km 335, Puerto Morelos, Q. Roo, CP 77580
                </p>
              </div>

              <div className="v-folio-badge">
                <label>Folio de Confirmación</label>
                <strong>{reserva.folio_confirmacion}</strong>
                {reserva.estatus_reservacion === 'CANCELADA' ? (
                    <small style={{ color: '#ef4444', fontWeight: 800 }}>● CANCELADA & LIBERADA</small>
                  ) : (
                    <small style={{ color: '#10b981' }}>● Confirmada & Garantizada</small>
                  )}
              </div>
            </div>

            {/* 2. Grid de Especificaciones (4x2) */}
            <div className="v-specs-grid">
              
              <div className="v-spec-item">
                <label>Huésped Titular</label>
                <strong>{reserva.nombres || 'Kevin'} {reserva.apellidos || 'Ramirez Soria'}</strong>
                <span>{reserva.email || 'jerrysoria32@gmail.com'}</span>
              </div>

              <div className="v-spec-item">
                <label>Check-in (Entrada)</label>
                <strong>{reserva.fecha_llegada ? reserva.fecha_llegada.substring(0, 10) : '2026-11-02'}</strong>
                <span>A partir de las 15:00 hrs</span>
              </div>

              <div className="v-spec-item">
                <label>Check-out (Salida)</label>
                <strong>{reserva.fecha_salida ? reserva.fecha_salida.substring(0, 10) : '2026-11-05'}</strong>
                <span>Hasta las 12:00 hrs</span>
              </div>

              <div className="v-spec-item">
                <label>Estancia y Ocupantes</label>
                <strong>{reserva.noches || 3} Noches</strong>
                <span>{reserva.adultos || 2} Adulto(s) • {reserva.ninos || 0} Niño(s)</span>
              </div>

              <div className="v-spec-item">
                <label>Suite Reservada</label>
                <strong>{reserva.nombre_suite || 'Deluxe Junior Suite Tropical View'}</strong>
                <span>{reserva.categoria_suite || 'Junior Suites'}</span>
              </div>

              <div className="v-spec-item">
                <label>Plan Tarifario</label>
                <strong>All-Inclusive Luxury</strong>
                <span>Alimentos & Bebidas Gourmet</span>
              </div>

              <div className="v-spec-item">
                <label>Garantía Bancaria</label>
                <strong>Tarjeta de Crédito</strong>
                <span>Terminación •••• {reserva.terminacion_tarjeta || '4040'}</span>
              </div>

              <div className="v-spec-item">
                <label>Fiesta Rewards</label>
                <strong>Socio Verificado</strong>
                <span>Puntos aplicables acreditados</span>
              </div>

            </div>

            {/* 3. Desglose Contable y Fiscal */}
            <table className="v-table-breakdown">
              <thead>
                <tr>
                  <th>Concepto de Hospitalidad</th>
                  <th>Detalle / Base Imponible</th>
                  <th>Importe Liquidado (MXN)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hospedaje All-Inclusive ({reserva.noches || 3} Noches)</td>
                  <td>Tarifa Base Garantizada Grupo Posadas</td>
                  <td>${Number(reserva.subtotal || 17959.86).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td>Impuesto al Valor Agregado (IVA)</td>
                  <td>Tasa 16.00% Federal</td>
                  <td>${Number(reserva.iva || 3637.44).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td>Impuesto Sobre Hospedaje (ISH Estatal)</td>
                  <td>Tasa 5.00% Estado de Quintana Roo</td>
                  <td>${Number(reserva.ishe || 1136.70).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td>Derecho de Saneamiento Ambiental Municipal</td>
                  <td>Cuota $100.00 MXN / noche</td>
                  <td>${Number(reserva.saneamiento_ambiental || 228.00).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>

            {/* 4. Total Liquidado */}
            <div className="v-total-bar">
              <div className="v-total-label">
                <span>Estatus Transaccional</span>
                {reserva.estatus_reservacion === 'CANCELADA' ? (
                    <strong style={{ color: '#ef4444' }}>FOLIO CANCELADO • INVENTARIO Y SALDO LIBERADOS</strong>
                  ) : (
                    <strong>Pago Único en 1 Exhibición (PUE) • Liquidado</strong>
                  )}
              </div>
              <div>
                <span style={{ fontSize: '0.64rem', textTransform: 'uppercase', color: '#64748b', display: 'block', textAlign: 'right' }}>Total General</span>
                <span className="v-total-val">${Number(reserva.total_general || 22734.00).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
            </div>

            {/* 5. Pie de Página */}
            <div className="v-footer-info">
              <p>
                <strong>Instrucciones de Recepción:</strong> Presenta este folio oficial digital o impreso junto con una identificación oficial vigente (INE o Pasaporte) al momento del registro. Servicio de Concierge y Front Desk disponible 24/7. Transacción registrada en SQL Server.
              </p>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <ShieldCheck size={26} color="#d4af37" style={{ display: 'inline-block' }} />
              </div>
            </div>

          </div>
        </>
      )}

          {/* Representación Impresa CFDI 4.0 */}
      {verPdfFactura && facturaEmitida && (
        <CFDI40Impresion 
          factura={facturaEmitida} 
          reserva={reserva} 
          onCerrar={() => setVerPdfFactura(false)} 
        />
      )}
      {/* ======================================================= */}
      {/* MODAL IN-APP: EMISIÓN Y TIMBRADO FISCAL CFDI 4.0        */}
      {/* ======================================================= */}
      {modalFactura && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          background: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#120f1a',
            border: '1px solid #d4af37',
            borderRadius: '10px',
            maxWidth: '540px',
            width: '100%',
            padding: '2.2rem',
            color: '#f8fafc',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(212,175,55,0.15)',
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.4rem',
              borderBottom: '1px solid #27272a',
              paddingBottom: '0.8rem'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 800 }}>
                  SAT México • Anexo 20
                </span>
                <h3 style={{ margin: '2px 0 0 0', color: '#fef08a', fontSize: '1.3rem', fontFamily: 'Cinzel, serif' }}>
                  Emisión Factura CFDI 4.0
                </h3>
                <small style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                  Folio Reserva: <strong>{reserva?.folio_confirmacion}</strong>
                </small>
              </div>
              <button
                type="button"
                onClick={() => setModalFactura(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  padding: '0.2rem'
                }}
              >
                ✕
              </button>
            </div>

            {!facturaExito ? (
            <form onSubmit={handleEmitirFactura} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.73rem', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: '5px', fontWeight: 700 }}>
                  RFC Receptor con Homoclave*
                </label>
                <input
                  type="text"
                  required
                  maxLength={13}
                  value={formFiscal.rfc}
                  onChange={(e) => setFormFiscal({ ...formFiscal, rfc: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#1b1726',
                    border: '1px solid #3f3f46',
                    borderRadius: '5px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontFamily: 'monospace',
                    letterSpacing: '1px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.73rem', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: '5px', fontWeight: 700 }}>
                  Nombre o Razón Social (Sin régimen societario)*
                </label>
                <input
                  type="text"
                  required
                  value={formFiscal.razonSocial}
                  onChange={(e) => setFormFiscal({ ...formFiscal, razonSocial: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#1b1726',
                    border: '1px solid #3f3f46',
                    borderRadius: '5px',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.73rem', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: '5px', fontWeight: 700 }}>
                    Código Postal Fiscal*
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formFiscal.codigoPostal}
                    onChange={(e) => setFormFiscal({ ...formFiscal, codigoPostal: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#1b1726',
                      border: '1px solid #3f3f46',
                      borderRadius: '5px',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.73rem', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: '5px', fontWeight: 700 }}>
                    Régimen Fiscal*
                  </label>
                  <select
                    value={formFiscal.regimenFiscal}
                    onChange={(e) => setFormFiscal({ ...formFiscal, regimenFiscal: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#1b1726',
                      border: '1px solid #3f3f46',
                      borderRadius: '5px',
                      color: '#ffffff',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option value="601">601 - General Personas Morales</option>
                    <option value="605">605 - Sueldos y Salarios</option>
                    <option value="612">612 - Personas Físicas Act. Empresariales</option>
                    <option value="626">626 - Régimen Simplificado (RESICO)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.73rem', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: '5px', fontWeight: 700 }}>
                  Uso de CFDI*
                </label>
                <select
                  value={formFiscal.usoCFDI}
                  onChange={(e) => setFormFiscal({ ...formFiscal, usoCFDI: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#1b1726',
                    border: '1px solid #3f3f46',
                    borderRadius: '5px',
                    color: '#ffffff',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="G03">G03 - Gastos en general</option>
                  <option value="G01">G01 - Adquisición de mercancías</option>
                  <option value="S01">S01 - Sin efectos fiscales</option>
                  <option value="CP01">CP01 - Pagos</option>
                </select>
              </div>

              <div style={{
                background: '#181424',
                padding: '0.9rem 1.1rem',
                borderRadius: '6px',
                border: '1px solid #2d263d',
                fontSize: '0.8rem',
                color: '#cbd5e1',
                lineHeight: 1.4
              }}>
                Monto liquidado a timbrar: <strong style={{ color: '#d4af37', fontSize: '0.95rem' }}>${reserva ? Number(reserva.total_general).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'} MXN</strong><br/>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Desglose: Hospedaje base + IVA (16%) + ISH Quintana Roo (5%) + Saneamiento Ambiental Municipal.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalFactura(false)}
                  style={{
                    padding: '0.7rem 1.3rem',
                    background: '#27272a',
                    border: 'none',
                    color: '#e2e8f0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargandoFactura}
                  style={{
                    padding: '0.7rem 1.8rem',
                    background: 'linear-gradient(135deg, #d4af37 0%, #aa8212 100%)',
                    border: 'none',
                    color: '#060508',
                    borderRadius: '4px',
                    cursor: cargandoFactura ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  {cargandoFactura ? 'Timbrando CFDI...' : 'Emitir y Timbrar'}
                </button>
              </div>
            </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.2rem 0' }}>
                <div style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '2px solid #d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: '#d4af37',
                  fontSize: '1.8rem'
                }}>
                  ✓
                </div>
                <h4 style={{ color: '#fef08a', fontSize: '1.25rem', margin: '0 0 0.5rem 0', fontFamily: 'Cinzel, serif' }}>
                  ¡Comprobante Timbrado Exitosamente!
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 1.3rem 0' }}>
                  El CFDI 4.0 ha sido certificado ante el SAT y registrado en la base de datos oficial.
                </p>

                <div style={{
                  background: '#181424',
                  border: '1px solid #2d263d',
                  borderRadius: '8px',
                  padding: '0.9rem',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                  fontSize: '0.82rem',
                  color: '#cbd5e1'
                }}>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Folio Fiscal: </span>
                    <strong style={{ color: '#fef08a' }}>{facturaExito?.folio_fiscal || ('FA-' + (reserva?.folio_confirmacion || ''))}</strong>
                  </div>
                  <div style={{ wordBreak: 'break-all' }}>
                    <span style={{ color: '#94a3b8' }}>UUID SAT: </span>
                    <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{facturaExito?.uuid_sat}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setModalFactura(false);
                      setFacturaExito(null);
                    }}
                    style={{
                      padding: '0.7rem 1.2rem',
                      background: '#27272a',
                      border: 'none',
                      color: '#e2e8f0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      generarYDescargarCFDI40XML(facturaExito, reserva);
                    }}
                    style={{
                      padding: '0.7rem 1.3rem',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    Descargar XML (.xml)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalFactura(false);
                      setVerPdfFactura(true);
                    }}
                    style={{
                      padding: '0.7rem 1.4rem',
                      background: 'linear-gradient(135deg, #d4af37 0%, #aa8212 100%)',
                      border: 'none',
                      color: '#060508',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px'
                    }}
                  >
                    Ver PDF Oficial
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
