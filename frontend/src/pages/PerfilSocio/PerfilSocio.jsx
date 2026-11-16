import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FiestaCard from '../../components/FiestaCard/FiestaCard';
import './PerfilSocio.css';

const API_BASE = 'http://localhost:5000/api';

const NIVELES_REWARDS = [
  {
    id: 'clasico',
    nombre: 'Clásico',
    minNoches: 0,
    beneficios: [
      { icono: '🛏️', titulo: 'Tarifa Preferencial Socios', desc: 'Hasta 10% de descuento directo en reservaciones web.' },
      { icono: '📶', titulo: 'Wi-Fi Premium de Alta Velocidad', desc: 'Conexión ilimitada en suite, playa y áreas comunes.' },
      { icono: '🍹', titulo: 'Bebida de Bienvenida Signature', desc: 'Coctel artesanal de recepción al hacer check-in.' }
    ]
  },
  {
    id: 'oro',
    nombre: 'Oro',
    minNoches: 5,
    beneficios: [
      { icono: '🥂', titulo: '10% Descuento en Restaurantes', desc: 'Aplicable en centros de consumo seleccionados del resort.' },
      { icono: '⏰', titulo: 'Early Check-In / Late Check-Out', desc: 'Sujeto a disponibilidad al momento de llegada o salida.' },
      { icono: '✨', titulo: 'Bono +15% Puntos Fiesta Rewards', desc: 'Acumulación acelerada en cada estancia liquidada.' }
    ]
  },
  {
    id: 'platino',
    nombre: 'Platino',
    minNoches: 15,
    beneficios: [
      { icono: '⬆️', titulo: 'Upgrade de Suite Garantizado', desc: 'Ascenso a categoría superior vista al mar sujeto a ocupación.' },
      { icono: '💆', titulo: '15% en Feel Harmony Spa', desc: 'Descuento preferencial en circuitos de hidroterapia y masajes.' },
      { icono: '🌙', titulo: '1 Noche Certificado Anual', desc: 'Válida en estancias mínimas de 3 noches consecutivas.' }
    ]
  },
  {
    id: 'titanium',
    nombre: 'Titanium Privilege',
    minNoches: 20,
    beneficios: [
      { icono: '🍽️', titulo: '20% Descuento en Gastronomía', desc: 'Válido en todos los restaurantes de especialidad y cavas.' },
      { icono: '🧖', titulo: '20% en Feel Harmony Spa', desc: 'Tarifa VIP en rituales holísticos y tratamientos signature.' },
      { icono: '🏝️', titulo: '2 Noches Gratis Disponibles', desc: 'Certificados activos listos para canjear en tu próxima estancia.' },
      { icono: '👑', titulo: 'Acceso Lounge VIP & Concierge 24/7', desc: 'Check-in privado, coctelería premium y atención prioritaria.' }
    ]
  }
];

export default function PerfilSocio() {
  const navigate = useNavigate();

  // Tabs: resumen | estancias | experiencias | tickets | billetera | facturacion | preferencias | cuenta
  const [tabActiva, setTabActiva] = useState('estancias');
  const [nivelVista, setNivelVista] = useState('titanium');
  const [usuario, setUsuario] = useState(null);
  const [reservaciones, setReservaciones] = useState([]);
  const [experiencias, setExperiencias] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tarjetasBancarias, setTarjetasBancarias] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [copiadoFr, setCopiadoFr] = useState(false);

  // Fiesta Card de Socio
  const [fiestaCard, setFiestaCard] = useState({
    saldo_disponible: 50000.00,
    linea_credito_total: 50000.00,
    numero_enmascarado: '4829 6049 3035 3467',
    puntos_rewards_acumulados: 2500,
    fecha_expiracion: '11/30',
    titular_tarjeta: 'KEVIN RAMIREZ SORIA',
    descuento_restaurantes_porcentaje: 20,
    descuento_spa_porcentaje: 20,
    noches_gratis_disponibles: 2,
    acceso_lounge_vip: true
  });
  // Premios, Cupones y Actividad del Monedero
const [codigoCupon, setCodigoCupon] = useState('');
const [cuponMsg, setCuponMsg] = useState('');
const [mostrarActividadWallet, setMostrarActividadWallet] = useState(false);
const [movimientosWallet, setMovimientosWallet] = useState([
  { id: 'MOV-101', fecha: '2026-11-16', concepto: 'Asignación Línea Titanium Privilege', tipo: 'ABONO', monto: '+$50,000.00 MXN' },
  { id: 'MOV-102', fecha: '2026-11-16', concepto: 'Bono Acumulado Estancias Confirmadas', tipo: 'ABONO', monto: '+2,500 PTS' },
  { id: 'MOV-103', fecha: '2026-11-16', concepto: 'Canje aplicado en Folio GFA-903115', tipo: 'CANJE', monto: '-$1,250.00 MXN' }
]);

