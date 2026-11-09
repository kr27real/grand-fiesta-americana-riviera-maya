import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, Loader2, Sparkles } from 'lucide-react';
import { fetchOfertas } from '../../services/api';
import './Ofertas.css';

export default function Ofertas() {
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorBD, setErrorBD] = useState(null);

  useEffect(() => {
    async function cargarOfertasDesdeBD() {
      try {
        setCargando(true);
        setErrorBD(null);

        const data = await fetchOfertas();

        if (Array.isArray(data) && data.length > 0) {
          setOfertas(data);
        } else {
          setErrorBD('La base de datos respondió, pero la tabla OfertasPromociones no contiene promociones activas.');
        }
      } catch (err) {
        console.error('Error al consultar ofertas desde SQL Server:', err);
        setErrorBD(err.message || 'No se pudo conectar con el backend en http://localhost:5000');
      } finally {
        setCargando(false);
      }
    }

    cargarOfertasDesdeBD();
  }, []);

  return (
    <div className="ofertas-page">
      <div className="ofertas-wrapper">
        
        <header className="ofertas-header">
          <span className="ofertas-pre-title">Temporada Especial</span>
          <h1>Ofertas & Promociones Exclusivas</h1>
          <p>
            Paquetes vacacionales, beneficios añadidos y tarifas preferenciales sincronizados en tiempo real desde Microsoft SQL Server.
          </p>
        </header>

        {cargando && (
          <div className="status-box status-loading">
            <Loader2 className="w-8 h-8 animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <h3>Consultando promociones en SQL Server...</h3>
            <p style={{ marginTop: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
              Sincronizando paquetes de temporada y convenios Fiesta Rewards.
            </p>
          </div>
        )}

        {errorBD && !cargando && (
          <div className="status-box status-error">
            <h3>Fallo de Conexión</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{errorBD}</p>
            <small style={{ display: 'block', marginTop: '1rem', color: '#cbd5e1' }}>
              Verifica que el servidor backend esté corriendo y que existan registros en la tabla OfertasPromociones.
            </small>
          </div>
        )}

        {!cargando && !errorBD && (
          <div className="ofertas-grid">
            {ofertas.map((oferta) => {
              const id = oferta.oferta_id || oferta.id;
              const titulo = oferta.titulo || oferta.Titulo || 'Promoción Especial';
              const descuento = oferta.descuento_etiqueta || oferta.Descuento || 'Tarifa Exclusiva';
              const vigencia = oferta.vigencia || oferta.Vigencia || 'Vigencia limitada';
              const descripcion = oferta.descripcion || oferta.Descripcion || 'Disfruta de beneficios excepcionales reservando directamente.';
              const imagen = oferta.imagen_url || oferta.ImagenUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';

              return (
                <article key={id} className="oferta-card">
                  <div className="oferta-img-wrapper">
                    <span className="oferta-tag">{descuento}</span>
                    <img
                      src={imagen}
                      alt={titulo}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  <div className="oferta-content">
                    <h3>{titulo}</h3>

                    <div className="oferta-vigencia-badge">
                      <Calendar size={14} />
                      <span>{vigencia}</span>
                    </div>

                    <p className="oferta-desc">{descripcion}</p>

                    <Link to="/disponibilidad" className="btn-oferta">
                      Aprovechar Oferta
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}