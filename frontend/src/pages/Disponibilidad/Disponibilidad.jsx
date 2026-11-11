import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSuites } from '../../services/api';
import { 
  Calendar, Users, Baby, Tag, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, Info, RefreshCw, Eye, ArrowLeft, Bed, Maximize2
} from 'lucide-react';
import './Disponibilidad.css';

export default function Disponibilidad() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state || {};

  // 1. Estados de Fecha y Aforo
  const [fechaLlegada, setFechaLlegada] = useState(stateData.fecha_llegada || '2026-12-01');
  const [fechaSalida, setFechaSalida] = useState(stateData.fecha_salida || '2026-12-05');
  const [adultos, setAdultos] = useState(stateData.adultos || 2);
  const [ninos, setNinos] = useState(stateData.ninos || 0);

  // 2. Inventario y Carga
  const [suites, setSuites] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [soloAptas, setSoloAptas] = useState(true);

  // 3. Plan Tarifario Seleccionado por Suite
  const [planSeleccionado, setPlanSeleccionado] = useState({});

  useEffect(() => {
    cargarInventario();
  }, []);

  const calcularNoches = () => {
    const d1 = new Date(fechaLlegada);
    const d2 = new Date(fechaSalida);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };
  const totalNoches = calcularNoches();

  const cargarInventario = async () => {
    setErrorMsg('');
    setCargando(true);
    try {
      const data = await fetchSuites();
      const suitesArray = Array.isArray(data) ? data : [];
      setSuites(suitesArray);

      // Inicializar cada suite con el plan 'FLEXIBLE'
      const planesInit = {};
      suitesArray.forEach(s => {
        planesInit[s.suite_id] = 'FLEXIBLE';
      });
      setPlanSeleccionado(planesInit);
    } catch (err) {
      setErrorMsg('No se pudo conectar con el motor de reservas en SQL Server.');
    } finally {
      setCargando(false);
    }
  };

  // Validación de Aforo Hotelero
  const validarAforo = (suite) => {
    const maxAdultos = Number(suite.capacidad_adultos) || 2;
    const maxNinos = Number(suite.capacidad_ninos) || 0;
    const esSoloAdultos = maxNinos === 0;

    if (esSoloAdultos && ninos > 0) {
      return { permitida: false, razon: 'Exclusiva Solo Adultos (+18)' };
    }
    if (adultos > maxAdultos) {
      return { permitida: false, razon: `Máximo ${maxAdultos} Adultos` };
    }
    if (ninos > maxNinos) {
      return { permitida: false, razon: `Máximo ${maxNinos} Niños` };
    }
    return { permitida: true, razon: 'Disponible' };
  };

  // 3 Planes Tarifarios Oficiales de Grupo Posadas
  const obtenerPlanesSuite = (precioBase) => {
    const base = Number(precioBase) || 6200;
    return [
      {
        id: 'FLEXIBLE',
        nombre: 'Tarifa Flexible All-Inclusive',
        descripcion: 'Cancelación sin penalización hasta 48 hrs antes del check-in.',
        precioNoche: base,
        beneficio: 'Garantía Estándar'
      },
      {
        id: 'FIESTA_REWARDS',
        nombre: 'Tarifa Exclusiva Socio Fiesta Rewards',
        descripcion: '10% de descuento directo + acumulación de puntos FR y amenidad.',
        precioNoche: base * 0.90,
        beneficio: '10% OFF SOCIO'
      },
      {
        id: 'PAQUETE_VIP',
        nombre: 'Experiencia Signature Cava & Spa',
        descripcion: 'Incluye botella de champagne Moët & Chandon y circuito de hidroterapia para dos.',
        precioNoche: base + 2450.00,
        beneficio: 'Experiencia VIP'
      }
    ];
  };

  const handleSeleccionarPlan = (suiteId, planId) => {
    setPlanSeleccionado(prev => ({ ...prev, [suiteId]: planId }));
  };

  // Transición directa al Paso 3: Checkout.jsx
  const handleAvanzarCheckout = (suite) => {
    const aforo = validarAforo(suite);
    if (!aforo.permitida) return;

    const planElegidoId = planSeleccionado[suite.suite_id] || 'FLEXIBLE';
    const planes = obtenerPlanesSuite(suite.precio_noche_base);
    const planDetalle = planes.find(p => p.id === planElegidoId) || planes[0];

    navigate('/checkout', {
      state: {
        suite_id: suite.suite_id,
        nombre_suite: suite.nombre,
        categoria: suite.categoria,
        precio_noche_base: planDetalle.precioNoche,
        plan_tarifario: planDetalle.nombre,
        plan_id: planDetalle.id,
        foto_principal: suite.foto_principal,
        tipo_cama: suite.tipo_cama,
        metros_cuadrados: suite.metros_cuadrados,
        fecha_llegada: fechaLlegada,
        fecha_salida: fechaSalida,
        noches: totalNoches,
        adultos: adultos,
        ninos: ninos
      }
    });
  };

  const suitesFiltradas = suites.filter(s => {
    if (soloAptas) {
      return validarAforo(s).permitida;
    }
    return true;
  });

  return (
    <div className="ibe-flow-page">
      
      {/* 1. STEPPER BREADCRUMB (BARRA DE ETAPAS DEL EMBUDO) */}
      <div className="ibe-stepper-header">
        <div className="ibe-container stepper-content">
          <button type="button" className="btn-back" onClick={() => navigate('/habitaciones')}>
            <ArrowLeft size={16} /> Volver al Catálogo
          </button>
          
          <div className="stepper-track">
            <span className="step-badge completed">1. Catálogo Suites</span>
            <span className="step-arrow">›</span>
            <span className="step-badge current">2. Fechas & Tarifas</span>
            <span className="step-arrow">›</span>
            <span className="step-badge pending">3. Personalización & Pago</span>
          </div>
        </div>
      </div>

      {/* 2. CONSOLA DE BÚSQUEDA Y MODIFICACIÓN DE FECHAS */}
      <section className="ibe-search-bar-wrap">
        <div className="ibe-container">
          <div className="ibe-search-bar-card">
            
            <div className="search-field">
              <label><Calendar size={13} /> LLEGADA</label>
              <input 
                type="date" 
                value={fechaLlegada} 
                onChange={(e) => setFechaLlegada(e.target.value)} 
              />
            </div>

            <div className="stay-nights-badge">
              <span>{totalNoches} noche(s)</span>
            </div>

            <div className="search-field">
              <label><Calendar size={13} /> SALIDA</label>
              <input 
                type="date" 
                value={fechaSalida} 
                onChange={(e) => setFechaSalida(e.target.value)} 
              />
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

            <button type="button" className="btn-search-update" onClick={cargarInventario}>
              <RefreshCw size={14} /> Actualizar
            </button>

          </div>
        </div>
      </section>

      {/* 3. LISTADO DE SUITES Y PLANES TARIFARIOS */}
      <main className="ibe-main-content">
        <div className="ibe-container">
          
          <div className="ibe-results-toolbar">
            <div>
              <h2>Suites Disponibles en Quintana Roo</h2>
              <p>Tarifas por noche para <strong>{adultos} Adultos</strong> {ninos > 0 ? `y ${ninos} Niños` : ''} ({totalNoches} noches de estancia).</p>
            </div>

            <label className="toggle-aptas">
              <input 
                type="checkbox" 
                checked={soloAptas} 
                onChange={(e) => setSoloAptas(e.target.checked)} 
              />
              <span>Mostrar solo suites disponibles para mi aforo</span>
            </label>
          </div>

          {cargando && (
            <div className="ibe-loading-box">
              <div className="ibe-spinner"></div>
              <h3>Consultando motor de disponibilidad en SQL Server...</h3>
            </div>
          )}

          {errorMsg && (
            <div className="ibe-error-box">
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="suites-inventory-stack">
            {suitesFiltradas.map(suite => {
              const aforo = validarAforo(suite);
              const planes = obtenerPlanesSuite(suite.precio_noche_base);
              const planActualId = planSeleccionado[suite.suite_id] || 'FLEXIBLE';
              const planActual = planes.find(p => p.id === planActualId) || planes[0];
              const totalEstancia = planActual.precioNoche * totalNoches;

              return (
                <article key={suite.suite_id} className={`suite-ibe-card ${!aforo.permitida ? 'unfit' : ''}`}>
                  
                  {/* IMAGEN Y METRAJE */}
                  <div className="suite-ibe-media">
                    <img src={suite.foto_principal} alt={suite.nombre} loading="lazy" />
                    <span className="media-cat-pill">{suite.categoria}</span>
                    <div className="media-footer-pills">
                      <span><Maximize2 size={13} /> {suite.metros_cuadrados} m²</span>
                      <span><Bed size={13} /> {suite.tipo_cama}</span>
                    </div>
                  </div>

                  {/* INFO Y SELECTOR DE TARIFAS */}
                  <div className="suite-ibe-details">
                    <div className="suite-title-row">
                      <h3>{suite.nombre}</h3>
                      {!aforo.permitida && <span className="unfit-tag">{aforo.razon}</span>}
                    </div>

                    <p className="suite-desc">{suite.descripcion}</p>

                    <div className="rate-plans-group">
                      <span className="rates-group-title">Selecciona tu Plan Tarifario:</span>
                      
                      {planes.map(plan => (
                        <div 
                          key={plan.id}
                          className={`rate-plan-option ${planActualId === plan.id ? 'active' : ''}`}
                          onClick={() => handleSeleccionarPlan(suite.suite_id, plan.id)}
                        >
                          <div className="plan-radio-col">
                            <input 
                              type="radio" 
                              name={`plan_${suite.suite_id}`} 
                              checked={planActualId === plan.id}
                              readOnly 
                            />
                            <div>
                              <strong>{plan.nombre}</strong>
                              <span className="plan-badge">{plan.beneficio}</span>
                              <p className="plan-desc">{plan.descripcion}</p>
                            </div>
                          </div>

                          <div className="plan-price-col">
                            <span className="plan-night-price">${Math.round(plan.precioNoche).toLocaleString('es-MX')} MXN</span>
                            <small>/ noche</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TOTAL Y BOTÓN DE AVANCE */}
                  <div className="suite-ibe-action-col">
                    <div className="action-top">
                      <span className="label-total">Total estancia ({totalNoches} noches):</span>
                      <strong className="figure-total">${Math.round(totalEstancia).toLocaleString('es-MX')} MXN</strong>
                      <small className="taxes-notice">Más IVA (16%), ISH (5%) y saneamiento</small>
                    </div>

                    <button 
                      type="button" 
                      disabled={!aforo.permitida}
                      className={`btn-advance-checkout ${!aforo.permitida ? 'btn-unfit' : ''}`}
                      onClick={() => handleAvanzarCheckout(suite)}
                    >
                      {aforo.permitida ? (
                        <>Continuar al Pago <ArrowRight size={16} /></>
                      ) : (
                        aforo.razon
                      )}
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