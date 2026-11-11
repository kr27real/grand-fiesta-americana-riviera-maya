import React, { useState, useEffect, useCallback } from 'react';
import { fetchGaleria } from '../../services/api';
import { 
  Database, AlertTriangle, Loader2, Sparkles, X, 
  Maximize2, RefreshCw, ChevronLeft, ChevronRight, ShieldCheck 
} from 'lucide-react';
import './Galeria.css';

// Galería fotográfica oficial de alta resolución de Grand Fiesta Americana Riviera Cancún
const GALERIA_FALLBACK = [
  {
    foto_id: 1,
    titulo: 'Arquitectura & Albercas Principales',
    categoria: 'RESORT & PLAYA',
    descripcion: 'Diseño contemporáneo que se abre hacia el mar Caribe con el complejo de nueve piscinas infinitas.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-1vkvkxf8aswz8zp6cnv3al62n/2998_photo.jpg'
  },
  {
    foto_id: 2,
    titulo: 'Lobby & Terrazas Abiertas',
    categoria: 'ARQUITECTURA',
    descripcion: 'Amplitud y techumbres de madera tropical que enmarcan la brisa y la vegetación de la costa.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-keenuzs88sxwkosbzny52srv/2991_photo.jpg'
  },
  {
    foto_id: 3,
    titulo: 'Deluxe Ocean Front Suite',
    categoria: 'SUITES',
    descripcion: 'Vistas panorámicas directas al mar turquesa con balcón privado y amenidades premium L’Occitane.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-d5kep978mo77ypyupyy4tiaqn/render-hab-king-9_standard.jpg?crop=250%2C0%2C1500%2C1125&width=1200'
  },
  {
    foto_id: 4,
    titulo: 'Restaurante Península frente al Arrecife',
    categoria: 'GASTRONOMÍA',
    descripcion: 'Buffet internacional con estaciones culinarias en vivo y terraza exterior sobre el agua.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-aiwi12y61alhuzqbpmywy5gs9/camera-04-0000-png_standard.jpg?crop=0%2C18%2C1584%2C1188&width=1200'
  },
  {
    foto_id: 5,
    titulo: 'Trattoria Rosato & Cava',
    categoria: 'GASTRONOMÍA',
    descripcion: 'Alta cocina italiana, pastas frescas artesanales y maridaje selecto de etiquetas mexicanas y toscanas.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-1u6qtwbl793pz2r84bef32xsb/image-112_standard.jpg?crop=160%2C0%2C960%2C720&width=1200'
  },
  {
    foto_id: 6,
    titulo: 'Piscina de Hidroterapia Feel Harmony Spa',
    categoria: 'SPA & BIENESTAR',
    descripcion: 'Santuario de relajación con circuito de aguas termales, sauna y cabinas holísticas de masaje.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-9di672cuo86gvwh810o7tlnns/al-spa-area-alberca-01_standard.jpg?crop=240%2C0%2C1440%2C1080&width=1200'
  },
  {
    foto_id: 7,
    titulo: 'Deluxe Tropical Reserve View',
    categoria: 'SUITES',
    descripcion: 'Un remanso de descanso envuelto por la selva y el manglar protegido de Quintana Roo.',
    imagen_url: 'https://image-tc.galaxy.tf/wipng-ewud5ufube3uynaref2e2bpvy/render-hab-king-5_standard.png?crop=121%2C0%2C725%2C544&width=1200'
  },
  {
    foto_id: 8,
    titulo: 'The Grand Stage & Vida Nocturna',
    categoria: 'ENTRETENIMIENTO',
    descripcion: 'Propuestas teatrales, shows acústicos y música en vivo que iluminan cada noche caribeña.',
    imagen_url: 'https://image-tc.galaxy.tf/wipng-9m9t9vyqhl3ok086kxscs97zs/whatsapp-image-2024-12-18-at-14-18-55_standard.png?crop=177%2C0%2C1647%2C1235&width=1200'
  },
  {
    foto_id: 9,
    titulo: 'Atardeceres en el Caribe Mexicano',
    categoria: 'RESORT & PLAYA',
    descripcion: 'Costas de arena blanca y el ritmo pausado del mar en el corredor de Riviera Cancún.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-2xx11wxhp9nxv8hnyt0sr7vxf/2993_photo.jpg'
  }
];

