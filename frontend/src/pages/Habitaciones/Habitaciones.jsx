import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchSuites } from '../../services/api';
import {
  Users, Bed, Maximize2, Calendar, ShieldAlert, ArrowRight, X,
  ChevronLeft, ChevronRight, AlertCircle, Award, CheckCircle2,
  Clock, MapPin, Sparkles, Waves, Utensils, Wifi, Star, Heart,
  Share2, Tag, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Check
} from 'lucide-react';
import './Habitaciones.css';
import './Habitaciones.mobile.css';

const PLANES_TARIFARIOS = [
  {
    id: 'no_reembolsable',
    disponibilidadId: 'FIESTA_REWARDS',
    nombre: 'Tarifa Anticipada Socio',
    multiplicador: 0.90,
    badge: 'AHORRO EXTRA -10%',
    beneficios: ['All-Inclusive Gourmet 24h', 'Pago inmediato requerido', 'No permite cambios']
  },
  {
    id: 'flexible',
    disponibilidadId: 'FLEXIBLE',
    nombre: 'Tarifa Flexible All-Inclusive',
    multiplicador: 1.00,
    badge: 'MÁS ELEGIDA',
    beneficios: ['Cancelación gratis hasta 24h antes', 'Sin pago por adelantado', 'All-Inclusive Gourmet 24h']
  },
  {
    id: 'signature_spa',
    disponibilidadId: 'PAQUETE_VIP',
    nombre: 'Experiencia Signature Cava & Spa',
    multiplicador: 1.18,
    badge: 'EXPERIENCIA VIP',
    beneficios: ['Circuito hidroterapia Feel Harmony Spa', 'Cena maridaje privada', 'Cancelación gratuita incluida']
  }
];

const FAQS_RESORT = [
  {
    q: '¿Qué incluye el concepto Grand All-Inclusive Luxury en todas las suites?',
    a: 'Incluye acceso ilimitado a nuestros 8 restaurantes de especialidad sin necesidad de brazalete, mixología premium de autor, servicio a la suite las 24 horas, minibar resurtido diariamente y actividades acuáticas no motorizadas.'
  },
  {
    q: '¿Cómo se aplica mi descuento de Socio Titanium Privilege?',
    a: 'Al mantener activo el interruptor de Tarifa Preferencial Socio Titanium (-20%), el sistema calcula automáticamente el descuento directo sobre la tarifa pública y acumula puntos Fiesta Rewards adicionales.'
  },
  {
    q: '¿Cuál es el horario oficial de Check-in y Check-out?',
    a: 'El Check-in inicia a las 15:00 hrs y el Check-out es a las 12:00 hrs. Los socios nivel Titanium Privilege cuentan con Early Check-in y Late Check-out cortesía sujetos a disponibilidad.'
  },
  {
    q: '¿Cuentan con suites exclusivas para adultos?',
    a: 'Sí, nuestras categorías Swim-Up y Master Suite Ocean Front cuentan con acceso exclusivo para mayores de 18 años, alberca privada y servicio de mayordomo dedicado.'
  }
];

