import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSuites } from '../../services/api';
import {
  Users, Bed, Maximize2, Calendar, ShieldAlert,
  ArrowRight, X, ChevronLeft, ChevronRight, AlertCircle,
  Award, Sparkles, MapPin, Star, Waves, Utensils, Wifi, Clock, CheckCircle2
} from 'lucide-react';
import './Habitaciones.css';

const PLANES_TARIFARIOS = [
  {
    id: 'no_reembolsable',
    nombre: 'Tarifa Anticipada No Reembolsable',
    multiplicador: 0.90,
    badge: 'MEJOR PRECIO (-10%)',
    beneficios: ['All-Inclusive Gourmet 24h', 'Pago inmediato requerido', 'No permite cambios de fecha']
  },
  {
    id: 'flexible',
    nombre: 'Tarifa Flexible All-Inclusive',
    multiplicador: 1.00,
    badge: 'MÁS ELEGIDA',
    beneficios: ['Cancelación gratis hasta 24h antes', 'Reserva hoy y paga en el resort', 'All-Inclusive Gourmet 24h']
  },
  {
    id: 'signature_spa',
    nombre: 'Experiencia Signature Cava & Spa',
    multiplicador: 1.18,
    badge: 'EXPERIENCIA VIP',
    beneficios: ['Circuito hidroterapia Feel Harmony Spa', 'Cena maridaje privada incluida', 'Cancelación gratuita incluida']
  }
];

