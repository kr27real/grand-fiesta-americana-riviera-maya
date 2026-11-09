import React, { useState, useEffect } from 'react';
import { fetchEspaciosEventos, cotizarEventoApi } from '../../services/api';
import { Users, Maximize, Calendar, CheckCircle2, Loader2, Sparkles, Send } from 'lucide-react';
import './Eventos.css';

const PRECIOS_BANQUETE = {
  'Sin Banquete': 0,
  'Coctel Canapés': 450,
  'Banquete 3 Tiempos': 850,
  'Banquete Autor 4 Tiempos': 1250
};

const PRECIOS_BARRA = {
  'Sin Barra': 0,
  'Nacional': 380,
  'Internacional Premium': 620
};

export default function Eventos() {
  const [espacios, setEspacios] = useState([]);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [folioGenerado, setFolioGenerado] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [usuario] = useState(() => {
    return JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user') || 'null');
  });

  const [formCotizacion, setFormCotizacion] = useState({
    tipo_evento: 'Boda Destino',
    fecha_evento: new Date(Date.now() + 86400000 * 90).toISOString().substring(0, 10),
    asistentes: 100,
    paquete_banquete: 'Banquete 3 Tiempos',
    barra_libre: 'Internacional Premium',
    nombre_contacto: usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() : '',
    email_contacto: usuario?.email || '',
    telefono_contacto: usuario?.telefono || '',
    notas_adicionales: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchEspaciosEventos();
        if (Array.isArray(data) && data.length > 0) {
          setEspacios(data);
          setEspacioSeleccionado(data[0]);
        }
      } catch (err) {
        console.error('Error al cargar espacios:', err);
      } finally {
        setCargando(false);
      }
    }
    loadData();
  }, []);

  // Cálculos en tiempo real
  const costoEspacio = espacioSeleccionado ? Number(espacioSeleccionado.costo_base_renta) : 0;
  const costoAlimentos = (PRECIOS_BANQUETE[formCotizacion.paquete_banquete] || 0) * Number(formCotizacion.asistentes);
  const costoBebidas = (PRECIOS_BARRA[formCotizacion.barra_libre] || 0) * Number(formCotizacion.asistentes);
  const totalEstimado = costoEspacio + costoAlimentos + costoBebidas;

  const handleSubmitCotizacion = async (e) => {
    e.preventDefault();
    if (!espacioSeleccionado) return;
    setEnviando(true);

    try {
      const payload = {
        usuario_id: usuario ? (usuario.usuario_id || usuario.id) : null,
        espacio_id: espacioSeleccionado.espacio_id,
        tipo_evento: formCotizacion.tipo_evento,
        fecha_evento: formCotizacion.fecha_evento,
        asistentes: Number(formCotizacion.asistentes),
        paquete_banquete: formCotizacion.paquete_banquete,
        barra_libre: formCotizacion.barra_libre,
        costo_espacio: costoEspacio,
        costo_alimentos: costoAlimentos,
        costo_bebidas: costoBebidas,
        total_estimado: totalEstimado,
        nombre_contacto: formCotizacion.nombre_contacto,
        email_contacto: formCotizacion.email_contacto,
        telefono_contacto: formCotizacion.telefono_contacto,
        notas_adicionales: formCotizacion.notas_adicionales
      };

      const res = await cotizarEventoApi(payload);
      setFolioGenerado(res.data?.folio_cotizacion || 'EVT-CONFIRMADO');
    } catch (err) {
      alert(err.message || 'Error al guardar la cotización en SQL Server.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="eventos-page-root">
      <div className="eventos-wrapper">
        
        <header className="eventos-header">
          <span className="eventos-pre-tag">Bodas de Ensueño & Centro de Convenciones</span>
          <h1>Eventos Exclusivos & MICE</h1>
          <p>
            Desde bodas frente al Caribe hasta congresos corporativos para 2,100 personas. Elige tu escenario, personaliza banquete y obtén una cotización oficial respaldada en SQL Server.
          </p>
        </header>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={36} className="animate-spin" color="#d4af37" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <>
            {/* 1. Catálogo de Espacios */}
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#f3e5ab', marginBottom: '1.5rem' }}>
              1. Selecciona tu Espacio o Salón
            </h2>

            <div className="espacios-grid">
              {espacios.map((esp) => {
                const isSelected = espacioSeleccionado?.espacio_id === esp.espacio_id;
                return (
                  <article key={esp.espacio_id} className="espacio-card">
                    <div className="espacio-img-wrap">
                      <img src={esp.imagen_url} alt={esp.nombre} />
                      <span className="espacio-badge">{esp.tipo_espacio}</span>
                    </div>
                    <div className="espacio-card-body">
                      <h3>{esp.nombre}</h3>
                      <div className="espacio-specs">
                        <span><Users size={13} style={{ display: 'inline' }} /> Hasta {esp.capacidad_maxima} pax</span>
                        <span><Maximize size={13} style={{ display: 'inline' }} /> {esp.area_m2} m²</span>
                      </div>
                      <p>{esp.descripcion}</p>
                      <button
                        type="button"
                        className={`btn-select-espacio ${isSelected ? 'selected' : ''}`}
                        onClick={() => setEspacioSeleccionado(esp)}
                      >
                        {isSelected ? '✓ Espacio Seleccionado' : 'Elegir este espacio'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* 2. Cotizador Interactivo */}
            <section className="cotizador-section">
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', margin: '0 0 1.5rem 0' }}>
                2. Cotizador en Tiempo Real & Solicitud de Bloqueo
              </h2>

              {folioGenerado ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <CheckCircle2 size={54} color="#22c55e" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: '#f3e5ab' }}>
                    ¡Cotización Registrada en SQL Server!
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '1rem' }}>
                    Tu expediente de evento ha sido asignado al equipo de bodas y convenciones con el folio:
                  </p>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f3e5ab', fontFamily: 'monospace', margin: '1rem 0' }}>
                    {folioGenerado}
                  </div>
                  <button onClick={() => setFolioGenerado('')} className="btn-select-espacio selected" style={{ padding: '0.8rem 2rem' }}>
                    Nueva Cotización
                  </button>
                </div>
              ) : (
                <div className="cotizador-grid">
                  <form onSubmit={handleSubmitCotizacion} className="cotizador-form">
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label>Tipo de Evento</label>
                        <select
                          value={formCotizacion.tipo_evento}
                          onChange={(e) => setFormCotizacion({ ...formCotizacion, tipo_evento: e.target.value })}
                        >
                          <option value="Boda Destino">Boda Destino</option>
                          <option value="Congreso / Convención">Congreso / Convención</option>
                          <option value="Cena de Gala">Cena de Gala</option>
                          <option value="Celebración Privada">Celebración Privada</option>
                        </select>
                      </div>

                      <div>
                        <label>Fecha Estimada</label>
                        <input
                          type="date"
                          required
                          value={formCotizacion.fecha_evento}
                          onChange={(e) => setFormCotizacion({ ...formCotizacion, fecha_evento: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label>Número de Asistentes</label>
                        <input
                          type="number"
                          min="10"
                          max={espacioSeleccionado ? espacioSeleccionado.capacidad_maxima : 2100}
                          value={formCotizacion.asistentes}
                          onChange={(e) => setFormCotizacion({ ...formCotizacion, asistentes: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label>Paquete de Banquete</label>
                        <select
                          value={formCotizacion.paquete_banquete}
                          onChange={(e) => setFormCotizacion({ ...formCotizacion, paquete_banquete: e.target.value })}
                        >
                          <option value="Sin Banquete">Sin Banquete</option>
                          <option value="Coctel Canapés">Coctel Canapés ($450 MXN/pax)</option>
                          <option value="Banquete 3 Tiempos">Banquete 3 Tiempos ($850 MXN/pax)</option>
                          <option value="Banquete Autor 4 Tiempos">Banquete Autor 4 Tiempos ($1,250 MXN/pax)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label>Servicio de Barra Libre</label>
                      <select
                        value={formCotizacion.barra_libre}
                        onChange={(e) => setFormCotizacion({ ...formCotizacion, barra_libre: e.target.value })}
                      >
                        <option value="Sin Barra">Sin Barra Libre</option>
                        <option value="Nacional">Barra Nacional ($380 MXN/pax)</option>
                        <option value="Internacional Premium">Internacional Premium ($620 MXN/pax)</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label>Nombre del Solicitante</label>
                        <input
                          type="text"
                          required
                          placeholder="Nombre completo"
                          value={formCotizacion.nombre_contacto}
                          onChange={(e) => setFormCotizacion({ ...formCotizacion, nombre_contacto: e.target.value })}
                        />
                      </div>

                      <div>
                        <label>Teléfono de Contacto</label>
                        <input
                          type="tel"
                          required
                          placeholder="10 dígitos"
                          value={formCotizacion.telefono_contacto}
                          onChange={(e) => setFormCotizacion({ ...formCotizacion, telefono_contacto: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label>Correo Electrónico</label>
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@empresa.com"
                        value={formCotizacion.email_contacto}
                        onChange={(e) => setFormCotizacion({ ...formCotizacion, email_contacto: e.target.value })}
                      />
                    </div>

                    <div>
                      <label>Requerimientos Especiales (Opcional)</label>
                      <textarea
                        rows="2"
                        placeholder="Montaje, pista de baile, audio profesional..."
                        value={formCotizacion.notas_adicionales}
                        onChange={(e) => setFormCotizacion({ ...formCotizacion, notas_adicionales: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn-guardar-cotizacion" disabled={enviando}>
                      {enviando ? 'Guardando en SQL Server...' : 'Enviar Solicitud Formal de Bloqueo'}
                    </button>
                  </form>

                  {/* Tarjeta de Resumen */}
                  <div className="resumen-card">
                    <div>
                      <h3>Resumen Estimado</h3>
                      <div className="resumen-line">
                        <span>Espacio:</span>
                        <strong>{espacioSeleccionado?.nombre}</strong>
                      </div>
                      <div className="resumen-line">
                        <span>Renta Base del Espacio:</span>
                        <span>${costoEspacio.toLocaleString('es-MX')} MXN</span>
                      </div>
                      <div className="resumen-line">
                        <span>Alimentos ({formCotizacion.asistentes} pax):</span>
                        <span>${costoAlimentos.toLocaleString('es-MX')} MXN</span>
                      </div>
                      <div className="resumen-line">
                        <span>Bebidas ({formCotizacion.asistentes} pax):</span>
                        <span>${costoBebidas.toLocaleString('es-MX')} MXN</span>
                      </div>
                    </div>

                    <div className="resumen-total">
                      <span>Total Estimado:</span>
                      <strong>${totalEstimado.toLocaleString('es-MX')} MXN</strong>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

      </div>
    </div>
  );
}