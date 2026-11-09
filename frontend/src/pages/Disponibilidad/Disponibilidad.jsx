import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchSuites, 
  createReservation 
} from '../../services/api';
import { 
  Calendar, Users, ShieldCheck, CreditCard, 
  CheckCircle2, Printer, ArrowRight, Loader2, BedDouble, AlertCircle
} from 'lucide-react';
import './Disponibilidad.css';

export default function Disponibilidad() {
  const [paso, setPaso] = useState(1);
  const [suites, setSuites] = useState([]);
  const [suiteSeleccionada, setSuiteSeleccionada] = useState(null);
  const [cargandoSuites, setCargandoSuites] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('*');
  const [filtroCama, setFiltroCama] = useState('*');
  const [suiteDetalleModal, setSuiteDetalleModal] = useState(null);

  // Parámetros de Estancia
  const [fechaLlegada, setFechaLlegada] = useState(new Date().toISOString().substring(0, 10));
  const [fechaSalida, setFechaSalida] = useState(new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10));
  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);

  // Sesión y Datos del Huésped
  const [usuario] = useState(() => {
    return JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user') || 'null');
  });

  const [datosHuesped, setDatosHuesped] = useState({
    nombre: usuario ? (usuario.nombre || 'Socio') : '',
    apellido: usuario ? (usuario.apellido || '') : '',
    email: usuario?.email || '',
    telefono: usuario?.telefono || '',
    peticiones: ''
  });

  // Datos Bancarios de Garantía
  const [datosTarjeta, setDatosTarjeta] = useState({
    titular: '',
    numero: '',
    expiracion: '',
    cvv: ''
  });

  const [procesandoPago, setProcesandoPago] = useState(false);
  const [reservacionConfirmada, setReservacionConfirmada] = useState(null);
  const [mensajeError, setMensajeError] = useState('');

  // Cargar catálogo de Suites desde SQL Server
  useEffect(() => {
    async function cargarCatalogo() {
      try {
        setCargandoSuites(true);
        const data = await fetchSuites();
        if (Array.isArray(data) && data.length > 0) {
          setSuites(data);
          setSuiteSeleccionada(data[0]);
        }
      } catch (err) {
        console.warn('Error al cargar suites:', err);
      } finally {
        setCargandoSuites(false);
      }
    }
    cargarCatalogo();
  }, []);

  // Cálculo de Noches
  const calcularNoches = () => {
    const f1 = new Date(fechaLlegada);
    const f2 = new Date(fechaSalida);
    const diff = Math.ceil((f2 - f1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const noches = calcularNoches();
  const precioNoche = suiteSeleccionada ? Number(suiteSeleccionada.precio_noche_base || suiteSeleccionada.precio_base || 7500) : 7500;
  const subtotalBase = precioNoche * noches;
  const iva = subtotalBase * 0.16;
  const ishe = subtotalBase * 0.05;
  const saneamiento = 76 * noches;
  const totalEstancia = subtotalBase + iva + ishe + saneamiento;

  const handleConfirmarReservacion = async (e) => {
    e.preventDefault();
    setMensajeError('');

    // --- BLINDAJE DE SEGURIDAD: VERIFICAR SESIÓN ---
    const rawUser = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    
    if (!rawUser || !token) {
        setMensajeError('Por seguridad, debes Iniciar Sesión o Unirte a Fiesta Rewards para procesar una reservación.');
        return;
    }
    
    let parsedUser;
    try {
        parsedUser = JSON.parse(rawUser);
        if (!parsedUser || !parsedUser.usuario_id) throw new Error();
    } catch {
        setMensajeError('Sesión inválida. Por favor, vuelve a Iniciar Sesión.');
        return;
    }
    // --- FIN BLINDAJE ---

    setProcesandoPago(true);

    try {
      const uId = parsedUser.usuario_id;
      const sId = suiteSeleccionada ? (suiteSeleccionada.suite_id || suiteSeleccionada.id || 1) : 1;
      const ultimos4 = datosTarjeta.numero ? datosTarjeta.numero.replace(/\s/g, '').slice(-4) : '4242';

      const payload = {
        usuario_id: uId,
        suite_id: sId,
        fecha_llegada: fechaLlegada,
        fecha_salida: fechaSalida,
        noches: noches,
        adultos: Number(adultos),
        ninos: Number(ninos),
        peticiones: datosHuesped.peticiones,
        subtotal: subtotalBase,
        iva: iva,
        ishe: ishe,
        saneamiento: saneamiento,
        total_general: totalEstancia,
        terminacion_tarjeta: ultimos4
      };

      const res = await createReservation(payload);
      setReservacionConfirmada(res.data || {
        folio_confirmacion: 'GFA-' + Math.floor(100000 + Math.random() * 900000),
        total_general: totalEstancia
      });
      setPaso(5);
    } catch (err) {
      setMensajeError(err.message || 'Error al procesar la reserva en SQL Server.');
    } finally {
      setProcesandoPago(false);
    }
  };

  return (
    <div className="disponibilidad-root" style={{ minHeight: '100vh', backgroundColor: '#060508', color: '#ffffff', padding: '7.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Barra de Progreso de Reserva */}
        <div className="booking-steps-bar" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {['1. Habitación', '2. Fechas', '3. Huésped', '4. Garantía', '5. Baucher'].map((nombrePaso, idx) => (
            <div 
              key={idx}
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: paso === (idx + 1) ? '#d4af37' : '#64748b',
                borderBottom: paso === (idx + 1) ? '2px solid #d4af37' : '2px solid transparent',
                paddingBottom: '0.4rem'
              }}
            >
              {nombrePaso}
            </div>
          ))}
        </div>

        {/* PASO 1: SELECCIONAR SUITE */}
        {paso === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ fontSize: '0.72rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 700 }}>Colección Exclusiva</span>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', color: '#f3e5ab', margin: '0.2rem 0' }}>Elige tu Suite de Lujo</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Vistas panorámicas al Caribe mexicano con amenidades de alta hospitalidad.</p>
            </div>

            {cargandoSuites ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <Loader2 size={36} className="animate-spin" color="#d4af37" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                {suites.map((s) => {
                  const isSel = suiteSeleccionada?.suite_id === s.suite_id;
                  return (
                    <article 
                      key={s.suite_id}
                      style={{
                        background: '#110f17',
                        border: isSel ? '2px solid #d4af37' : '1px solid rgba(196, 181, 253, 0.2)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ height: '210px', position: 'relative' }}>
                        <img 
                          src={s.foto_principal || 'https://image-tc.galaxy.tf/wijpeg-8f436tlgefhnfu48zvpns3run/_photo.jpg'} 
                          alt={s.nombre} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#ffffff', margin: '0 0 0.4rem 0' }}>{s.nombre}</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6, flexGrow: 1 }}>{s.descripcion}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '1.4rem 0 1rem 0' }}>
                          <div>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f3e5ab' }}>
                              ${Number(s.precio_noche_base || 7500).toLocaleString('es-MX')}
                            </span>
                            <small style={{ color: '#cbd5e1', marginLeft: '4px' }}>MXN / Noche</small>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSuiteSeleccionada(s);
                            setPaso(2);
                          }}
                          style={{
                            background: isSel ? '#d4af37' : 'transparent',
                            color: isSel ? '#060508' : '#d4af37',
                            border: '1px solid #d4af37',
                            borderRadius: '4px',
                            padding: '0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                        >
                          {isSel ? 'Seleccionada • Continuar' : 'Reservar esta suite'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PASO 2: SELECCIONAR FECHAS Y HUÉSPEDES */}
        {paso === 2 && (
          <div style={{ maxWidth: '650px', margin: '0 auto', background: '#110f17', border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '10px', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', textAlign: 'center', margin: '0 0 1.5rem 0' }}>
              Fechas de tu Estancia
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Llegada</label>
                <input 
                  type="date" 
                  value={fechaLlegada} 
                  onChange={(e) => setFechaLlegada(e.target.value)}
                  style={{ width: '100%', height: '46px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Salida</label>
                <input 
                  type="date" 
                  value={fechaSalida} 
                  onChange={(e) => setFechaSalida(e.target.value)}
                  style={{ width: '100%', height: '46px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Adultos</label>
                <select 
                  value={adultos} 
                  onChange={(e) => setAdultos(e.target.value)}
                  style={{ width: '100%', height: '46px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="1">1 Adulto</option>
                  <option value="2">2 Adultos</option>
                  <option value="3">3 Adultos</option>
                  <option value="4">4 Adultos</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Niños</label>
                <select 
                  value={ninos} 
                  onChange={(e) => setNinos(e.target.value)}
                  style={{ width: '100%', height: '46px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="0">0 Niños</option>
                  <option value="1">1 Niño</option>
                  <option value="2">2 Niños</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#161322', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '6px', padding: '1.2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                <span>Estancia calculada:</span>
                <strong>{noches} Noche{noches > 1 ? 's' : ''}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', color: '#f3e5ab', fontWeight: 800 }}>
                <span>Total Estimado:</span>
                <strong>${totalEstancia.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => setPaso(1)} style={{ flex: 1, height: '46px', background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>Atrás</button>
              <button type="button" onClick={() => setPaso(3)} style={{ flex: 2, height: '46px', background: 'linear-gradient(135deg, #d4af37, #aa8212)', border: 'none', color: '#060508', fontWeight: 800, borderRadius: '4px', cursor: 'pointer' }}>Continuar a Huésped</button>
            </div>
          </div>
        )}

        {/* PASO 3: DATOS DEL HUÉSPED */}
        {paso === 3 && (
          <div style={{ maxWidth: '650px', margin: '0 auto', background: '#110f17', border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '10px', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', textAlign: 'center', margin: '0 0 1.5rem 0' }}>
              Datos del Huésped Titular
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>Nombre(s)*</label>
                <input 
                  type="text" 
                  required
                  value={datosHuesped.nombre} 
                  onChange={(e) => setDatosHuesped({ ...datosHuesped, nombre: e.target.value })}
                  style={{ width: '100%', height: '44px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>Apellidos*</label>
                <input 
                  type="text" 
                  required
                  value={datosHuesped.apellido} 
                  onChange={(e) => setDatosHuesped({ ...datosHuesped, apellido: e.target.value })}
                  style={{ width: '100%', height: '44px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>Correo Electrónico*</label>
              <input 
                type="email" 
                required
                value={datosHuesped.email} 
                onChange={(e) => setDatosHuesped({ ...datosHuesped, email: e.target.value })}
                style={{ width: '100%', height: '44px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>Teléfono Móvil*</label>
              <input 
                type="tel" 
                required
                placeholder="+52 55 1234 5678"
                value={datosHuesped.telefono} 
                onChange={(e) => setDatosHuesped({ ...datosHuesped, telefono: e.target.value })}
                style={{ width: '100%', height: '44px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>Peticiones Especiales (Opcional)</label>
              <textarea 
                rows="2"
                placeholder="Piso alto, cama adicional, motivo de aniversario..."
                value={datosHuesped.peticiones} 
                onChange={(e) => setDatosHuesped({ ...datosHuesped, peticiones: e.target.value })}
                style={{ width: '100%', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0.6rem 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => setPaso(2)} style={{ flex: 1, height: '46px', background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>Atrás</button>
              <button type="button" onClick={() => setPaso(4)} style={{ flex: 2, height: '46px', background: 'linear-gradient(135deg, #d4af37, #aa8212)', border: 'none', color: '#060508', fontWeight: 800, borderRadius: '4px', cursor: 'pointer' }}>Continuar a Pago</button>
            </div>
          </div>
        )}

        {/* PASO 4: GARANTÍA BANCARIA & CONFIRMAR */}
        {paso === 4 && (
          <form onSubmit={handleConfirmarReservacion} style={{ maxWidth: '650px', margin: '0 auto', background: '#110f17', border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '10px', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', textAlign: 'center', margin: '0 0 1.5rem 0' }}>
              Garantía Bancaria & Pago
            </h2>

            {mensajeError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> <span>{mensajeError}</span>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>Titular de la Tarjeta*</label>
              <input 
                type="text" 
                required
                placeholder="Como aparece en el plástico"
                value={datosTarjeta.titular} 
                onChange={(e) => setDatosTarjeta({ ...datosTarjeta, titular: e.target.value })}
                style={{ width: '100%', height: '44px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>Número de Tarjeta (16 dígitos)*</label>
              <input 
                type="text" 
                required
                maxLength="19"
                placeholder="4000 1234 5678 9010"
                value={datosTarjeta.numero} 
                onChange={(e) => setDatosTarjeta({ ...datosTarjeta, numero: e.target.value })}
                style={{ width: '100%', height: '44px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>Expiración (MM/AA)*</label>
                <input 
                  type="text" 
                  required
                  maxLength="5"
                  placeholder="12/28"
                  value={datosTarjeta.expiracion} 
                  onChange={(e) => setDatosTarjeta({ ...datosTarjeta, expiracion: e.target.value })}
                  style={{ width: '100%', height: '44px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#c4b5fd', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>CVV*</label>
                <input 
                  type="password" 
                  required
                  maxLength="4"
                  placeholder="123"
                  value={datosTarjeta.cvv} 
                  onChange={(e) => setDatosTarjeta({ ...datosTarjeta, cvv: e.target.value })}
                  style={{ width: '100%', height: '44px', background: '#181524', border: '1px solid rgba(196, 181, 253, 0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => setPaso(3)} style={{ flex: 1, height: '48px', background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>Atrás</button>
              <button type="submit" disabled={procesandoPago} style={{ flex: 2, height: '48px', background: 'linear-gradient(135deg, #d4af37, #aa8212)', border: 'none', color: '#060508', fontWeight: 800, borderRadius: '4px', cursor: 'pointer' }}>
                {procesandoPago ? 'Garantizando en SQL Server...' : `Liquidar y Garantizar $${totalEstancia.toLocaleString('es-MX')} MXN`}
              </button>
            </div>
          </form>
        )}

        {/* PASO 5: VOUCHER EJECUTIVO EN PDF Y FOLIO OFICIAL */}
        {paso === 5 && reservacionConfirmada && (
          <div className="voucher-master-wrapper">
            
            <div className="voucher-card-luxury" id="voucher-print-area">
              
              {/* Cabecera Oficial */}
              <div className="voucher-top-header">
                <div className="voucher-brand-block">
                  <h2>Grand Fiesta Americana</h2>
                  <span>Riviera Cancún Resort & Spa</span>
                  <p>Grupo Posadas de México • Carretera Cancún-Tulum Km 335, Puerto Morelos, Q.Roo, CP 77580</p>
                </div>

                <div className="voucher-folio-box">
                  <span>Folio de Confirmación</span>
                  <strong>{reservacionConfirmada.folio_confirmacion || 'GFA-407088'}</strong>
                </div>
              </div>

              {/* Matriz de Datos de Estancia */}
              <div className="voucher-details-grid">
                <div className="voucher-field-item">
                  <label>Huésped Titular</label>
                  <strong>{datosHuesped.nombre} {datosHuesped.apellido}</strong>
                  <span>{datosHuesped.email}</span>
                </div>

                <div className="voucher-field-item">
                  <label>Suite Reservada</label>
                  <strong>{suiteSeleccionada?.nombre || 'Deluxe Tropical Reserve'}</strong>
                  <span>{suiteSeleccionada?.categoria || 'Vista al Mar'}</span>
                </div>

                <div className="voucher-field-item">
                  <label>Check-In (Llegada)</label>
                  <strong>{fechaLlegada}</strong>
                  <span>A partir de 15:00 hrs</span>
                </div>

                <div className="voucher-field-item">
                  <label>Check-Out (Salida)</label>
                  <strong>{fechaSalida}</strong>
                  <span>Hasta las 12:00 hrs</span>
                </div>

                <div className="voucher-field-item">
                  <label>Estancia Total</label>
                  <strong>{noches} Noche{noches > 1 ? 's' : ''}</strong>
                  <span>{adultos} Adulto(s) • {ninos} Niño(s)</span>
                </div>

                <div className="voucher-field-item">
                  <label>Garantía de Pago</label>
                  <strong>Tarjeta de Crédito</strong>
                  <span>Terminación •••• {datosTarjeta.numero.slice(-4) || '4242'}</span>
                </div>

                <div className="voucher-field-item">
                  <label>Régimen de Estancia</label>
                  <strong>All-Inclusive Luxury</strong>
                  <span>Alimentos & Bebidas Gourmet</span>
                </div>

                <div className="voucher-field-item">
                  <label>Programa Lealtad</label>
                  <strong>Fiesta Rewards</strong>
                  <span>Puntos acumulados aplicables</span>
                </div>
              </div>

              {/* Desglose Tributario Oficial */}
              <div className="voucher-breakdown-section">
                <table className="voucher-breakdown-table">
                  <thead>
                    <tr>
                      <th>Concepto de Hospitalidad</th>
                      <th className="text-right">Detalle / Tasa</th>
                      <th className="text-right">Importe (MXN)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Estancia en Suite de Lujo ({noches} Noches)</td>
                      <td className="text-right">Tarifa Garantizada</td>
                      <td className="text-right">${((reservacionConfirmada.total_general || totalEstancia) * 0.79).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td>Impuesto al Valor Agregado (IVA)</td>
                      <td className="text-right">16.00%</td>
                      <td className="text-right">${((reservacionConfirmada.total_general || totalEstancia) * 0.16).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td>Impuesto Sobre Hospedaje (ISH Estatal)</td>
                      <td className="text-right">5.00%</td>
                      <td className="text-right">${((reservacionConfirmada.total_general || totalEstancia) * 0.05).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td>Derecho de Saneamiento Ambiental Municipal</td>
                      <td className="text-right">$76.00 MXN / noche</td>
                      <td className="text-right">${(76 * noches).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Banner de Total y Estatus */}
              <div className="voucher-total-banner">
                <div className="voucher-status-pill">
                  <CheckCircle2 size={16} /> Estatus: Garantizada & Confirmada en SQL Server
                </div>

                <div className="voucher-total-amount">
                  <span>Total General Liquidado:</span>
                  <strong>${Number(reservacionConfirmada.total_general || totalEstancia).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                </div>
              </div>

              {/* Pie de Verificación Digital con QR */}
              <div className="voucher-verification-footer">
                <div className="verification-notice">
                  <strong>Instrucciones de Llegada:</strong> Presenta este folio digital o impreso junto con una identificación oficial vigente y la tarjeta de garantía al momento de tu registro en recepción. Para asistencia con traslados aeropuerto-hotel, comunícate con Concierge al +52 (443) 310 81 37.
                </div>

                <div className="qr-code-placeholder" title="Escanear para validación en recepción">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GFA-RESERVA:${reservacionConfirmada.folio_confirmacion || 'GFA-407088'}`} 
                    alt="Código QR de Validación" 
                  />
                </div>
              </div>

            </div>

            {/* Botonera de Acciones en Pantalla */}
            <div className="voucher-actions-bar">
              <button 
                type="button" 
                onClick={() => window.print()} 
                className="btn-print-luxury"
              >
                <Printer size={16} /> Descargar Voucher en PDF / Imprimir
              </button>

              <Link to="/perfil-socio" className="btn-portal-link">
                Ver en Mi Perfil de Socio →
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}