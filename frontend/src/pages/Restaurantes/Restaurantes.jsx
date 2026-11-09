import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Shirt, UtensilsCrossed, Loader2, Sparkles, CalendarCheck } from 'lucide-react';
import { fetchRestaurantes } from '../../services/api';
import './Restaurantes.css';

export default function Restaurantes() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorBD, setErrorBD] = useState(null);

  useEffect(() => {
    async function cargarRestaurantes() {
      try {
        setCargando(true);
        setErrorBD(null);

        const data = await fetchRestaurantes();

        if (Array.isArray(data) && data.length > 0) {
          setRestaurantes(data);
        } else {
          setErrorBD('La consulta respondió correctamente, pero no se encontraron restaurantes en la tabla Restaurantes.');
        }
      } catch (err) {
        console.error('Error al consultar restaurantes desde SQL Server:', err);
        setErrorBD(err.message || 'No se pudo conectar con el endpoint de restaurantes.');
      } finally {
        setCargando(false);
      }
    }

    cargarRestaurantes();
  }, []);

  return (
    <div className="restaurantes-page">
      <div className="restaurantes-wrapper">
        
        <header className="restaurantes-header">
          <span className="restaurantes-pre-title">Gastronomía de Autor</span>
          <h1>Restaurantes & Bares Exclusivos</h1>
          <p>
            Un viaje sensorial a través de la alta cocina mexicana e internacional. 
            Galardones AAA Cuatro Diamantes, ingredientes frescos del Caribe y servicio de guante blanco.
          </p>
        </header>

        {cargando && (
          <div className="status-box status-loading">
            <Loader2 className="w-8 h-8 animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <h3>Sincronizando centros gastronómicos desde SQL Server...</h3>
            <p style={{ marginTop: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
              Consultando cavas, menús de especialidad y códigos de vestimenta.
            </p>
          </div>
        )}

        {errorBD && !cargando && (
          <div className="status-box status-error">
            <h3>Fallo de Conexión</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{errorBD}</p>
            <small style={{ display: 'block', marginTop: '1rem', color: '#cbd5e1' }}>
              Asegúrate de haber ejecutado el script para crear y poblar la tabla Restaurantes en HotelGranFiestaAmericanaDB.
            </small>
          </div>
        )}

        {!cargando && !errorBD && (
          <div className="restaurantes-grid">
            {restaurantes.map((rest) => {
              const id = rest.restaurante_id || rest.id;
              const nombre = rest.nombre || rest.Nombre;
              const cocina = rest.tipo_cocina || rest.TipoCocina || 'Cocina Internacional';
              const concepto = rest.concepto || rest.Concepto || '';
              const descripcion = rest.descripcion || rest.Descripcion || '';
              const horario = rest.horario_apertura || rest.HorarioApertura || '18:00 - 23:00 hrs';
              const codigoVestir = rest.codigo_vestir || rest.CodigoVestir || 'Casual Elegante';
              const requiereRes = rest.requiere_reservacion || rest.RequiereReservacion;
              const foto = rest.foto_principal || rest.FotoPrincipal || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

              return (
                <article key={id} className="restaurante-card">
                  <div className="restaurante-img-box">
                    <span className="cuisine-badge">{cocina}</span>
                    {requiereRes && (
                      <span className="reservacion-badge">Requiere Reserva</span>
                    )}
                    <img
                      src={foto}
                      alt={nombre}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  <div className="restaurante-body">
                    <h2 className="restaurante-nombre">{nombre}</h2>
                    {concepto && <div className="restaurante-concepto">{concepto}</div>}

                    <p className="restaurante-descripcion">{descripcion}</p>

                    <div className="restaurante-specs-card">
                      <div className="spec-line">
                        <Clock size={15} color="#d4af37" />
                        <span>Horario: <strong>{horario}</strong></span>
                      </div>
                      <div className="spec-line">
                        <Shirt size={15} color="#b39ddb" />
                        <span>Código de Vestir: <strong>{codigoVestir}</strong></span>
                      </div>
                    </div>

                    <Link to="/contacto" className="btn-mesa">
                      Reservar Mesa / Concierge
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