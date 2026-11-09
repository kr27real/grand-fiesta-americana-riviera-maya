import React, { useState, useEffect } from 'react';
import { fetchGaleria } from '../../services/api';
import { Database, AlertTriangle, Loader2, Sparkles, X, Maximize2, RefreshCw } from 'lucide-react';
import './Galeria.css';

export default function Galeria() {
  const [fotos, setFotos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('TODAS');
  const [cargando, setCargando] = useState(true);
  const [dbOffline, setDbOffline] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fotoModal, setFotoModal] = useState(null);

  const cargarGaleriaDesdeBD = async () => {
    try {
      setCargando(true);
      setDbOffline(false);
      setErrorMsg('');

      const data = await fetchGaleria();
      if (Array.isArray(data) && data.length > 0) {
        setFotos(data);
      } else {
        setFotos([]);
      }
    } catch (err) {
      console.error('Error al conectar con la galería en SQL Server:', err);
      setDbOffline(true);
      setErrorMsg(err.message || 'No se pudo establecer conexión con la base de datos.');
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

  return (
    <div className="galeria-page-root">
      <div className="galeria-wrapper">
        
        {/* Encabezado */}
        <header className="galeria-header">
          <span className="galeria-pre-title">Colección Visual Exclusiva</span>
          <h1>Galería del Resort & Spa</h1>
          <p>
            Explora las postales oficiales de Grand Fiesta Americana Riviera Cancún. 
            Arquitectura de ultra lujo, suites de alta gama y experiencias culinarias frente a las costas del Caribe.
          </p>
        </header>

        {/* Estado: Cargando */}
        {cargando && (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#f3e5ab' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem' }}>
              Consultando Galería en Microsoft SQL Server...
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Recuperando imágenes y descripciones desde HotelGranFiestaAmericanaDB
            </p>
          </div>
        )}

        {/* Estado: Base de Datos Apagada / Sin Conexión */}
        {dbOffline && !cargando && (
          <div className="db-offline-card">
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 0.6rem auto' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#fca5a5', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              <Database size={15} /> Error de Conexión con Base de Datos
            </div>
            <h3>Base de Datos No Disponible</h3>
            <p>
              No se pudo conectar con el servidor SQL Server (HotelGranFiestaAmericanaDB). 
              Asegúrate de que el servicio de MSSQL esté encendido y que el backend esté respondiendo en el puerto 5000.
            </p>
            <button onClick={cargarGaleriaDesdeBD} className="btn-retry-conn">
              <RefreshCw size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Reintentar Conexión
            </button>
          </div>
        )}

        {/* Filtros de Categoría */}
        {!cargando && !dbOffline && categorias.length > 1 && (
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

        {/* Grilla de Fotografías */}
        {!cargando && !dbOffline && (
          <div className="galeria-masonry-grid">
            {fotosFiltradas.map((item) => {
              const id = item.foto_id || item.id;
              const titulo = item.titulo || 'Vista del Resort';
              const categoria = item.categoria || 'Resort';
              const descripcion = item.descripcion || 'Grand Fiesta Americana Riviera Cancún';
              const imgUrl = item.imagen_url || 'https://image-tc.galaxy.tf/wijpeg-1vkvkxf8aswz8zp6cnv3al62n/imagen-1.jpg';

              return (
                <article
                  key={id}
                  className="galeria-item-card"
                  onClick={() => setFotoModal({ titulo, descripcion, categoria, imgUrl })}
                >
                  <img
                    src={imgUrl}
                    alt={titulo}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://image-tc.galaxy.tf/wijpeg-1vkvkxf8aswz8zp6cnv3al62n/imagen-1.jpg';
                    }}
                  />
                  <div className="galeria-card-overlay">
                    <span className="galeria-badge">{categoria}</span>
                    <h4>{titulo}</h4>
                    <p>{descripcion}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modal Lightbox */}
        {fotoModal && (
          <div className="lightbox-backdrop" onClick={() => setFotoModal(null)}>
            <div className="lightbox-content-box" onClick={(e) => e.stopPropagation()}>
              <button className="btn-close-lightbox" onClick={() => setFotoModal(null)}>
                <X size={28} />
              </button>
              <img src={fotoModal.imgUrl} alt={fotoModal.titulo} className="lightbox-img-full" />
              <div className="lightbox-caption">
                <span className="galeria-badge">{fotoModal.categoria}</span>
                <h3>{fotoModal.titulo}</h3>
                <p>{fotoModal.descripcion}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}