import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSuites } from '../../services/api';
import { 
  Calendar, Users, Baby, Tag, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, 
  Bed, Maximize2, Award, Flame, ChevronDown, ChevronUp, DollarSign
} from 'lucide-react';
import './Disponibilidad.css';

const SUITES_FALLBACK = [
  {
    suite_id: 1,
    nombre: 'Deluxe Junior Suite Tropical View',
    categoria: 'JUNIOR SUITES',
    metros_cuadrados: 52,
    tipo_cama: '1 Cama King Size o 2 Dobles',
    capacidad_adultos: 3,
    capacidad_ninos: 1,
    precio_noche_base: 6200,
    habitaciones_disponibles: 4,
    descripcion: 'Elegante suite con terraza privada con vistas a la reserva tropical y manglar protegido, equipada con tina de inmersión y amenidades L’Occitane.',
    foto_principal: 'https://image-tc.galaxy.tf/wipng-ewud5ufube3uynaref2e2bpvy/render-hab-king-5_standard.png?crop=121%2C0%2C725%2C544&width=1200'
  },
  {
    suite_id: 2,
    nombre: 'Deluxe Ocean Front Suite',
    categoria: 'OCEAN FRONT SUITES',
    metros_cuadrados: 64,
    tipo_cama: '1 Cama King Size',
    capacidad_adultos: 2,
    capacidad_ninos: 0,
    precio_noche_base: 8900,
    habitaciones_disponibles: 2,
    descripcion: 'Exclusiva suite solo adultos frente al mar Caribe con balcón panorámico, servicio de mayordomo y acceso preferencial a zonas VIP.',
    foto_principal: 'https://image-tc.galaxy.tf/wijpeg-d5kep978mo77ypyupyy4tiaqn/render-hab-king-9_standard.jpg?crop=250%2C0%2C1500%2C1125&width=1200'
  },
  {
    suite_id: 3,
    nombre: 'Grand Club Master Suite Ocean View',
    categoria: 'GRAND CLUB SUITES',
    metros_cuadrados: 95,
    tipo_cama: '1 Cama King Size + Sofá Cama',
    capacidad_adultos: 4,
    capacidad_ninos: 2,
    precio_noche_base: 12500,
    habitaciones_disponibles: 2,
    descripcion: 'Amplia estancia con sala independiente, comedor privado y acceso ilimitado al Grand Club Lounge con desayuno gourmet y champagne.',
    foto_principal: 'https://image-tc.galaxy.tf/wijpeg-1vkvkxf8aswz8zp6cnv3al62n/2998_photo.jpg'
  }
];

const CUPONES_VALIDOS = {
  'PROMO15': { descuento: 0.15, etiqueta: '15% OFF Temporada Playa + Traslado' },
  'APERTURA2027': { descuento: 0.20, etiqueta: '20% OFF Tarifa Inaugural 2027' },
  'VIVE30': { descuento: 0.30, etiqueta: '30% OFF Reserva Directa Web' },
  'ROMANCE': { descuento: 0.12, etiqueta: '12% OFF Escapada Romántica & Spa' },
  'TITANIUM': { descuento: 0.15, etiqueta: '15% OFF Exclusivo Socio Titanium' }
};

const TIPO_CAMBIO_USD = 18.50;