export default function Habitaciones() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state || {};

  // 1. Estados de catálogo SQL Server
  const [suites, setSuites] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // 2. Barra de búsqueda y huéspedes
  const [fechaLlegada, setFechaLlegada] = useState(stateData.fecha_llegada || '2026-12-01');
  const [fechaSalida, setFechaSalida] = useState(stateData.fecha_salida || '2026-12-05');
  const [adultos, setAdultos] = useState(Number(stateData.adultos) || 2);
  const [ninos, setNinos] = useState(Number(stateData.ninos) || 0);

  // 3. Filtros rápidos tipo Booking (b_rooms_table_filters)
  const [filtroCategoria, setFiltroCategoria] = useState('*');
  const [filtroCama, setFiltroCama] = useState('*');
  const [soloCancelacionGratis, setSoloCancelacionGratis] = useState(false);
  const [soloAdultosFiltro, setSoloAdultosFiltro] = useState(false);
  const [aplicarDescuentoSocio, setAplicarDescuentoSocio] = useState(true);
  const [guardadoEnWishlist, setGuardadoEnWishlist] = useState(false);

  // 4. Tabla comparativa & Resumen lateral de selección (hp_booking_summary)
  const [vistaModo, setVistaModo] = useState('ambas'); // 'tarjetas' | 'tabla' | 'ambas'
  const [seleccionTabla, setSeleccionTabla] = useState({ suiteId: null, planId: 'flexible', cantidad: 1 });

  // 5. Modal Split-View y Acordeón FAQ
  const [suiteModal, setSuiteModal] = useState(null);
  const [tabActiva, setTabActiva] = useState('tarifas');
  const [fotoModalIndex, setFotoModalIndex] = useState(0);
  const [planSeleccionado, setPlanSeleccionado] = useState('flexible');
  const [faqAbierta, setFaqAbierta] = useState(0);
  const [seccionActivaNav, setSeccionActivaNav] = useState('vista-general');

  const suitePreseleccionadaId = stateData.suite_id_preseleccionado || null;

  useEffect(() => {
    async function cargarCatalogo() {
      try {
        setCargando(true);
        const data = await fetchSuites();
        let suitesArray = Array.isArray(data) ? data : [];
        if (suitePreseleccionadaId) {
          suitesArray = [...suitesArray].sort((a, b) =>
            a.suite_id === suitePreseleccionadaId ? -1 : b.suite_id === suitePreseleccionadaId ? 1 : 0
          );
        }
        setSuites(suitesArray);
        if (suitesArray.length > 0 && !seleccionTabla.suiteId) {
          setSeleccionTabla({ suiteId: suitesArray[0].suite_id, planId: 'flexible', cantidad: 1 });
        }
      } catch (err) {
        setError('No se pudo sincronizar el inventario desde la base de datos.');
      } finally {
        setCargando(false);
      }
    }
    cargarCatalogo();
  }, [suitePreseleccionadaId]);

  const calcularNoches = () => {
    const d1 = new Date(fechaLlegada);
    const d2 = new Date(fechaSalida);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };
  const totalNoches = calcularNoches();

  const categoriasDisponibles = ['*', ...new Set(suites.map(s => s.categoria).filter(Boolean))];

  const suitesFiltradas = suites.filter((suite) => {
    const matchCat = filtroCategoria === '*' || suite.categoria === filtroCategoria;
    const matchCama = filtroCama === '*' || (suite.tipo_cama && suite.tipo_cama.toLowerCase().includes(filtroCama.toLowerCase()));
    const matchSoloAdultos = !soloAdultosFiltro || Number(suite.capacidad_ninos) === 0;
    return matchCat && matchCama && matchSoloAdultos;
  });

  const validarAforo = (suite) => {
    const maxAdultos = Number(suite.capacidad_adultos) || 2;
    const maxNinos = Number(suite.capacidad_ninos) || 0;
    const esSoloAdultos = maxNinos === 0;

    if (esSoloAdultos && ninos > 0) return { permitido: false, motivo: 'Solo Adultos (+18)' };
    if (adultos > maxAdultos) return { permitido: false, motivo: `Máx. ${maxAdultos} Adultos` };
    if (ninos > maxNinos) return { permitido: false, motivo: `Máx. ${maxNinos} Niños` };
    return { permitido: true };
  };

  const calcularPrecioFinal = (precioBase, multiplicadorPlan = 1.0) => {
    const base = (Number(precioBase) || 6200) * multiplicadorPlan;
    return aplicarDescuentoSocio ? base * 0.80 : base;
  };

  const handleIrADisponibilidad = (suite, planObj = null) => {
    const check = validarAforo(suite);
    if (!check.permitido) return;

    const planElegido = planObj || PLANES_TARIFARIOS.find(p => p.id === planSeleccionado) || PLANES_TARIFARIOS[1];
    if (suiteModal) setSuiteModal(null);

    navigate('/disponibilidad', {
      state: {
        suite_id_preseleccionado: suite.suite_id,
        nombre_suite_preseleccionada: suite.nombre,
        fecha_llegada: fechaLlegada,
        fecha_salida: fechaSalida,
        adultos,
        ninos,
        plan_id_preseleccionado: planElegido.disponibilidadId,
        plan_tarifario: planElegido.nombre,
        precio_aplicado: calcularPrecioFinal(suite.precio_noche_base, planElegido.multiplicador)
      }
    });
  };

  const obtenerFotosSuite = (suite) => {
    if (!suite) return [];
    let lista = [];
    if (suite.galeria_fotos) {
      if (Array.isArray(suite.galeria_fotos)) lista = suite.galeria_fotos;
      else if (typeof suite.galeria_fotos === 'string') {
        try { lista = JSON.parse(suite.galeria_fotos); } catch (e) { lista = []; }
      }
    }
    const fotosNormalizadas = lista.map(item =>
      typeof item === 'string'
        ? { url: item, titulo: suite.nombre }
        : { url: item.url || suite.foto_principal, titulo: item.titulo || suite.nombre }
    );
    if (fotosNormalizadas.length === 0 && suite.foto_principal) {
      fotosNormalizadas.push({ url: suite.foto_principal, titulo: suite.nombre });
    }
    return fotosNormalizadas;
  };

  const abrirModalSuite = (suite, tabInicial = 'tarifas') => {
    setSuiteModal(suite);
    setTabActiva(tabInicial);
    setFotoModalIndex(0);
    setPlanSeleccionado('flexible');
  };

  const scrollASeccion = (id) => {
    setSeccionActivaNav(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fotosModalActual = obtenerFotosSuite(suiteModal);
  const planActualObj = PLANES_TARIFARIOS.find(p => p.id === planSeleccionado) || PLANES_TARIFARIOS[1];
  const fotosMosaicoHero = suites.slice(0, 5).map(s => ({ url: s.foto_principal, nombre: s.nombre, suite: s }));

  // Cálculo para la caja resumen lateral de la tabla
  const suiteResumenObj = suites.find(s => s.suite_id === seleccionTabla.suiteId) || suites[0];
  const planResumenObj = PLANES_TARIFARIOS.find(p => p.id === seleccionTabla.planId) || PLANES_TARIFARIOS[1];
  const precioNocheResumen = suiteResumenObj ? calcularPrecioFinal(suiteResumenObj.precio_noche_base, planResumenObj.multiplicador) : 0;
  const subtotalResumen = precioNocheResumen * totalNoches * seleccionTabla.cantidad;
  const impuestosResumen = subtotalResumen * 0.21 + (33 * totalNoches * seleccionTabla.cantidad);

  return (
    <div className="posadas-rooms-page">

      {/* 1. BARRA DE ANCLAS INTERNAS (PropertyHeaderNavDesktop) */}
      <div className="booking-subnav-sticky">
        <div className="posadas-container subnav-flex">
          <div className="subnav-links">
            <button className={seccionActivaNav === 'vista-general' ? 'active' : ''} onClick={() => scrollASeccion('vista-general')}>Vista general</button>
            <button className={seccionActivaNav === 'suites-tarifas' ? 'active' : ''} onClick={() => scrollASeccion('suites-tarifas')}>Suites y precios</button>
            <button className={seccionActivaNav === 'tabla-comparativa' ? 'active' : ''} onClick={() => scrollASeccion('tabla-comparativa')}>Comparador de tarifas</button>
            <button className={seccionActivaNav === 'servicios-resort' ? 'active' : ''} onClick={() => scrollASeccion('servicios-resort')}>Servicios del resort</button>
            <button className={seccionActivaNav === 'normas-casa' ? 'active' : ''} onClick={() => scrollASeccion('normas-casa')}>Normas y FAQ</button>
          </div>
          <div className="subnav-actions">
            <span className="price-match-tag"><Tag size={13} /> Igualamos el precio</span>
          </div>
        </div>
      </div>

      {/* 2. CABECERA + GRID ASIMÉTRICO 9/3 (MOSAICO + SIDEBAR REPUTACIÓN & UBICACIÓN) */}
      <section id="vista-general" className="resort-showcase-header">
        <div className="posadas-container">
          <div className="resort-title-bar">
            <div>
              <div className="resort-badges-line">
                <span className="diamond-pill">★★★★★ RESORT 5 DIAMANTES</span>
                <span className="all-inclusive-pill">GRAND ALL-INCLUSIVE LUXURY</span>
                <span className="sustainable-pill">🌿 Certificación Sustentable Nivel 3</span>
              </div>
              <h1 className="editorial-title" style={{ marginBottom: '0.2rem' }}>
                Grand Fiesta Americana Riviera Cancún
              </h1>
              <p className="resort-address-line">
                <MapPin size={14} color="#d4af37" />
                <span>Carretera Cancún - Tulum Km 335, Bahía Petempich, Puerto Morelos, Q. Roo</span>
                <button type="button" className="link-map-inline" onClick={() => scrollASeccion('servicios-resort')}>
                  – Ubicación excelente frente al mar
                </button>
              </p>
            </div>

            <div className="header-cta-cluster">
              <button
                type="button"
                className={`btn-icon-circle ${guardadoEnWishlist ? 'saved' : ''}`}
                onClick={() => setGuardadoEnWishlist(!guardadoEnWishlist)}
                title="Guardar en favoritos"
              >
                <Heart size={17} fill={guardadoEnWishlist ? '#d4af37' : 'none'} color="#d4af37" />
              </button>
              <button
                type="button"
                className="btn-icon-circle"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                title="Copiar enlace"
              >
                <Share2 size={17} color="#d4af37" />
              </button>
              <button type="button" className="btn-bb-search" style={{ width: 'auto' }} onClick={() => scrollASeccion('tabla-comparativa')}>
                Reserva tu suite
              </button>
            </div>
          </div>

          {/* GRID 9/3: IZQUIERDA MOSAICO 5 FOTOS | DERECHA SIDEBAR REVIEWS + UBICACIÓN */}
          <div className="hero-9-3-layout">
            <div className="hero-col-9">
              {fotosMosaicoHero.length >= 3 && (
                <div className="resort-mosaic-grid">
                  <div className="mosaic-main-photo" onClick={() => abrirModalSuite(fotosMosaicoHero[0].suite, 'confort')}>
                    <img src={fotosMosaicoHero[0].url} alt={fotosMosaicoHero[0].nombre} />
                    <span className="mosaic-caption">{fotosMosaicoHero[0].nombre}</span>
                  </div>
                  <div className="mosaic-side-grid">
                    {fotosMosaicoHero.slice(1, 5).map((item, idx) => (
                      <div key={idx} className="mosaic-sub-photo" onClick={() => abrirModalSuite(item.suite, 'confort')}>
                        <img src={item.url} alt={item.nombre} />
                        <span className="mosaic-sub-caption">
                          {idx === 3 ? `+ Ver galería (${suites.length} categorías)` : item.nombre}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR DERECHA (3 COLUMNAS COMO EN BOOKING.COM) */}
            <aside className="hero-col-3">
              <div className="sidebar-review-card">
                <div className="src-top">
                  <div>
                    <strong>Excepcional</strong>
                    <small>4,820 comentarios reales</small>
                  </div>
                  <span className="rating-score-badge">9.6</span>
                </div>

                <p className="src-quote">
                  “La vista desde la suite Ocean Front y el servicio personalizado en la cava superaron cualquier expectativa.”
                </p>
                <span className="src-author">🇲🇽 Kevin R. • Socio Titanium Privilege</span>

                <div className="src-subscores">
                  <div><span>Personal y Mayordomía</span><strong>9.9</strong></div>
                  <div><span>Limpieza y Confort</span><strong>9.8</strong></div>
                  <div><span>Ubicación frente al mar</span><strong>9.6</strong></div>
                </div>
              </div>

              <div className="sidebar-location-card">
                <div className="slc-header">
                  <MapPin size={15} color="#d4af37" />
                  <strong>Entorno Privilegiado</strong>
                </div>
                <ul className="slc-distances">
                  <li><span>Playa Bahía Petempich</span><strong>A 20 m</strong></li>
                  <li><span>Aeropuerto Int. Cancún</span><strong>18 min</strong></li>
                  <li><span>Arrecife Puerto Morelos</span><strong>10 min</strong></li>
                </ul>
              </div>
            </aside>
          </div>

          {/* BANNER DE FIDELIDAD TIPO GENIUS BENEFITS CARD */}
          <div className="titanium-genius-banner">
            <div className="tgb-left">
              <span className="tgb-emblem">FIESTA REWARDS • TITANIUM PRIVILEGE</span>
              <div>
                <h4>Tienes desbloqueado el 20% de descuento directo y beneficios VIP en este resort</h4>
                <p>Incluye tarifa preferencial en todas las suites, prioridad de upgrade y acceso al lounge ejecutivo.</p>
              </div>
            </div>
            <label className="tgb-switch-pill">
              <input
                type="checkbox"
                checked={aplicarDescuentoSocio}
                onChange={(e) => setAplicarDescuentoSocio(e.target.checked)}
              />
              <span>{aplicarDescuentoSocio ? '✓ Beneficio Aplicado' : 'Activar Descuento'}</span>
            </label>
          </div>
        </div>
      </section>

      {/* 3. BOOKING BAR */}
      <section className="posadas-bb-section">
        <div className="posadas-container">
          <div className="posadas-bb-card">
            <div className="bb-col">
              <label><Calendar size={13} /> LLEGADA</label>
              <input type="date" value={fechaLlegada} onChange={(e) => setFechaLlegada(e.target.value)} />
            </div>
            <div className="bb-col">
              <label><Calendar size={13} /> SALIDA</label>
              <input type="date" value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} />
            </div>
            <div className="bb-col">
              <label><Users size={13} /> ADULTOS</label>
              <select value={adultos} onChange={(e) => setAdultos(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n < 10 ? `0${n}` : n} Adultos</option>)}
              </select>
            </div>
            <div className="bb-col">
              <label><Users size={13} /> NIÑOS (0-12)</label>
              <select value={ninos} onChange={(e) => setNinos(Number(e.target.value))}>
                {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n < 10 ? `0${n}` : n} Niños</option>)}
              </select>
            </div>
            <div className="bb-col bb-action">
              <button
                type="button"
                className="btn-bb-search"
                onClick={() => navigate('/disponibilidad', { state: { fecha_llegada: fechaLlegada, fecha_salida: fechaSalida, adultos, ninos } })}
              >
                VER DISPONIBILIDAD ({totalNoches} NOCHES)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BARRA DE FILTROS TIPO BOOKING (b_rooms_table_filters) */}
      <section id="suites-tarifas" className="posadas-filters-section">
        <div className="posadas-container">
          <div className="filters-flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="quick-filter-chips">
              <button
                type="button"
                className={`qf-chip ${soloCancelacionGratis ? 'active' : ''}`}
                onClick={() => setSoloCancelacionGratis(!soloCancelacionGratis)}
              >
                {soloCancelacionGratis ? '✓ ' : ''}Cancelación gratis - Sin pago por adelantado
              </button>
              <button
                type="button"
                className={`qf-chip ${soloAdultosFiltro ? 'active' : ''}`}
                onClick={() => setSoloAdultosFiltro(!soloAdultosFiltro)}
              >
                {soloAdultosFiltro ? '✓ ' : ''}Solo Adultos (+18)
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="filter-dropdown">
                <label>Categoría</label>
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                  <option value="*">Todas las categorías</option>
                  {categoriasDisponibles.filter(c => c !== '*').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="filter-dropdown">
                <label>Cama</label>
                <select value={filtroCama} onChange={(e) => setFiltroCama(e.target.value)}>
                  <option value="*">Todas</option>
                  <option value="King">King Size</option>
                  <option value="Dobles">2 Dobles / Queen</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GRID DE TARJETAS DE SUITES */}
      <section className="posadas-cards-section">
        <div className="posadas-container">
          {cargando && <div className="posadas-loader">Consultando catálogo en SQL Server...</div>}
          {error && <div className="posadas-error"><AlertCircle size={18} /> {error}</div>}

          <div className="rooms-grid-layout">
            {suitesFiltradas.map((suite) => {
              const aforo = validarAforo(suite);
              const esSoloAdultos = Number(suite.capacidad_ninos) === 0;
              const precioPublico = Number(suite.precio_noche_base) || 6200;
              const precioCalculado = calcularPrecioFinal(precioPublico);
              const esPreseleccionada = suite.suite_id === suitePreseleccionadaId;

              return (
                <div key={suite.suite_id} className={`room-luxury-card ${!aforo.permitido ? 'room-unfit' : ''} ${esPreseleccionada ? 'highlighted-card' : ''}`}>
                  <div className="card-media-box">
                    <img src={suite.foto_principal} alt={suite.nombre} loading="lazy" />
                    {esSoloAdultos && <span className="badge-adults-only"><ShieldAlert size={12} /> Solo Adultos (+18)</span>}
                    {esPreseleccionada && <span className="media-selected-pill">★ Tu Selección</span>}

                    <ul className="floating-specs-bar">
                      <li><Users size={15} /><span>{suite.capacidad_adultos} Adultos</span></li>
                      <li><Bed size={15} /><span>{suite.tipo_cama ? suite.tipo_cama.split('o')[0] : 'King'}</span></li>
                      <li><Maximize2 size={15} /><span>{suite.metros_cuadrados} m²</span></li>
                    </ul>
                  </div>

                  <div className="card-content-box">
                    <h3 className="room-name">{suite.nombre}</h3>
                    <div className="rate-from-box">
                      <span className="rate-caption">{aplicarDescuentoSocio ? 'Tarifa Exclusiva Socio' : 'Tarifa Pública Desde'}</span>
                      {aplicarDescuentoSocio && (
                        <span className="rate-strikethrough">MXN ${precioPublico.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      )}
                      <strong className="rate-amount">
                        <small>MXN</small> ${Number(precioCalculado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </strong>
                      <span className="rate-tax-hint">Por noche • Cancelación gratuita disponible</span>
                    </div>

                    <div className="card-footer-buttons">
                      <button type="button" className="btn-card-outline" onClick={() => abrirModalSuite(suite, 'tarifas')}>
                        Planes y Detalles
                      </button>
                      <button
                        type="button"
                        disabled={!aforo.permitido}
                        className={`btn-card-primary ${!aforo.permitido ? 'disabled' : ''}`}
                        onClick={() => handleIrADisponibilidad(suite)}
                      >
                        {aforo.permitido ? 'Reservar' : aforo.motivo}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. TABLA COMPARATIVA DE TARIFAS Y BLOQUES (RoomTableBase + hp_booking_summary) */}
      <section id="tabla-comparativa" className="booking-room-table-section">
        <div className="posadas-container">
          <div className="section-header-row">
            <div>
              <span className="brand-eyebrow">COMPARADOR DIRECTO DE TARIFAS</span>
              <h2 className="editorial-subtitle" style={{ fontStyle: 'normal', color: '#f3e5ab' }}>
                Disponibilidad y Planes por Categoría ({totalNoches} noches)
              </h2>
            </div>
          </div>

          <div className="room-table-with-summary">
            <div className="rt-main-table-wrap">
              <table className="luxury-rooms-table">
                <thead>
                  <tr>
                    <th>Tipo de Suite</th>
                    <th>Capacidad</th>
                    <th>Plan y Condiciones</th>
                    <th>Precio por {totalNoches} noche(s)</th>
                    <th>Selección</th>
                  </tr>
                </thead>
                <tbody>
                  {suitesFiltradas.map((suite) => {
                    const aforo = validarAforo(suite);
                    const planesVisibles = soloCancelacionGratis
                      ? PLANES_TARIFARIOS.filter(p => p.id !== 'no_reembolsable')
                      : PLANES_TARIFARIOS;

                    return planesVisibles.map((plan, pIdx) => {
                      const precioNoche = calcularPrecioFinal(suite.precio_noche_base, plan.multiplicador);
                      const precioEstancia = precioNoche * totalNoches;
                      const esFilaSeleccionada = seleccionTabla.suiteId === suite.suite_id && seleccionTabla.planId === plan.id;

                      return (
                        <tr key={`${suite.suite_id}-${plan.id}`} className={esFilaSeleccionada ? 'rt-row-selected' : ''}>
                          {pIdx === 0 && (
                            <td rowSpan={planesVisibles.length} className="rt-suite-cell">
                              <button type="button" className="rt-suite-link" onClick={() => abrirModalSuite(suite, 'confort')}>
                                {suite.nombre}
                              </button>
                              <div className="rt-suite-specs">
                                <span><Maximize2 size={12} /> {suite.metros_cuadrados} m²</span>
                                <span><Bed size={12} /> {suite.tipo_cama}</span>
                                <span><Waves size={12} /> {suite.vista_tipo || 'Vista Caribe'}</span>
                              </div>
                            </td>
                          )}

                          <td className="rt-occ-cell">
                            <div className="occ-icons">
                              <Users size={15} color="#d4af37" />
                              <span>{suite.capacidad_adultos} Ad. {Number(suite.capacidad_ninos) > 0 ? `+ ${suite.capacidad_ninos} Ni.` : ''}</span>
                            </div>
                          </td>

                          <td className="rt-plan-cell">
                            <span className="rt-plan-badge">{plan.badge}</span>
                            <strong>{plan.nombre}</strong>
                            <ul>
                              {plan.beneficios.map((b, i) => <li key={i}>✓ {b}</li>)}
                            </ul>
                          </td>

                          <td className="rt-price-cell">
                            <strong>MXN ${precioEstancia.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                            <small>${precioNoche.toLocaleString('es-MX', { minimumFractionDigits: 2 })} / noche</small>
                            <span className="rt-tax-note">+ IVA 16% e ISH 5%</span>
                          </td>

                          <td className="rt-select-cell">
                            <button
                              type="button"
                              disabled={!aforo.permitido}
                              className={`btn-rt-select ${esFilaSeleccionada ? 'active' : ''}`}
                              onClick={() => setSeleccionTabla({ suiteId: suite.suite_id, planId: plan.id, cantidad: 1 })}
                            >
                              {!aforo.permitido ? aforo.motivo : esFilaSeleccionada ? '✓ Elegida' : 'Seleccionar'}
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>

            {/* CAJA LATERAL DE RESUMEN DE RESERVA (hp_booking_summary) */}
            {suiteResumenObj && (
              <aside className="rt-sticky-summary">
                <span className="brand-eyebrow">TU SELECCIÓN ACTUAL</span>
                <h4>{suiteResumenObj.nombre}</h4>
                <p className="rts-plan-name">{planResumenObj.nombre}</p>

                <div className="rts-dates-box">
                  <div><small>ENTRADA</small><strong>{fechaLlegada}</strong></div>
                  <div><small>SALIDA</small><strong>{fechaSalida}</strong></div>
                </div>

                <div className="rts-price-lines">
                  <div><span>{totalNoches} noche(s) × 1 suite</span><strong>${subtotalResumen.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></div>
                  <div><span>Impuestos Quintana Roo</span><strong>${impuestosResumen.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></div>
                  <div className="rts-total">
                    <span>Total estimado</span>
                    <strong>${(subtotalResumen + impuestosResumen).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-bb-search"
                  onClick={() => handleIrADisponibilidad(suiteResumenObj, planResumenObj)}
                >
                  Continuar con esta Suite →
                </button>
                <small className="rts-footnote">• Confirmación inmediata • Sin cargos ocultos</small>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* 7. SERVICIOS COMPLETOS DEL RESORT (PropertyFacilitiesBlockDesktop) */}
      <section id="servicios-resort" className="resort-facilities-full">
        <div className="posadas-container">
          <h3 className="seccion-subtitulo">SERVICIOS E INSTALACIONES DEL RESORT</h3>
          <div className="facilities-3-cols">
            <div className="fac-category-card">
              <h4><Waves size={16} color="#d4af37" /> Playa y Bienestar</h4>
              <ul>
                <li>✓ Acceso directo a playa privada de arena blanca</li>
                <li>✓ 6 albercas climatizadas con borde infinito</li>
                <li>✓ Feel Harmony Spa con circuito de hidroterapia</li>
                <li>✓ Camastros Bali y servicio de toallas en playa</li>
              </ul>
            </div>
            <div className="fac-category-card">
              <h4><Utensils size={16} color="#d4af37" /> Gastronomía y Mixología</h4>
              <ul>
                <li>✓ 8 restaurantes de especialidad a la carta</li>
                <li>✓ Cava privada con sommelier certificado</li>
                <li>✓ Room Service gourmet disponible 24 horas</li>
                <li>✓ Bares Swim-Up y Sky Lounge frente al Caribe</li>
              </ul>
            </div>
            <div className="fac-category-card">
              <h4><Sparkles size={16} color="#d4af37" /> Confort y Tecnología</h4>
              <ul>
                <li>✓ Wi-Fi de fibra óptica en suites y áreas comunes</li>
                <li>✓ Domótica táctil para iluminación y clima</li>
                <li>✓ Traslado privado aeropuerto (según tarifa)</li>
                <li>✓ Concierge digital y seguridad 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. NORMAS DE LA CASA Y PREGUNTAS FRECUENTES (HouseRules + PropertyPageFAQ) */}
      <section id="normas-casa" className="resort-house-rules-section">
        <div className="posadas-container">
          <div className="house-rules-box">
            <h3 className="seccion-subtitulo">NORMAS DE LA CASA Y POLÍTICAS DE ESTANCIA</h3>
            <div className="house-rules-grid">
              <div className="rule-row">
                <strong><Clock size={15} color="#d4af37" /> Entrada (Check-in)</strong>
                <span>De las 15:00 a las 23:30 hrs. Pre-check-in express disponible para socios Fiesta Rewards.</span>
              </div>
              <div className="rule-row">
                <strong><Clock size={15} color="#d4af37" /> Salida (Check-out)</strong>
                <span>Hasta las 12:00 hrs. Late check-out cortesía sujeto a nivel Titanium Privilege.</span>
              </div>
              <div className="rule-row">
                <strong><CheckCircle2 size={15} color="#d4af37" /> Cancelación y Métodos de Pago</strong>
                <span>Cancelación gratuita hasta 24h antes en tarifas flexibles. Aceptamos Fiesta Card, Visa, Mastercard, Amex y CoDi®/SPEI.</span>
              </div>
              <div className="rule-row">
                <strong><ShieldAlert size={15} color="#d4af37" /> Política de Suites</strong>
                <span>Todas nuestras suites son 100% libres de humo. Acceso exclusivo +18 en categorías Swim-Up y Master Adultos.</span>
              </div>
            </div>

            {/* ACORDEÓN PREGUNTAS FRECUENTES */}
            <div className="resort-faq-wrap">
              <h4 className="faq-heading"><HelpCircle size={16} color="#d4af37" /> Preguntas frecuentes sobre el alojamiento</h4>
              <div className="faq-list">
                {FAQS_RESORT.map((item, idx) => {
                  const abierta = faqAbierta === idx;
                  return (
                    <div key={idx} className={`faq-item ${abierta ? 'open' : ''}`}>
                      <button type="button" className="faq-question" onClick={() => setFaqAbierta(abierta ? -1 : idx)}>
                        <span>{item.q}</span>
                        {abierta ? <ChevronUp size={16} color="#d4af37" /> : <ChevronDown size={16} color="#94a3b8" />}
                      </button>
                      {abierta && <p className="faq-answer">{item.a}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. MODAL SPLIT-VIEW LUXURY */}
      {suiteModal && (
        <div className="modal-backdrop-luxury" onClick={() => setSuiteModal(null)}>
          <div className="modal-sheet modal-sheet-wide" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setSuiteModal(null)} aria-label="Cerrar">
              <X size={18} />
            </button>

            <div className="modal-split-layout">
              <div className="modal-left-gallery">
                {fotosModalActual.length > 0 && (
                  <div className="modal-slider-wrap">
                    <div className="modal-slider-main">
                      <img src={fotosModalActual[fotoModalIndex]?.url} alt={fotosModalActual[fotoModalIndex]?.titulo} />
                      {fotosModalActual.length > 1 && (
                        <>
                          <button type="button" className="modal-slider-nav prev" onClick={() => setFotoModalIndex((prev) => (prev - 1 + fotosModalActual.length) % fotosModalActual.length)}><ChevronLeft size={18} /></button>
                          <button type="button" className="modal-slider-nav next" onClick={() => setFotoModalIndex((prev) => (prev + 1) % fotosModalActual.length)}><ChevronRight size={18} /></button>
                        </>
                      )}
                      <div className="modal-photo-caption">
                        <span>{fotosModalActual[fotoModalIndex]?.titulo}</span>
                        <small>{fotoModalIndex + 1} / {fotosModalActual.length}</small>
                      </div>
                    </div>

                    {fotosModalActual.length > 1 && (
                      <div className="modal-thumbnails-strip">
                        {fotosModalActual.map((f, i) => (
                          <button key={i} type="button" className={`modal-thumb-btn ${i === fotoModalIndex ? 'active-thumb' : ''}`} onClick={() => setFotoModalIndex(i)}>
                            <img src={f.url} alt="" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="modal-gallery-highlights">
                  <div className="mgh-item"><small>SUPERFICIE</small><strong>{suiteModal.metros_cuadrados} m²</strong></div>
                  <div className="mgh-item"><small>DESCANSO</small><strong>{suiteModal.tipo_cama}</strong></div>
                  <div className="mgh-item"><small>AFORO MÁX.</small><strong>{suiteModal.capacidad_adultos} Ad. / {suiteModal.capacidad_ninos} Ni.</strong></div>
                </div>
              </div>

              <div className="modal-right-details">
                <div className="modal-sheet-head">
                  <span className="brand-eyebrow">{suiteModal.categoria}</span>
                  <h2>{suiteModal.nombre}</h2>
                  <div className="modal-tags">
                    <span>Vista: {suiteModal.vista_tipo || 'Panorámica'}</span>
                    <span>All-Inclusive Gourmet</span>
                    {aplicarDescuentoSocio && <span className="tag-gold-vip">Beneficio Titanium -20%</span>}
                  </div>
                </div>

                <div className="modal-tabs-nav">
                  <button className={tabActiva === 'tarifas' ? 'active' : ''} onClick={() => setTabActiva('tarifas')}>Tarifas (3)</button>
                  <button className={tabActiva === 'confort' ? 'active' : ''} onClick={() => setTabActiva('confort')}>Confort</button>
                  <button className={tabActiva === 'bano' ? 'active' : ''} onClick={() => setTabActiva('bano')}>Baño Spa</button>
                  <button className={tabActiva === 'tech' ? 'active' : ''} onClick={() => setTabActiva('tech')}>Domótica</button>
                  <button className={tabActiva === 'servicios' ? 'active' : ''} onClick={() => setTabActiva('servicios')}>Servicios</button>
                  <button className={tabActiva === 'politica' ? 'active' : ''} onClick={() => setTabActiva('politica')}>Políticas</button>
                </div>

                <div className="modal-sheet-body">
                  {tabActiva === 'tarifas' && (
                    <div className="modal-pane-content">
                      <div className="rate-blocks-selector">
                        {PLANES_TARIFARIOS.map(plan => {
                          const precioPlan = calcularPrecioFinal(suiteModal.precio_noche_base, plan.multiplicador);
                          const seleccionado = planSeleccionado === plan.id;
                          return (
                            <div key={plan.id} className={`rate-block-option ${seleccionado ? 'selected' : ''}`} onClick={() => setPlanSeleccionado(plan.id)}>
                              <div className="rbo-left">
                                <span className="rbo-badge">{plan.badge}</span>
                                <h4>{plan.nombre}</h4>
                                <ul>{plan.beneficios.map((b, i) => <li key={i}>✓ {b}</li>)}</ul>
                              </div>
                              <div className="rbo-right">
                                <strong>${precioPlan.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                                <small>MXN / noche</small>
                                <span className="rbo-radio">{seleccionado ? '● Activo' : '○ Elegir'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {tabActiva === 'confort' && (
                    <div className="modal-pane-content">
                      <p>{suiteModal.detalles_confort || suiteModal.descripcion || 'Sin especificaciones registradas.'}</p>
                      {suiteModal.amenidades_destacadas && (
                        <div className="amenidades-badges-box">
                          <span className="amenidades-label">Amenidades destacadas</span>
                          <div className="amenidades-chips-list">
                            {suiteModal.amenidades_destacadas.split(',').map((amenidad, idx) => (
                              <span key={idx} className="amenidad-chip"><span className="chip-bullet">•</span> {amenidad.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {tabActiva === 'bano' && <div className="modal-pane-content"><p>{suiteModal.detalles_bano || 'Equipamiento con tina de inmersión y amenidades L’Occitane.'}</p></div>}
                  {tabActiva === 'tech' && <div className="modal-pane-content"><p>{suiteModal.detalles_tecnologia || 'Domótica por control táctil, Wi-Fi de alta velocidad y Smart TV 65".'}</p></div>}
                  {tabActiva === 'servicios' && <div className="modal-pane-content"><p>{suiteModal.servicios_incluidos || 'Hospedaje All-Inclusive con mayordomía y servicio de alimentos 24/7.'}</p></div>}
                  {tabActiva === 'politica' && <div className="modal-pane-content"><p>{suiteModal.politica_suite || 'Check-in: 15:00 hrs | Check-out: 12:00 hrs. Espacio libre de humo.'}</p></div>}
                </div>

                <div className="modal-sheet-foot">
                  <div className="modal-rate-indicator">
                    <small>{planActualObj.nombre}</small>
                    <strong>${Number(calcularPrecioFinal(suiteModal.precio_noche_base, planActualObj.multiplicador)).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                    <small style={{ fontSize: '0.62rem', color: '#94a3b8' }}>+ 16% IVA + 5% ISH + Saneamiento Ambiental</small>
                  </div>
                  <button type="button" className="btn-card-primary" onClick={() => handleIrADisponibilidad(suiteModal, planActualObj)}>
                    Reservar este Plan <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}