const handleCanjearCupon = (e) => {
  e.preventDefault();
  const code = codigoCupon.trim().toUpperCase();
  if (!code) return;

  const cuponesValidos = {
    TITANIUM500: { pts: 500, bonoMxn: 0, desc: 'Bono VIP +500 Puntos Fiesta Rewards' },
    CANCUN1000: { pts: 0, bonoMxn: 1000, desc: 'Vale de $1,000.00 MXN para Spa o Restaurantes' },
    VIPGFA: { pts: 1000, bonoMxn: 500, desc: 'Paquete Bienvenida: +1,000 PTS y $500.00 MXN' }
  };

  const premio = cuponesValidos[code];
  if (!premio) {
    setCuponMsg('Código no válido o expirado. Prueba con: TITANIUM500, CANCUN1000 o VIPGFA.');
    return;
  }

  setFiestaCard(prev => ({
    ...prev,
    saldo_disponible: prev.saldo_disponible + premio.bonoMxn,
    puntos_rewards_acumulados: Number(prev.puntos_rewards_acumulados) + premio.pts
  }));

  setMovimientosWallet(prev => [
    {
      id: `MOV-${Math.floor(200 + Math.random() * 800)}`,
      fecha: new Date().toISOString().split('T')[0],
      concepto: `Cupón canjeado (${code}): ${premio.desc}`,
      tipo: 'ABONO',
      monto: premio.bonoMxn > 0 ? `+$${premio.bonoMxn.toLocaleString('es-MX')}.00 MXN` : `+${premio.pts} PTS`
    },
    ...prev
  ]);

  setCuponMsg(`✓ ¡Premio acreditado! ${premio.desc}`);
  setCodigoCupon('');
};

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
  // Seguridad, Comunicaciones y Acompañantes (MySettings VIP)
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifEmailOfertas, setNotifEmailOfertas] = useState(true);
  const [notifPushPagos, setNotifPushPagos] = useState(true);
  const [acompanantes, setAcompanantes] = useState([
    { id: 1, nombre: 'Acompañante Principal VIP', relacion: 'Invitado Frecuente', documento: 'INE / Pasaporte Verificado' }
  ]);
  const [nuevoAcompNombre, setNuevoAcompNombre] = useState('');
  const [nuevoAcompRelacion, setNuevoAcompRelacion] = useState('Familiar');
  const [seguridadFeedback, setSeguridadFeedback] = useState('');
  // Expediente Internacional, Pre-Check-In y Accesibilidad (MySettings_Index)
  const [idiomaAtencion, setIdiomaAtencion] = useState('es-mx');
  const [divisaPreferida, setDivisaPreferida] = useState('MXN');
  const [accesibilidadActiva, setAccesibilidadActiva] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState('Pasaporte');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [vigenciaDocumento, setVigenciaDocumento] = useState('2030-12-31');
  const [direccionResidencia, setDireccionResidencia] = useState('Coacalco, Estado de México, México');
  const [docGuardadoMsg, setDocGuardadoMsg] = useState('');

  const handleGuardarExpedienteViajero = (e) => {
    e.preventDefault();
    setDocGuardadoMsg('✓ Documento de viaje, preferencias regionales y accesibilidad sincronizados para Pre-Check-In Express.');
    setTimeout(() => setDocGuardadoMsg(''), 4000);
  };

  const handleAgregarAcompanante = (e) => {
    e.preventDefault();
    if (!nuevoAcompNombre.trim()) return;
    setAcompanantes(prev => [
      ...prev,
      {
        id: Date.now(),
        nombre: nuevoAcompNombre.trim(),
        relacion: nuevoAcompRelacion,
        documento: 'Registro Express Pre-Check-In'
      }
    ]);
    setNuevoAcompNombre('');
    setSeguridadFeedback('✓ Acompañante agregado a tu lista de Pre-Check-In.');
    setTimeout(() => setSeguridadFeedback(''), 3000);
  };

  const handleExportarExpedienteJson = () => {
    const expediente = {
      fecha_exportacion: new Date().toISOString(),
      socio: {
        usuario_id: usuario.usuario_id,
        nombre_completo: `${usuario.nombres} ${usuario.apellidos}`,
        email: usuario.email,
        telefono: usuario.telefono,
        fiesta_rewards_id: usuario.fiesta_rewards_id,
        nivel_socio: nivelOficial,
        noches_acumuladas: nochesSql
      },
      monedero: fiestaCard,
      estancias: listaReservas,
      experiencias: listaExperiencias,
      facturas_cfdi: facturas,
      tickets_concierge: listaTickets
    };
    const blob = new Blob([JSON.stringify(expediente, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expediente_GFA_${usuario.fiesta_rewards_id || 'SOCIO'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

      // 2. Tickets de Front Desk
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
              numero_enmascarado: f.numero_enmascarado || '4829 6049 3035 3467',
              puntos_rewards_acumulados: f.puntos_rewards_acumulados ?? 2500,
              fecha_expiracion: f.fecha_expiracion || '11/30',
              titular_tarjeta: f.titular_tarjeta || `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim(),
              descuento_restaurantes_porcentaje: f.descuento_restaurantes_porcentaje ?? 20,
              descuento_spa_porcentaje: f.descuento_spa_porcentaje ?? 20,
              noches_gratis_disponibles: f.noches_gratis_disponibles ?? 2,
              acceso_lounge_vip: Boolean(f.acceso_lounge_vip ?? true)
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

      // 6. Experiencias & Spa en SQL Server
      try {
        const resExp = await fetch(`${API_BASE}/experiencias/usuario/${uid}`, { headers: authHeaders });
        if (resExp.ok) {
          const expData = await resExp.json();
          const arrayExp = Array.isArray(expData)
            ? expData
            : (Array.isArray(expData?.experiencias) ? expData.experiencias : (Array.isArray(expData?.data) ? expData.data : []));
          setExperiencias(arrayExp);
        } else {
          setExperiencias([]);
        }
      } catch (eExp) {
        setExperiencias([]);
      }

    } catch (err) {
      console.error('Error al sincronizar datos del socio:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleCopiarFolioFr = () => {
    const idFr = usuario?.fiesta_rewards_id || 'FR-964612';
    navigator.clipboard?.writeText(idFr);
    setCopiadoFr(true);
    setTimeout(() => setCopiadoFr(false), 2000);
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

    let marcaDetectada = 'Visa';
    if (cleanNum.startsWith('5') || cleanNum.startsWith('2')) marcaDetectada = 'Mastercard';
    else if (cleanNum.startsWith('3')) marcaDetectada = 'American Express';

    const ultimos4 = cleanNum.slice(-4);
    const numeroEnmascarado = `${cleanNum.slice(0, 4)} •••• •••• ${ultimos4}`;

    try {
      const expParts = tbExp.split('/');
      const mExp = parseInt(expParts[0], 10) || 12;
      const aExp = parseInt(expParts[1], 10) || 29;

      const payload = {
        usuario_id: usuario.usuario_id,
        alias_tarjeta: tbBanco || 'Tarjeta Personal',
        banco_emisor: tbBanco,
        marca_tarjeta: marcaDetectada,
        tipo_cuenta: tbTipo === 'CREDITO' ? 'Crédito' : 'Débito',
        numero_enmascarado: numeroEnmascarado,
        titular_nombre: tbTitular.toUpperCase(),
        mes_expiracion: mExp,
        anio_expiracion: aExp,
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

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || 'Error al registrar la tarjeta en SQL Server.');
      }

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

  const nochesSql = usuario.noches_acumuladas !== undefined && usuario.noches_acumuladas !== null
    ? Number(usuario.noches_acumuladas)
    : listaReservas.reduce((acc, r) => acc + (parseInt(r.noches) || 0), 0);

  // Solo suma estancias vigentes (excluye CANCELADA)
  const reservasVigentes = listaReservas.filter(r => (r.estatus_reservacion || '').toUpperCase() !== 'CANCELADA');
  const totalInvertido = reservasVigentes.reduce((acc, r) => acc + (parseFloat(r.total_general) || 0), 0);
  const estanciasActivas = reservasVigentes.length;
  const nivelOficial = usuario.nivel_socio || 'Titanium Privilege';
  const porcentajeProgreso = Math.min(100, Math.round((nochesSql / 25) * 100));
  const nivelSeleccionadoObj = NIVELES_REWARDS.find(n => n.id === nivelVista) || NIVELES_REWARDS[3];

  return (
    <main className="perfil-socio-container">

      {/* 1. CABECERA DE SOCIO REFLEJADA DE SQL SERVER */}
      <section className="perfil-header-box">
        <div className="perfil-avatar">
          <span>👤</span>
        </div>
        <div className="perfil-info">
          <span className="perfil-greeting-tag">EXPEDIENTE DE FIDELIZACIÓN • GRUPO POSADAS</span>
          <h2>Hola, {usuario.nombres} {usuario.apellidos}</h2>
          <p className="perfil-meta">
            ✉ {usuario.email} &nbsp;|&nbsp; ✆ {usuario.telefono || 'Sin teléfono'} &nbsp;|&nbsp; 📍 {usuario.pais || 'México'}
          </p>
          <div className="perfil-header-actions">
            <button
              type="button"
              onClick={handleCopiarFolioFr}
              className="perfil-fr-badge-interactive"
              title="Haz clic para copiar tu ID Fiesta Rewards"
            >
              <span>Socio Fiesta Rewards: <strong>{usuario.fiesta_rewards_id || 'FR-964612'}</strong></span>
              <span className="copiar-tag">{copiadoFr ? '✓ COPIADO' : 'COPIAR'}</span>
            </button>
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
          <div className="loyalty-level-badge">👑 NIVEL {nivelOficial.toUpperCase()}</div>
          <div className="loyalty-points-val">{Number(fiestaCard.puntos_rewards_acumulados).toLocaleString('es-MX')} PTS</div>
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
          <span className="metric-label">INVERSIÓN ACTIVA EN RESORT</span>
          <span className="metric-val">${totalInvertido.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
        </div>
      </section>

      {/* 3. NAVEGACIÓN COMPLETA POR TABS */}
      <nav className="perfil-tabs-nav">
        <button
          className={`perfil-tab-btn ${tabActiva === 'resumen' ? 'active' : ''}`}
          onClick={() => setTabActiva('resumen')}
        >
          👑 HUB FIESTA REWARDS
        </button>
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

      {/* TAB 0: HUB FIESTA REWARDS (ESTILO MEMBERSHIP HUB SUPERADO) */}
      {tabActiva === 'resumen' && (
        <section className="tab-pane">
          <div className="rewards-hub-top-grid">
            {/* Bloque Izquierdo: Progresión y Ventajas por Nivel */}
            <div className="rewards-hub-card">
              <div className="rewards-hub-card-head">
                <div>
                  <h4 className="seccion-subtitulo">PROGRESIÓN Y VENTAJAS FIESTA REWARDS</h4>
                  <p className="seccion-desc" style={{ marginBottom: 0 }}>
                    Disfruta beneficios exclusivos sincronizados desde <code>TarjetasFiestaCard</code>.
                  </p>
                </div>
                <span className="hub-status-pill">ESTATUS ACTIVO: {nivelOficial.toUpperCase()}</span>
              </div>

              {/* Barra de Progreso de Noches */}
              <div className="loyalty-progress-container">
                <div className="loyalty-progress-header">
                  <span>Progreso de Estancias Anuales: <strong>{nochesSql} noches acumuladas</strong></span>
                  <span>{nochesSql >= 20 ? 'Nivel Máximo Desbloqueado (100%)' : `${porcentajeProgreso}%`}</span>
                </div>
                <div className="loyalty-progress-bar-bg">
                  <div className="loyalty-progress-fill" style={{ width: `${porcentajeProgreso}%` }}></div>
                </div>
              </div>

              {/* Selector de Niveles (Carrusel / Pestañas de Nivel) */}
              <div className="rewards-tiers-selector">
                {NIVELES_REWARDS.map((niv) => {
                  const desbloqueado = nochesSql >= niv.minNoches;
                  return (
                    <button
                      key={niv.id}
                      type="button"
                      className={`tier-pill-btn ${nivelVista === niv.id ? 'active' : ''} ${desbloqueado ? 'unlocked' : 'locked'}`}
                      onClick={() => setNivelVista(niv.id)}
                    >
                      <span>{desbloqueado ? '🔓' : '🔒'} {niv.nombre}</span>
                      <small>{niv.minNoches === 0 ? 'Inicial' : `${niv.minNoches}+ noches`}</small>
                    </button>
                  );
                })}
              </div>

              {/* Tarjetas de Beneficios del Nivel Seleccionado */}
              <div className="rewards-benefits-grid">
                {nivelSeleccionadoObj.beneficios.map((ben, index) => (
                  <div key={index} className="reward-benefit-tile">
                    <span className="reward-benefit-icon">{ben.icono}</span>
                    <div>
                      <h5>{ben.titulo}</h5>
                      <p>{ben.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloque Derecho: Resumen de Monedero, Crédito Institucional y Vales */}
            <div className="rewards-wallet-summary-card">
              <h4 className="seccion-subtitulo">RESUMEN DE CRÉDITO Y MONEDERO</h4>
              <p className="seccion-desc">Saldos disponibles listos para aplicar en check-out o consumos.</p>

              <div className="wallet-summary-rows">
                <div className="wallet-summary-row">
                  <span>Línea de Crédito Fiesta Card</span>
                  <strong>${fiestaCard.saldo_disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                </div>
                <div className="wallet-summary-row">
                  <span>Puntos Fiesta Rewards</span>
                  <strong className="gold-text">{Number(fiestaCard.puntos_rewards_acumulados).toLocaleString('es-MX')} PTS</strong>
                </div>
                <div className="wallet-summary-row">
                  <span>Certificados de Noche Gratis</span>
                  <strong>{fiestaCard.noches_gratis_disponibles} Noches</strong>
                </div>
                <div className="wallet-summary-row">
                  <span>Cortesía Gastronomía &amp; Spa</span>
                  <strong>{fiestaCard.descuento_restaurantes_porcentaje}% / {fiestaCard.descuento_spa_porcentaje}%</strong>
                </div>
              </div>

              <button
                type="button"
                className="btn-guardar-perfil"
                onClick={() => setTabActiva('billetera')}
              >
                IR AL MONEDERO Y TARJETAS →
              </button>
            </div>
          </div>

          {/* Directorio Rápido por Categorías (Estilo Booking Membership Hub) */}
          <div className="hub-directory-grid">
            <div className="hub-dir-card">
              <h5>💳 Información de Pago y Fiscal</h5>
              <button type="button" onClick={() => setTabActiva('billetera')}>
                <span>Billetera Fiesta Card &amp; Tarjetas ({tarjetasBancarias.length + 1})</span>
                <span>›</span>
              </button>
              <button type="button" onClick={() => setTabActiva('facturacion')}>
                <span>Comprobantes Fiscales CFDI 4.0 ({facturas.length})</span>
                <span>›</span>
              </button>
            </div>

            <div className="hub-dir-card">
              <h5>🏨 Viajes y Experiencias</h5>
              <button type="button" onClick={() => setTabActiva('estancias')}>
                <span>Estancias &amp; Suites Reservadas ({listaReservas.length})</span>
                <span>›</span>
              </button>
              <button type="button" onClick={() => setTabActiva('experiencias')}>
                <span>Citas Feel Harmony Spa &amp; Experiencias ({listaExperiencias.length})</span>
                <span>›</span>
              </button>
            </div>

            <div className="hub-dir-card">
              <h5>⚙️ Gestión de Cuenta y Concierge</h5>
              <button type="button" onClick={() => setTabActiva('preferencias')}>
                <span>Preferencias de Suite ({prefCama})</span>
                <span>›</span>
              </button>
              <button type="button" onClick={() => setTabActiva('tickets')}>
                <span>Tickets de Atención Concierge ({listaTickets.length})</span>
                <span>›</span>
              </button>
              <button type="button" onClick={() => setTabActiva('cuenta')}>
                <span>Datos Personales y Seguridad</span>
                <span>›</span>
              </button>
            </div>
          </div>
        </section>
      )}

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
                <article key={exp.folio_experiencia || exp.reserva_experiencia_id || exp.experiencia_id} className="reserva-card-item borde-pagado">
                  <div className="reserva-header-row">
                    <span className="reserva-folio">FOLIO: {exp.folio_experiencia}</span>
                    <span className="reserva-badge badge-confirmada">{(exp.estatus || 'AGENDADA').toUpperCase()}</span>
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
              {listaTickets.map(t => {
                const descLimpia = (t.descripcion || '').replace(/^"+|"+$/g, '');
                return (
                  <div key={t.ticket_id} className="ticket-item-perfil">
                    <div className="ticket-item-top">
                      <span className="ticket-id-tag">TCK-{t.ticket_id} {t.clave_reservacion ? `• ${t.clave_reservacion}` : ''}</span>
                      <span className="ticket-badge-estatus">{t.estatus || 'En Revisión'}</span>
                    </div>
                    <h4 className="ticket-cat">{t.categoria}</h4>
                    <p className="ticket-desc">"{descLimpia}"</p>
                    <small className="ticket-date">Registrado el: {new Date(t.creado_en).toLocaleString('es-MX')}</small>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: PREMIOS, MONEDERO Y TARJETAS */}
   {tabActiva === 'billetera' && (
     <section className="tab-pane">
       {/* A. PANEL CONSOLIDADO DE PREMIOS Y MONEDERO */}
       <div className="wallet-hero-panel">
         <div className="wallet-hero-main">
           <div className="wallet-hero-title-group">
             <span className="wallet-icon-badge">👛</span>
             <div>
               <h4 className="seccion-subtitulo" style={{ marginBottom: '2px' }}>SALDO CONSOLIDADO DE PREMIOS Y MONEDERO</h4>
               <p className="seccion-desc" style={{ marginBottom: 0 }}>
                 Incluye tu crédito institucional Fiesta Card y el valor canjeable de tus puntos y certificados.
               </p>
             </div>
           </div>
           <div className="wallet-hero-total">
             <small>DISPONIBLE TOTAL</small>
             <strong>
               ${(fiestaCard.saldo_disponible + (Number(fiestaCard.puntos_rewards_acumulados) * 0.5)).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
             </strong>
           </div>
         </div>

         <div className="wallet-hero-breakdown">
           <div className="wallet-break-item">
             <span>Crédito Institucional Fiesta Card</span>
             <strong>${fiestaCard.saldo_disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
           </div>
           <div className="wallet-break-item">
             <span>Puntos Fiesta Rewards ({Number(fiestaCard.puntos_rewards_acumulados).toLocaleString('es-MX')} PTS)</span>
             <strong className="gold-text">
               ${(Number(fiestaCard.puntos_rewards_acumulados) * 0.5).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
             </strong>
           </div>
           <div className="wallet-break-item">
             <span>Vales / Certificados Noche Gratis ({fiestaCard.noches_gratis_disponibles || 2})</span>
             <strong>Activos en Cuenta</strong>
           </div>
           <button
             type="button"
             className="btn-ver-actividad-wallet"
             onClick={() => setMostrarActividadWallet(!mostrarActividadWallet)}
           >
             {mostrarActividadWallet ? 'Ocultar Actividad ▲' : 'Ver Actividad en Premios y Monedero ▼'}
           </button>
         </div>

         {/* Desplegable de Actividad del Monedero */}
         {mostrarActividadWallet && (
           <div className="wallet-activity-drawer">
             <h5>HISTORIAL DE MOVIMIENTOS Y CANJES</h5>
             {movimientosWallet.map(mov => (
               <div key={mov.id} className="wallet-mov-row">
                 <div>
                   <span className="mov-id">{mov.id}</span>
                   <span className="mov-concepto">{mov.concepto}</span>
                   <small className="mov-fecha">{mov.fecha}</small>
                 </div>
                 <span className={`mov-monto ${mov.tipo === 'ABONO' ? 'abono' : 'canje'}`}>{mov.monto}</span>
               </div>
             ))}
           </div>
         )}
       </div>

       {/* B. CANJEADOR DE CÓDIGOS PROMOCIONALES */}
       <div className="wallet-coupon-bar">
         <div className="coupon-bar-text">
           <strong>🎟 ¿Has conseguido un código de cortesía o regalo?</strong>
           <span>Acredita puntos extra o saldo promocional directo a tu monedero (Ej. <code>TITANIUM500</code>, <code>CANCUN1000</code>).</span>
         </div>
         <form onSubmit={handleCanjearCupon} className="coupon-bar-form">
           <input
             type="text"
             placeholder="Ingresa tu código..."
             value={codigoCupon}
             onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
           />
           <button type="submit">AÑADIR AL MONEDERO</button>
         </form>
       </div>
       {cuponMsg && <div className="factura-alert-banner" style={{ marginBottom: '22px' }}>{cuponMsg}</div>}

       {/* C. TARJETA CORPORATIVA 3D Y BÓVEDA DE TARJETAS BANCARIAS */}
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
                 <div key={t.tarjeta_bancaria_id} className={`tarjeta-bancaria-item ${t.es_preferida ? 'predeterminada-activa' : ''}`}>
                   <div className="tb-brand-badge">{t.marca_tarjeta || 'CARD'}</div>
                   <div className="tb-info">
                     <span className="tb-num">{t.numero_enmascarado}</span>
                     <span className="tb-titular">{t.titular_nombre} | Vence: {t.mes_expiracion}/{t.anio_expiracion}</span>
                     <span className="tb-banco">{t.banco_emisor} • {t.tipo_cuenta}</span>
                   </div>
                   <div className="tb-acciones">
                     {t.es_preferida ? (
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

       {/* D. GUÍA DE FUNCIONAMIENTO DE PREMIOS Y MONEDERO */}
       <div className="wallet-pillars-box">
         <h4 className="seccion-subtitulo">¿CÓMO FUNCIONA PREMIOS Y MONEDERO?</h4>
         <div className="wallet-pillars-grid">
           <div className="wallet-pillar-item">
             <span>🏆</span>
             <div>
               <h5>Reserva y gana premios</h5>
               <p>Cada estancia liquidada y experiencia en Spa acumula puntos y certificados listos para tu próxima visita.</p>
             </div>
           </div>
           <div className="wallet-pillar-item">
             <span>📱</span>
             <div>
               <h5>Tenlo todo a mano</h5>
               <p>Consulta en un solo lugar tus saldos, códigos promocionales, certificados vigentes y tarjetas guardadas.</p>
             </div>
           </div>
           <div className="wallet-pillar-item">
             <span>💎</span>
             <div>
               <h5>Paga con el Monedero y ahorra</h5>
               <p>Aplica tus puntos Fiesta Rewards o tu línea institucional directamente en la pasarela de reservaciones.</p>
             </div>
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
                    <p className="fic-meta">Receptor: {f.rfc_receptor || 'XAXX010101000'} | {f.razon_social_receptor || f.razon_social || 'Socio Posadas'}</p>
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

      {/* TAB 7: SEGURIDAD, PRIVACIDAD & CUENTA */}
      {tabActiva === 'cuenta' && (
        <section className="tab-pane">
          {/* A. PANEL DE ESTADO DE SEGURIDAD Y VERIFICACIÓN */}
          <div className="security-status-banner">
            <div className="sec-badge-card">
              <span className="sec-icon">🛡️</span>
              <div>
                <strong>Protección de Cuenta Alta</strong>
                <small>Contraseña cifrada con Bcrypt Hash • Sesión JWT Activa</small>
              </div>
            </div>
            <div className="sec-badge-card">
              <span className="sec-icon">✅</span>
              <div>
                <strong>Correo Titular Verificado</strong>
                <small>{usuario.email}</small>
              </div>
            </div>
            <div className="sec-badge-card">
              <span className="sec-icon">📲</span>
              <div>
                <strong>Canal Directo Concierge</strong>
                <small>{editTelefono || 'Sin teléfono asignado'}</small>
              </div>
            </div>
          </div>

          {seguridadFeedback && <div className="factura-alert-banner">{seguridadFeedback}</div>}

          {/* B. DATOS PERSONALES Y CREDENCIALES (SQL SERVER) */}
          <div className="cuenta-box" style={{ marginBottom: '24px' }}>
            <div className="cuenta-header-row">
              <div>
                <h4 className="seccion-subtitulo">DATOS PERSONALES Y CREDENCIALES (SQL SERVER)</h4>
                <p className="seccion-desc" style={{ marginBottom: 0 }}>
                  Actualiza tu información oficial y clave de acceso en <code>dbo.Usuarios</code>.
                </p>
              </div>
              <div className="cuenta-seguridad-meta">
                <span className="meta-pill">ID SQL: #{usuario.usuario_id}</span>
                <span className="meta-pill">Rol: {usuario.rol || 'Socio VIP'}</span>
              </div>
            </div>

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
                  <label>Correo Electrónico (Columna: email - Verificado)</label>
                  <input type="email" disabled className="input-disabled" value={usuario.email} />
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

          {/* C. PREFERENCIAS DE COMUNICACIÓN Y ACOMPAÑANTES DE VIAJE */}
          <div className="billetera-grid-layout" style={{ marginBottom: '24px' }}>
            {/* Preferencias de Comunicación */}
            <div className="cuenta-box">
              <h4 className="seccion-subtitulo">PREFERENCIAS DE COMUNICACIÓN</h4>
              <p className="seccion-desc">Elige cómo deseas recibir tus llaves digitales, facturas y beneficios.</p>

              <div className="comm-toggles-list">
                <label className="comm-toggle-row">
                  <div>
                    <strong>WhatsApp Concierge &amp; Check-In Express</strong>
                    <small>Recibe tu código QR de suite y confirmaciones de traslado privado.</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifWhatsapp}
                    onChange={(e) => {
                      setNotifWhatsapp(e.target.checked);
                      setSeguridadFeedback('Preferencias de comunicación actualizadas.');
                    }}
                  />
                </label>

                <label className="comm-toggle-row">
                  <div>
                    <strong>Preventas y Beneficios Titanium Privilege</strong>
                    <small>Acceso anticipado a tarifas preferenciales y eventos gastronómicos.</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifEmailOfertas}
                    onChange={(e) => {
                      setNotifEmailOfertas(e.target.checked);
                      setSeguridadFeedback('Preferencias de comunicación actualizadas.');
                    }}
                  />
                </label>

                <label className="comm-toggle-row">
                  <div>
                    <strong>Alertas de Pagos, Reembolsos y Timbrado CFDI</strong>
                    <small>Notificación inmediata cuando se emite una factura SAT o movimiento.</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPushPagos}
                    onChange={(e) => {
                      setNotifPushPagos(e.target.checked);
                      setSeguridadFeedback('Preferencias de comunicación actualizadas.');
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Acompañantes de Viaje */}
            <div className="cuenta-box">
              <h4 className="seccion-subtitulo">ACOMPAÑANTES DE VIAJE FRECUENTES</h4>
              <p className="seccion-desc">Agiliza la entrega de brazaletes RFID registrando a tus invitados habituales.</p>

              <form onSubmit={handleAgregarAcompanante} className="acomp-inline-form">
                <input
                  type="text"
                  placeholder="Nombre completo del acompañante"
                  value={nuevoAcompNombre}
                  onChange={(e) => setNuevoAcompNombre(e.target.value)}
                />
                <select value={nuevoAcompRelacion} onChange={(e) => setNuevoAcompRelacion(e.target.value)}>
                  <option value="Familiar">Familiar</option>
                  <option value="Pareja">Pareja</option>
                  <option value="Ejecutivo / Negocios">Ejecutivo</option>
                </select>
                <button type="submit">+ AÑADIR</button>
              </form>

              <div className="acomp-list">
                {acompanantes.map(ac => (
                  <div key={ac.id} className="acomp-item">
                    <div>
                      <strong>{ac.nombre}</strong>
                      <small>{ac.relacion} • {ac.documento}</small>
                    </div>
                    <button
                      type="button"
                      className="btn-eliminar-tb"
                      onClick={() => setAcompanantes(acompanantes.filter(item => item.id !== ac.id))}
                      title="Quitar acompañante"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* C2. DOCUMENTOS DE VIAJE (PRE-CHECK-IN) Y PREFERENCIAS REGIONALES */}
          <div className="cuenta-box" style={{ marginBottom: '24px' }}>
            <div className="cuenta-header-row">
              <div>
                <h4 className="seccion-subtitulo">DOCUMENTACIÓN DE VIAJE Y ACCESIBILIDAD (PRE-CHECK-IN)</h4>
                <p className="seccion-desc" style={{ marginBottom: 0 }}>
                  Registra tu identificación oficial, idioma de concierge y accesibilidad para entrega directa de llave RFID.
                </p>
              </div>
              <span className="hub-status-pill">FAST-TRACK CHECK-IN</span>
            </div>

            {docGuardadoMsg && <div className="cuenta-alert-banner">{docGuardadoMsg}</div>}

            <form onSubmit={handleGuardarExpedienteViajero} className="cuenta-form">
              <div className="form-row-3">
                <div className="input-field">
                  <label>Documento Oficial</label>
                  <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
                    <option value="Pasaporte">Pasaporte Internacional</option>
                    <option value="INE / ID Oficial">INE / Identificación Nacional</option>
                    <option value="Licencia / Global Entry">Global Entry / Sentri</option>
                  </select>
                </div>

                <div className="input-field">
                  <label>Folio / Número de Documento (Cifrado)</label>
                  <input
                    type="text"
                    placeholder="Ej. G38492014"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="input-field">
                  <label>Fecha de Expiración</label>
                  <input
                    type="date"
                    value={vigenciaDocumento}
                    onChange={(e) => setVigenciaDocumento(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="input-field">
                  <label>Idioma de Atención en Resort</label>
                  <select value={idiomaAtencion} onChange={(e) => setIdiomaAtencion(e.target.value)}>
                    <option value="es-mx">Español (México)</option>
                    <option value="en-us">English (US)</option>
                    <option value="fr">Français</option>
                    <option value="pt-br">Português</option>
                  </select>
                </div>

                <div className="input-field">
                  <label>Divisa Preferida en Tarifas</label>
                  <select value={divisaPreferida} onChange={(e) => setDivisaPreferida(e.target.value)}>
                    <option value="MXN">MXN - Peso Mexicano ($)</option>
                    <option value="USD">USD - Dólar Estadounidense (US$)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                  </select>
                </div>

                <div className="input-field">
                  <label>Domicilio / Ciudad de Residencia</label>
                  <input
                    type="text"
                    value={direccionResidencia}
                    onChange={(e) => setDireccionResidencia(e.target.value)}
                  />
                </div>
              </div>

              <label className="comm-toggle-row" style={{ marginBottom: '14px' }}>
                <div>
                  <strong>Suite con Adaptaciones de Accesibilidad</strong>
                  <small>Priorizar habitaciones con acceso sin escalones, barras de apoyo y regadera tipo roll-in.</small>
                </div>
                <input
                  type="checkbox"
                  checked={accesibilidadActiva}
                  onChange={(e) => setAccesibilidadActiva(e.target.checked)}
                />
              </label>

              <button type="submit" className="btn-guardar-perfil">
                GUARDAR EXPEDIENTE DE VIAJERO →
              </button>
            </form>
          </div>

          {/* D. PRIVACIDAD, PORTABILIDAD DE DATOS Y SESIÓN */}
          <div className="privacy-footer-box">
            <div>
              <h4 className="seccion-subtitulo" style={{ marginBottom: '4px' }}>PRIVACIDAD Y PORTABILIDAD DE DATOS</h4>
              <p className="seccion-desc" style={{ marginBottom: 0 }}>
                Descarga una copia íntegra de tu historial en SQL Server o cierra tu sesión activa de forma segura.
              </p>
            </div>
            <div className="privacy-footer-actions">
              <button type="button" className="btn-agregar-tarjeta" onClick={handleExportarExpedienteJson}>
                📥 EXPORTAR EXPEDIENTE (JSON)
              </button>
              <button type="button" className="btn-cerrar-sesion-sec" onClick={expulsarUsuario}>
                CERRAR SESIÓN SEGURA
              </button>
            </div>
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