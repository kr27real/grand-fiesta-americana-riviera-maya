import LoginModal from '../../components/LoginModal/LoginModal';
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSuites } from '../../services/api';
import { 
  BedDouble, Users, Sparkles, Check, ArrowRight, 
  Loader2, Maximize2, Eye, X, ChevronLeft, ChevronRight,
  Coffee, Wifi, ShieldCheck, Waves, Bath, Tv, Moon, Clock,
  Star, Search, SlidersHorizontal, Scale, Calculator, Calendar
} from 'lucide-react';
import './Habitaciones.css';

export default function Habitaciones() {
  const [toastNotif, setToastNotif] = useState(null);

  const mostrarToast = (mensaje, tipo = 'warning') => {
    setToastNotif({ mensaje, tipo });
    setTimeout(() => setToastNotif(null), 4500);
  };
  const navigate = useNavigate();

  // Estados para blindaje de autenticación de reserva
  const [modalLoginAbierto, setModalLoginAbierto] = useState(false);
  const [suitePendienteReserva, setSuitePendienteReserva] = useState(null);

    const handleSolicitarReserva = (e, suiteData, parametrosExtra = {}) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (suiteData && Number(suiteData.inventario_disponible) <= 0) {
      mostrarToast(`La suite "${suiteData.nombre}" se encuentra temporalmente agotada para estas fechas. Te invitamos a consultar otras categorías disponibles.`);
      return;
    }

    let usuario = null;
    try {
      usuario = JSON.parse(
        localStorage.getItem('usuario_gfa') ||
        localStorage.getItem('usuario') ||
        localStorage.getItem('gfa_user') ||
        'null'
      );
    } catch (err) {
      usuario = null;
    }

    const token = localStorage.getItem('token_gfa') || localStorage.getItem('token');
    const estaAutenticado = Boolean(usuario || token);

    if (!estaAutenticado) {
      setSuitePendienteReserva({ suite: suiteData, ...parametrosExtra });
      setModalLoginAbierto(true);
      return;
    }

    navigate('/checkout', {
      state: {
        suite: suiteData,
        ...parametrosExtra
      }
    });
  };
  
  const [suites, setSuites] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. Estados de Filtros Avanzados
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('TODAS');
  const [filtroAmenidad, setFiltroAmenidad] = useState('TODAS');
    const [filtroCama, setFiltroCama] = useState('TODAS');
  const [precioMaximo, setPrecioMaximo] = useState(40000);

  // 2. Estados del Comparador
  const [suitesAComparar, setSuitesAComparar] = useState([]);
  const [modalComparadorAbierto, setModalComparadorAbierto] = useState(false);

  // 3. Estados de la Ficha Técnica y Simulador
  const [suiteSeleccionada, setSuiteSeleccionada] = useState(null);
  const [fotoModalIndex, setFotoModalIndex] = useState(0);
  const [pestanaActiva, setPestanaActiva] = useState('confort');

  // Fechas del Simulador en el Modal
  const hoyStr = new Date().toISOString().substring(0, 10);
  const salidaDefecto = new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10);
  const [simLlegada, setSimLlegada] = useState(hoyStr);
  const [simSalida, setSimSalida] = useState(salidaDefecto);
  const [simAdultos, setSimAdultos] = useState(2);

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

  // Parser de fotos seguro
  const getFotosSuite = (suite) => {
    if (!suite) return [];
    try {
      if (suite.galeria_fotos) {
        const parsed = JSON.parse(suite.galeria_fotos);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* fallback */ }
    return [suite.foto_principal];
  };

  // Reseñas verificadas fijas por categoría
  const getResenasSuite = (suiteId) => {
    const resenasGenerales = [
      { autor: 'Carlos M. (Socio Platino)', calif: 5, fecha: 'Octubre 2026', comentario: 'La comodidad del colchón Sealy y las almohadas es insuperable. El servicio de mayordomo estuvo pendiente de cada detalle.' },
      { autor: 'Elena R. (Huésped Verificado)', calif: 5, fecha: 'Septiembre 2026', comentario: 'La vista al mar desde la terraza privada es un deleite total al amanecer. El minibar siempre estuvo resurtido con café Nespresso.' },
      { autor: 'David S. (Socio Oro)', calif: 4.9, fecha: 'Agosto 2026', comentario: 'El baño de mármol con tina exenta y amenidades L’Occitane eleva la estancia al nivel de los mejores resorts de ultra lujo.' }
    ];
    return resenasGenerales;
  };

  // Lógica de Filtrado Multicriterio
  const suitesFiltradas = useMemo(() => {
    return suites.filter(s => {
      const coincideCat = categoriaSeleccionada === 'TODAS' || s.categoria === categoriaSeleccionada;
      const coincidePrecio = Number(s.precio_noche_base) <= precioMaximo;
      const coincideBusqueda = 
        s.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        s.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        (s.vista_tipo && s.vista_tipo.toLowerCase().includes(busqueda.toLowerCase()));
      
      let coincideAmenidad = true;
      if (filtroAmenidad === 'SWIM_UP') coincideAmenidad = s.nombre.toLowerCase().includes('swim up') || (s.vista_tipo && s.vista_tipo.toLowerCase().includes('alberca'));
      if (filtroAmenidad === 'JACUZZI') coincideAmenidad = (s.detalles_bano && s.detalles_bano.toLowerCase().includes('jacuzzi')) || (s.amenidades_destacadas && s.amenidades_destacadas.toLowerCase().includes('jacuzzi'));
      if (filtroAmenidad === 'GRAND_CLUB') coincideAmenidad = s.categoria.toLowerCase().includes('grand club') || s.nombre.toLowerCase().includes('grand club');
      if (filtroAmenidad === 'FAMILIAR') coincideAmenidad = s.capacidad_adultos >= 4 || s.capacidad_ninos >= 2;

              let coincideCama = true;
        if (filtroCama === 'KING') coincideCama = s.tipo_cama && s.tipo_cama.toLowerCase().includes('king');
        if (filtroCama === 'DOBLE') coincideCama = s.tipo_cama && (s.tipo_cama.toLowerCase().includes('doble') || s.tipo_cama.toLowerCase().includes('queen'));

        return coincideCat && coincidePrecio && coincideBusqueda && coincideAmenidad && coincideCama;
    });
  }, [suites, categoriaSeleccionada, precioMaximo, busqueda, filtroAmenidad, filtroCama]);

  // Manejo del comparador
  const toggleComparar = (suite) => {
    if (suitesAComparar.find(item => item.suite_id === suite.suite_id)) {
      setSuitesAComparar(suitesAComparar.filter(item => item.suite_id !== suite.suite_id));
    } else {
      if (suitesAComparar.length >= 3) {
        alert('Puedes comparar un máximo de 3 suites al mismo tiempo.');
        return;
      }
      setSuitesAComparar([...suitesAComparar, suite]);
    }
  };

  // Cálculos del simulador en el modal
  const f1 = new Date(simLlegada);
  const f2 = new Date(simSalida);
  const nochesCalc = Math.ceil((f2 - f1) / (1000 * 60 * 60 * 24));
  const nochesSimuladas = nochesCalc > 0 ? nochesCalc : 1;

  const precioBaseSimulado = suiteSeleccionada ? Number(suiteSeleccionada.precio_noche_base) * nochesSimuladas : 0;
  const ivaSimulado = precioBaseSimulado * 0.16;
  const ishSimulado = precioBaseSimulado * 0.05;
  const saneamientoSimulado = 76.00 * nochesSimuladas;
  const totalSimulado = precioBaseSimulado + ivaSimulado + ishSimulado + saneamientoSimulado;

  return (
    <div style={{ backgroundColor: '#060508', minHeight: '100vh', color: '#ffffff', padding: '8.5rem 2rem 5rem', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto' }}>
        
        {/* Encabezado Principal */}
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.74rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 800 }}>
            Colección de Hospedaje • 618 Llaves Físicas
          </span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', color: '#f3e5ab', margin: '0.4rem 0 0.8rem 0' }}>
            Suites Frente al Mar & Jardines Privados
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.94rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            Fichas técnicas con transparencia arquitectónica, simulador de costos en vivo y herramienta de comparación lado a lado.
          </p>
        </header>

        {/* 1. BARRA DE FILTROS AVANZADOS Y BÚSQUEDA */}
        <div style={{ background: '#110f17', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '1.4rem 2rem', marginBottom: '3rem', boxShadow: '0 15px 35px rgba(0,0,0,0.85)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            
            {/* Buscador de texto */}
            <div>
              <label style={{ fontSize: '0.66rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                Buscar por Nombre o Atributo
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  placeholder="Ej. Swim Up, Jacuzzi, Terraza..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ width: '100%', background: '#161420', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '4px', padding: '0.65rem 0.8rem 0.65rem 2.2rem', color: '#fff', fontSize: '0.84rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Selector de Categoría */}
            <div>
              <label style={{ fontSize: '0.66rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                Categoría Arquitectónica
              </label>
              <select 
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                style={{ width: '100%', background: '#161420', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '4px', padding: '0.65rem 0.8rem', color: '#fff', fontSize: '0.84rem', outline: 'none' }}
              >
                <option value="TODAS">Todas las Categorías</option>
                {Array.from(new Set(suites.map(s => s.categoria))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Experiencia Clave */}
            <div>
              <label style={{ fontSize: '0.66rem', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                Experiencia Exclusiva
              </label>
              <select 
                value={filtroAmenidad}
                onChange={(e) => setFiltroAmenidad(e.target.value)}
                style={{ width: '100%', background: '#161420', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '4px', padding: '0.65rem 0.8rem', color: '#fff', fontSize: '0.84rem', outline: 'none' }}
              >
                <option value="TODAS">Cualquier Experiencia</option>
                <option value="SWIM_UP">Acceso Directo Swim Up</option>
                <option value="JACUZZI">Jacuzzi o Tina Exterior</option>
                <option value="GRAND_CLUB">Acceso Grand Club Lounge</option>
                <option value="FAMILIAR">Residencial Familiar (+4 pax)</option>
              </select>
            </div>

            {/* Slider de Precio */}
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

        {/* Mensaje de resultados */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Mostrando <strong>{suitesFiltradas.length}</strong> de {suites.length} suites disponibles
          </span>

          {suitesAComparar.length > 0 && (
            <button
              onClick={() => setModalComparadorAbierto(true)}
              style={{
                background: 'linear-gradient(135deg, #d4af37, #aa8212)',
                color: '#060508',
                border: 'none',
                padding: '0.55rem 1.4rem',
                borderRadius: '25px',
                fontSize: '0.76rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(212,175,55,0.4)'
              }}
            >
              <Scale size={15} /> Comparar Suites ({suitesAComparar.length}/3)
            </button>
          )}
        </div>

        {/* Grilla de Suites */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Loader2 size={40} className="animate-spin" color="#d4af37" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2.5rem' }}>
            {suitesFiltradas.map(suite => {
              const fotos = getFotosSuite(suite);
              const estaSeleccionadaParaComparar = suitesAComparar.some(item => item.suite_id === suite.suite_id);

              return (
                <article 
                  key={suite.suite_id}
                  style={{
                    background: 'linear-gradient(165deg, rgba(20, 18, 28, 0.95) 0%, rgba(12, 10, 18, 0.98) 100%)',
                    border: estaSeleccionadaParaComparar ? '2px solid #d4af37' : '1px solid rgba(196, 181, 253, 0.18)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.85)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Foto de la Suite */}
                  <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                    <img 
                      src={suite.foto_principal} 
                      alt={suite.nombre} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: suite.inventario_disponible <= 0 ? 'rgba(185, 28, 28, 0.95)' : 'rgba(6, 5, 8, 0.88)', border: '1px solid #d4af37', color: '#f3e5ab', fontSize: '0.68rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {suite.categoria}
                    </span>

                    {/* Botón Añadir a Comparador */}
                    <button 
                      onClick={() => toggleComparar(suite)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: estaSeleccionadaParaComparar ? '#d4af37' : 'rgba(6, 5, 8, 0.8)',
                        color: estaSeleccionadaParaComparar ? '#060508' : '#ffffff',
                        border: '1px solid rgba(255,255,255,0.4)',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backdropFilter: 'blur(5px)'
                      }}
                      title="Comparar frente a otra suite"
                    >
                      <Scale size={12} /> {estaSeleccionadaParaComparar ? 'Seleccionada' : 'Comparar'}
                    </button>

                    <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.92)', border: '1px solid #22c55e', color: '#86efac', fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                      {suite.inventario_disponible ?? suite.inventario_total} de {suite.inventario_total} libres
                    </span>
                  </div>

                  {/* Ficha Frontal */}
                  <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.74rem', marginBottom: '0.4rem', fontWeight: 700 }}>
                      <Star size={13} fill="#fbbf24" /> 4.9 • Calificación Verificada Fiesta Rewards
                    </div>

                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', color: '#ffffff', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
                      {suite.nombre}
                    </h3>

                    {/* Ficha Resumida */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.74rem', color: '#cbd5e1', margin: '0.6rem 0 1rem 0', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
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

                    <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6, flexGrow: 1, marginBottom: '1.2rem' }}>
                      {suite.descripcion}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.9rem' }}>
                      <div>
                        <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', display: 'block' }}>Tarifa All-Inclusive Desde</span>
                        <strong style={{ fontSize: '1.6rem', color: '#f3e5ab', fontWeight: 800 }}>
                          ${Number(suite.precio_noche_base).toLocaleString('es-MX')}
                        </strong>
                        <small style={{ color: '#cbd5e1', marginLeft: '4px', fontSize: '0.74rem' }}>MXN / Noche</small>
                      </div>

                      <span style={{ fontSize: '0.72rem', color: '#aa8212', fontWeight: 700 }}>
                        All-Inclusive Luxury
                      </span>
                    </div>

                    {/* Botones */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '0.8rem' }}>
                      <button 
                        type="button"
                        onClick={() => {
                          setSuiteSeleccionada(suite);
                          setFotoModalIndex(0);
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

                                            {suite.inventario_disponible <= 0 ? (
                        <button type="button" disabled
                          style={{
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            color: '#71717a',
                            textAlign: 'center',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            letterSpacing: '1.4px',
                            textTransform: 'uppercase',
                            cursor: 'not-allowed',
                            opacity: 0.8
                          }}
                        >
                          Agotada
                        </button>
                      ) : (
                        <button type="button" onClick={(e) => handleSolicitarReserva(e, suite)}
                          style={{
                            background: 'linear-gradient(135deg, #d4af37 0%, #aa8212 100%)',
                            color: '#060508',
                            textAlign: 'center',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            letterSpacing: '1.4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Reservar <ArrowRight size={14} />
                        </button>
                      )}
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 2. MODAL COMPARADOR LADO A LADO */}
        {modalComparadorAbierto && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(6,5,8,0.92)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ background: '#110f17', border: '1px solid #d4af37', borderRadius: '12px', width: '100%', maxWidth: '1100px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }}>
              
              <button onClick={() => setModalComparadorAbierto(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#fff', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#d4af37', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 800 }}>Análisis Comparativo</span>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: '#f3e5ab', margin: '0.3rem 0 0' }}>Comparativa de Suites Seleccionadas</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${suitesAComparar.length}, 1fr)`, gap: '1.5rem' }}>
                {suitesAComparar.map(s => (
                  <div key={s.suite_id} style={{ background: '#161420', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <img src={s.foto_principal} alt={s.nombre} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '1rem' }} />
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>{s.nombre}</h3>
                    
                    <div style={{ fontSize: '1.5rem', color: '#f3e5ab', fontWeight: 800, marginBottom: '1rem' }}>
                      ${Number(s.precio_noche_base).toLocaleString('es-MX')} <small style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>MXN / Noche</small>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 2 }}>
                      <li><strong>Superficie:</strong> {s.metros_cuadrados || 52} m²</li>
                      <li><strong>Cama:</strong> {s.tipo_cama || 'King Size'}</li>
                      <li><strong>Orientación:</strong> {s.vista_tipo || 'Vista al Mar'}</li>
                      <li><strong>Aforo:</strong> {s.capacidad_adultos} Adultos</li>
                    </ul>

                    <button type="button" onClick={(e) => handleSolicitarReserva(e, s)}
                      className="btn-reservar-gold" 
                      style={{ textAlign: 'center', padding: '0.75rem', marginTop: 'auto' }}
                    >
                      Reservar Esta <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* 3 & 4. MODAL DETALLE CON SIMULADOR DE COSTOS Y RESEÑAS VERIFICADAS */}
        {suiteSeleccionada && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(6, 5, 8, 0.92)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ background: '#110f17', border: '1px solid #d4af37', borderRadius: '12px', width: '100%', maxWidth: '1020px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.98)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              
              <button type="button" onClick={() => setSuiteSeleccionada(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffffff', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>

              {/* Carrusel */}
              {(() => {
                const fotosModal = getFotosSuite(suiteSeleccionada);
                return (
                  <div style={{ height: '390px', position: 'relative', background: '#000', flexShrink: 0 }}>
                    <img src={fotosModal[fotoModalIndex]} alt="Foto Suite" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    <div style={{ position: 'absolute', bottom: '16px', right: '20px', background: 'rgba(0,0,0,0.75)', padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.74rem', color: '#f3e5ab', border: '1px solid #d4af37' }}>
                      Foto {fotoModalIndex + 1} de {fotosModal.length}
                    </div>
                  </div>
                );
              })()}

              <div style={{ padding: '2.2rem' }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>
                  {suiteSeleccionada.nombre}
                </h2>

                {/* Pestañas de Navegación */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(212,175,55,0.3)', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {[
                    { id: 'confort', label: 'Confort & Descanso', icon: <Moon size={15} /> },
                    { id: 'bano', label: 'Baño Spa & Mármol', icon: <Bath size={15} /> },
                    { id: 'tecnologia', label: 'Tecnología & Servicios', icon: <Tv size={15} /> },
                    { id: 'simulador', label: 'Simulador de Cotización', icon: <Calculator size={15} /> },
                    { id: 'resenas', label: 'Reseñas de Huéspedes', icon: <Star size={15} /> },
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

                {/* Contenido Dinámico de Pestañas */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.4rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '2rem' }}>
                  
                  {pestanaActiva === 'confort' && (
                    <div>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>Confort Ergonómico</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7 }}>{suiteSeleccionada.detalles_confort || 'Colchón Sealy Posturepedic® Plush King Size, sábanas de 400 hilos y cortinas automatizadas.'}</p>
                    </div>
                  )}

                  {pestanaActiva === 'bano' && (
                    <div>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>Cuarto de Baño Spa</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7 }}>{suiteSeleccionada.detalles_bano || 'Tina exenta de inmersión profunda, mármol Carrara y amenidades botánicas L’Occitane.'}</p>
                    </div>
                  )}

                  {pestanaActiva === 'tecnologia' && (
                    <div>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>Tecnología & Servicios</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7 }}>{suiteSeleccionada.detalles_tecnologia || 'Smart TV 65" 4K con Apple AirPlay, barra de sonido JBL y cerradura RFID móvil.'}</p>
                    </div>
                  )}

                  {/* 3. SIMULADOR DE COTIZACIÓN EN VIVO */}
                  {pestanaActiva === 'simulador' && (
                    <div>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#f3e5ab', margin: '0 0 1rem 0' }}>
                        Simulador de Estancia con Desglose Fiscal en Una Sola Exhibición (PUE)
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Llegada</label>
                          <input type="date" value={simLlegada} onChange={(e) => setSimLlegada(e.target.value)} style={{ width: '100%', background: '#161420', border: '1px solid rgba(196,181,253,0.2)', padding: '0.5rem', color: '#fff', borderRadius: '4px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Salida</label>
                          <input type="date" value={simSalida} onChange={(e) => setSimSalida(e.target.value)} style={{ width: '100%', background: '#161420', border: '1px solid rgba(196,181,253,0.2)', padding: '0.5rem', color: '#fff', borderRadius: '4px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: '#c4b5fd', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Adultos</label>
                          <select value={simAdultos} onChange={(e) => setSimAdultos(Number(e.target.value))} style={{ width: '100%', background: '#161420', border: '1px solid rgba(196,181,253,0.2)', padding: '0.5rem', color: '#fff', borderRadius: '4px' }}>
                            <option value="1">1 Adulto</option>
                            <option value="2">2 Adultos</option>
                            <option value="3">3 Adultos</option>
                          </select>
                        </div>
                      </div>

                      {/* Tabla Desglosada */}
                      <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <td style={{ padding: '0.4rem 0' }}>Hospedaje Base ({nochesSimuladas} Noches)</td>
                            <td style={{ textAlign: 'right', color: '#fff' }}>${precioBaseSimulado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <td style={{ padding: '0.4rem 0' }}>IVA (16%)</td>
                            <td style={{ textAlign: 'right', color: '#fff' }}>${ivaSimulado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <td style={{ padding: '0.4rem 0' }}>Impuesto Hospedaje Estatal (ISH 5%)</td>
                            <td style={{ textAlign: 'right', color: '#fff' }}>${ishSimulado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <td style={{ padding: '0.4rem 0' }}>Saneamiento Ambiental</td>
                            <td style={{ textAlign: 'right', color: '#fff' }}>${saneamientoSimulado.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '0.6rem 0', fontWeight: 800, color: '#f3e5ab' }}>Total Estimado de Estancia</td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: '#f3e5ab', fontSize: '1.1rem' }}>${totalSimulado.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 4. RESEÑAS VERIFICADAS */}
                  {pestanaActiva === 'resenas' && (
                    <div>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#f3e5ab', margin: '0 0 1rem 0' }}>
                        Opiniones Verificadas de Socios Fiesta Rewards
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        {getResenasSuite(suiteSeleccionada.suite_id).map((r, i) => (
                          <div key={i} style={{ background: '#161420', padding: '0.9rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.74rem' }}>
                              <strong style={{ color: '#fff' }}>{r.autor}</strong>
                              <span style={{ color: '#94a3b8' }}>{r.fecha}</span>
                            </div>
                            <div style={{ color: '#fbbf24', fontSize: '0.7rem', marginBottom: '0.4rem' }}>
                              ★★★★★ ({r.calif}/5)
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>"{r.comentario}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Pie del Modal con Liquidación y Botón Checkout */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(212,175,55,0.35)', paddingTop: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>Tarifa Oficial por Noche</span>
                    <strong style={{ fontSize: '1.9rem', color: '#f3e5ab', fontWeight: 800 }}>
                      ${Number(suiteSeleccionada.precio_noche_base).toLocaleString('es-MX')} MXN
                    </strong>
                    <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 700 }}>
                      ● Incluye Alimentos, Bebidas de Autor, IVA 16% e ISH 5%
                    </div>
                  </div>

                  <button type="button" onClick={(e) => handleSolicitarReserva(e, suiteSeleccionada, { fechaLlegada: simLlegada, fechaSalida: simSalida, adultos: simAdultos })}
                    className="btn-reservar-gold"
                    style={{ padding: '0.9rem 2.5rem', fontSize: '0.84rem' }}
                  >
                    Proceder al Checkout con Fechas Simuladas <ArrowRight size={16} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

        {/* MODAL DE SOCIO FIESTA REWARDS INTEGRADO PARA RESERVAS */}
        <LoginModal
          isOpen={modalLoginAbierto}
          onClose={() => setModalLoginAbierto(false)}
          onLoginSuccess={(userData) => {
            setModalLoginAbierto(false);
            const suiteDestino = suitePendienteReserva || { suite: suites[0] || null };
            navigate('/checkout', {
              state: suiteDestino
            });
          }}
        />
        {/* Toast Notification Moderno In-App */}
      {toastNotif && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 99999,
          background: 'rgba(17, 15, 23, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #d4af37',
          borderLeft: '4px solid #ef4444',
          borderRadius: '8px',
          padding: '1.1rem 1.6rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 15px rgba(212,175,55,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '460px',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', flexShrink: 0, boxShadow: '0 0 8px #ef4444' }} />
          <div style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#f3e5ab', fontWeight: 700, marginBottom: '2px' }}>
              Inventario No Disponible
            </span>
            <span style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.4, display: 'block' }}>
              {toastNotif.mensaje}
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setToastNotif(null)} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer', padding: '0 0.2rem' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}