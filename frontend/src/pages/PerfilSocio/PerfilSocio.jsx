import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FiestaCard from '../../components/FiestaCard/FiestaCard';
import './PerfilSocio.css';

const API_BASE = 'http://localhost:5000/api';

export default function PerfilSocio() {
  const navigate = useNavigate();

  // Tabs: estancias | experiencias | tickets | billetera | facturacion | preferencias | cuenta
  const [tabActiva, setTabActiva] = useState('estancias'); 
  const [usuario, setUsuario] = useState(null);
  const [reservaciones, setReservaciones] = useState([]);
  const [experiencias, setExperiencias] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tarjetasBancarias, setTarjetasBancarias] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Fiesta Card de Socio
  const [fiestaCard, setFiestaCard] = useState({
    saldo_disponible: 50000.00,
    linea_credito_total: 50000.00,
    numero_enmascarado: '4829 •••• •••• 7788',
    puntos_rewards_acumulados: 500,
    fecha_expiracion: '11/30',
    titular_tarjeta: 'KEVIN RAMIREZ SORIA'
  });

  // Modal Voucher
  const [reservaBaucher, setReservaBaucher] = useState(null);

  // Modal Nueva Tarjeta Bancaria
  const [modalTarjetaOpen, setModalTarjetaOpen] = useState(false);
  const [tbNumero, setTbNumero] = useState('');
  const [tbTitular, setTbTitular] = useState('');
  const [tbExp, setTbExp] = useState('');
  const [tbCvv, setTbCvv] = useState('');
  const [tbBanco, setTbBanco] = useState('BBVA Bancomer');
  const [tbTipo, setTbTipo] = useState('CREDITO');
  const [tbPredeterminada, setTbPredeterminada] = useState(false);
  const [tbError, setTbError] = useState('');

  // Facturación Fiscal CFDI 4.0
  const [folioFacturar, setFolioFacturar] = useState('');
  const [rfcReceptor, setRfcReceptor] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [cpFiscal, setCpFiscal] = useState('');
  const [regimenFiscal, setRegimenFiscal] = useState('601');
  const [usoCfdi, setUsoCfdi] = useState('G03');
  const [facturaMsg, setFacturaMsg] = useState('');
  const [timbrando, setTimbrando] = useState(false);

  // Preferencias de Hospedaje directas de SQL Server
  const [prefCama, setPrefCama] = useState('King Size');
  const [prefPiso, setPrefPiso] = useState('Piso Alto - Vista al Mar');
  const [prefAdicionales, setPrefAdicionales] = useState('');
  const [prefMsg, setPrefMsg] = useState('');
  const [guardandoPref, setGuardandoPref] = useState(false);

  // Configuración de Cuenta y Credenciales
  const [editNombre, setEditNombre] = useState('');
  const [editApellidos, setEditApellidos] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [editMsg, setEditMsg] = useState('');

  useEffect(() => {
    const verificarSesion = async () => {
      const rawUser = localStorage.getItem('usuario') || localStorage.getItem('usuario_gfa');
      const token = localStorage.getItem('token') || localStorage.getItem('token_gfa');

      if (!rawUser || !token) {
        expulsarUsuario();
        return;
      }

      let u = null;
      try {
        u = JSON.parse(rawUser);
        if (!u || (!u.usuario_id && !u.id)) throw new Error("Datos locales no válidos");
      } catch {
        expulsarUsuario();
        return;
      }

      const uid = u.usuario_id || u.id;

      // Asignar datos iniciales seguros desde el registro local
      setUsuario(u);
      setEditNombre(u.nombres || u.nombre || '');
      setEditApellidos(u.apellidos || u.apellido || '');
      setEditTelefono(u.telefono || '');
      setPrefCama(u.preferencia_cama || 'King Size');
      setPrefPiso(u.preferencia_piso || 'Piso Alto - Vista al Mar');
      setPrefAdicionales(u.preferencias_adicionales || '');

      cargarDatosPerfil(uid);
    };

    verificarSesion();
  }, [navigate]);

  const expulsarUsuario = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuario_gfa');
    localStorage.removeItem('token');
    localStorage.removeItem('token_gfa');
    setUsuario(null);
    navigate('/', { replace: true });
  };

  const cargarDatosPerfil = async (uid) => {
    const token = localStorage.getItem('token') || localStorage.getItem('token_gfa');
    const authHeaders = { 
      Authorization: `Bearer ${token}`, 
      "Content-Type": "application/json" 
    };

    setCargando(true);

    try {
      // 1. Refrescar datos del usuario desde /api/usuarios/perfil/:id
      try {
        const resUser = await fetch(`${API_BASE}/usuarios/perfil/${uid}`, { headers: authHeaders });
        if (resUser.ok) {
          const freshData = await resUser.json();
          const userObj = freshData.usuario || freshData;
          if (userObj && (userObj.usuario_id || userObj.nombres)) {
            setUsuario(userObj);
            localStorage.setItem('usuario', JSON.stringify(userObj));
            setEditNombre(userObj.nombres || '');
            setEditApellidos(userObj.apellidos || '');
            setEditTelefono(userObj.telefono || '');
            setPrefCama(userObj.preferencia_cama || 'King Size');
            setPrefPiso(userObj.preferencia_piso || 'Piso Alto - Vista al Mar');
            setPrefAdicionales(userObj.preferencias_adicionales || '');
          }
        }
      } catch (eU) {
        console.warn('Ruta de perfil usuario no disponible, usando estado local.');
      }

      // 2. Tickets de Front Desk (con protección estricta de arreglo)
      try {
        const resTickets = await fetch(`${API_BASE}/tickets/usuario/${uid}`, { headers: authHeaders });
        if (resTickets.ok) {
          const tksData = await resTickets.json();
          if (Array.isArray(tksData)) {
            setTickets(tksData);
          } else if (Array.isArray(tksData.tickets)) {
            setTickets(tksData.tickets);
          } else {
            setTickets([]);
          }
        } else {
          setTickets([]);
        }
      } catch (eT) {
        setTickets([]);
      }

      // 3. Facturas CFDI 4.0
      try {
        const resFac = await fetch(`${API_BASE}/facturas/usuario/${uid}`, { headers: authHeaders });
        if (resFac.ok) {
          const facData = await resFac.json();
          setFacturas(Array.isArray(facData) ? facData : (Array.isArray(facData.facturas) ? facData.facturas : []));
        } else {
          setFacturas([]);
        }
      } catch (eFac) {
        setFacturas([]);
      }

      // 4. Billetera & Fiesta Card
      try {
        const resB = await fetch(`${API_BASE}/billetera/${uid}`, { headers: authHeaders });
        if (resB.ok) {
          const bData = await resB.json();
          const f = bData.fiesta_card || bData;
          if (f) {
            setFiestaCard({
              saldo_disponible: parseFloat(f.saldo_disponible) || 50000.00,
              linea_credito_total: parseFloat(f.linea_credito_total) || 50000.00,
              numero_enmascarado: f.numero_enmascarado || '4829 •••• •••• 7788',
              puntos_rewards_acumulados: f.puntos_rewards_acumulados || 500,
              fecha_expiracion: f.fecha_expiracion || '11/30',
              titular_tarjeta: f.titular_tarjeta || `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim()
            });
          }
          if (Array.isArray(bData.tarjetas_bancarias)) {
            setTarjetasBancarias(bData.tarjetas_bancarias);
          } else {
            setTarjetasBancarias([]);
          }
        }
      } catch (eB) {
        console.warn('Error leyendo billetera:', eB);
      }

      // 5. Reservaciones de estancias en SQL
      try {
        const resR = await fetch(`${API_BASE}/reservaciones/usuario/${uid}`, { headers: authHeaders });
        if (resR.ok) {
          const rawRes = await resR.json();
          const arrayReservas = Array.isArray(rawRes) 
            ? rawRes 
            : (Array.isArray(rawRes?.reservaciones) ? rawRes.reservaciones : (Array.isArray(rawRes?.data) ? rawRes.data : []));
          setReservaciones(arrayReservas);
        }
      } catch (eR) {
        setReservaciones([]);
      }

      // 6. Experiencias
      setExperiencias([]);

    } catch (err) {
      console.error('Error al sincronizar datos del socio:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleCancelarReservacion = async (reservaObj) => {
    const resId = reservaObj?.reservacion_id || reservaObj;
    const esPagada = (reservaObj?.estatus_reservacion || '').toUpperCase().includes('CONFIRMADA') || reservaObj?.estatus_pago === 'PAGADO';
    
    const msgConfirm = esPagada 
      ? '¿Deseas cancelar esta reservación confirmada? El importe liquidado se reembolsará íntegramente a tu método de pago registrado en SQL Server.' 
      : '¿Deseas cancelar esta reservación pendiente?';

    if (!window.confirm(msgConfirm)) return;

    try {
      const res = await fetch(`${API_BASE}/reservaciones/${resId}/cancelar`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('token_gfa')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cancelar la reservación.');
      alert(data.mensaje || 'Reservación cancelada y saldo reembolsado.');
      if (usuario) cargarDatosPerfil(usuario.usuario_id);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAgregarTarjeta = async (e) => {
    e.preventDefault();
    setTbError('');
    const cleanNum = tbNumero.replace(/\s+/g, '');
    if (cleanNum.length < 15 || cleanNum.length > 16) {
      setTbError('Ingresa un número de tarjeta válido (15 o 16 dígitos).');
      return;
    }

    let marcaDetectada = 'VISA';
    if (cleanNum.startsWith('5') || cleanNum.startsWith('2')) marcaDetectada = 'MASTERCARD';
    else if (cleanNum.startsWith('3')) marcaDetectada = 'AMEX';

    try {
      const expParts = tbExp.split('/');
      const mExp = parseInt(expParts[0], 10) || 12;
      const aExp = parseInt(expParts[1], 10) || 29;

      const payload = {
        usuario_id: usuario.usuario_id,
        alias_tarjeta: tbBanco || 'Mi Tarjeta',
        banco_emisor: tbBanco,
        marca_tarjeta: marcaDetectada,
        tipo_cuenta: tbTipo === 'CREDITO' ? 'Crédito' : 'Débito',
        numero_tarjeta: cleanNum,
        titular_nombre: tbTitular.toUpperCase(),
        mes_expiracion: mExp,
        anio_expiracion: aExp,
        saldo_disponible_simulado: 50000.00,
        es_preferida: tbPredeterminada ? 1 : 0
      };

      const res = await fetch(`${API_BASE}/billetera`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('token_gfa')}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al registrar la tarjeta en SQL Server.');
      
      cargarDatosPerfil(usuario.usuario_id);
      setModalTarjetaOpen(false);
      setTbNumero('');
      setTbTitular('');
      setTbExp('');
      setTbCvv('');
    } catch (err) {
      setTbError(err.message);
    }
  };

  const handleEstablecerPredeterminada = async (tarjetaId) => {
    try {
      await fetch(`${API_BASE}/billetera/${tarjetaId}/predeterminada`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('token_gfa')}`
        }
      });
      cargarDatosPerfil(usuario.usuario_id);
    } catch (err) {
      setTarjetasBancarias(tarjetasBancarias.map(t => ({
        ...t,
        es_predeterminada: t.tarjeta_bancaria_id === tarjetaId
      })));
    }
  };

  const handleEliminarTarjeta = async (tarjetaId) => {
    if (!window.confirm('¿Deseas remover esta tarjeta de tu bóveda bancaria?')) return;
    try {
      await fetch(`${API_BASE}/billetera/${tarjetaId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('token_gfa')}`
        }
      });
      cargarDatosPerfil(usuario.usuario_id);
    } catch (err) {
      console.error('Error al eliminar tarjeta:', err);
    }
  };

  const handleTimbrarFactura = async (e) => {
    e.preventDefault();
    setTimbrando(true);
    setFacturaMsg('Conectando con el PAC y validando esquema ante el SAT...');

    try {
      const res = await fetch(`${API_BASE}/facturas`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('token_gfa')}`
        },
        body: JSON.stringify({
          usuario_id: usuario.usuario_id,
          folio_confirmacion: folioFacturar,
          rfc_receptor: rfcReceptor,
          razon_social_receptor: razonSocial,
          codigo_postal_fiscal: cpFiscal,
          regimen_fiscal_receptor: regimenFiscal,
          uso_cfdi: usoCfdi
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en timbrado CFDI');

      const nuevaFactura = data.factura || {
        folio_fiscal: `FAGFA-${Math.floor(10000 + Math.random() * 90000)}`,
        uuid_sat: '4B7C9D2E-18A3-41F6-B290-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        folio_reservacion: folioFacturar,
        rfc_receptor: rfcReceptor,
        razon_social: razonSocial,
        fecha_emision: new Date().toISOString(),
        total_facturado: 29250.00
      };

      setFacturas([nuevaFactura, ...facturas]);
      setFacturaMsg(`¡CFDI 4.0 Timbrado con éxito! UUID: ${nuevaFactura.uuid_sat}`);
      setFolioFacturar('');
      setRfcReceptor('');
      setRazonSocial('');
    } catch (err) {
      setFacturaMsg(`Aviso: ${err.message}`);
    } finally {
      setTimbrando(false);
    }
  };

  const handleGuardarPreferencias = async (e) => {
    e.preventDefault();
    setGuardandoPref(true);
    setPrefMsg('');

    try {
      const res = await fetch(`${API_BASE}/usuarios/preferencias/${usuario.usuario_id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('token_gfa')}`
        },
        body: JSON.stringify({
          preferencia_cama: prefCama,
          preferencia_piso: prefPiso,
          preferencias_adicionales: prefAdicionales
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudieron actualizar las preferencias.');

      const usuarioActualizado = { 
        ...usuario, 
        preferencia_cama: prefCama, 
        preferencia_piso: prefPiso, 
        preferencias_adicionales: prefAdicionales 
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      setUsuario(usuarioActualizado);
      setPrefMsg('Preferencias de hospedaje actualizadas en SQL Server con éxito.');
    } catch (err) {
      setPrefMsg(`Error: ${err.message}`);
    } finally {
      setGuardandoPref(false);
    }
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setEditMsg('');
    if (editPassword && editPassword !== editConfirmPassword) {
      setEditMsg('Las contraseñas no coinciden.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/usuarios/perfil/${usuario.usuario_id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('token_gfa')}`
        },
        body: JSON.stringify({
          nombres: editNombre,
          apellidos: editApellidos,
          telefono: editTelefono,
          password: editPassword || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar datos.');

      const usuarioActualizado = { ...usuario, ...data.usuario };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      setUsuario(usuarioActualizado);
      setEditMsg('Información de cuenta y credenciales actualizadas en SQL Server con éxito.');
      setEditPassword('');
      setEditConfirmPassword('');
    } catch (err) {
      setEditMsg(err.message);
    }
  };

  if (!usuario) return null;

  const listaReservas = Array.isArray(reservaciones) ? reservaciones : [];
  const listaTickets = Array.isArray(tickets) ? tickets : [];
  const listaExperiencias = Array.isArray(experiencias) ? experiencias : [];
  
  // Noches acumuladas: refleja fielmente la columna noches_acumuladas (36)
  const nochesSql = usuario.noches_acumuladas !== undefined && usuario.noches_acumuladas !== null
    ? Number(usuario.noches_acumuladas)
    : listaReservas.reduce((acc, r) => acc + (parseInt(r.noches) || 0), 0);

  const totalInvertido = listaReservas.reduce((acc, r) => acc + (parseFloat(r.total_general) || 0), 0);
  const estanciasActivas = listaReservas.filter(r => (r.estatus_reservacion || '').toUpperCase() !== 'CANCELADA').length;
  const nivelOficial = usuario.nivel_socio || 'Titanium Privilege';

  return (
    <main className="perfil-socio-container">
      
      {/* 1. CABECERA DE SOCIO REFLEJADA DE SQL SERVER */}
      <section className="perfil-header-box">
        <div className="perfil-avatar">
          <span>👤</span>
        </div>
        <div className="perfil-info">
          <h2>{usuario.nombres} {usuario.apellidos}</h2>
          <p className="perfil-meta">
            ✉ {usuario.email} &nbsp;|&nbsp; ✆ {usuario.telefono || 'Sin teléfono'} &nbsp;|&nbsp; 📍 {usuario.pais || 'México'}
          </p>
          <div className="perfil-header-actions">
            <span className="perfil-fr-badge">
              Socio Fiesta Rewards: <strong>{usuario.fiesta_rewards_id || 'FR-412600'}</strong>
            </span>
            <span className="perfil-sql-id">
              ID Usuario SQL: <strong>#{usuario.usuario_id}</strong>
            </span>
            {usuario.ultimo_acceso && (
              <span className="perfil-ultimo-acceso">
                Última sesión: {new Date(usuario.ultimo_acceso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Panel de Estatus de Socio Titanium Privilege */}
        <div className="perfil-loyalty-status">
          <div className="loyalty-level-badge">NIVEL {nivelOficial.toUpperCase()}</div>
          <div className="loyalty-points-val">{fiestaCard.puntos_rewards_acumulados} PTS</div>
          <span className="loyalty-points-sub">FIESTA REWARDS DISPONIBLES</span>
        </div>
      </section>

      {/* 2. RESUMEN DE MÉTRICAS */}
      <section className="perfil-metrics-grid">
        <div className="metric-box">
          <span className="metric-label">ESTANCIAS ACTIVAS</span>
          <span className="metric-val">{estanciasActivas}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">NOCHES ACUMULADAS (SQL)</span>
          <span className="metric-val">{nochesSql} Noches</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">INVERSIÓN TOTAL EN RESORT</span>
          <span className="metric-val">${totalInvertido.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
        </div>
      </section>

      {/* 3. NAVEGACIÓN COMPLETA POR TABS */}
      <nav className="perfil-tabs-nav">
        <button 
          className={`perfil-tab-btn ${tabActiva === 'estancias' ? 'active' : ''}`}
          onClick={() => setTabActiva('estancias')}
        >
          🏨 ESTANCIAS &amp; SUITES ({listaReservas.length})
        </button>
        <button 
          className={`perfil-tab-btn ${tabActiva === 'experiencias' ? 'active' : ''}`}
          onClick={() => setTabActiva('experiencias')}
        >
          ✨ EXPERIENCIAS &amp; SPA ({listaExperiencias.length})
        </button>
        <button 
          className={`perfil-tab-btn ${tabActiva === 'tickets' ? 'active' : ''}`}
          onClick={() => setTabActiva('tickets')}
        >
          🛎 TICKETS &amp; CONCIERGE ({listaTickets.length})
        </button>
        <button 
          className={`perfil-tab-btn ${tabActiva === 'billetera' ? 'active' : ''}`}
          onClick={() => setTabActiva('billetera')}
        >
          💳 BILLETERAS Y TARJETAS ({tarjetasBancarias.length + 1})
        </button>
        <button 
          className={`perfil-tab-btn ${tabActiva === 'facturacion' ? 'active' : ''}`}
          onClick={() => setTabActiva('facturacion')}
        >
          📑 FACTURACIÓN CFDI 4.0 ({facturas.length})
        </button>
        <button 
          className={`perfil-tab-btn ${tabActiva === 'preferencias' ? 'active' : ''}`}
          onClick={() => setTabActiva('preferencias')}
        >
          ⭐ PREFERENCIAS DE SUITE
        </button>
        <button 
          className={`perfil-tab-btn ${tabActiva === 'cuenta' ? 'active' : ''}`}
          onClick={() => setTabActiva('cuenta')}
        >
          ⚙ SEGURIDAD &amp; CUENTA
        </button>
      </nav>

      {/* 4. CONTENIDOS DE CADA PESTAÑA */}

      {/* TAB 1: ESTANCIAS */}
      {tabActiva === 'estancias' && (
        <section className="tab-pane">
          {cargando ? (
            <p className="perfil-empty">Sincronizando estancias con SQL Server...</p>
          ) : listaReservas.length === 0 ? (
            <div className="perfil-sin-reservas">
              <p>No tienes reservaciones registradas en la base de datos.</p>
              <button onClick={() => navigate('/habitaciones')} className="btn-explorar-suites">
                EXPLORAR SUITES &amp; RESERVAR →
              </button>
            </div>
          ) : (
            (() => {
              const norm = (t) => (t || '').toString().toUpperCase();
              const pagadas = listaReservas.filter(r => norm(r.estatus_reservacion).includes('CONFIRMADA') || norm(r.estatus_reservacion).includes('PAGAD'));
              const porPagar = listaReservas.filter(r => norm(r.estatus_reservacion).includes('PENDIENTE') || norm(r.estatus_reservacion).includes('POR'));
              const canceladas = listaReservas.filter(r => norm(r.estatus_reservacion).includes('CANCELAD'));

              const renderTarjeta = (res, esPendiente) => {
                const cancelada = norm(res.estatus_reservacion).includes('CANCELAD');
                return (
                  <article 
                    key={res.reservacion_id} 
                    className={`reserva-card-item ${cancelada ? 'cancelada' : ''} ${esPendiente ? 'borde-por-pagar' : 'borde-pagado'}`}
                  >
                    <div className="reserva-header-row">
                      <span className="reserva-folio">FOLIO: {res.folio_confirmacion}</span>
                      <span className={`reserva-badge ${cancelada ? 'badge-cancelada' : esPendiente ? 'badge-por-pagar' : 'badge-confirmada'}`}>
                        {cancelada ? '✕ CANCELADA' : esPendiente ? '⏳ POR PAGAR (QR/SPEI)' : '✓ PAGADO / CONFIRMADA'}
                      </span>
                    </div>

                    <div className="reserva-body-grid">
                      <div className="reserva-suite-info">
                        <h4>{res.nombre_suite || 'Suite Presidencial'}</h4>
                        <p className="reserva-fechas">
                          Llegada: {res.fecha_llegada?.substring(0, 10)} | Salida: {res.fecha_salida?.substring(0, 10)} | {res.noches} Noches
                        </p>
                        {esPendiente && (
                          <p className="reserva-aviso-pendiente">
                            ⚠ Liquidación pendiente vía CoDi® o SPEI bancario (Vigencia: 24 horas).
                          </p>
                        )}
                        {res.peticiones_especiales && (
                          <p className="reserva-peticion-preview">
                            Petición: "{res.peticiones_especiales}"
                          </p>
                        )}
                      </div>

                      <div className="reserva-precio-col">
                        <span className={`reserva-precio-monto ${esPendiente ? 'color-pendiente' : ''}`}>
                          ${parseFloat(res.total_general || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                        
                        <div className="reserva-acciones-row">
                          <button
                            className={`btn-ver-baucher ${esPendiente ? 'btn-pagar-pendiente' : ''}`}
                            onClick={() => setReservaBaucher(res)}
                          >
                            {esPendiente ? 'PAGAR / BAUCHER QR' : 'VER / IMPRIMIR VOUCHER'}
                          </button>
                          {!cancelada && (
                            <button
                              onClick={() => handleCancelarReservacion(res)}
                              className="btn-cancelar-accion"
                            >
                              CANCELAR
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              };

              return (
                <div className="subsecciones-estancias-wrapper">
                  <div className="subseccion-grupo">
                    <div className="subseccion-titulo-line">
                      <span className="subseccion-tag pagadas">● ESTANCIAS CONFIRMADAS ({pagadas.length})</span>
                      <small>Sincronizadas con la tabla Reservaciones de SQL Server.</small>
                    </div>
                    {pagadas.length === 0 ? (
                      <p className="empty-subseccion">No tienes estancias confirmadas vigentes.</p>
                    ) : (
                      pagadas.map(res => renderTarjeta(res, false))
                    )}
                  </div>

                  <div className="subseccion-grupo" style={{ marginTop: '2.5rem' }}>
                    <div className="subseccion-titulo-line">
                      <span className="subseccion-tag pendientes">⏳ ESTANCIAS PENDIENTES ({porPagar.length})</span>
                      <small>Apartados con orden bancaria pendiente de acreditar.</small>
                    </div>
                    {porPagar.length === 0 ? (
                      <p className="empty-subseccion">No hay habitaciones pendientes de pago.</p>
                    ) : (
                      porPagar.map(res => renderTarjeta(res, true))
                    )}
                  </div>

                  {canceladas.length > 0 && (
                    <div className="subseccion-grupo subseccion-canceladas" style={{ marginTop: '2.5rem' }}>
                      <div className="subseccion-titulo-line">
                        <span className="subseccion-tag canceladas">✕ CANCELADAS ({canceladas.length})</span>
                      </div>
                      {canceladas.map(res => renderTarjeta(res, false))}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </section>
      )}

      {/* TAB 2: EXPERIENCIAS & SPA */}
      {tabActiva === 'experiencias' && (
        <section className="tab-pane">
          {listaExperiencias.length === 0 ? (
            <div className="perfil-sin-reservas">
              <h4 className="seccion-subtitulo">EXPERIENCIAS EXCLUSIVAS DEL RESORT</h4>
              <p>No tienes citas agendadas para Feel Harmony Spa, Cenas Románticas en Playa o Catas de Tequila.</p>
              <button onClick={() => navigate('/experiencias')} className="btn-explorar-suites">
                AGENDAR EXPERIENCIAS &amp; SPA →
              </button>
            </div>
          ) : (
            <div className="experiencias-grid-historial">
              {listaExperiencias.map(exp => (
                <article key={exp.folio_experiencia || exp.experiencia_id} className="reserva-card-item borde-pagado">
                  <div className="reserva-header-row">
                    <span className="reserva-folio">FOLIO: {exp.folio_experiencia}</span>
                    <span className="reserva-badge badge-confirmada">AGENDADA</span>
                  </div>
                  <div className="reserva-body-grid">
                    <div className="reserva-suite-info">
                      <h4>{exp.titulo_experiencia}</h4>
                      <p className="reserva-fechas">
                        Cita: {exp.fecha_cita?.substring(0, 10)} a las {exp.horario_cita} | {exp.numero_personas} Personas
                      </p>
                    </div>
                    <div className="reserva-precio-col">
                      <span className="reserva-precio-monto">
                        ${parseFloat(exp.total_mxn || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: TICKETS & CONCIERGE */}
      {tabActiva === 'tickets' && (
        <section className="tab-pane">
          {listaTickets.length === 0 ? (
            <div className="perfil-sin-reservas">
              <h4 className="seccion-subtitulo">ASISTENCIA DIRECTA CON CONCIERGE</h4>
              <p>No tienes tickets de asistencia ni solicitudes especiales abiertas en la base de datos.</p>
              <button onClick={() => navigate('/contacto')} className="btn-explorar-suites">
                SOLICITAR SERVICIO DE CONCIERGE →
              </button>
            </div>
          ) : (
            <div className="tickets-grid-historial">
              {listaTickets.map(t => (
                <div key={t.ticket_id} className="ticket-item-perfil">
                  <div className="ticket-item-top">
                    <span className="ticket-id-tag">TCK-{t.ticket_id}</span>
                    <span className="ticket-badge-estatus">{t.estatus || 'En Revisión'}</span>
                  </div>
                  <h4 className="ticket-cat">{t.categoria}</h4>
                  <p className="ticket-desc">"{t.descripcion}"</p>
                  <small className="ticket-date">Registrado el: {new Date(t.creado_en).toLocaleString('es-MX')}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: BILLETERA & TARJETAS */}
      {tabActiva === 'billetera' && (
        <section className="tab-pane">
          <div className="billetera-grid-layout">
            <div className="billetera-card-col">
              <h4 className="seccion-subtitulo">TARJETA CORPORATIVA FIESTA RECOMPENSAS</h4>
              <p className="seccion-desc">Línea de crédito institucional asignada a tu membresía {nivelOficial}.</p>
              
              <div className="fiesta-card-render-wrapper">
                <FiestaCard 
                  saldoDisponible={fiestaCard.saldo_disponible}
                  lineaCredito={fiestaCard.linea_credito_total}
                  numeroEnmascarado={fiestaCard.numero_enmascarado}
                  titular={`${usuario.nombres} ${usuario.apellidos}`}
                  expiracion={fiestaCard.fecha_expiracion}
                  puntosRewards={fiestaCard.puntos_rewards_acumulados}
                />
              </div>
            </div>

            <div className="billetera-metodos-col">
              <div className="metodos-header-flex">
                <div>
                  <h4 className="seccion-subtitulo">TARJETAS BANCARIAS VINCULADAS</h4>
                  <p className="seccion-desc">Bóveda con cifrado bancario almacenada en SQL Server.</p>
                </div>
                <button 
                  className="btn-agregar-tarjeta"
                  onClick={() => setModalTarjetaOpen(true)}
                >
                  + AGREGAR TARJETA
                </button>
              </div>

              <div className="billetera-tarjetas-lista">
                {tarjetasBancarias.length === 0 ? (
                  <p style={{ color: '#888', fontStyle: 'italic', padding: '1rem' }}>No tienes tarjetas bancarias externas registradas.</p>
                ) : (
                  tarjetasBancarias.map((t) => (
                    <div key={t.tarjeta_bancaria_id} className={`tarjeta-bancaria-item ${t.es_predeterminada ? 'predeterminada-activa' : ''}`}>
                      <div className="tb-brand-badge">{t.marca_tarjeta || 'CARD'}</div>
                      <div className="tb-info">
                        <span className="tb-num">•••• •••• •••• {t.ultimos_cuatro || t.numero_tarjeta?.slice(-4)}</span>
                        <span className="tb-titular">{t.titular_nombre} | Vence: {t.mes_expiracion}/{t.anio_expiracion}</span>
                        <span className="tb-banco">{t.banco_emisor}</span>
                      </div>
                      <div className="tb-acciones">
                        {t.es_predeterminada ? (
                          <span className="tb-badge-pred">PREDETERMINADA</span>
                        ) : (
                          <button 
                            className="btn-hacer-pred"
                            onClick={() => handleEstablecerPredeterminada(t.tarjeta_bancaria_id)}
                          >
                            Elegir principal
                          </button>
                        )}
                        <button 
                          className="btn-eliminar-tb"
                          onClick={() => handleEliminarTarjeta(t.tarjeta_bancaria_id)}
                          title="Eliminar tarjeta"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: FACTURACIÓN CFDI 4.0 */}
      {tabActiva === 'facturacion' && (
        <section className="tab-pane">
          <div className="facturacion-layout">
            <div className="facturacion-box">
              <h4 className="seccion-subtitulo">TIMBRADO FISCAL SAT (CFDI 4.0)</h4>
              <p className="seccion-desc">Ingresa tu folio de confirmación y los datos de tu Constancia de Situación Fiscal.</p>

              {facturaMsg && <div className="factura-alert-banner">{facturaMsg}</div>}

              <form onSubmit={handleTimbrarFactura} className="facturacion-form">
                <div className="form-row-2">
                  <div className="input-field">
                    <label>Folio de Confirmación</label>
                    <input type="text" required placeholder="Ej. GFA-225722" value={folioFacturar} onChange={(e) => setFolioFacturar(e.target.value)} />
                  </div>
                  <div className="input-field">
                    <label>RFC del Receptor</label>
                    <input type="text" required placeholder="XAXX010101000" value={rfcReceptor} onChange={(e) => setRfcReceptor(e.target.value.toUpperCase())} />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="input-field">
                    <label>Nombre o Razón Social</label>
                    <input type="text" required placeholder="Kevin Ramirez Soria" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
                  </div>
                  <div className="input-field">
                    <label>Código Postal Fiscal</label>
                    <input type="text" required placeholder="77500" value={cpFiscal} onChange={(e) => setCpFiscal(e.target.value)} />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="input-field">
                    <label>Régimen Fiscal Receptor</label>
                    <select value={regimenFiscal} onChange={(e) => setRegimenFiscal(e.target.value)}>
                      <option value="601">601 - General de Ley Personas Morales</option>
                      <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados</option>
                      <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                      <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                    </select>
                  </div>
                  <div className="input-field">
                    <label>Uso de CFDI</label>
                    <select value={usoCfdi} onChange={(e) => setUsoCfdi(e.target.value)}>
                      <option value="G03">G03 - Gastos en general</option>
                      <option value="S01">S01 - Sin efectos fiscales</option>
                      <option value="G01">G01 - Adquisición de mercancías</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-timbrar-cfdi" disabled={timbrando}>
                  {timbrando ? 'TIMBRANDO ANTE EL SAT...' : 'EMITIR Y TIMBRAR FACTURA CFDI 4.0 →'}
                </button>
              </form>
            </div>

            <div className="facturas-historial-box">
              <h4 className="seccion-subtitulo">HISTORIAL DE COMPROBANTES FISCALES</h4>
              {facturas.length === 0 ? (
                <div className="perfil-sin-reservas">
                  <p>Aún no has timbrado comprobantes fiscales en esta cuenta.</p>
                </div>
              ) : (
                facturas.map((f, idx) => (
                  <div key={idx} className="factura-item-card">
                    <div className="fic-head">
                      <span className="fic-folio">{f.folio_fiscal || 'FACTURA SAT'}</span>
                      <span className="fic-total">${parseFloat(f.total_facturado || 29250).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                    </div>
                    <p className="fic-uuid"><strong>UUID:</strong> {f.uuid_sat || 'SAT-VALIDATED-UUID'}</p>
                    <p className="fic-meta">Receptor: {f.rfc_receptor || 'XAXX010101000'} | {f.razon_social || 'Socio Posadas'}</p>
                    <div className="fic-actions">
                      <button className="btn-descarga-xml" onClick={() => alert('Descargando archivo XML timbrado...')}>XML SAT</button>
                      <button className="btn-descarga-pdf" onClick={() => alert('Descargando representación impresa PDF...')}>PDF SAT</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 6: PREFERENCIAS DE SUITE 100% SQL */}
      {tabActiva === 'preferencias' && (
        <section className="tab-pane">
          <div className="cuenta-box">
            <h4 className="seccion-subtitulo">PREFERENCIAS DE HOSPEDAJE (SQL SERVER)</h4>
            <p className="seccion-desc">
              Parámetros registrados para asignación automática de suites al momento de check-in en Front Desk.
            </p>
            {prefMsg && <div className="cuenta-alert-banner">{prefMsg}</div>}

            <form onSubmit={handleGuardarPreferencias} className="cuenta-form">
              <div className="form-row-2">
                <div className="input-field">
                  <label>Preferencia de Cama (Columna: preferencia_cama)</label>
                  <select value={prefCama} onChange={(e) => setPrefCama(e.target.value)}>
                    <option value="King Size">King Size</option>
                    <option value="Dos Camas Dobles">Dos Camas Dobles</option>
                    <option value="Cama King Size + Sofá Cama">Cama King Size + Sofá Cama</option>
                  </select>
                </div>

                <div className="input-field">
                  <label>Ubicación y Piso (Columna: preferencia_piso)</label>
                  <select value={prefPiso} onChange={(e) => setPrefPiso(e.target.value)}>
                    <option value="Piso Alto - Vista al Mar">Piso Alto - Vista al Mar</option>
                    <option value="Piso Medio - Cerca de Elevadores">Piso Medio - Cerca de Elevadores</option>
                    <option value="Planta Baja - Acceso a Piscina (Swim-Up)">Planta Baja - Acceso a Piscina (Swim-Up)</option>
                    <option value="Zona Tranquila - Lejos de Áreas de Música">Zona Tranquila - Lejos de Áreas de Música</option>
                  </select>
                </div>
              </div>

              <div className="input-field">
                <label>Preferencias Adicionales (Columna: preferencias_adicionales)</label>
                <textarea 
                  rows="3"
                  placeholder="Ej. Almohadas hipoalergénicas, copa de vino a la llegada, habitación libre de plumas..."
                  value={prefAdicionales}
                  onChange={(e) => setPrefAdicionales(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-guardar-perfil" disabled={guardandoPref}>
                {guardandoPref ? 'ACTUALIZANDO EN SQL SERVER...' : 'ACTUALIZAR PREFERENCIAS EN BD →'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* TAB 7: SEGURIDAD & CUENTA */}
      {tabActiva === 'cuenta' && (
        <section className="tab-pane">
          <div className="cuenta-box">
            <h4 className="seccion-subtitulo">DATOS DE LA CUENTA DE SOCIO</h4>
            <p className="seccion-desc">Actualiza tu información personal y credenciales en la tabla Usuarios de SQL Server.</p>
            {editMsg && <div className="cuenta-alert-banner">{editMsg}</div>}

            <form onSubmit={handleGuardarPerfil} className="cuenta-form">
              <div className="form-row-2">
                <div className="input-field">
                  <label>Nombre(s) (Columna: nombres)</label>
                  <input type="text" required value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                </div>
                <div className="input-field">
                  <label>Apellido(s) (Columna: apellidos)</label>
                  <input type="text" required value={editApellidos} onChange={(e) => setEditApellidos(e.target.value)} />
                </div>
              </div>

              <div className="form-row-2">
                <div className="input-field">
                  <label>Correo Electrónico (Columna: email - Lectura)</label>
                  <input type="email" disabled value={usuario.email} />
                </div>
                <div className="input-field">
                  <label>Teléfono de Contacto (Columna: telefono)</label>
                  <input type="tel" value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} />
                </div>
              </div>

              <div className="form-row-2">
                <div className="input-field">
                  <label>Nueva Contraseña (Opcional - Bcrypt Hash)</label>
                  <input type="password" placeholder="Mínimo 6 caracteres" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
                </div>
                <div className="input-field">
                  <label>Confirmar Nueva Contraseña</label>
                  <input type="password" placeholder="Repite la contraseña" value={editConfirmPassword} onChange={(e) => setEditConfirmPassword(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn-guardar-perfil">
                GUARDAR CAMBIOS EN SQL SERVER →
              </button>
            </form>
          </div>
        </section>
      )}

      {/* MODAL BAUCHER */}
      {reservaBaucher && (
        <div className="baucher-modal-overlay">
          <div className="baucher-modal-card">
            <div className="baucher-ticket-header">
              <span className="baucher-brand">GRAND FIESTA AMERICANA</span>
              <span className="baucher-location">RIVIERA CANCÚN RESORT &amp; SPA</span>
              <p className="baucher-sub">COMPROBANTE OFICIAL DE RESERVACIÓN HOTELERA</p>
            </div>

            <div className="baucher-ticket-body">
              <div className="baucher-row-destacado">
                <div>
                  <span className="baucher-label">FOLIO OFICIAL</span>
                  <span className="baucher-valor folio-gold">{reservaBaucher.folio_confirmacion}</span>
                </div>
                <div>
                  <span className="baucher-label">ESTATUS</span>
                  <span className="baucher-valor">{reservaBaucher.estatus_reservacion}</span>
                </div>
              </div>

              <div className="baucher-linea-punteada"></div>

              <div className="baucher-detalles-grid">
                <div><span className="baucher-label">TITULAR:</span> <span className="baucher-valor">{usuario.nombres} {usuario.apellidos}</span></div>
                <div><span className="baucher-label">SUITE:</span> <span className="baucher-valor">{reservaBaucher.nombre_suite}</span></div>
                <div><span className="baucher-label">FECHA LLEGADA:</span> <span className="baucher-valor">{reservaBaucher.fecha_llegada?.substring(0, 10)}</span></div>
                <div><span className="baucher-label">FECHA SALIDA:</span> <span className="baucher-valor">{reservaBaucher.fecha_salida?.substring(0, 10)}</span></div>
                <div><span className="baucher-label">ESTANCIA:</span> <span className="baucher-valor">{reservaBaucher.noches} Noches</span></div>
                <div><span className="baucher-label">HUÉSPEDES:</span> <span className="baucher-valor">{reservaBaucher.adultos || 2} Adultos, {reservaBaucher.ninos || 0} Niños</span></div>
              </div>

              <div className="baucher-linea-punteada"></div>

              <div className="baucher-desglose">
                <div className="b-line"><span>Tarifa Hospedaje:</span> <span>${(parseFloat(reservaBaucher.total_general) * 0.77).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span></div>
                <div className="b-line"><span>IVA (16%):</span> <span>${(parseFloat(reservaBaucher.total_general) * 0.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span></div>
                <div className="b-line"><span>ISH Impuesto Sobre Hospedaje (5%):</span> <span>${(parseFloat(reservaBaucher.total_general) * 0.05).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span></div>
                <div className="b-line"><span>Derecho de Saneamiento Ambiental:</span> <span>${(parseFloat(reservaBaucher.total_general) * 0.02).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span></div>
                <div className="b-total-row"><span>TOTAL PAGADO:</span> <span className="b-total-gold">${parseFloat(reservaBaucher.total_general).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span></div>
              </div>

              <div className="baucher-qr-sim">
                <div className="qr-box">[ CÓDIGO QR DE CHECK-IN EXPRESS ]</div>
                <p>Presenta este comprobante en la recepción para entrega directa de tus accesos RFID.</p>
              </div>
            </div>

            <div className="baucher-modal-actions">
              <button className="btn-imprimir-baucher" onClick={() => window.print()}>IMPRIMIR BAUCHER 🖨</button>
              <button className="btn-cerrar-baucher" onClick={() => setReservaBaucher(null)}>CERRAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA TARJETA BANCARIA */}
      {modalTarjetaOpen && (
        <div className="baucher-modal-overlay">
          <div className="baucher-modal-card modal-tarjeta-box">
            <h3 className="modal-tarjeta-title">VINCULAR NUEVA TARJETA BANCARIA</h3>
            <p className="seccion-desc">Cifrado de grado bancario para transacciones de alta seguridad en Grupo Posadas.</p>

            {tbError && <div className="factura-alert-banner" style={{ borderColor: '#DC3545', color: '#FF7B88' }}>{tbError}</div>}

            <form onSubmit={handleAgregarTarjeta} className="tarjeta-form">
              <div className="input-field">
                <label>Número de Tarjeta (15 o 16 dígitos)</label>
                <input 
                  type="text" 
                  required 
                  maxLength={19} 
                  placeholder="4152 3140 1234 5678" 
                  value={tbNumero} 
                  onChange={(e) => setTbNumero(e.target.value)} 
                />
              </div>

              <div className="input-field">
                <label>Nombre del Titular</label>
                <input 
                  type="text" 
                  required 
                  placeholder="KEVIN RAMIREZ SORIA" 
                  value={tbTitular} 
                  onChange={(e) => setTbTitular(e.target.value)} 
                />
              </div>

              <div className="form-row-2">
                <div className="input-field">
                  <label>Vencimiento (MM/AA)</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={5} 
                    placeholder="12/28" 
                    value={tbExp} 
                    onChange={(e) => setTbExp(e.target.value)} 
                  />
                </div>
                <div className="input-field">
                  <label>CVV / CVC</label>
                  <input 
                    type="password" 
                    required 
                    maxLength={4} 
                    placeholder="•••" 
                    value={tbCvv} 
                    onChange={(e) => setTbCvv(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="input-field">
                  <label>Banco Emisor</label>
                  <select value={tbBanco} onChange={(e) => setTbBanco(e.target.value)}>
                    <option value="BBVA Bancomer">BBVA</option>
                    <option value="Santander">Santander</option>
                    <option value="Banorte">Banorte</option>
                    <option value="Citibanamex">Citibanamex</option>
                    <option value="HSBC">HSBC</option>
                    <option value="American Express">American Express</option>
                  </select>
                </div>
                <div className="input-field">
                  <label>Tipo de Plástico</label>
                  <select value={tbTipo} onChange={(e) => setTbTipo(e.target.value)}>
                    <option value="CREDITO">Crédito</option>
                    <option value="DEBITO">Débito</option>
                  </select>
                </div>
              </div>

              <label className="checkbox-pred-label">
                <input 
                  type="checkbox" 
                  checked={tbPredeterminada} 
                  onChange={(e) => setTbPredeterminada(e.target.checked)} 
                />
                Establecer como tarjeta principal de cobro
              </label>

              <div className="modal-tarjeta-buttons">
                <button type="submit" className="btn-timbrar-cfdi">GUARDAR TARJETA SEGURA →</button>
                <button type="button" className="btn-cancelar-tarjeta" onClick={() => setModalTarjetaOpen(false)}>CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}