export default function Disponibilidad() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state || {};

  const hoyISO = new Date().toISOString().substring(0, 10);
  const [fechaLlegada, setFechaLlegada] = useState(stateData.fecha_llegada || '2026-12-01');
  const [fechaSalida, setFechaSalida] = useState(stateData.fecha_salida || '2026-12-05');
  const [adultos, setAdultos] = useState(Number(stateData.adultos) || 2);
  const [ninos, setNinos] = useState(Number(stateData.ninos) || 0);
  const [moneda, setMoneda] = useState('MXN');

  const [codigoPromoInput, setCodigoPromoInput] = useState(stateData.codigo_promocion || '');
  const [cuponActivo, setCuponActivo] = useState(() => {
    const code = (stateData.codigo_promocion || '').toUpperCase();
    return CUPONES_VALIDOS[code] ? { codigo: code, ...CUPONES_VALIDOS[code] } : null;
  });
  const [promoFeedback, setPromoFeedback] = useState('');

  const suitePreseleccionadaId = stateData.suite_id_preseleccionado || null;

  const [suites, setSuites] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dbOffline, setDbOffline] = useState(false);
  const [soloAptas, setSoloAptas] = useState(true);
  const [planSeleccionado, setPlanSeleccionado] = useState({});
  const [desgloseAbierto, setDesgloseAbierto] = useState({});

  useEffect(() => {
    cargarInventario();
  }, []);

  const handleCambioLlegada = (nuevaLlegada) => {
    setFechaLlegada(nuevaLlegada);
    if (nuevaLlegada >= fechaSalida) {
      const d = new Date(nuevaLlegada);
      d.setDate(d.getDate() + 1);
      setFechaSalida(d.toISOString().substring(0, 10));
    }
  };

  const calcularNoches = () => {
    const d1 = new Date(fechaLlegada);
    const d2 = new Date(fechaSalida);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };
  const totalNoches = calcularNoches();

  const cargarInventario = async () => {
    setDbOffline(false);
    setCargando(true);
    try {
      const data = await fetchSuites();
      let suitesArray = Array.isArray(data) && data.length > 0 ? data : SUITES_FALLBACK;

      if (suitePreseleccionadaId) {
        suitesArray = [...suitesArray].sort((a, b) => 
          a.suite_id === suitePreseleccionadaId ? -1 : b.suite_id === suitePreseleccionadaId ? 1 : 0
        );
      }

      setSuites(suitesArray);

      const planesInit = {};
      suitesArray.forEach(s => {
        planesInit[s.suite_id] =
          s.suite_id === suitePreseleccionadaId && stateData.plan_id_preseleccionado
            ? stateData.plan_id_preseleccionado
            : 'FLEXIBLE';
      });
      setPlanSeleccionado(planesInit);
    } catch (err) {
      console.warn('SQL Server no disponible en disponibilidad, usando inventario de respaldo:', err);
      setDbOffline(true);
      setSuites(SUITES_FALLBACK);
      const planesInit = {};
      SUITES_FALLBACK.forEach(s => {
        planesInit[s.suite_id] =
          s.suite_id === suitePreseleccionadaId && stateData.plan_id_preseleccionado
            ? stateData.plan_id_preseleccionado
            : 'FLEXIBLE';
      });
      setPlanSeleccionado(planesInit);
    } finally {
      setCargando(false);
    }
  };

  const handleAplicarCupon = (e) => {
    e.preventDefault();
    const code = codigoPromoInput.trim().toUpperCase();
    if (!code) {
      setCuponActivo(null);
      setPromoFeedback('');
      return;
    }
    if (CUPONES_VALIDOS[code]) {
      setCuponActivo({ codigo: code, ...CUPONES_VALIDOS[code] });
      setPromoFeedback(`✓ Código ${code} aplicado (${CUPONES_VALIDOS[code].etiqueta})`);
    } else {
      setCuponActivo(null);
      setPromoFeedback('Código promocional no vigente. Prueba con PROMO15 o VIVE30.');
    }
  };

  const formatMoney = (montoMxn) => {
    const valor = moneda === 'USD' ? montoMxn / TIPO_CAMBIO_USD : montoMxn;
    return `${moneda === 'USD' ? 'US$' : '$'}${valor.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${moneda}`;
  };

  const validarAforo = (suite) => {
    const maxAdultos = Number(suite.capacidad_adultos) || 2;
    const maxNinos = Number(suite.capacidad_ninos) || 0;
    const esSoloAdultos = maxNinos === 0;

    if (esSoloAdultos && ninos > 0) return { permitida: false, razon: 'Exclusiva Solo Adultos (+18)' };
    if (adultos > maxAdultos) return { permitida: false, razon: `Máximo ${maxAdultos} Adultos` };
    if (ninos > maxNinos) return { permitida: false, razon: `Máximo ${maxNinos} Niños` };
    return { permitida: true, razon: 'Disponible' };
  };

  const obtenerPlanesSuite = (precioBase) => {
    const baseOriginal = Number(precioBase) || 6200;
    const factorSocio = !cuponActivo && stateData.precio_aplicado ? 0.80 : 1;
    const factorPromo = cuponActivo ? (1 - cuponActivo.descuento) : factorSocio;
    const base = baseOriginal * factorPromo;

    return [
      {
        id: 'FLEXIBLE',
        nombre: 'Tarifa Flexible All-Inclusive',
        descripcion: 'Cancelación sin penalización hasta 48 hrs antes del check-in. Alimentos y bebidas ilimitadas.',
        precioNoche: base,
        precioOriginal: baseOriginal,
        beneficio: cuponActivo ? `${cuponActivo.codigo} APLICADO` : (factorSocio < 1 ? 'TITANIUM -20%' : 'Garantía Estándar')
      },
      {
        id: 'FIESTA_REWARDS',
        nombre: 'Tarifa Exclusiva Socio Fiesta Rewards',
        descripcion: '10% de descuento adicional sobre tarifa + acumulación doble de puntos FR y amenidad de bienvenida.',
        precioNoche: base * 0.90,
        precioOriginal: baseOriginal,
        beneficio: '10% EXTRA SOCIO'
      },
      {
        id: 'PAQUETE_VIP',
        nombre: 'Experiencia Signature Cava & Spa',
        descripcion: 'Incluye botella de champagne Moët & Chandon y circuito de hidroterapia en Feel Harmony Spa para dos.',
        precioNoche: base + 2450.00,
        precioOriginal: baseOriginal + 2450.00,
        beneficio: 'Experiencia VIP'
      }
    ];
  };

  const calcularDesgloseFiscal = (precioNocheMxn) => {
    const subtotal = precioNocheMxn * totalNoches;
    const iva = subtotal * 0.16;
    const ish = subtotal * 0.05;
    const saneamiento = 33.00 * totalNoches;
    const totalGeneral = subtotal + iva + ish + saneamiento;
    const puntosGanados = Math.round((subtotal / TIPO_CAMBIO_USD) * 10);
    return { subtotal, iva, ish, saneamiento, totalGeneral, puntosGanados };
  };

  const handleAvanzarCheckout = (suite) => {
    const aforo = validarAforo(suite);
    if (!aforo.permitida) return;

    const planElegidoId = planSeleccionado[suite.suite_id] || 'FLEXIBLE';
    const planes = obtenerPlanesSuite(suite.precio_noche_base);
    const planDetalle = planes.find(p => p.id === planElegidoId) || planes[0];
    const fiscal = calcularDesgloseFiscal(planDetalle.precioNoche);

    navigate('/checkout', {
      state: {
        suite_id: suite.suite_id,
        nombre_suite: suite.nombre,
        categoria: suite.categoria,
        precio_noche_base: planDetalle.precioNoche,
        plan_tarifario: planDetalle.nombre,
        plan_id: planDetalle.id,
        codigo_promocion: cuponActivo ? cuponActivo.codigo : null,
        foto_principal: suite.foto_principal,
        tipo_cama: suite.tipo_cama,
        metros_cuadrados: suite.metros_cuadrados,
        fecha_llegada: fechaLlegada,
        fecha_salida: fechaSalida,
        noches: totalNoches,
        adultos,
        ninos,
        moneda,
        subtotal: fiscal.subtotal,
        iva: fiscal.iva,
        ishe: fiscal.ish,
        saneamiento_ambiental: fiscal.saneamiento,
        total_general: fiscal.totalGeneral,
        puntos_a_ganar: fiscal.puntosGanados
      }
    });
  };

  const suitesFiltradas = suites.filter(s => (soloAptas ? validarAforo(s).permitida : true));

  return (
    <div className="ibe-flow-page">
      
      {/* 1. STEPPER BREADCRUMB */}
      <div className="ibe-stepper-header">
        <div className="ibe-container stepper-content">
          <button type="button" className="btn-back" onClick={() => navigate('/habitaciones')}>
            <ArrowLeft size={16} /> Volver al Catálogo
          </button>
          
          <div className="stepper-track">
            <span className="step-badge completed">1. Catálogo Suites</span>
            <span className="step-arrow">›</span>
            <span className="step-badge current">2. Fechas &amp; Tarifas</span>
            <span className="step-arrow">›</span>
            <span className="step-badge pending">3. Personalización &amp; Pago</span>
          </div>

          <div className="currency-switcher">
            <DollarSign size={14} />
            <button type="button" className={moneda === 'MXN' ? 'active' : ''} onClick={() => setMoneda('MXN')}>MXN</button>
            <span>|</span>
            <button type="button" className={moneda === 'USD' ? 'active' : ''} onClick={() => setMoneda('USD')}>USD</button>
          </div>
        </div>
      </div>

      {/* 2. CONSOLA DE BÚSQUEDA, FECHAS Y CÓDIGO PROMOCIONAL */}
      <section className="ibe-search-bar-wrap">
        <div className="ibe-container">
          <div className="ibe-search-bar-card">
            <div className="search-field">
              <label><Calendar size={13} /> LLEGADA</label>
              <input type="date" min={hoyISO} value={fechaLlegada} onChange={(e) => handleCambioLlegada(e.target.value)} />
            </div>

            <div className="stay-nights-badge">
              <span>{totalNoches} noche(s)</span>
            </div>

            <div className="search-field">
              <label><Calendar size={13} /> SALIDA</label>
              <input type="date" min={fechaLlegada} value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} />
            </div>

            <div className="search-field">
              <label><Users size={13} /> ADULTOS</label>
              <select value={adultos} onChange={(e) => setAdultos(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Adultos</option>)}
              </select>
            </div>

            <div className="search-field">
              <label><Baby size={13} /> NIÑOS (0-12)</label>
              <select value={ninos} onChange={(e) => setNinos(Number(e.target.value))}>
                {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n} Niños</option>)}
              </select>
            </div>

            <form onSubmit={handleAplicarCupon} className="search-field promo-field">
              <label><Tag size={13} /> CÓDIGO PROMO</label>
              <div className="promo-input-group">
                <input 
                  type="text" 
                  placeholder="Ej. PROMO15" 
                  value={codigoPromoInput} 
                  onChange={(e) => setCodigoPromoInput(e.target.value.toUpperCase())} 
                />
                <button type="submit" className="btn-apply-promo">Aplicar</button>
              </div>
            </form>
          </div>

          {promoFeedback && (
            <div className={`promo-status-banner ${cuponActivo ? 'valid' : 'invalid'}`}>
              {promoFeedback}
            </div>
          )}
        </div>
      </section>

      {/* 3. LISTADO DE SUITES Y PLANES TARIFARIOS */}
      <main className="ibe-main-content">
        <div className="ibe-container">
          <div className="ibe-results-toolbar">
            <div>
              <h2>Suites Disponibles en Riviera Cancún</h2>
              <p>Tarifas por noche para <strong>{adultos} Adultos</strong> {ninos > 0 ? `y ${ninos} Niños` : ''} ({totalNoches} noches de estancia).</p>
            </div>

            <label className="toggle-aptas">
              <input type="checkbox" checked={soloAptas} onChange={(e) => setSoloAptas(e.target.checked)} />
              <span>Mostrar solo suites disponibles para mi aforo</span>
            </label>
          </div>

          {dbOffline && (
            <div className="ibe-cache-notice">
              <ShieldCheck size={15} /> Mostrando tarifas garantizadas de Grupo Posadas (Modo Contingencia Activo)
            </div>
          )}

          {cargando && (
            <div className="ibe-loading-box">
              <div className="ibe-spinner"></div>
              <h3>Consultando motor de disponibilidad en SQL Server...</h3>
            </div>
          )}

          <div className="suites-inventory-stack">
            {suitesFiltradas.map(suite => {
              const aforo = validarAforo(suite);
              const planes = obtenerPlanesSuite(suite.precio_noche_base);
              const planActualId = planSeleccionado[suite.suite_id] || 'FLEXIBLE';
              const planActual = planes.find(p => p.id === planActualId) || planes[0];
              const fiscal = calcularDesgloseFiscal(planActual.precioNoche);
              const esPreseleccionada = suite.suite_id === suitePreseleccionadaId;
              const disponibilidadRestante = suite.habitaciones_disponibles || 3;
              const mostrarDesglose = !!desgloseAbierto[suite.suite_id];

              return (
                <article 
                  key={suite.suite_id} 
                  className={`suite-ibe-card ${!aforo.permitida ? 'unfit' : ''} ${esPreseleccionada ? 'highlighted-suite' : ''}`}
                >
                  <div className="suite-ibe-media">
                    <img src={suite.foto_principal} alt={suite.nombre} loading="lazy" />
                    <span className="media-cat-pill">{suite.categoria}</span>
                    {esPreseleccionada && <span className="media-selected-pill">★ Tu Selección</span>}
                    <div className="media-footer-pills">
                      <span><Maximize2 size={13} /> {suite.metros_cuadrados} m²</span>
                      <span><Bed size={13} /> {suite.tipo_cama}</span>
                    </div>
                  </div>

                  <div className="suite-ibe-details">
                    <div className="suite-title-row">
                      <h3>{suite.nombre}</h3>
                      {!aforo.permitida ? (
                        <span className="unfit-tag">{aforo.razon}</span>
                      ) : disponibilidadRestante <= 3 ? (
                        <span className="scarcity-tag">
                          <Flame size={12} /> ¡Últimas {disponibilidadRestante} suites disponibles!
                        </span>
                      ) : null}
                    </div>

                    <p className="suite-desc">{suite.descripcion}</p>

                    <div className="rate-plans-group">
                      <span className="rates-group-title">Selecciona tu Plan Tarifario:</span>
                      
                      {planes.map(plan => (
                        <div 
                          key={plan.id} 
                          className={`rate-plan-option ${planActualId === plan.id ? 'active' : ''}`}
                          onClick={() => setPlanSeleccionado(prev => ({ ...prev, [suite.suite_id]: plan.id }))}
                        >
                          <div className="plan-radio-col">
                            <input type="radio" name={`plan_${suite.suite_id}`} checked={planActualId === plan.id} readOnly />
                            <div>
                              <strong>{plan.nombre}</strong>
                              <span className="plan-badge">{plan.beneficio}</span>
                              <p className="plan-desc">{plan.descripcion}</p>
                            </div>
                          </div>

                          <div className="plan-price-col">
                            {(cuponActivo || plan.precioOriginal > plan.precioNoche) && (
                              <del className="old-price">{formatMoney(plan.precioOriginal)}</del>
                            )}
                            <span className="plan-night-price">{formatMoney(plan.precioNoche)}</span>
                            <small>/ noche</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="suite-ibe-action-col">
                    <div className="action-top">
                      <span className="label-total">Subtotal ({totalNoches} noches):</span>
                      <strong className="figure-total">{formatMoney(fiscal.subtotal)}</strong>
                      
                      <div className="rewards-earn-pill">
                        <Award size={13} /> Acumulas <strong>+{fiscal.puntosGanados.toLocaleString()} pts</strong> Fiesta Rewards
                      </div>

                      <button 
                        type="button" 
                        className="btn-toggle-taxes"
                        onClick={() => setDesgloseAbierto(prev => ({ ...prev, [suite.suite_id]: !prev[suite.suite_id] }))}
                      >
                        <span>Total con impuestos: <strong>{formatMoney(fiscal.totalGeneral)}</strong></span>
                        {mostrarDesglose ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {mostrarDesglose && (
                        <div className="taxes-mini-breakdown">
                          <div><span>IVA (16%):</span> <span>{formatMoney(fiscal.iva)}</span></div>
                          <div><span>ISH Quintana Roo (5%):</span> <span>{formatMoney(fiscal.ish)}</span></div>
                          <div><span>Saneamiento Ambiental:</span> <span>{formatMoney(fiscal.saneamiento)}</span></div>
                        </div>
                      )}
                    </div>

                    <button 
                      type="button" 
                      disabled={!aforo.permitida}
                      className={`btn-advance-checkout ${!aforo.permitida ? 'btn-unfit' : ''}`}
                      onClick={() => handleAvanzarCheckout(suite)}
                    >
                      {aforo.permitida ? <>Continuar al Pago <ArrowRight size={16} /></> : aforo.razon}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}