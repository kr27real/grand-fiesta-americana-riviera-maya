import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSuites, createReservation } from '../../services/api';
import LoginModal from '../../components/LoginModal/LoginModal';
import { 
  BedDouble, Users, Sparkles, Check, ArrowRight, ArrowLeft,
  Loader2, Maximize2, Eye, X, ChevronLeft, ChevronRight,
  Coffee, Wifi, ShieldCheck, Waves, Bath, Tv, Moon, Clock,
  Star, Search, SlidersHorizontal, Scale, Calculator, Calendar,
  CreditCard, CheckCircle2, Printer, Download, UserCheck, Plane,
  Award, QrCode, AlertCircle, ReceiptText, Gift, Info, ShieldAlert,
  ConciergeBell, FileText, CheckCircle
} from 'lucide-react';
import './Habitaciones.css';

export default function Habitaciones() {
  const navigate = useNavigate();

  // 0. Stepper Maestro
  const [etapaFlujo, setEtapaFlujo] = useState('catalogo'); // 'catalogo' | 'personalizar' | 'pago' | 'exito'

  // 1. Estancia
  const hoyISO = new Date().toISOString().substring(0, 10);
  const salidaISO = new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10);
  const [fechaLlegadaGlobal, setFechaLlegadaGlobal] = useState(hoyISO);
  const [fechaSalidaGlobal, setFechaSalidaGlobal] = useState(salidaISO);
  const [adultosGlobal, setAdultosGlobal] = useState(2);
  const [ninosGlobal, setNinosGlobal] = useState(0);

  // 2. Suites & Filtros
  const [suites, setSuites] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('TODAS');
  const [filtroAmenidad, setFiltroAmenidad] = useState('TODAS');
  const [precioMaximo, setPrecioMaximo] = useState(40000);

  // Estados Ficha Técnica Modal
  const [suiteFichaModal, setSuiteFichaModal] = useState(null);
  const [fotoModalIndex, setFotoModalIndex] = useState(0);
  const [pestanaActiva, setPestanaActiva] = useState('confort');

  // 3. Suite & Personalización
  const [suiteSeleccionada, setSuiteSeleccionada] = useState(null);
  const [serviciosAdicionales, setServiciosAdicionales] = useState({
    transportePrivado: false,
    masajePareja: false,
    cenaRomanticaPlaya: false,
    cavaPremiumVino: false,
    checkInTemprano: false
  });
  const [almohadaElegida, setAlmohadaElegida] = useState('Plumas de Ganso Hipoalergénica');

  // 4. Huésped & Sesión
  const [usuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('usuario') || localStorage.getItem('gfa_user') || 'null');
    } catch {
      return null;
    }
  });

  const [datosHuesped, setDatosHuesped] = useState({
    nombre: usuario?.nombre || 'Kevin',
    apellido: usuario?.apellido || 'Ramirez Soria',
    email: usuario?.email || 'jerrysoria32@gmail.com',
    telefono: usuario?.telefono || '5548166341',
    peticiones: ''
  });

  // 5. Facturación SAT CFDI 4.0
  const [requiereFactura, setRequiereFactura] = useState(false);
  const [datosFactura, setDatosFactura] = useState({
    rfc: 'XEXX010101000',
    razonSocial: 'KEVIN RAMIREZ SORIA',
    codigoPostal: '77580',
    regimenFiscal: '605 - Sueldos y Salarios',
    usoCFDI: 'G03 - Gastos en general'
  });

  // 6. Pagos
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [datosTarjeta, setDatosTarjeta] = useState({
    titular: 'Kevin Ramirez Soria',
    numero: '4000 1234 5678 4044',
    expiracion: '12/28',
    cvv: '982',
    msi: '1'
  });
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  // 7. Modales y Notificaciones
  const [modalVoucherAbierto, setModalVoucherAbierto] = useState(false);
  const [voucherData, setVoucherData] = useState(null);
  const [modalLoginAbierto, setModalLoginAbierto] = useState(false);
  const [suitePendienteReserva, setSuitePendienteReserva] = useState(null);
  const [toastNotif, setToastNotif] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        const data = await fetchSuites();
        setSuites(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Error al cargar suites:', err);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // Parser robusto de galería compatible con array de strings y array de objetos con título
  const getFotosSuite = (suite) => {
    if (!suite) return [];
    try {
      if (suite.galeria_fotos) {
        const parsed = typeof suite.galeria_fotos === 'string' ? JSON.parse(suite.galeria_fotos) : suite.galeria_fotos;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(item => {
            if (typeof item === 'string') return { url: item, titulo: suite.nombre };
            return { url: item.url || item.foto_url, titulo: item.titulo || suite.nombre };
          });
        }
      }
    } catch (e) { /* fallback */ }
    return [{ url: suite.foto_principal, titulo: suite.nombre }];
  };

  const getResenasSuite = () => [
    { autor: 'Carlos M. (Socio Platino)', calif: 5, fecha: 'Octubre 2026', comentario: 'La comodidad del colchón Sealy y las almohadas es insuperable. El mayordomo atendió cada petición con excelencia.' },
    { autor: 'Elena R. (Huésped Verificado)', calif: 5, fecha: 'Septiembre 2026', comentario: 'La vista al mar Caribe desde la terraza privada es espectacular. El minibar premium siempre resurtido.' },
    { autor: 'David S. (Socio Oro)', calif: 4.9, fecha: 'Agosto 2026', comentario: 'El baño de mármol con tina de inmersión y amenidades L’Occitane eleva la estancia al máximo lujo.' }
  ];

  const mostrarToast = (msg) => {
    setToastNotif(msg);
    setTimeout(() => setToastNotif(null), 4500);
  };

  const nochesEstancia = useMemo(() => {
    const f1 = new Date(fechaLlegadaGlobal);
    const f2 = new Date(fechaSalidaGlobal);
    const diff = Math.ceil((f2 - f1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [fechaLlegadaGlobal, fechaSalidaGlobal]);

  const desgloseFinanciero = useMemo(() => {
    const tarifaNoche = suiteSeleccionada ? Number(suiteSeleccionada.precio_noche_base || 7500) : 7500;
    const baseHospedaje = tarifaNoche * nochesEstancia;

    let totalExtras = 0;
    if (serviciosAdicionales.transportePrivado) totalExtras += 1850;
    if (serviciosAdicionales.masajePareja) totalExtras += 3400;
    if (serviciosAdicionales.cenaRomanticaPlaya) totalExtras += 4200;
    if (serviciosAdicionales.cavaPremiumVino) totalExtras += 1950;
    if (serviciosAdicionales.checkInTemprano) totalExtras += 950;

    const subtotalBruto = baseHospedaje + totalExtras;
    const iva = subtotalBruto * 0.16;
    const ish = subtotalBruto * 0.05;
    const saneamiento = 76 * nochesEstancia;
    const totalLiquidacion = subtotalBruto + iva + ish + saneamiento;
    const puntosFiestaRewards = Math.round(subtotalBruto * 0.10);

    return {
      tarifaNoche,
      baseHospedaje,
      totalExtras,
      subtotalBruto,
      iva,
      ish,
      saneamiento,
      totalLiquidacion,
      puntosFiestaRewards
    };
  }, [suiteSeleccionada, nochesEstancia, serviciosAdicionales]);

  const iniciarReservaSuite = (suite) => {
    if (suite && Number(suite.inventario_disponible) <= 0) {
      mostrarToast(`La suite "${suite.nombre}" se encuentra temporalmente agotada.`);
      return;
    }
    const token = localStorage.getItem('token_gfa') || localStorage.getItem('token');
    if (!usuario && !token) {
      setSuitePendienteReserva(suite);
      setModalLoginAbierto(true);
      return;
    }
    setSuiteSeleccionada(suite);
    setSuiteFichaModal(null);
    setEtapaFlujo('personalizar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEjecutarLiquidacion = async (e) => {
    e.preventDefault();
    setErrorPago('');
    setProcesandoPago(true);

    try {
      const uId = usuario?.usuario_id || usuario?.id || 1;
      const sId = suiteSeleccionada?.suite_id || suiteSeleccionada?.id || 1;
      const terminacion = metodoPago === 'tarjeta' ? datosTarjeta.numero.replace(/\s/g, '').slice(-4) : 'SPEI';

      const extrasStr = Object.entries(serviciosAdicionales)
        .filter(([, activo]) => activo)
        .map(([k]) => k)
        .join(', ');

      const fiscalInfo = requiereFactura 
        ? ` | [CFDI 4.0: RFC=${datosFactura.rfc}, CP=${datosFactura.codigoPostal}, Uso=${datosFactura.usoCFDI}]` 
        : '';

      const payload = {
        usuario_id: uId,
        suite_id: sId,
        fecha_llegada: fechaLlegadaGlobal,
        fecha_salida: fechaSalidaGlobal,
        noches: nochesEstancia,
        adultos: Number(adultosGlobal),
        ninos: Number(ninosGlobal),
        peticiones: `[Almohada: ${almohadaElegida}] [Extras: ${extrasStr || 'Ninguno'}]${fiscalInfo} ${datosHuesped.peticiones}`.trim(),
        subtotal: desgloseFinanciero.subtotalBruto,
        iva: desgloseFinanciero.iva,
        ishe: desgloseFinanciero.ish,
        saneamiento: desgloseFinanciero.saneamiento,
        total_general: desgloseFinanciero.totalLiquidacion,
        terminacion_tarjeta: terminacion
      };

      const res = await createReservation(payload);
      const folioGen = res?.data?.folio_confirmacion || ('GFA-' + Math.floor(100000 + Math.random() * 900000));

      setVoucherData({
        folio: folioGen,
        titular: `${datosHuesped.nombre} ${datosHuesped.apellido}`.trim(),
        email: datosHuesped.email,
        telefono: datosHuesped.telefono,
        suite: suiteSeleccionada?.nombre || 'Suite de Lujo',
        categoria: suiteSeleccionada?.categoria || 'Ocean Front',
        llegada: fechaLlegadaGlobal,
        salida: fechaSalidaGlobal,
        noches: nochesEstancia,
        adultos: adultosGlobal,
        ninos: ninosGlobal,
        metodo: metodoPago,
        terminacion: terminacion,
        desglose: desgloseFinanciero,
        requiereFactura: requiereFactura,
        datosFactura: datosFactura
      });

      setModalVoucherAbierto(true);
    } catch (err) {
      setErrorPago(err.message || 'Error al conectar con SQL Server.');
    } finally {
      setProcesandoPago(false);
    }
  };

  const suitesFiltradas = useMemo(() => {
    return suites.filter(s => {
      const matchCat = categoriaSeleccionada === 'TODAS' || s.categoria === categoriaSeleccionada;
      const matchPrecio = Number(s.precio_noche_base) <= precioMaximo;
      const matchBusqueda = s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            s.descripcion.toLowerCase().includes(busqueda.toLowerCase());

      let matchAmenidad = true;
      if (filtroAmenidad === 'SWIM_UP') matchAmenidad = s.nombre.toLowerCase().includes('swim up') || (s.vista_tipo && s.vista_tipo.toLowerCase().includes('alberca'));
      if (filtroAmenidad === 'JACUZZI') matchAmenidad = (s.detalles_bano && s.detalles_bano.toLowerCase().includes('jacuzzi')) || (s.amenidades_destacadas && s.amenidades_destacadas.toLowerCase().includes('jacuzzi'));
      if (filtroAmenidad === 'GRAND_CLUB') matchAmenidad = s.categoria.toLowerCase().includes('grand club') || s.nombre.toLowerCase().includes('grand club');

      return matchCat && matchPrecio && matchBusqueda && matchAmenidad;
    });
  }, [suites, categoriaSeleccionada, precioMaximo, busqueda, filtroAmenidad]);

  return (
    <div style={{ backgroundColor: '#060508', minHeight: '100vh', color: '#ffffff', padding: '8rem 2rem 5rem', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto' }}>

        {/* BREADCRUMB */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'catalogo', label: '1. Catálogo & Fechas' },
            { id: 'personalizar', label: '2. Personalizar Suite' },
            { id: 'pago', label: '3. Garantía & Pago' },
            { id: 'exito', label: '4. Confirmación' }
          ].map((st) => (
            <div 
              key={st.id}
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: etapaFlujo === st.id ? '#d4af37' : '#64748b',
                borderBottom: etapaFlujo === st.id ? '2px solid #d4af37' : '2px solid transparent',
                paddingBottom: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {st.label}
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            FASE 1: CATÁLOGO CON SQL SERVER COMPLETO
        ══════════════════════════════════════════════════════════ */}
        {etapaFlujo === 'catalogo' && (
          <div>
            <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ fontSize: '0.74rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 800 }}>
                Colección de Hospedaje • 618 Llaves Físicas
              </span>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', color: '#f3e5ab', margin: '0.4rem 0 0.8rem 0' }}>
                Suites Frente al Mar & Jardines Privados
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.94rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
                Fichas técnicas con transparencia arquitectónica, inventario oficial en tiempo real y comodidades de clase mundial.
              </p>
            </header>

            {/* BARRA UNIFICADA DE FECHAS */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(20, 18, 30, 0.95), rgba(12, 10, 18, 0.98))',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '8px',
              padding: '1.4rem 1.8rem',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              alignItems: 'end',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)'
            }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d4af37', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <Calendar size={14} /> Fecha de Llegada
                </label>
                <input 
                  type="date"
                  min={hoyISO}
                  value={fechaLlegadaGlobal}
                  onChange={(e) => {
                    setFechaLlegadaGlobal(e.target.value);
                    if (e.target.value >= fechaSalidaGlobal) {
                      const d = new Date(e.target.value);
                      d.setDate(d.getDate() + 1);
                      setFechaSalidaGlobal(d.toISOString().substring(0, 10));
                    }
                  }}
                  style={{ width: '100%', background: '#0e0c15', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0.7rem 0.8rem', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d4af37', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <Calendar size={14} /> Fecha de Salida
                </label>
                <input 
                  type="date"
                  min={fechaLlegadaGlobal}
                  value={fechaSalidaGlobal}
                  onChange={(e) => setFechaSalidaGlobal(e.target.value)}
                  style={{ width: '100%', background: '#0e0c15', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0.7rem 0.8rem', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d4af37', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <Users size={14} /> Adultos
                </label>
                <select 
                  value={adultosGlobal} 
                  onChange={(e) => setAdultosGlobal(Number(e.target.value))}
                  style={{ width: '100%', background: '#0e0c15', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0.7rem 0.8rem', color: '#fff', outline: 'none' }}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Adulto' : 'Adultos'}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d4af37', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <Users size={14} /> Niños (0-12 años)
                </label>
                <select 
                  value={ninosGlobal} 
                  onChange={(e) => setNinosGlobal(Number(e.target.value))}
                  style={{ width: '100%', background: '#0e0c15', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0.7rem 0.8rem', color: '#fff', outline: 'none' }}
                >
                  {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n === 0 ? 'Sin niños' : `${n} ${n === 1 ? 'Niño' : 'Niños'}`}</option>)}
                </select>
              </div>
            </div>

            {/* FILTROS */}
            <div style={{ background: '#110f17', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '1.2rem 1.8rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.2rem', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '0.66rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Buscar por Atributo o Nombre</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text"
                      placeholder="Ej. Swim Up, Jacuzzi, Terraza, Penthouse..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      style={{ width: '100%', background: '#161420', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '4px', padding: '0.65rem 0.8rem 0.65rem 2.2rem', color: '#fff', fontSize: '0.84rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.66rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Categoría Arquitectónica</label>
                  <select 
                    value={categoriaSeleccionada}
                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                    style={{ width: '100%', background: '#161420', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '4px', padding: '0.65rem 0.8rem', color: '#fff', fontSize: '0.84rem', outline: 'none' }}
                  >
                    <option value="TODAS">Todas las Categorías</option>
                    {Array.from(new Set(suites.map(s => s.categoria))).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <span>Tarifa Máx / Noche</span>
                    <strong style={{ color: '#f3e5ab' }}>${precioMaximo.toLocaleString('es-MX')} MXN</strong>
                  </div>
                  <input 
                    type="range"
                    min="6000"
                    max="40000"
                    step="1000"
                    value={precioMaximo}
                    onChange={(e) => setPrecioMaximo(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#d4af37', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* GRILLA DE SUITES */}
            {cargando ? (
              <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                <Loader2 size={40} className="animate-spin" color="#d4af37" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2.5rem' }}>
                {suitesFiltradas.map(suite => {
                  const excesoCapacidad = adultosGlobal > (suite.capacidad_adultos || 3) || ninosGlobal > (suite.capacidad_ninos || 2);
                  const amenidadesLista = (suite.amenidades_destacadas || '').split(',').map(a => a.trim()).filter(Boolean);

                  return (
                    <article 
                      key={suite.suite_id}
                      style={{
                        background: 'linear-gradient(165deg, rgba(20, 18, 28, 0.95) 0%, rgba(12, 10, 18, 0.98) 100%)',
                        border: '1px solid rgba(196, 181, 253, 0.18)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.85)'
                      }}
                    >
                      {/* FOTO & BADGES */}
                      <div style={{ height: '230px', position: 'relative' }}>
                        <img src={suite.foto_principal} alt={suite.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(6, 5, 8, 0.88)', border: '1px solid #d4af37', color: '#f3e5ab', fontSize: '0.68rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {suite.categoria}
                        </span>
                        <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.92)', border: '1px solid #22c55e', color: '#86efac', fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                          {suite.inventario_disponible ?? suite.inventario_total} de {suite.inventario_total} disponibles
                        </span>
                      </div>

                      <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>{suite.nombre}</h3>
                        
                        {/* BADGES TÉCNICOS DESDE SQL SERVER */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.74rem', color: '#cbd5e1', margin: '0.4rem 0 0.8rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Maximize2 size={13} color="#d4af37" />
                            <span><strong>{suite.metros_cuadrados || 52} m²</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <BedDouble size={13} color="#c4b5fd" />
                            <span>{suite.tipo_cama || '1 King o 2 Dobles'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Waves size={13} color="#38bdf8" />
                            <span>{suite.vista_tipo || 'Vista al Mar'}</span>
                          </div>
                        </div>

                        {/* CHIPS DE AMENIDADES DESTACADAS */}
                        {amenidadesLista.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.9rem' }}>
                            {amenidadesLista.slice(0, 3).map((am, i) => (
                              <span key={i} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#f3e5ab', fontSize: '0.66rem', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Check size={10} color="#d4af37" /> {am}
                              </span>
                            ))}
                          </div>
                        )}

                        <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6, flexGrow: 1, marginBottom: '1.2rem' }}>{suite.descripcion}</p>

                        {/* AFORO & ALERTA */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '0.8rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Users size={13} color="#d4af37" /> Aforo Máximo: {suite.capacidad_adultos} Adultos {suite.capacidad_ninos > 0 ? `• ${suite.capacidad_ninos} Niños` : ''}
                          </span>
                          {excesoCapacidad && (
                            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.7rem' }}>Aforo Excedido</span>
                          )}
                        </div>

                        {/* PRECIO */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.9rem' }}>
                          <div>
                            <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: '#64748b', display: 'block' }}>Tarifa All-Inclusive Desde</span>
                            <strong style={{ fontSize: '1.6rem', color: '#f3e5ab', fontWeight: 800 }}>${Number(suite.precio_noche_base).toLocaleString('es-MX')}</strong>
                            <small style={{ color: '#cbd5e1', marginLeft: '4px', fontSize: '0.74rem' }}>MXN / Noche</small>
                          </div>
                        </div>

                        {/* BOTONERA DUAL */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '0.8rem' }}>
                          <button 
                            type="button" 
                            onClick={() => {
                              setSuiteFichaModal(suite);
                              setFotoModalIndex(0);
                              setPestanaActiva('confort');
                            }}
                            style={{
                              background: 'rgba(20, 18, 28, 0.95)',
                              border: '1px solid rgba(212, 175, 55, 0.45)',
                              color: '#f3e5ab',
                              padding: '0.75rem',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <Eye size={14} /> Ficha Técnica
                          </button>

                          <button 
                            type="button" 
                            disabled={excesoCapacidad || Number(suite.inventario_disponible) <= 0}
                            onClick={() => iniciarReservaSuite(suite)}
                            style={{
                              background: (excesoCapacidad || Number(suite.inventario_disponible) <= 0) ? '#27272a' : 'linear-gradient(135deg, #d4af37, #aa8212)',
                              color: (excesoCapacidad || Number(suite.inventario_disponible) <= 0) ? '#71717a' : '#060508',
                              border: 'none',
                              padding: '0.75rem',
                              borderRadius: '4px',
                              fontWeight: 800,
                              fontSize: '0.74rem',
                              letterSpacing: '1px',
                              textTransform: 'uppercase',
                              cursor: (excesoCapacidad || Number(suite.inventario_disponible) <= 0) ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            {Number(suite.inventario_disponible) <= 0 ? 'Agotada' : (excesoCapacidad ? 'Revisar Huéspedes' : 'Reservar Suite')} <ArrowRight size={14} />
                          </button>
                        </div>

                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            MODAL DE FICHA TÉCNICA Y ARQUITECTURA (SQL SERVER COMPLETO)
        ══════════════════════════════════════════════════════════ */}
        {suiteFichaModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(6, 5, 8, 0.94)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ background: '#110f17', border: '1px solid #d4af37', borderRadius: '12px', width: '100%', maxWidth: '1060px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.98)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              
              <button 
                type="button" 
                onClick={() => setSuiteFichaModal(null)} 
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffffff', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>

              {/* Carrusel Dinámico con Soporte de Objetos o Strings */}
              {(() => {
                const fotosModal = getFotosSuite(suiteFichaModal);
                const fotoActual = fotosModal[fotoModalIndex] || fotosModal[0];
                return (
                  <div style={{ height: '390px', position: 'relative', background: '#000', flexShrink: 0 }}>
                    <img src={fotoActual.url} alt={fotoActual.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {fotosModal.length > 1 && (
                      <>
                        <button onClick={() => setFotoModalIndex((prev) => (prev === 0 ? fotosModal.length - 1 : prev - 1))} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.65)', border: '1px solid #d4af37', color: '#fff', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ChevronLeft size={22} />
                        </button>
                        <button onClick={() => setFotoModalIndex((prev) => (prev === fotosModal.length - 1 ? 0 : prev + 1))} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.65)', border: '1px solid #d4af37', color: '#fff', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ChevronRight size={22} />
                        </button>
                      </>
                    )}
                    <div style={{ position: 'absolute', bottom: '16px', left: '20px', background: 'rgba(0,0,0,0.75)', padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem', color: '#f3e5ab', border: '1px solid rgba(212,175,55,0.4)' }}>
                      <strong>{fotoActual.titulo}</strong>
                    </div>
                    <div style={{ position: 'absolute', bottom: '16px', right: '20px', background: 'rgba(0,0,0,0.75)', padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.74rem', color: '#f3e5ab', border: '1px solid #d4af37' }}>
                      Foto {fotoModalIndex + 1} de {fotosModal.length}
                    </div>
                  </div>
                );
              })()}

              <div style={{ padding: '2.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.8rem' }}>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: '#f3e5ab', margin: 0 }}>
                    {suiteFichaModal.nombre}
                  </h2>
                  <span style={{ color: '#d4af37', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
                    {suiteFichaModal.categoria}
                  </span>
                </div>

                {/* Resumen Arquitectónico */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', background: '#161420', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.25)', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <div><strong style={{ color: '#d4af37' }}>Superficie:</strong> {suiteFichaModal.metros_cuadrados} m²</div>
                  <div><strong style={{ color: '#d4af37' }}>Cama:</strong> {suiteFichaModal.tipo_cama}</div>
                  <div><strong style={{ color: '#d4af37' }}>Orientación:</strong> {suiteFichaModal.vista_tipo}</div>
                  <div><strong style={{ color: '#d4af37' }}>Capacidad:</strong> Hasta {suiteFichaModal.capacidad_adultos} Adultos / {suiteFichaModal.capacidad_ninos} Niños</div>
                </div>

                {/* Pestañas Arquitectónicas */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(212,175,55,0.3)', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {[
                    { id: 'confort', label: 'Confort & Descanso', icon: <Moon size={15} /> },
                    { id: 'bano', label: 'Baño Spa & Mármol', icon: <Bath size={15} /> },
                    { id: 'tecnologia', label: 'Tecnología & Conectividad', icon: <Tv size={15} /> },
                    { id: 'servicios', label: 'Servicios Todo Incluido', icon: <ConciergeBell size={15} /> },
                    { id: 'politicas', label: 'Políticas & Estancia', icon: <FileText size={15} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPestanaActiva(tab.id)}
                      style={{
                        background: pestanaActiva === tab.id ? 'rgba(212,175,55,0.15)' : 'transparent',
                        border: 'none',
                        borderBottom: pestanaActiva === tab.id ? '2px solid #d4af37' : '2px solid transparent',
                        color: pestanaActiva === tab.id ? '#f3e5ab' : '#94a3b8',
                        padding: '0.65rem 1rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Contenido Dinámico de la Base de Datos */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '2rem' }}>
                  {pestanaActiva === 'confort' && (
                    <div>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>Confort Ergonómico & Descanso de Alta Gama</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.8 }}>
                        {suiteFichaModal.detalles_confort || 'Colchón Sealy Posturepedic® Plush King Size, sábanas de 400 hilos de algodón egipcio y cortinas motorizadas Blackout.'}
                      </p>
                    </div>
                  )}

                  {pestanaActiva === 'bano' && (
                    <div>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>Cuarto de Baño Spa & Acabados de Mármol</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.8 }}>
                        {suiteFichaModal.detalles_bano || 'Tina exenta de inmersión profunda, mármol Carrara pulido, regadera de lluvia presurizada y amenidades botánicas francesas L’Occitane.'}
                      </p>
                    </div>
                  )}

                  {pestanaActiva === 'tecnologia' && (
                    <div>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>Tecnología, Domótica & Conectividad</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.8 }}>
                        {suiteFichaModal.detalles_tecnologia || 'Smart TV Ultra HD 4K de 65", sistema de audio Bluetooth JBL®, cerradura electrónica RFID y Wi-Fi 6 dedicado.'}
                      </p>
                    </div>
                  )}

                  {pestanaActiva === 'servicios' && (
                    <div>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>Servicios de Hospitalidad Incluidos</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.8 }}>
                        {suiteFichaModal.servicios_incluidos || 'Room service gourmet 24/7, minibar premium diario, mayordomo de solarium y amenidades de bienvenida.'}
                      </p>
                    </div>
                  )}

                  {pestanaActiva === 'politicas' && (
                    <div>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>Normativa Oficial de Ocupación</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.8 }}>
                        {suiteFichaModal.politica_suite || 'Check-in oficial: 15:00 hrs | Check-out: 12:00 hrs. Espacio 100% libre de humo de tabaco.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pie del Modal: Continuar al Flujo de Personalización */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(212,175,55,0.35)', paddingTop: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>Tarifa Oficial por Noche</span>
                    <strong style={{ fontSize: '1.8rem', color: '#f3e5ab', fontWeight: 800 }}>
                      ${Number(suiteFichaModal.precio_noche_base).toLocaleString('es-MX')} MXN
                    </strong>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => iniciarReservaSuite(suiteFichaModal)}
                    style={{ background: 'linear-gradient(135deg, #d4af37, #aa8212)', color: '#060508', border: 'none', padding: '0.85rem 2.2rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.84rem', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Personalizar y Reservar Suite <ArrowRight size={15} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            LAYOUT EN 2 COLUMNAS PARA FASES 2 (PERSONALIZAR) Y 3 (PAGO)
        ══════════════════════════════════════════════════════════ */}
        {(etapaFlujo === 'personalizar' || etapaFlujo === 'pago') && suiteSeleccionada && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2.5rem', alignItems: 'start' }}>
            
            {/* COLUMNA IZQUIERDA */}
            <div>
              {etapaFlujo === 'personalizar' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setEtapaFlujo('catalogo')}
                      style={{ background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <ArrowLeft size={15} /> Volver al Catálogo
                    </button>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', margin: 0 }}>
                      Personaliza tu Estancia en {suiteSeleccionada.nombre}
                    </h2>
                  </div>

                  {/* Menú de Almohadas */}
                  <div style={{ background: '#110f17', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '1.8rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#d4af37', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <Moon size={16} /> Menú de Almohadas & Descanso Ergonómico
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      {['Plumas de Ganso Hipoalergénica', 'Memory Foam Ortopédica', 'Gel Refrescante Cervical', 'Lavanda & Manzanilla Relax'].map(alm => (
                        <label key={alm} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: almohadaElegida === alm ? 'rgba(212,175,55,0.15)' : '#161420', border: almohadaElegida === alm ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)', padding: '0.9rem', borderRadius: '6px', cursor: 'pointer' }}>
                          <input type="radio" name="almohada" checked={almohadaElegida === alm} onChange={() => setAlmohadaElegida(alm)} />
                          <span style={{ fontSize: '0.82rem' }}>{alm}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Servicios Adicionales */}
                  <div style={{ background: '#110f17', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '1.8rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#d4af37', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <Sparkles size={16} /> Experiencias Exclusivas & Add-ons
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[
                        { key: 'transportePrivado', label: 'Transportación Privada Aeropuerto - Hotel (Suburban Luxury)', precio: 1850 },
                        { key: 'masajePareja', label: 'Ritual de Masaje Haab Spa en Pareja (80 minutos)', precio: 3400 },
                        { key: 'cenaRomanticaPlaya', label: 'Cena Privada a 4 Tiempos en la Playa con Antorchas', precio: 4200 },
                        { key: 'cavaPremiumVino', label: 'Botella de Moët & Chandon y Cava de Bienvenida', precio: 1950 },
                        { key: 'checkInTemprano', label: 'Early Check-In Garantizado desde las 10:00 hrs', precio: 950 }
                      ].map(srv => (
                        <label key={srv.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161420', padding: '1rem', borderRadius: '6px', border: serviciosAdicionales[srv.key] ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <input 
                              type="checkbox" 
                              checked={serviciosAdicionales[srv.key]} 
                              onChange={(e) => setServiciosAdicionales({ ...serviciosAdicionales, [srv.key]: e.target.checked })} 
                            />
                            <span style={{ fontSize: '0.86rem', color: '#fff' }}>{srv.label}</span>
                          </div>
                          <strong style={{ color: '#f3e5ab', fontSize: '0.9rem' }}>+${srv.precio.toLocaleString('es-MX')} MXN</strong>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => { setEtapaFlujo('pago'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{ width: '100%', height: '52px', background: 'linear-gradient(135deg, #d4af37, #aa8212)', color: '#060508', border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    Continuar a Garantía & Pago <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {etapaFlujo === 'pago' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setEtapaFlujo('personalizar')}
                      style={{ background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <ArrowLeft size={15} /> Volver a Personalizar
                    </button>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', margin: 0 }}>
                      Garantía & Pago
                    </h2>
                  </div>

                  {errorPago && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <AlertCircle size={18} /> {errorPago}
                    </div>
                  )}

                  <form onSubmit={handleEjecutarLiquidacion}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.8rem' }}>
                      <div 
                        onClick={() => setMetodoPago('tarjeta')}
                        style={{ background: metodoPago === 'tarjeta' ? 'rgba(212,175,55,0.12)' : '#110f17', border: metodoPago === 'tarjeta' ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.1)', padding: '1.2rem', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <CreditCard size={22} color="#d4af37" />
                        <strong style={{ display: 'block', margin: '0.4rem 0 0.1rem', fontSize: '0.9rem' }}>Tarjeta Bancaria</strong>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Visa, MC, American Express</span>
                      </div>

                      <div 
                        onClick={() => setMetodoPago('spei_oxxo')}
                        style={{ background: metodoPago === 'spei_oxxo' ? 'rgba(212,175,55,0.12)' : '#110f17', border: metodoPago === 'spei_oxxo' ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.1)', padding: '1.2rem', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <QrCode size={22} color="#38bdf8" />
                        <strong style={{ display: 'block', margin: '0.4rem 0 0.1rem', fontSize: '0.9rem' }}>Centros de Servicio / SPEI</strong>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>OXXO, 7-Eleven, Transferencia</span>
                      </div>
                    </div>

                    {metodoPago === 'tarjeta' ? (
                      <div style={{ background: '#110f17', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '1.8rem', marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1.2rem' }}>
                          <label style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Nombre del Titular</label>
                          <input 
                            type="text" 
                            required 
                            value={datosTarjeta.titular} 
                            onChange={(e) => setDatosTarjeta({ ...datosTarjeta, titular: e.target.value })} 
                            style={{ width: '100%', height: '46px', background: '#161420', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#fff' }} 
                          />
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                          <label style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Número de Tarjeta (16 dígitos)</label>
                          <input 
                            type="text" 
                            required 
                            maxLength="19" 
                            value={datosTarjeta.numero} 
                            onChange={(e) => setDatosTarjeta({ ...datosTarjeta, numero: e.target.value })} 
                            style={{ width: '100%', height: '46px', background: '#161420', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#fff' }} 
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Expiración (MM/AA)</label>
                            <input type="text" required maxLength="5" value={datosTarjeta.expiracion} onChange={(e) => setDatosTarjeta({ ...datosTarjeta, expiracion: e.target.value })} style={{ width: '100%', height: '46px', background: '#161420', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#fff' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>CVV</label>
                            <input type="password" required maxLength="4" value={datosTarjeta.cvv} onChange={(e) => setDatosTarjeta({ ...datosTarjeta, cvv: e.target.value })} style={{ width: '100%', height: '46px', background: '#161420', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#fff' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Meses sin Intereses</label>
                            <select value={datosTarjeta.msi} onChange={(e) => setDatosTarjeta({ ...datosTarjeta, msi: e.target.value })} style={{ width: '100%', height: '46px', background: '#161420', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#fff' }}>
                              <option value="1">1 Pago Único (PUE)</option>
                              <option value="3">3 Meses sin Intereses</option>
                              <option value="6">6 Meses sin Intereses</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#110f17', border: '1px dashed #38bdf8', borderRadius: '8px', padding: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
                        <QrCode size={42} color="#38bdf8" style={{ margin: '0 auto 0.8rem' }} />
                        <h4 style={{ color: '#f3e5ab', fontSize: '1.1rem', margin: '0 0 0.4rem' }}>Ficha de Pago en Tiendas de Conveniencia / SPEI</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 auto' }}>
                          Al confirmar, se emitirá una línea de captura para pagar en OXXO, 7-Eleven o transferencia con vigencia de 48 hrs.
                        </p>
                      </div>
                    )}

                    {/* MÓDULO CFDI 4.0 SAT */}
                    <div style={{ background: '#110f17', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '8px', padding: '1.4rem 1.8rem', marginBottom: '2rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: requiereFactura ? '1.2rem' : '0' }}>
                        <input 
                          type="checkbox" 
                          checked={requiereFactura} 
                          onChange={(e) => setRequiereFactura(e.target.checked)} 
                        />
                        <span style={{ fontSize: '0.86rem', color: '#f3e5ab', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <ReceiptText size={16} color="#d4af37" /> ¿Requiere Factura Fiscal Mexicana (CFDI 4.0)?
                        </span>
                      </label>

                      {requiereFactura && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>RFC Receptor*</label>
                            <input type="text" required value={datosFactura.rfc} onChange={(e) => setDatosFactura({ ...datosFactura, rfc: e.target.value.toUpperCase() })} style={{ width: '100%', height: '42px', background: '#161420', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#fff' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Razón Social*</label>
                            <input type="text" required value={datosFactura.razonSocial} onChange={(e) => setDatosFactura({ ...datosFactura, razonSocial: e.target.value })} style={{ width: '100%', height: '42px', background: '#161420', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#fff' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Código Postal Fiscal*</label>
                            <input type="text" required maxLength="5" value={datosFactura.codigoPostal} onChange={(e) => setDatosFactura({ ...datosFactura, codigoPostal: e.target.value })} style={{ width: '100%', height: '42px', background: '#161420', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#fff' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Uso de CFDI*</label>
                            <select value={datosFactura.usoCFDI} onChange={(e) => setDatosFactura({ ...datosFactura, usoCFDI: e.target.value })} style={{ width: '100%', height: '42px', background: '#161420', border: '1px solid rgba(196,181,253,0.25)', borderRadius: '4px', padding: '0 0.8rem', color: '#fff' }}>
                              <option value="G03 - Gastos en general">G03 - Gastos en general</option>
                              <option value="CP01 - Pagos">CP01 - Pagos</option>
                              <option value="S01 - Sin efectos fiscales">S01 - Sin efectos fiscales</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={procesandoPago}
                      style={{
                        width: '100%',
                        height: '54px',
                        background: 'linear-gradient(135deg, #d4af37, #aa8212)',
                        color: '#060508',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 900,
                        fontSize: '0.92rem',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(212,175,55,0.4)'
                      }}
                    >
                      {procesandoPago ? 'Procesando en SQL Server...' : `Liquidar y Confirmar $${desgloseFinanciero.totalLiquidacion.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: STICKY SUMMARY */}
            <aside style={{ position: 'sticky', top: '7.5rem', background: '#110f17', border: '1px solid #d4af37', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.85)' }}>
              <div style={{ height: '160px', position: 'relative' }}>
                <img src={suiteSeleccionada.foto_principal} alt={suiteSeleccionada.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(6,5,8,0.85)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.68rem', color: '#f3e5ab', fontWeight: 700, border: '1px solid #d4af37' }}>
                  {suiteSeleccionada.categoria}
                </span>
              </div>

              <div style={{ padding: '1.4rem' }}>
                <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#fff', margin: '0 0 0.8rem' }}>{suiteSeleccionada.nombre}</h4>

                <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.6, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                  <div><strong>Llegada:</strong> {fechaLlegadaGlobal}</div>
                  <div><strong>Salida:</strong> {fechaSalidaGlobal} ({nochesEstancia} Noches)</div>
                  <div><strong>Huéspedes:</strong> {adultosGlobal} Adultos {ninosGlobal > 0 ? `• ${ninosGlobal} Niños` : ''}</div>
                  <div><strong>Almohada:</strong> {almohadaElegida}</div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.8, marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Hospedaje ({nochesEstancia} Noches):</span>
                    <span>${desgloseFinanciero.baseHospedaje.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {desgloseFinanciero.totalExtras > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                      <span>Servicios Extras:</span>
                      <span>+${desgloseFinanciero.totalExtras.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>IVA (16%):</span>
                    <span>${desgloseFinanciero.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>ISH Estatal (5%):</span>
                    <span>${desgloseFinanciero.ish.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Saneamiento Ambiental:</span>
                    <span>${desgloseFinanciero.saneamiento.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(212,175,55,0.4)', paddingTop: '0.9rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Liquidado:</span>
                  <strong style={{ fontSize: '1.35rem', color: '#f3e5ab' }}>${desgloseFinanciero.totalLiquidacion.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                </div>

                <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px dashed #d4af37', padding: '0.65rem 0.8rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: '#f3e5ab' }}>
                  <Gift size={15} color="#d4af37" />
                  <span>Acumulas <strong>+{desgloseFinanciero.puntosFiestaRewards} pts</strong> Fiesta Rewards</span>
                </div>
              </div>
            </aside>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            FASE 4: PANTALLA FINAL DE ÉXITO
        ══════════════════════════════════════════════════════════ */}
        {etapaFlujo === 'exito' && voucherData && (
          <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center', background: '#110f17', border: '1px solid #d4af37', borderRadius: '12px', padding: '3.5rem 2rem' }}>
            <CheckCircle2 size={68} color="#22c55e" style={{ margin: '0 auto 1.5rem' }} />
            <span style={{ fontSize: '0.78rem', color: '#d4af37', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 800 }}>¡Transacción Garantizada!</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', color: '#f3e5ab', margin: '0.5rem 0 1rem' }}>Reserva Realizada con Éxito</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
              Tu estancia en <strong>{voucherData.suite}</strong> ha quedado registrada en los libros oficiales de Grand Fiesta Americana Riviera Cancún.
            </p>

            <div style={{ background: '#161420', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '1.2rem', marginBottom: '2.5rem', display: 'inline-block' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>FOLIO OFICIAL EMITIDO:</span>
              <strong style={{ fontSize: '1.6rem', color: '#f3e5ab', letterSpacing: '2px' }}>{voucherData.folio}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
              <button 
                type="button" 
                onClick={() => setModalVoucherAbierto(true)}
                style={{ background: '#161420', border: '1px solid #d4af37', color: '#f3e5ab', padding: '1rem', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Printer size={16} /> Reabrir Voucher Oficial
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/perfil-socio')}
                style={{ background: 'linear-gradient(135deg, #d4af37, #aa8212)', border: 'none', color: '#060508', padding: '1rem', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
              >
                Ir a Mi Perfil de Socio →
              </button>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => {
                  setEtapaFlujo('catalogo');
                  setSuiteSeleccionada(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.86rem' }}
              >
                ← Volver a Reservar otra Suite
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════
          VENTANA EMERGENTE (MODAL): VOUCHER OFICIAL IMPRIMIBLE
      ══════════════════════════════════════════════════════════ */}
      {modalVoucherAbierto && voucherData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: '#0e0c15', border: '1px solid #d4af37', borderRadius: '12px', width: '100%', maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto', padding: '2.5rem', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.95)' }}>
            
            <button 
              type="button" 
              onClick={() => { setModalVoucherAbierto(false); setEtapaFlujo('exito'); }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}
            >
              ✕
            </button>

            {/* Cabecera Voucher */}
            <div style={{ borderBottom: '2px solid #d4af37', paddingBottom: '1.2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#f3e5ab', margin: 0 }}>Grand Fiesta Americana</h3>
                <span style={{ color: '#d4af37', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Riviera Cancún Resort & Spa</span>
                <p style={{ color: '#94a3b8', fontSize: '0.74rem', margin: '0.3rem 0 0' }}>Grupo Posadas • Carretera Cancún-Tulum Km 335, Q. Roo, CP 77580</p>
              </div>
              <div style={{ textAlign: 'right', background: '#161420', border: '1px solid rgba(212,175,55,0.4)', padding: '0.6rem 1rem', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.66rem', color: '#d4af37', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Folio de Confirmación</span>
                <strong style={{ fontSize: '1.3rem', color: '#fff', letterSpacing: '1px' }}>{voucherData.folio}</strong>
              </div>
            </div>

            {/* Matriz de Datos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#14121a', padding: '1.2rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
              <div><strong style={{ color: '#d4af37', display: 'block' }}>Huésped Titular:</strong> {voucherData.titular}</div>
              <div><strong style={{ color: '#d4af37', display: 'block' }}>Suite Asignada:</strong> {voucherData.suite}</div>
              <div><strong style={{ color: '#d4af37', display: 'block' }}>Check-in:</strong> {voucherData.llegada} (15:00 hrs)</div>
              <div><strong style={{ color: '#d4af37', display: 'block' }}>Check-out:</strong> {voucherData.salida} (12:00 hrs)</div>
              <div><strong style={{ color: '#d4af37', display: 'block' }}>Estancia:</strong> {voucherData.noches} Noche(s)</div>
              <div><strong style={{ color: '#d4af37', display: 'block' }}>Aforo:</strong> {voucherData.adultos} Adulto(s) {voucherData.ninos > 0 ? `• ${voucherData.ninos} Niño(s)` : ''}</div>
              {voucherData.requiereFactura && (
                <div style={{ gridColumn: '1 / -1', background: 'rgba(212,175,55,0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px dashed #d4af37' }}>
                  <strong style={{ color: '#d4af37' }}>CFDI 4.0 Solicitado:</strong> RFC {voucherData.datosFactura.rfc} ({voucherData.datosFactura.razonSocial})
                </div>
              )}
            </div>

            {/* Desglose Tributario */}
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', marginBottom: '1.5rem', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0' }}>Concepto</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Importe (MXN)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.5rem 0' }}>Estancia Base + Personalizaciones</td>
                  <td style={{ textAlign: 'right' }}>${voucherData.desglose.subtotalBruto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.5rem 0' }}>Impuesto al Valor Agregado (IVA 16%)</td>
                  <td style={{ textAlign: 'right' }}>${voucherData.desglose.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.5rem 0' }}>Impuesto Sobre Hospedaje (ISH 5%)</td>
                  <td style={{ textAlign: 'right' }}>${voucherData.desglose.ish.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.5rem 0' }}>Derecho de Saneamiento Ambiental</td>
                  <td style={{ textAlign: 'right' }}>${voucherData.desglose.saneamiento.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.8rem 0', fontWeight: 800, color: '#f3e5ab' }}>TOTAL GENERAL LIQUIDADO:</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#f3e5ab', fontSize: '1.2rem' }}>${voucherData.desglose.totalLiquidacion.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</td>
                </tr>
              </tbody>
            </table>

            {/* Código QR e Instrucciones */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#161420', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${voucherData.folio}&color=060508`}
                alt="QR Validación"
                style={{ width: '85px', height: '85px', background: '#fff', padding: '4px', borderRadius: '4px' }}
              />
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
                <strong style={{ color: '#22c55e', display: 'block', marginBottom: '0.2rem' }}>● Reserva Afianzada en SQL Server</strong>
                Presenta este comprobante digital o impreso al presentarte en recepción. Acceso directo con llave móvil RFID.
              </div>
            </div>

            {/* Botones del Modal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={() => window.print()}
                style={{ background: '#1e1a28', border: '1px solid #d4af37', color: '#f3e5ab', padding: '0.85rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Printer size={15} /> Imprimir Voucher
              </button>

              <button 
                type="button" 
                onClick={() => { setModalVoucherAbierto(false); setEtapaFlujo('exito'); }}
                style={{ background: 'linear-gradient(135deg, #d4af37, #aa8212)', border: 'none', color: '#060508', padding: '0.85rem', borderRadius: '6px', fontWeight: 900, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Confirmar y Cerrar Resumen
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Login Socio */}
      <LoginModal 
        isOpen={modalLoginAbierto}
        onClose={() => setModalLoginAbierto(false)}
        onLoginSuccess={() => {
          setModalLoginAbierto(false);
          if (suitePendienteReserva) {
            iniciarReservaSuite(suitePendienteReserva);
          }
        }}
      />

      {/* Toast */}
      {toastNotif && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999999, background: '#110f17', border: '1px solid #d4af37', borderLeft: '4px solid #ef4444', borderRadius: '6px', padding: '1rem 1.4rem', color: '#fff', fontSize: '0.85rem', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          {toastNotif}
        </div>
      )}

    </div>
  );
}