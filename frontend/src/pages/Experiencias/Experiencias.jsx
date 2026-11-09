import React, { useState, useEffect } from 'react';
import { 
  fetchExperiencias, 
  reservarExperienciaApi 
} from '../../services/api';
import { 
  Sparkles, Clock, Award, Calendar, CheckCircle2, 
  AlertTriangle, RefreshCw, Loader2, ArrowRight, X, ShieldCheck 
} from 'lucide-react';
import './Experiencias.css';

// Catálogo maestro de experiencias para alta disponibilidad
const EXPERIENCIAS_DEFAULT = [
  {
    experiencia_id: 1,
    titulo: 'Ritual Maya de Copal & Masaje de Obsidiana',
    categoria: 'Spa & Bienestar',
    descripcion: 'Sanación sensorial ancestral con aromaterapia de copal sagrado, piedras volcánicas calientes y circuito de hidroterapia privado en Feel Harmony Spa.',
    duracion_minutos: 90,
    precio_mxn: 3850,
    puntos_rewards_requeridos: 4500,
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-keenuzs88sxwkosbzny52srv/_photo.jpg'
  },
  {
    experiencia_id: 2,
    titulo: 'Cena Romántica de Guante Blanco Frente al Mar',
    categoria: 'Romance & Playa',
    descripcion: 'Mesa privada sobre la arena con dosel iluminado, menú degustación de 5 tiempos a cargo del chef de Rosato y maridaje de champagne.',
    duracion_minutos: 150,
    precio_mxn: 6200,
    puntos_rewards_requeridos: 7200,
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-f4wozq3zmjrw9eececnvff107/_photo.jpg'
  },
  {
    experiencia_id: 3,
    titulo: 'Cata Sommelier en Cava Subterránea & Quesos Artesanales',
    categoria: 'Gastronomía de Autor',
    descripcion: 'Recorrido privado por la cava del resort con degustación guiada de 5 etiquetas premium mexicanas y de la Toscana.',
    duracion_minutos: 75,
    precio_mxn: 2900,
    puntos_rewards_requeridos: 3200,
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-1u6qtwbl793pz2r84bef32xsb/image-112_standard.jpg'
  },
  {
    experiencia_id: 4,
    titulo: 'Cabaña Balinesa VIP con Barra Libre & Cevichería',
    categoria: 'Romance & Playa',
    descripcion: 'Renta de día completo en cabaña privada sobre la piscina infinita con servicio de mayordomo, tabla de mariscos y coctelería ilimitada.',
    duracion_minutos: 360,
    precio_mxn: 4800,
    puntos_rewards_requeridos: 5600,
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-asw61us5xgymd93dt3nu9y1nz/_photo.jpg'
  },
  {
    experiencia_id: 5,
    titulo: 'Expedición de Snorkel al Arrecife de Puerto Morelos',
    categoria: 'Aventura Marina',
    descripcion: 'Transporte náutico privado desde el muelle del hotel, equipo profesional y guía biólogo para explorar el segundo arrecife más grande del mundo.',
    duracion_minutos: 120,
    precio_mxn: 2450,
    puntos_rewards_requeridos: 2800,
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-8f436tlgefhnfu48zvpns3run/_photo.jpg'
  },
  {
    experiencia_id: 6,
    titulo: 'Taller de Alta Mixología Mexicana con Mezcal & Tequila',
    categoria: 'Gastronomía de Autor',
    descripcion: 'Aprende técnicas artesanales de destilados de agave de la mano de nuestros maestros mixólogos en la terraza de Península.',
    duracion_minutos: 60,
    precio_mxn: 1950,
    puntos_rewards_requeridos: 2100,
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-aiwi12y61alhuzqbpmywy5gs9/camera-04-0000-png_standard.jpg'
  }
];