export default function Habitaciones() {
  const navigate = useNavigate();

  // Estados del catálogo
  const [suites, setSuites] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Parámetros de la barra de búsqueda rápida
  const [fechaLlegada, setFechaLlegada] = useState('2026-12-01');
  const [fechaSalida, setFechaSalida] = useState('2026-12-05');
  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);

  // Filtros Isotope y Socio VIP
  const [filtroCategoria, setFiltroCategoria] = useState('*');
  const [filtroCama, setFiltroCama] = useState('*');
  const [aplicarDescuentoSocio, setAplicarDescuentoSocio] = useState(true);

  // Modal Ficha Técnica, Plan Tarifario y Slider interno
  const [suiteModal, setSuiteModal] = useState(null);
  const [tabActiva, setTabActiva] = useState('confort');
  const [fotoModalIndex, setFotoModalIndex] = useState(0);
  const [planSeleccionado, setPlanSeleccionado] = useState('flexible');

  useEffect(() => {
    async function cargarCatalogo() {
      try {
        setCargando(true);
        const data = await fetchSuites();
        setSuites(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('No se pudo sincronizar el inventario desde la base de datos.');
      } finally {
        setCargando(false);
      }
    }
    cargarCatalogo();
  }, []);

  const categoriasDisponibles = ['*', ...new Set(suites.map(s => s.categoria).filter(Boolean))];

  const suitesFiltradas = suites.filter((suite) => {
    const matchCat = filtroCategoria === '*' || suite.categoria === filtroCategoria;
    const matchCama = filtroCama === '*' || (suite.tipo_cama && suite.tipo_cama.toLowerCase().includes(filtroCama.toLowerCase()));
    return matchCat && matchCama;
  });

  const validarAforo = (suite) => {
    const maxAdultos = Number(suite.capacidad_adultos) || 2;
    const maxNinos = Number(suite.capacidad_ninos) || 0;
    const esSoloAdultos = maxNinos === 0;

    if (esSoloAdultos && ninos > 0) {
      return { permitido: false, motivo: 'Solo Adultos (+18)' };
    }
    if (adultos > maxAdultos) {
      return { permitido: false, motivo: `Máx. ${maxAdultos} Adultos` };
    }
    if (ninos > maxNinos) {
      return { permitido: false, motivo: `Máx. ${maxNinos} Niños` };
    }
    return { permitido: true };
  };

  const calcularPrecioFinal = (precioBase, multiplicadorPlan = 1.0) => {
    const base = (Number(precioBase) || 0) * multiplicadorPlan;
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
        plan_tarifario: planElegido.nombre,
        precio_aplicado: calcularPrecioFinal(suite.precio_noche_base, planElegido.multiplicador)
      }
    });
  };

  const obtenerFotosSuite = (suite) => {
    if (!suite) return [];
    let lista = [];

    if (suite.galeria_fotos) {
      if (Array.isArray(suite.galeria_fotos)) {
        lista = suite.galeria_fotos;
      } else if (typeof suite.galeria_fotos === 'string') {
        try {
          lista = JSON.parse(suite.galeria_fotos);
        } catch (e) {
          lista = [];
        }
      }
    }

    const fotosNormalizadas = lista.map(item => {
      if (typeof item === 'string') return { url: item, titulo: suite.nombre };
      return { url: item.url || suite.foto_principal, titulo: item.titulo || suite.nombre };
    });

    if (fotosNormalizadas.length === 0 && suite.foto_principal) {
      fotosNormalizadas.push({ url: suite.foto_principal, titulo: suite.nombre });
    }

    return fotosNormalizadas;
  };

  const abrirModalSuite = (suite) => {
    setSuiteModal(suite);
    setTabActiva('confort');
    setFotoModalIndex(0);
    setPlanSeleccionado('flexible');
  };

  const fotosModalActual = obtenerFotosSuite(suiteModal);
  const planActualObj = PLANES_TARIFARIOS.find(p => p.id === planSeleccionado) || PLANES_TARIFARIOS[1];

  const siguienteFoto = () => {
    if (fotosModalActual.length === 0) return;
    setFotoModalIndex((prev) => (prev + 1) % fotosModalActual.length);
  };

  const anteriorFoto = () => {
    if (fotosModalActual.length === 0) return;
    setFotoModalIndex((prev) => (prev - 1 + fotosModalActual.length) % fotosModalActual.length);
  };

  // Fotos destacadas para el mosaico superior tomando las primeras suites cargadas
  const fotosMosaicoHero = suites.slice(0, 5).map(s => ({
    url: s.foto_principal,
    nombre: s.nombre,
    suite: s
  }));

  return (
    <div className="posadas-rooms-page">

      {/* 1. CABECERA DE RESORT + REPUTACIÓN + GALERÍA MOSAICO HERO */}
      <section className="resort-showcase-header">
        <div className="posadas-container">
          <div className="resort-title-bar">
            <div>
              <div className="resort-badges-line">
                <span className="diamond-pill">★★★★★ RESORT 5 DIAMANTES</span>
                <span className="all-inclusive-pill">ALL-INCLUSIVE LUXURY</span>
              </div>
              <h1 className="editorial-title" style={{ marginBottom: '0.2rem' }}>
                Grand Fiesta Americana Riviera Cancún
              </h1>
              <p className="resort-address-line">
                <MapPin size={14} color="#d4af37" />
                <span>Carretera Cancún - Tulum Km 335, Bahía Petempich, Puerto Morelos, Quintana Roo</span>
              </p>
            </div>

            <div className="resort-rating-box">
              <div className="rating-text">
                <strong>Excepcional</strong>
                <small>4,820 reseñas verificadas</small>
              </div>
              <div className="rating-score-badge">9.6</div>
            </div>
          </div>

          {/* Mosaico Fotográfico Asimétrico */}
          {fotosMosaicoHero.length >= 3 && (
            <div className="resort-mosaic-grid">
              <div
                className="mosaic-main-photo"
                onClick={() => abrirModalSuite(fotosMosaicoHero[0].suite)}
              >
                <img src={fotosMosaicoHero[0].url} alt={fotosMosaicoHero[0].nombre} />
                <span className="mosaic-caption">{fotosMosaicoHero[0].nombre}</span>
              </div>
              <div className="mosaic-side-grid">
                {fotosMosaicoHero.slice(1, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="mosaic-sub-photo"
                    onClick={() => abrirModalSuite(item.suite)}
                  >
                    <img src={item.url} alt={item.nombre} />
                    <span className="mosaic-sub-caption">{item.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Franja de Servicios Más Populares */}
          <div className="popular-facilities-strip">
            <div className="facility-pill"><Waves size={15} color="#d4af37" /> <span>Frente a playa privada</span></div>
            <div className="facility-pill"><Utensils size={15} color="#d4af37" /> <span>8 Restaurantes Gourmet</span></div>
            <div className="facility-pill"><Sparkles size={15} color="#d4af37" /> <span>Feel Harmony Spa</span></div>
            <div className="facility-pill"><Wifi size={15} color="#d4af37" /> <span>Wi-Fi Alta Velocidad</span></div>
            <div className="facility-pill"><Star size={15} color="#d4af37" /> <span>Servicio a Suite 24/7</span></div>
          </div>
        </div>
      </section>

      {/* 2. BOOKING BAR */}
      <section className="posadas-bb-section">
        <div className="posadas-container">
          <div className="posadas-bb-card">

            <div className="bb-col">
              <label><Calendar size={13} /> LLEGADA</label>
              <input
                type="date"
                value={fechaLlegada}
                onChange={(e) => setFechaLlegada(e.target.value)}
              />
            </div>

            <div className="bb-col">
              <label><Calendar size={13} /> SALIDA</label>
              <input
                type="date"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
              />
            </div>

            <div className="bb-col">
              <label><Users size={13} /> ADULTOS</label>
              <select value={adultos} onChange={(e) => setAdultos(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n < 10 ? `0${n}` : n}</option>
                ))}
              </select>
            </div>

            <div className="bb-col">
              <label><Users size={13} /> NIÑOS (0-12)</label>
              <select value={ninos} onChange={(e) => setNinos(Number(e.target.value))}>
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n < 10 ? `0${n}` : n}</option>
                ))}
              </select>
            </div>

            <div className="bb-col bb-action">
              <button
                type="button"
                className="btn-bb-search"
                onClick={() => {
                  navigate('/disponibilidad', {
                    state: { fecha_llegada: fechaLlegada, fecha_salida: fechaSalida, adultos, ninos }
                  });
                }}
              >
                BUSCAR DISPONIBILIDAD
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FILTROS ISOTOPE & BENEFICIO SOCIO VIP */}
      <section className="posadas-filters-section">
        <div className="posadas-container">
          <div className="filters-flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>

            <div className="socio-discount-toggle" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Award size={16} color="#d4af37" />
              <label style={{ fontSize: '0.8rem', color: '#f3e5ab', fontWeight: 700, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={aplicarDescuentoSocio}
                  onChange={(e) => setAplicarDescuentoSocio(e.target.checked)}
                  style={{ accentColor: '#d4af37', marginRight: '6px', cursor: 'pointer' }}
                />
                Aplicar Tarifa Preferencial Socio Titanium Privilege (-20%)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div className="filter-dropdown">
                <label>Tipo de habitación</label>
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                  <option value="*">Todas las categorías</option>
                  {categoriasDisponibles.filter(c => c !== '*').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="filter-dropdown">
                <label>Tipo de cama</label>
                <select value={filtroCama} onChange={(e) => setFiltroCama(e.target.value)}>
                  <option value="*">Todas las camas</option>
                  <option value="King">Cama King Size</option>
                  <option value="Dobles">Dos Camas Dobles / Queen</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. GRID DE TARJETAS DE SUITES */}
      <section className="posadas-cards-section">
        <div className="posadas-container">

          {cargando && <div className="posadas-loader">Consultando catálogo en SQL Server...</div>}
          {error && <div className="posadas-error"><AlertCircle size={18} /> {error}</div>}

          <div className="rooms-grid-layout">
            {suitesFiltradas.map((suite, idx) => {
              const aforo = validarAforo(suite);
              const esSoloAdultos = Number(suite.capacidad_ninos) === 0;
              const precioPublico = Number(suite.precio_noche_base) || 0;
              const precioCalculado = calcularPrecioFinal(precioPublico);
              const altaDemanda = idx % 2 === 0;

              return (
                <div key={suite.suite_id} className={`room-luxury-card ${!aforo.permitido ? 'room-unfit' : ''}`}>

                  <div className="card-media-box">
                    <img src={suite.foto_principal} alt={suite.nombre} loading="lazy" />

                    {esSoloAdultos ? (
                      <span className="badge-adults-only">
                        <ShieldAlert size={12} /> Solo Adultos (+18)
                      </span>
                    ) : altaDemanda && (
                      <span className="badge-high-demand">
                        🔥 Alta demanda • Últimas 2 suites
                      </span>
                    )}

                    <ul className="floating-specs-bar">
                      <li>
                        <Users size={15} />
                        <span>{suite.capacidad_adultos} Adultos</span>
                      </li>
                      <li>
                        <Bed size={15} />
                        <span>{suite.tipo_cama ? suite.tipo_cama.split('o')[0] : 'King'}</span>
                      </li>
                      <li>
                        <Maximize2 size={15} />
                        <span>{suite.metros_cuadrados} m²</span>
                      </li>
                    </ul>
                  </div>

                  <div className="card-content-box">
                    <h3 className="room-name">{suite.nombre}</h3>

                    <div className="rate-from-box">
                      <span className="rate-caption">
                        {aplicarDescuentoSocio ? 'Tarifa Exclusiva Socio Titanium' : 'Tarifa Pública Desde'}
                      </span>

                      {aplicarDescuentoSocio && (
                        <span className="rate-strikethrough">
                          MXN ${precioPublico.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      )}

                      <strong className="rate-amount">
                        <small>MXN</small> ${Number(precioCalculado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </strong>

                      <span className="rate-tax-hint">
                        Por noche • Cancelación gratuita disponible
                      </span>
                    </div>

                    <div className="card-footer-buttons">
                      <button
                        type="button"
                        className="btn-card-outline"
                        onClick={() => abrirModalSuite(suite)}
                      >
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

      {/* 5. NORMAS DE LA CASA Y POLÍTICAS DEL RESORT (HOUSE RULES) */}
      <section className="resort-house-rules-section">
        <div className="posadas-container">
          <div className="house-rules-box">
            <h3 className="seccion-subtitulo">INFORMACIÓN IMPORTANTE Y NORMAS DEL RESORT</h3>
            <div className="house-rules-grid">
              <div className="rule-row">
                <strong><Clock size={15} color="#d4af37" /> Entrada (Check-in)</strong>
                <span>De las 15:00 a las 23:30 hrs. Pre-check-in express disponible para socios Fiesta Rewards.</span>
              </div>
              <div className="rule-row">
                <strong><Clock size={15} color="#d4af37" /> Salida (Check-out)</strong>
                <span>Hasta las 12:00 hrs. Late check-out sujeto a disponibilidad de nivel Titanium.</span>
              </div>
              <div className="rule-row">
                <strong><CheckCircle2 size={15} color="#d4af37" /> Cancelación y Pago</strong>
                <span>Cancelación gratuita hasta 24 horas antes en tarifas flexibles. Aceptamos Fiesta Card, Visa, Mastercard, Amex y CoDi®/SPEI.</span>
              </div>
              <div className="rule-row">
                <strong><ShieldAlert size={15} color="#d4af37" /> Política de Suites</strong>
                <span>Todas nuestras suites son 100% libres de humo. Acceso exclusivo +18 en categorías Swim-Up y Master Adultos.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALLOUT FIESTA REWARDS */}
      <section className="posadas-fr-callout">
        <div className="posadas-container">
          <div className="fr-callout-inner">
            <div className="fr-info">
              <span className="brand-eyebrow">FIESTA REWARDS</span>
              <h3>Obtén Promociones Exclusivas</h3>
              <p>
                Sea parte de Fiesta Rewards y viva experiencias selectas en cada viaje.
                Conozca el lujo, lo mejor de nuestra hospitalidad, momentos únicos y beneficios exclusivos.
              </p>
            </div>
            <div className="fr-actions">
              <button type="button" className="btn-fr-join" onClick={() => navigate('/registro')}>
                Registrarse
              </button>
              <button type="button" className="btn-fr-more" onClick={() => navigate('/perfil-socio')}>
                Ver Más
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MODAL FICHA TÉCNICA + SELECTOR DE BLOQUES TARIFARIOS (SPLIT LUXURY) */}
      {suiteModal && (
        <div className="modal-backdrop-luxury" onClick={() => setSuiteModal(null)}>
          <div className="modal-sheet modal-sheet-wide" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setSuiteModal(null)} aria-label="Cerrar">
              <X size={18} />
            </button>

            <div className="modal-split-layout">
              {/* COLUMNA IZQUIERDA: GALERÍA VISUAL INMERSIVA */}
              <div className="modal-left-gallery">
                {fotosModalActual.length > 0 && (
                  <div className="modal-slider-wrap">
                    <div className="modal-slider-main">
                      <img
                        src={fotosModalActual[fotoModalIndex]?.url}
                        alt={fotosModalActual[fotoModalIndex]?.titulo}
                      />

                      {fotosModalActual.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="modal-slider-nav prev"
                            onClick={anteriorFoto}
                            aria-label="Foto anterior"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            type="button"
                            className="modal-slider-nav next"
                            onClick={siguienteFoto}
                            aria-label="Foto siguiente"
                          >
                            <ChevronRight size={18} />
                          </button>
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
                          <button
                            key={i}
                            type="button"
                            className={`modal-thumb-btn ${i === fotoModalIndex ? 'active-thumb' : ''}`}
                            onClick={() => setFotoModalIndex(i)}
                          >
                            <img src={f.url} alt="" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Resumen rápido debajo de las fotos */}
                <div className="modal-gallery-highlights">
                  <div className="mgh-item">
                    <small>SUPERFICIE</small>
                    <strong>{suiteModal.metros_cuadrados} m²</strong>
                  </div>
                  <div className="mgh-item">
                    <small>DESCANSO</small>
                    <strong>{suiteModal.tipo_cama}</strong>
                  </div>
                  <div className="mgh-item">
                    <small>AFORO MÁX.</small>
                    <strong>{suiteModal.capacidad_adultos} Ad. / {suiteModal.capacidad_ninos} Ni.</strong>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: DETALLES, PESTAÑAS, TARIFAS Y RESERVA */}
              <div className="modal-right-details">
                <div className="modal-sheet-head">
                  <span className="brand-eyebrow">{suiteModal.categoria}</span>
                  <h2>{suiteModal.nombre}</h2>
                  <div className="modal-tags">
                    <span>Vista: {suiteModal.vista_tipo}</span>
                    <span>All-Inclusive Gourmet</span>
                    {aplicarDescuentoSocio && <span className="tag-gold-vip">Beneficio Titanium -20%</span>}
                  </div>
                </div>

                <div className="modal-tabs-nav">
                  <button className={tabActiva === 'tarifas' ? 'active' : ''} onClick={() => setTabActiva('tarifas')}>
                    Tarifas (3)
                  </button>
                  <button className={tabActiva === 'confort' ? 'active' : ''} onClick={() => setTabActiva('confort')}>
                    Confort
                  </button>
                  <button className={tabActiva === 'bano' ? 'active' : ''} onClick={() => setTabActiva('bano')}>
                    Baño Spa
                  </button>
                  <button className={tabActiva === 'tech' ? 'active' : ''} onClick={() => setTabActiva('tech')}>
                    Domótica
                  </button>
                  <button className={tabActiva === 'servicios' ? 'active' : ''} onClick={() => setTabActiva('servicios')}>
                    Servicios
                  </button>
                  <button className={tabActiva === 'politica' ? 'active' : ''} onClick={() => setTabActiva('politica')}>
                    Políticas
                  </button>
                </div>

                <div className="modal-sheet-body">
                  {tabActiva === 'tarifas' && (
                    <div className="modal-pane-content">
                      <div className="rate-blocks-selector">
                        {PLANES_TARIFARIOS.map(plan => {
                          const precioPlan = calcularPrecioFinal(suiteModal.precio_noche_base, plan.multiplicador);
                          const seleccionado = planSeleccionado === plan.id;
                          return (
                            <div
                              key={plan.id}
                              className={`rate-block-option ${seleccionado ? 'selected' : ''}`}
                              onClick={() => setPlanSeleccionado(plan.id)}
                            >
                              <div className="rbo-left">
                                <span className="rbo-badge">{plan.badge}</span>
                                <h4>{plan.nombre}</h4>
                                <ul>
                                  {plan.beneficios.map((b, i) => <li key={i}>✓ {b}</li>)}
                                </ul>
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
                      <p>{suiteModal.detalles_confort || 'Sin especificaciones registradas.'}</p>
                      {suiteModal.amenidades_destacadas && (
                        <div className="amenidades-badges-box">
                          <span className="amenidades-label">Amenidades destacadas</span>
                          <div className="amenidades-chips-list">
                            {suiteModal.amenidades_destacadas.split(',').map((amenidad, idx) => (
                              <span key={idx} className="amenidad-chip">
                                <span className="chip-bullet">•</span> {amenidad.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {tabActiva === 'bano' && (
                    <div className="modal-pane-content">
                      <p>{suiteModal.detalles_bano || 'Equipamiento estándar con amenidades L’Occitane.'}</p>
                    </div>
                  )}

                  {tabActiva === 'tech' && (
                    <div className="modal-pane-content">
                      <p>{suiteModal.detalles_tecnologia || 'Tecnología estándar con Wi-Fi y Smart TV.'}</p>
                    </div>
                  )}

                  {tabActiva === 'servicios' && (
                    <div className="modal-pane-content">
                      <p>{suiteModal.servicios_incluidos || 'Hospedaje All-Inclusive con servicio 24/7.'}</p>
                    </div>
                  )}

                  {tabActiva === 'politica' && (
                    <div className="modal-pane-content">
                      <p>{suiteModal.politica_suite || 'Check-in: 15:00 hrs | Check-out: 12:00 hrs. Espacio libre de humo.'}</p>
                    </div>
                  )}
                </div>

                <div className="modal-sheet-foot">
                  <div className="modal-rate-indicator">
                    <small>{planActualObj.nombre}</small>
                    <strong>
                      ${Number(calcularPrecioFinal(suiteModal.precio_noche_base, planActualObj.multiplicador)).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </strong>
                    <small style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                      + 16% IVA + 5% ISH + Saneamiento
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn-card-primary"
                    onClick={() => handleIrADisponibilidad(suiteModal, planActualObj)}
                  >
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