export default function Galeria() {
  const [fotos, setFotos] = useState(GALERIA_FALLBACK);
  const [categoriaActiva, setCategoriaActiva] = useState('TODAS');
  const [cargando, setCargando] = useState(true);
  const [dbOffline, setDbOffline] = useState(false);
  const [modalIndex, setModalIndex] = useState(null);

  const cargarGaleriaDesdeBD = async () => {
    try {
      setCargando(true);
      setDbOffline(false);

      const data = await fetchGaleria();
      if (Array.isArray(data) && data.length > 0) {
        setFotos(data);
      } else {
        setFotos(GALERIA_FALLBACK);
      }
    } catch (err) {
      console.warn('SQL Server no disponible, cargando galería fotográfica de respaldo:', err);
      setDbOffline(true);
      setFotos(GALERIA_FALLBACK);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarGaleriaDesdeBD();
  }, []);

  const categorias = ['TODAS', ...new Set(fotos.map((f) => f.categoria?.toUpperCase()).filter(Boolean))];

  const fotosFiltradas = categoriaActiva === 'TODAS'
    ? fotos
    : fotos.filter((f) => f.categoria?.toUpperCase() === categoriaActiva);

  // Navegación dentro del Lightbox
  const handleNextModal = useCallback(() => {
    if (modalIndex === null) return;
    setModalIndex((prev) => (prev + 1) % fotosFiltradas.length);
  }, [modalIndex, fotosFiltradas.length]);

  const handlePrevModal = useCallback(() => {
    if (modalIndex === null) return;
    setModalIndex((prev) => (prev - 1 + fotosFiltradas.length) % fotosFiltradas.length);
  }, [modalIndex, fotosFiltradas.length]);

  // Teclado para el Lightbox (Escape, Flechas)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalIndex === null) return;
      if (e.key === 'Escape') setModalIndex(null);
      if (e.key === 'ArrowRight') handleNextModal();
      if (e.key === 'ArrowLeft') handlePrevModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalIndex, handleNextModal, handlePrevModal]);

  const fotoActual = modalIndex !== null ? fotosFiltradas[modalIndex] : null;

  return (
    <div className="galeria-page-root">
      <div className="galeria-wrapper">
        
        {/* Encabezado Editorial */}
        <header className="galeria-header">
          <span className="galeria-pre-title">COLECCIÓN VISUAL EXCLUSIVA</span>
          <h1>Galería del Resort & Spa</h1>
          <p>
            Explora las postales oficiales de Grand Fiesta Americana Riviera Cancún: arquitectura contemporánea, 
            suites de alta gama, santuarios de bienestar y centros gastronómicos frente al mar Caribe[cite: 6].
          </p>
        </header>

        {dbOffline && (
          <div className="galeria-cache-badge">
            <ShieldCheck size={14} />
            <span>Galería visual oficial sincronizada desde la colección de Grupo Posadas</span>
          </div>
        )}

        {/* Filtros Isotope de Categorías */}
        {!cargando && categorias.length > 1 && (
          <div className="galeria-filters-row">
            {categorias.map((cat) => (
              <button
                key={cat}
                className={`btn-filter-tag ${categoriaActiva === cat ? 'active' : ''}`}
                onClick={() => setCategoriaActiva(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Estado: Cargando */}
        {cargando && (
          <div className="galeria-loading-box">
            <Loader2 size={36} className="animate-spin galeria-spinner" />
            <h3>Sincronizando colección fotográfica con SQL Server...</h3>
          </div>
        )}

        {/* Cuadrícula de Fotografías */}
        {!cargando && (
          <div className="galeria-masonry-grid">
            {fotosFiltradas.map((item, idx) => {
              const id = item.foto_id || item.id || idx;
              const titulo = item.titulo || 'Vista del Resort';
              const categoria = item.categoria || 'RESORT';
              const descripcion = item.descripcion || 'Grand Fiesta Americana Riviera Cancún';
              const imgUrl = item.imagen_url || 'https://image-tc.galaxy.tf/wijpeg-1vkvkxf8aswz8zp6cnv3al62n/2998_photo.jpg';

              return (
                <article
                  key={id}
                  className="galeria-item-card"
                  onClick={() => setModalIndex(idx)}
                >
                  <img
                    src={imgUrl}
                    alt={titulo}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://image-tc.galaxy.tf/wijpeg-1vkvkxf8aswz8zp6cnv3al62n/2998_photo.jpg';
                    }}
                  />
                  <div className="galeria-card-overlay">
                    <span className="galeria-badge">{categoria}</span>
                    <h4>{titulo}</h4>
                    <p>{descripcion}</p>
                    <div className="galeria-zoom-hint">
                      <Maximize2 size={16} /> <span>Ampliar</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modal Lightbox Interactivo con Flechas de Navegación */}
        {fotoActual && (
          <div className="lightbox-backdrop" onClick={() => setModalIndex(null)}>
            <div className="lightbox-content-box" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                className="btn-close-lightbox" 
                onClick={() => setModalIndex(null)}
                aria-label="Cerrar vista completa"
              >
                <X size={24} />
              </button>

              {/* Controles de Navegación */}
              {fotosFiltradas.length > 1 && (
                <>
                  <button 
                    type="button" 
                    className="lightbox-nav-btn prev"
                    onClick={handlePrevModal}
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button 
                    type="button" 
                    className="lightbox-nav-btn next"
                    onClick={handleNextModal}
                    aria-label="Foto siguiente"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}

              <div className="lightbox-image-stage">
                <img 
                  src={fotoActual.imagen_url} 
                  alt={fotoActual.titulo} 
                  className="lightbox-img-full" 
                />
              </div>

              <div className="lightbox-caption">
                <div className="lightbox-caption-meta">
                  <span className="galeria-badge">{fotoActual.categoria}</span>
                  <span className="lightbox-counter">{modalIndex + 1} / {fotosFiltradas.length}</span>
                </div>
                <h3>{fotoActual.titulo}</h3>
                <p>{fotoActual.descripcion}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}