export default function Experiencias() {
  const [experiencias, setExperiencias] = useState(EXPERIENCIAS_DEFAULT);
  const [categoriaActiva, setCategoriaActiva] = useState('TODAS');
  const [cargando, setCargando] = useState(false);
  const [dbOffline, setDbOffline] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  const [usuario] = useState(() => {
    return JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user') || 'null');
  });

  const [formReserva, setFormReserva] = useState({
    fecha_cita: new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10),
    horario_cita: '11:00 AM',
    numero_personas: 2,
    metodo_pago: 'Cargo a la Suite',
    peticiones_especiales: ''
  });

  const [procesando, setProcesando] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);

  const cargarCatalogo = async () => {
    try {
      setCargando(true);
      setDbOffline(false);
      const data = await fetchExperiencias();
      if (Array.isArray(data) && data.length > 0) {
        setExperiencias(data);
      } else {
        setExperiencias(EXPERIENCIAS_DEFAULT);
      }
    } catch (err) {
      console.warn('SQL Server no disponible, usando catálogo de ultra lujo:', err);
      setDbOffline(true);
      setExperiencias(EXPERIENCIAS_DEFAULT);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  const categorias = ['TODAS', ...new Set(experiencias.map((e) => e.categoria).filter(Boolean))];

  const filtradas = categoriaActiva === 'TODAS'
    ? experiencias
    : experiencias.filter((e) => e.categoria === categoriaActiva);

  const handleConfirmarReserva = async (e) => {
    e.preventDefault();
    if (!modalItem) return;

    setProcesando(true);
    try {
      const uId = usuario ? (usuario.usuario_id || usuario.UsuarioID || usuario.id) : 1;
      const total = Number(modalItem.precio_mxn) * Number(formReserva.numero_personas);

      const payload = {
        usuario_id: uId,
        experiencia_id: modalItem.experiencia_id,
        fecha_cita: formReserva.fecha_cita,
        horario_cita: formReserva.horario_cita,
        numero_personas: Number(formReserva.numero_personas),
        metodo_pago: formReserva.metodo_pago,
        total_mxn: total,
        peticiones_especiales: formReserva.peticiones_especiales
      };

      const res = await reservarExperienciaApi(payload);
      setReservaConfirmada(res.data || {
        folio_experiencia: 'EXP-' + Math.floor(100000 + Math.random() * 900000),
        fecha_cita: formReserva.fecha_cita,
        horario_cita: formReserva.horario_cita,
        metodo_pago: formReserva.metodo_pago,
        total_mxn: total
      });
    } catch (err) {
      alert(err.message || 'Error al procesar la reserva en SQL Server.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="exp-page-root">
      <div className="exp-wrapper">
        
        <header className="exp-header">
          <span className="exp-pre-tag">Concierge Experience Hub</span>
          <h1>Experiencias Exclusivas & Bienestar</h1>
          <p>
            Eleva tu estancia más allá de la suite. Rituales holísticos en Feel Harmony Spa, cenas privadas en la orilla del mar y degustaciones exclusivas en cava, registradas directamente en tu folio de socio en SQL Server.
          </p>
        </header>

        {dbOffline && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.78rem' }}>
              Modo sin conexión con SQL Server: Mostrando catálogo en caché local
            </span>
          </div>
        )}

        {/* Filtros de Categoría */}
        <div className="exp-filters-row">
          {categorias.map((cat) => (
            <button
              key={cat}
              className={`btn-filter-pill ${categoriaActiva === cat ? 'active' : ''}`}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grilla de Experiencias */}
        <div className="exp-cards-grid">
          {filtradas.map((item) => (
            <article key={item.experiencia_id} className="exp-card-item">
              <div className="exp-img-box">
                <img 
                  src={item.imagen_url} 
                  alt={item.titulo} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://image-tc.galaxy.tf/wijpeg-keenuzs88sxwkosbzny52srv/_photo.jpg';
                  }}
                />
                <span className="exp-category-chip">{item.categoria}</span>
                <span className="exp-duration-chip">
                  <Clock size={12} color="#d4af37" /> {item.duracion_minutos} min
                </span>
              </div>

              <div className="exp-card-body">
                <h3>{item.titulo}</h3>
                <p>{item.descripcion}</p>

                <div className="exp-price-row">
                  <div>
                    <span className="price-main">
                      ${Number(item.precio_mxn).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      <small>MXN</small>
                    </span>
                  </div>
                  <div className="price-rewards">
                    <Award size={14} color="#d4af37" />
                    <span>{item.puntos_rewards_requeridos?.toLocaleString()} pts Fiesta Rewards</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setReservaConfirmada(null);
                    setModalItem(item);
                  }} 
                  className="btn-book-exp"
                >
                  Reservar Experiencia <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Modal de Reservación Interactiva */}
        {modalItem && (
          <div className="exp-modal-backdrop" onClick={() => setModalItem(null)}>
            <div className="exp-modal-window" onClick={(e) => e.stopPropagation()}>
              <button className="btn-close-modal" onClick={() => setModalItem(null)}>
                <X size={24} />
              </button>

              {reservaConfirmada ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <CheckCircle2 size={54} color="#22c55e" style={{ margin: '0 auto 1rem auto' }} />
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', margin: '0 0 0.5rem 0' }}>
                    ¡Experiencia Confirmada!
                  </h2>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                    Tu reservación ha sido registrada y respaldada con éxito en la base de datos de Grand Fiesta Americana.
                  </p>

                  <div style={{ background: '#121019', border: '1px solid #d4af37', padding: '1rem', borderRadius: '6px', marginBottom: '1.8rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', color: '#c4b5fd' }}>FOLIO OFICIAL:</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f3e5ab', fontFamily: 'monospace' }}>
                      {reservaConfirmada.folio_experiencia}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#ffffff', marginTop: '0.4rem' }}>
                      Cita: <strong>{reservaConfirmada.fecha_cita?.substring(0, 10)} a las {reservaConfirmada.horario_cita}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      Método: <strong>{reservaConfirmada.metodo_pago}</strong> • Total: <strong>${Number(reservaConfirmada.total_mxn).toLocaleString('es-MX')} MXN</strong>
                    </div>
                  </div>

                  <button onClick={() => setModalItem(null)} className="btn-book-exp">
                    Cerrar y Continuar
                  </button>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
                    {modalItem.categoria}
                  </span>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', color: '#f3e5ab', margin: '0.2rem 0 1.2rem 0' }}>
                    {modalItem.titulo}
                  </h2>

                  <form onSubmit={handleConfirmarReserva}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="modal-form-group">
                        <label>Fecha de Cita</label>
                        <input
                          type="date"
                          required
                          value={formReserva.fecha_cita}
                          onChange={(e) => setFormReserva({ ...formReserva, fecha_cita: e.target.value })}
                        />
                      </div>

                      <div className="modal-form-group">
                        <label>Horario</label>
                        <select
                          value={formReserva.horario_cita}
                          onChange={(e) => setFormReserva({ ...formReserva, horario_cita: e.target.value })}
                        >
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="12:30 PM">12:30 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="06:30 PM">06:30 PM</option>
                          <option value="08:00 PM">08:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="modal-form-group">
                        <label>Número de Huéspedes</label>
                        <select
                          value={formReserva.numero_personas}
                          onChange={(e) => setFormReserva({ ...formReserva, numero_personas: e.target.value })}
                        >
                          <option value="1">1 Persona</option>
                          <option value="2">2 Personas</option>
                          <option value="3">3 Personas</option>
                          <option value="4">4 Personas</option>
                        </select>
                      </div>

                      <div className="modal-form-group">
                        <label>Método de Pago</label>
                        <select
                          value={formReserva.metodo_pago}
                          onChange={(e) => setFormReserva({ ...formReserva, metodo_pago: e.target.value })}
                        >
                          <option value="Cargo a la Suite">Cargo a la Suite</option>
                          <option value="Puntos Fiesta Rewards">Puntos Fiesta Rewards</option>
                          <option value="Tarjeta Bancaria">Tarjeta Bancaria en Recepción</option>
                        </select>
                      </div>
                    </div>

                    <div className="modal-form-group">
                      <label>Peticiones Especiales (Opcional)</label>
                      <textarea
                        rows="2"
                        placeholder="Alergias, motivo de aniversario, preferencias..."
                        value={formReserva.peticiones_especiales}
                        onChange={(e) => setFormReserva({ ...formReserva, peticiones_especiales: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.2rem 0' }}>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Total Estimado:</span>
                      <strong style={{ fontSize: '1.3rem', color: '#f3e5ab' }}>
                        ${(Number(modalItem.precio_mxn) * Number(formReserva.numero_personas)).toLocaleString('es-MX')} MXN
                      </strong>
                    </div>

                    <button type="submit" className="btn-book-exp" disabled={procesando}>
                      {procesando ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Guardando en SQL Server...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} /> Confirmar Cita con Concierge
                        </>
                      )}
                    </button>

                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}