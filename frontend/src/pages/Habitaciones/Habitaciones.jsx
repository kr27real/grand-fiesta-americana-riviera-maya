import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSuites } from '../../services/api';
import { 
  Users, Bed, Maximize2, Calendar, ShieldAlert, 
  ArrowRight, X, ChevronLeft, ChevronRight, AlertCircle 
} from 'lucide-react';
import './Habitaciones.css';

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

  // Filtros Isotope
  const [filtroCategoria, setFiltroCategoria] = useState('*');
  const [filtroCama, setFiltroCama] = useState('*');

  // Modal Ficha Técnica y Slider interno
  const [suiteModal, setSuiteModal] = useState(null);
  const [tabActiva, setTabActiva] = useState('confort');
  const [fotoModalIndex, setFotoModalIndex] = useState(0);

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

  const handleIrADisponibilidad = (suite) => {
    const check = validarAforo(suite);
    if (!check.permitido) return;

    if (suiteModal) setSuiteModal(null);

    navigate('/disponibilidad', {
      state: {
        suite_id_preseleccionado: suite.suite_id,
        nombre_suite_preseleccionada: suite.nombre,
        fecha_llegada: fechaLlegada,
        fecha_salida: fechaSalida,
        adultos,
        ninos
      }
    });
  };

  // Parser seguro para las fotos de la suite
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

    // Normalizar a objetos con propiedad url y titulo
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
  };

  const fotosModalActual = obtenerFotosSuite(suiteModal);

  const siguienteFoto = () => {
    if (fotosModalActual.length === 0) return;
    setFotoModalIndex((prev) => (prev + 1) % fotosModalActual.length);
  };

  const anteriorFoto = () => {
    if (fotosModalActual.length === 0) return;
    setFotoModalIndex((prev) => (prev - 1 + fotosModalActual.length) % fotosModalActual.length);
  };

  return (
    <div className="posadas-rooms-page">
      
      {/* 1. BOOKING BAR */}
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

      {/* 2. INTRO EDITORIAL */}
      <section className="posadas-intro-section">
        <div className="posadas-container-narrow">
          <span className="brand-eyebrow">GRAND FIESTA AMERICANA RIVIERA CANCÚN</span>
          <h1 className="editorial-title">Habitaciones</h1>
          <h2 className="editorial-subtitle">Relájate frente al mar Caribe</h2>
          <p className="editorial-paragraph">
            Un refugio privado que se vuelve un espacio exclusivo y personal. Después de un día de disfrute bajo el sol, 
            la mejor recompensa es regresar a una habitación que tiene justo lo que anhelas para el descanso. Con un total 
            de 600 habitaciones y suites distribuidas en cinco categorías, ofrecemos el escenario ideal 
            definido por la amplitud, la elegancia relajada y el ritmo pausado del mar.
          </p>
        </div>
      </section>

      {/* 3. FILTROS ISOTOPE */}
      <section className="posadas-filters-section">
        <div className="posadas-container">
          <div className="filters-flex">
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
      </section>

      {/* 4. GRID DE TARJETAS */}
      <section className="posadas-cards-section">
        <div className="posadas-container">
          
          {cargando && <div className="posadas-loader">Consultando catálogo en SQL Server...</div>}
          {error && <div className="posadas-error"><AlertCircle size={18} /> {error}</div>}

          <div className="rooms-grid-layout">
            {suitesFiltradas.map((suite) => {
              const aforo = validarAforo(suite);
              const esSoloAdultos = Number(suite.capacidad_ninos) === 0;

              return (
                <div key={suite.suite_id} className={`room-luxury-card ${!aforo.permitido ? 'room-unfit' : ''}`}>
                  
                  <div className="card-media-box">
                    <img src={suite.foto_principal} alt={suite.nombre} loading="lazy" />
                    
                    {esSoloAdultos && (
                      <span className="badge-adults-only">
                        <ShieldAlert size={12} /> Solo Adultos (+18)
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
                        <span>{suite.metros_cuadrados} Mts</span>
                      </li>
                    </ul>
                  </div>

                  <div className="card-content-box">
                    <h3 className="room-name">{suite.nombre}</h3>

                    <div className="rate-from-box">
                      <span className="rate-caption">Tarifas Desde</span>
                      <strong className="rate-amount">
                        <small>MXN</small> ${Number(suite.precio_noche_base).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>

                    <div className="card-footer-buttons">
                      <button 
                        type="button" 
                        className="btn-card-outline"
                        onClick={() => abrirModalSuite(suite)}
                      >
                        Ver más
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

      {/* 5. CALLOUT FIESTA REWARDS */}
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

      {/* 6. MODAL FICHA TÉCNICA CON SLIDER DE IMÁGENES */}
      {suiteModal && (
        <div className="modal-backdrop-luxury" onClick={() => setSuiteModal(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setSuiteModal(null)}>
              <X size={20} />
            </button>

            {/* SECCIÓN DEL SLIDER DENTRO DEL MODAL */}
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
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        type="button" 
                        className="modal-slider-nav next"
                        onClick={siguienteFoto}
                        aria-label="Foto siguiente"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  <div className="modal-photo-caption">
                    <span>{fotosModalActual[fotoModalIndex]?.titulo}</span>
                    <small>{fotoModalIndex + 1} / {fotosModalActual.length}</small>
                  </div>
                </div>

                {/* TIRA DE MINIATURAS (THUMBNAILS) */}
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

            <div className="modal-sheet-head">
              <span className="brand-eyebrow">{suiteModal.categoria}</span>
              <h2>{suiteModal.nombre}</h2>
              <div className="modal-tags">
                <span>{suiteModal.metros_cuadrados} m²</span>
                <span>{suiteModal.tipo_cama}</span>
                <span>Vista: {suiteModal.vista_tipo}</span>
                <span>Capacidad: {suiteModal.capacidad_adultos} Adultos / {suiteModal.capacidad_ninos} Niños</span>
              </div>
            </div>

            <div className="modal-tabs-nav">
              <button className={tabActiva === 'confort' ? 'active' : ''} onClick={() => setTabActiva('confort')}>
                Confort & Descanso
              </button>
              <button className={tabActiva === 'bano' ? 'active' : ''} onClick={() => setTabActiva('bano')}>
                Baño Spa
              </button>
              <button className={tabActiva === 'tech' ? 'active' : ''} onClick={() => setTabActiva('tech')}>
                Domótica & Audio
              </button>
              <button className={tabActiva === 'servicios' ? 'active' : ''} onClick={() => setTabActiva('servicios')}>
                Servicios Incluidos
              </button>
              <button className={tabActiva === 'politica' ? 'active' : ''} onClick={() => setTabActiva('politica')}>
                Políticas
              </button>
            </div>

            <div className="modal-sheet-body">
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
                <small>Tarifa por noche</small>
                <strong>${Number(suiteModal.precio_noche_base).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
              </div>
              <button 
                type="button" 
                className="btn-card-primary"
                onClick={() => handleIrADisponibilidad(suiteModal)}
              >
                Configurar en Disponibilidad <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}