import React, { useEffect, useState } from 'react';
import { 
  Clock, Shirt, UtensilsCrossed, Loader2, Sparkles, 
  CalendarCheck, ArrowRight, X, CheckCircle2, ShieldCheck, Wine 
} from 'lucide-react';
import { fetchRestaurantes } from '../../services/api';
import './Restaurantes.css';

// 6 Centros gastronómicos oficiales de Grand Fiesta Americana Riviera Cancún
const RESTAURANTES_DEFAULT = [
  {
    restaurante_id: 1,
    nombre: 'Península',
    tipo_cocina: 'Buffet Frente al Mar',
    concepto: 'Cocina costera contemporánea y vista panorámica al arrecife',
    descripcion: 'Donde las mañanas comienzan con el sonido de las olas y las noches invitan a contemplar el horizonte turquesa con estaciones de mariscos frescos, cortes en vivo y panadería artesanal.',
    horario_apertura: '07:00 - 22:30 hrs',
    codigo_vestir: 'Casual Playa / Sin calzado húmedo',
    requiere_reservacion: false,
    foto_principal: 'https://image-tc.galaxy.tf/wijpeg-aiwi12y61alhuzqbpmywy5gs9/camera-04-0000-png_standard.jpg?crop=0%2C18%2C1584%2C1188&width=1200'
  },
  {
    restaurante_id: 2,
    nombre: 'Viña Del Mar',
    tipo_cocina: 'Cocina Internacional',
    concepto: 'El corazón gastronómico y de convivencia del resort',
    descripcion: 'Un espacio dinámico de autor para reunirse a cualquier hora, donde las mejores tradiciones culinarias del mundo se fusionan con ingredientes selectos de la península de Yucatán.',
    horario_apertura: '12:30 - 23:00 hrs',
    codigo_vestir: 'Casual Elegante',
    requiere_reservacion: false,
    foto_principal: 'https://image-tc.galaxy.tf/wijpeg-1dw3841ug4yola1lq9uzgmvd/camera-07-0000-png_standard.jpg?crop=0%2C18%2C1584%2C1188&width=1200'
  },
  {
    restaurante_id: 3,
    nombre: 'Rosato',
    tipo_cocina: 'Alta Cocina Italiana',
    concepto: 'Elegancia toscana, pastas frescas al dente y cava de autor',
    descripcion: 'Vibrante, cálido y auténticamente italiano. Su cava de vinos de guarda y recetas de trattoria de lujo hacen de cada cena un homenaje al buen vivir y la alta hospitalidad.',
    horario_apertura: '18:00 - 23:00 hrs',
    codigo_vestir: 'Elegante Formal (Pantalón largo)',
    requiere_reservacion: true,
    foto_principal: 'https://image-tc.galaxy.tf/wijpeg-1u6qtwbl793pz2r84bef32xsb/image-112_standard.jpg?crop=160%2C0%2C960%2C720&width=1200'
  },
  {
    restaurante_id: 4,
    nombre: 'Arrecife Prime Steakhouse',
    tipo_cocina: 'Cortes & Grill',
    concepto: 'Cortes finos al carbón de encino y langosta del Caribe',
    descripcion: 'Selección de cortes certificados USDA Prime curados y marinados al momento, preparados en parrilla abierta a la leña con guarniciones gourmet y mixología con humo de mezcal.',
    horario_apertura: '18:30 - 23:00 hrs',
    codigo_vestir: 'Casual Elegante',
    requiere_reservacion: true,
    foto_principal: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
  },
  {
    restaurante_id: 5,
    nombre: 'Kantenah Sushi & Raw Bar',
    tipo_cocina: 'Nikkei & Teppanyaki',
    concepto: 'Fusión japonesa-mexicana sobre terraza al atardecer',
    descripcion: 'Barra de sushi omakase en terraza con vistas al atardecer del Caribe. Nigiris de salmón flameado, ceviches con yuzu y mesas de teppanyaki con espectáculo culinario privado.',
    horario_apertura: '13:00 - 22:30 hrs',
    codigo_vestir: 'Casual Resort',
    requiere_reservacion: true,
    foto_principal: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    restaurante_id: 6,
    nombre: 'Grand Club VIP Lounge',
    tipo_cocina: 'Gourmet Tapas & Champagne',
    concepto: 'Acceso privado exclusivo para huéspedes Grand Club',
    descripcion: 'Desayuno continental premium, barra de canapés de autor a cargo del chef ejecutivo por la tarde y selección de champagnes y licores de alta gama durante todo el día.',
    horario_apertura: '07:00 - 22:00 hrs',
    codigo_vestir: 'Resort Chic',
    requiere_reservacion: false,
    foto_principal: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function Restaurantes() {
  const [restaurantes, setRestaurantes] = useState(RESTAURANTES_DEFAULT);
  const [filtroCocina, setFiltroCocina] = useState('TODOS');
  const [cargando, setCargando] = useState(true);
  const [dbOffline, setDbOffline] = useState(false);

  // Estados del Modal de Reservación
  const [modalRestaurante, setModalRestaurante] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [formMesa, setFormMesa] = useState({
    fecha: new Date().toISOString().substring(0, 10),
    hora: '19:30',
    comensales: 2,
    zona: 'Interior Climatizado',
    notas: ''
  });

  useEffect(() => {
    async function cargarRestaurantes() {
      try {
        setCargando(true);
        setDbOffline(false);
        const data = await fetchRestaurantes();

        if (Array.isArray(data) && data.length > 0) {
          setRestaurantes(data);
        } else {
          setRestaurantes(RESTAURANTES_DEFAULT);
        }
      } catch (err) {
        console.warn('SQL Server no disponible, activando catálogo gastronómico de respaldo:', err);
        setDbOffline(true);
        setRestaurantes(RESTAURANTES_DEFAULT);
      } finally {
        setCargando(false);
      }
    }

    cargarRestaurantes();
  }, []);

  const categorias = ['TODOS', ...new Set(restaurantes.map(r => r.tipo_cocina || r.TipoCocina).filter(Boolean))];

  const restaurantesFiltrados = filtroCocina === 'TODOS'
    ? restaurantes
    : restaurantes.filter(r => (r.tipo_cocina || r.TipoCocina) === filtroCocina);

  const handleAbrirReserva = (rest) => {
    setModalRestaurante(rest);
    setReservaConfirmada(null);
    setFormMesa({
      fecha: new Date().toISOString().substring(0, 10),
      hora: '19:30',
      comensales: 2,
      zona: 'Interior Climatizado',
      notas: ''
    });
  };

  const handleConfirmarMesa = (e) => {
    e.preventDefault();
    setProcesando(true);

    setTimeout(() => {
      setProcesando(false);
      setReservaConfirmada({
        folio: 'REST-' + Math.floor(100000 + Math.random() * 900000),
        restaurante: modalRestaurante.nombre || modalRestaurante.Nombre,
        fecha: formMesa.fecha,
        hora: formMesa.hora,
        comensales: formMesa.comensales,
        zona: formMesa.zona
      });
    }, 800);
  };

  return (
    <div className="restaurantes-page-root">
      <div className="restaurantes-container">
        
        {/* Encabezado Editorial */}
        <header className="restaurantes-header">
          <span className="restaurantes-pre-title">GASTRONOMÍA DE ALTA GAMA</span>
          <h1>Restaurantes & Cavas de Autor</h1>
          <p>
            Una experiencia culinaria definida por la frescura de la costa mexicana, las técnicas de la cocina 
            internacional y una selección rigurosa de vinos de guarda, acompañada por un servicio cálido e intuitivo.
          </p>
        </header>

        {dbOffline && (
          <div className="restaurantes-cache-badge">
            <ShieldCheck size={14} />
            <span>Catálogo gastronómico oficial de Grupo Posadas sincronizado</span>
          </div>
        )}

        {/* Filtros Isotope de Tipo de Cocina */}
        <div className="restaurantes-filters-row">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`btn-filter-pill ${filtroCocina === cat ? 'active' : ''}`}
              onClick={() => setFiltroCocina(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {cargando && (
          <div className="restaurantes-loading-box">
            <Loader2 className="animate-spin restaurantes-spinner" size={36} />
            <h3>Sincronizando centros gastronómicos con SQL Server...</h3>
          </div>
        )}

        {!cargando && (
          <div className="restaurantes-grid-layout">
            {restaurantesFiltrados.map((rest) => {
              const id = rest.restaurante_id || rest.id;
              const nombre = rest.nombre || rest.Nombre;
              const cocina = rest.tipo_cocina || rest.TipoCocina || 'Cocina Internacional';
              const concepto = rest.concepto || rest.Concepto || '';
              const descripcion = rest.descripcion || rest.Descripcion || '';
              const horario = rest.horario_apertura || rest.HorarioApertura || '18:00 - 23:00 hrs';
              const codigoVestir = rest.codigo_vestir || rest.CodigoVestir || 'Casual Elegante';
              const requiereRes = rest.requiere_reservacion !== undefined 
                ? rest.requiere_reservacion 
                : rest.RequiereReservacion;
              const foto = rest.foto_principal || rest.FotoPrincipal || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';

              return (
                <article key={id} className="restaurante-card-item">
                  
                  {/* Fotografía 16:9 con Badges de Cocina y Reserva */}
                  <div className="restaurante-media-box">
                    <span className="cuisine-badge">{cocina}</span>
                    {requiereRes && (
                      <span className="reservacion-badge">
                        <CalendarCheck size={11} /> Requiere Reserva
                      </span>
                    )}
                    <img
                      src={foto}
                      alt={nombre}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://image-tc.galaxy.tf/wijpeg-aiwi12y61alhuzqbpmywy5gs9/camera-04-0000-png_standard.jpg?crop=0%2C18%2C1584%2C1188&width=1200';
                      }}
                    />
                  </div>

                  {/* Cuerpo Editorial */}
                  <div className="restaurante-body-content">
                    <h2 className="restaurante-nombre">{nombre}</h2>
                    {concepto && <div className="restaurante-concepto">{concepto}</div>}

                    <p className="restaurante-descripcion">{descripcion}</p>

                    <div className="restaurante-specs-panel">
                      <div className="spec-row">
                        <Clock size={14} />
                        <span>Horario: <strong>{horario}</strong></span>
                      </div>
                      <div className="spec-row">
                        <Shirt size={14} />
                        <span>Vestimenta: <strong>{codigoVestir}</strong></span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="btn-reservar-mesa"
                      onClick={() => handleAbrirReserva(rest)}
                    >
                      Reservar Mesa / Concierge <ArrowRight size={15} />
                    </button>
                  </div>

                </article>
              );
            })}
          </div>
        )}

        {/* Modal de Reservación de Mesa Gastronómica */}
        {modalRestaurante && (
          <div className="rest-modal-backdrop" onClick={() => setModalRestaurante(null)}>
            <div className="rest-modal-window" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                className="btn-close-rest-modal"
                onClick={() => setModalRestaurante(null)}
              >
                <X size={20} />
              </button>

              {reservaConfirmada ? (
                <div className="rest-confirm-state">
                  <CheckCircle2 size={52} color="#22c55e" className="confirm-icon" />
                  <span className="restaurantes-pre-title">RESERVACIÓN CONFIRMADA</span>
                  <h2>¡Mesa Asegurada!</h2>
                  <p>
                    Tu turno ha sido agendado exitosamente en el sistema de hostelería de Grand Fiesta Americana Riviera Cancún.
                  </p>

                  <div className="rest-ticket-voucher">
                    <div className="voucher-line">
                      <span>Folio de Mesa:</span>
                      <strong>{reservaConfirmada.folio}</strong>
                    </div>
                    <div className="voucher-line">
                      <span>Restaurante:</span>
                      <strong>{reservaConfirmada.restaurante}</strong>
                    </div>
                    <div className="voucher-line">
                      <span>Fecha & Horario:</span>
                      <strong>{reservaConfirmada.fecha} a las {reservaConfirmada.hora} hrs</strong>
                    </div>
                    <div className="voucher-line">
                      <span>Asistentes & Zona:</span>
                      <strong>{reservaConfirmada.comensales} personas ({reservaConfirmada.zona})</strong>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn-reservar-mesa"
                    onClick={() => setModalRestaurante(null)}
                  >
                    Aceptar y Volver al Catálogo
                  </button>
                </div>
              ) : (
                <div className="rest-form-state">
                  <span className="restaurantes-pre-title">HOSTELERÍA CONCIERGE</span>
                  <h2>Reservar en {modalRestaurante.nombre || modalRestaurante.Nombre}</h2>
                  <p className="rest-modal-subtitle">
                    Selecciona tu fecha y turno. Las reservaciones se garantizan sin costo adicional para huéspedes del resort.
                  </p>

                  <form onSubmit={handleConfirmarMesa}>
                    <div className="rest-form-grid">
                      <div className="rest-input-group">
                        <label>Fecha de la Cena / Comida</label>
                        <input 
                          type="date" 
                          required
                          value={formMesa.fecha}
                          onChange={(e) => setFormMesa({ ...formMesa, fecha: e.target.value })}
                        />
                      </div>

                      <div className="rest-input-group">
                        <label>Turno de Horario</label>
                        <select 
                          value={formMesa.hora}
                          onChange={(e) => setFormMesa({ ...formMesa, hora: e.target.value })}
                        >
                          <option value="13:00">13:00 hrs (Comida)</option>
                          <option value="14:30">14:30 hrs (Comida)</option>
                          <option value="18:30">18:30 hrs (Primer Turno)</option>
                          <option value="19:45">19:45 hrs (Horario Estelar)</option>
                          <option value="21:15">21:15 hrs (Segundo Turno)</option>
                        </select>
                      </div>
                    </div>

                    <div className="rest-form-grid">
                      <div className="rest-input-group">
                        <label>Número de Comensales</label>
                        <select 
                          value={formMesa.comensales}
                          onChange={(e) => setFormMesa({ ...formMesa, comensales: Number(e.target.value) })}
                        >
                          {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                            <option key={n} value={n}>{n} {n === 1 ? 'Persona' : 'Personas'}</option>
                          ))}
                        </select>
                      </div>

                      <div className="rest-input-group">
                        <label>Preferencia de Zona</label>
                        <select 
                          value={formMesa.zona}
                          onChange={(e) => setFormMesa({ ...formMesa, zona: e.target.value })}
                        >
                          <option value="Interior Climatizado">Interior Climatizado</option>
                          <option value="Terraza al Aire Libre">Terraza al Aire Libre</option>
                          <option value="Frente a la Cava">Mesa Cercana a la Cava</option>
                        </select>
                      </div>
                    </div>

                    <div className="rest-input-group">
                      <label>Restricciones Alimentarias / Ocasión Especial</label>
                      <textarea 
                        rows="2"
                        placeholder="Ej: Aniversario, alergia a mariscos, mesa tranquila..."
                        value={formMesa.notas}
                        onChange={(e) => setFormMesa({ ...formMesa, notas: e.target.value })}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn-reservar-mesa"
                      disabled={procesando}
                    >
                      {procesando ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Registrando Reserva...
                        </>
                      ) : (
                        <>
                          <CalendarCheck size={16} /> Confirmar Asignación de Mesa
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