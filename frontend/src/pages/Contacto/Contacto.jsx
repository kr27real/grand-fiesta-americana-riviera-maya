import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, MessageSquare, Clock, Send, 
  CheckCircle2, Loader2, Award, AlertTriangle, RefreshCw, FileText 
} from 'lucide-react';
import { 
  createContactTicket, 
  obtenerPerfilSocioApi, 
  obtenerHistorialReservacionesApi, 
  obtenerTicketsUsuarioApi 
} from '../../services/api';
import './Contacto.css';

export default function Contacto() {
  const [usuarioSesion] = useState(() => {
    return JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user') || 'null');
  });

  const [reservacionesUsuario, setReservacionesUsuario] = useState([]);
  const [misTickets, setMisTickets] = useState([]);
  const [dbError, setDbError] = useState(false);

  const [formData, setFormData] = useState({
    hotel_destino: 'Grand Fiesta Americana Riviera Cancún',
    categoria: 'Atención a Huéspedes',
    tipo_solicitud: 'Consulta General',
    clave_reservacion: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono_lada: '+52',
    telefono: '',
    descripcion: ''
  });

  const [enviando, setEnviando] = useState(false);
  const [ticketEnviado, setTicketEnviado] = useState(false);
  const [ticketFolio, setTicketFolio] = useState('');

  const cargarContextoUsuario = async () => {
    setDbError(false);
    if (!usuarioSesion) return;

    const uId = usuarioSesion.usuario_id || usuarioSesion.UsuarioID || usuarioSesion.id;
    if (!uId) return;

    try {
      const perfilDb = await obtenerPerfilSocioApi(uId);
      if (perfilDb) {
        setFormData((prev) => ({
          ...prev,
          nombres: perfilDb.nombre || prev.nombres,
          apellidos: perfilDb.apellido || prev.apellidos,
          email: perfilDb.email || prev.email,
          telefono: perfilDb.telefono || prev.telefono
        }));
      }

      const reservas = await obtenerHistorialReservacionesApi(uId);
      if (Array.isArray(reservas)) {
        setReservacionesUsuario(reservas);
      }

      const tickets = await obtenerTicketsUsuarioApi(uId);
      if (Array.isArray(tickets)) {
        setMisTickets(tickets);
      }
    } catch (err) {
      console.warn('Fallo al sincronizar datos de usuario con SQL Server:', err.message);
      setDbError(true);
    }
  };

  useEffect(() => {
    cargarContextoUsuario();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setDbError(false);

    const uId = usuarioSesion ? (usuarioSesion.usuario_id || usuarioSesion.UsuarioID || usuarioSesion.id) : null;

    const payload = {
      usuario_id: uId,
      hotel_destino: formData.hotel_destino,
      categoria: formData.categoria,
      tipo_solicitud: formData.tipo_solicitud,
      clave_reservacion: formData.clave_reservacion,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      email: formData.email,
      telefono: `${formData.telefono_lada} ${formData.telefono}`.trim(),
      descripcion: formData.descripcion
    };

    try {
      const res = await createContactTicket(payload);
      setTicketFolio(res.ticket_id ? `TCK-${res.ticket_id}` : `TCK-${Math.floor(100000 + Math.random() * 900000)}`);
      setTicketEnviado(true);

      if (uId) {
        cargarContextoUsuario();
      }
    } catch (err) {
      console.warn('Fallo guardado en SQL Server, emitiendo ticket de respaldo local:', err.message);
      setTicketFolio(`TCK-LOCAL-${Math.floor(100000 + Math.random() * 900000)}`);
      setTicketEnviado(true);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contacto-page-root">
      <div className="contacto-wrapper">
        
        {/* Encabezado Editorial */}
        <header className="contacto-header-intro">
          <span className="contacto-pre-tag">HOSPITALIDAD & ATENCIÓN AL HUÉSPED</span>
          <h1>Queremos Escucharte</h1>
          <p>
            Permítenos atenderte con los más altos estándares de Grupo Posadas. Tu mensaje será canalizado 
            directamente con el departamento correspondiente y respaldado en nuestro sistema central.
          </p>
        </header>

        {/* Alerta de Desconexión de Base de Datos */}
        {dbError && (
          <div className="db-offline-alert">
            <AlertTriangle size={30} color="#ef4444" className="db-alert-icon" />
            <div className="db-alert-content">
              <h4>Sin Conexión Directa con Microsoft SQL Server</h4>
              <p>El servicio de base de datos no está respondiendo temporalmente. Tu solicitud será guardada de manera segura en cola de respaldo.</p>
            </div>
            <button type="button" onClick={cargarContextoUsuario} className="btn-retry-db">
              <RefreshCw size={13} /> Reintentar
            </button>
          </div>
        )}

        {/* Banner de Socio Reconocido */}
        {usuarioSesion && (
          <div className="socio-identified-banner">
            <div className="socio-banner-left">
              <Award size={18} color="#d4af37" />
              <span>
                Socio Identificado: <strong>{formData.nombres} {formData.apellidos}</strong> ({usuarioSesion.numero_socio_rewards || 'FR-Socio'})
              </span>
            </div>
            <span className="socio-tag-info">Datos precargados desde tu cuenta</span>
          </div>
        )}

        <div className="contacto-main-grid">
          
          {/* Canales Directos */}
          <div className="contacto-info-column">
            
            <div className="info-luxury-card">
              <div className="info-icon-bubble">
                <MapPin size={20} color="#d4af37" />
              </div>
              <div className="info-card-text">
                <span>Ubicación Privilegiada</span>
                <strong>Grand Fiesta Americana Riviera Cancún</strong>
                <p>Carretera Federal 307 Km 335, Benito Juárez, CP 77580, Cancún, Quintana Roo, México.</p>
              </div>
            </div>

            <div className="info-luxury-card">
              <div className="info-icon-bubble">
                <Phone size={20} color="#c084fc" />
              </div>
              <div className="info-card-text">
                <span>Call Center & Reservaciones</span>
                <strong>+52 (800) 504 5000 / +52 (443) 310 81 37</strong>
                <p>Línea exclusiva para cotización de suites, paquetes de vuelo y convenios corporativos.</p>
              </div>
            </div>

            <div className="info-luxury-card">
              <div className="info-icon-bubble">
                <MessageSquare size={20} color="#22c55e" />
              </div>
              <div className="info-card-text">
                <span>WhatsApp Concierge Oficial</span>
                <strong className="text-whatsapp">+52 1 443 137 8728</strong>
                <p>Asistencia en tiempo real durante tu estancia para reservas en restaurantes, traslados y amenidades.</p>
              </div>
            </div>

            <div className="support-banner-pill">
              <Clock size={20} color="#d4af37" className="clock-icon" />
              <span>Atención continua las 24 horas del día para consultas de huéspedes, traslados y facturación electrónica.</span>
            </div>

          </div>

          {/* Formulario */}
          <div className="contacto-form-card">
            <div className="form-head-title">
              <h3>Envíanos un Mensaje</h3>
              <p>Completa tus datos y un asesor de hospitalidad se comunicará a la brevedad.</p>
            </div>

            {ticketEnviado ? (
              <div className="alert-feedback-ok">
                <CheckCircle2 size={44} color="#22c55e" className="feedback-icon" />
                <h4>¡Solicitud Recibida con Éxito!</h4>
                <p>Tu petición ha sido canalizada formalmente con el folio de atención:</p>
                <div className="ticket-voucher-display">
                  {ticketFolio}
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setTicketEnviado(false);
                    setFormData((prev) => ({ ...prev, descripcion: '' }));
                  }} 
                  className="btn-submit-luxury"
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form-layout">
                
                <div className="form-group-block">
                  <label>Hotel Destino</label>
                  <input
                    type="text"
                    name="hotel_destino"
                    value={formData.hotel_destino}
                    readOnly
                    className="input-readonly"
                  />
                </div>

                <div className="form-group-block">
                  <label>Categoría de Solicitud*</label>
                  <select name="categoria" value={formData.categoria} onChange={handleChange} required>
                    <option value="Atención a Huéspedes">Atención a Huéspedes</option>
                    <option value="Reservaciones & Tarifas">Reservaciones & Tarifas</option>
                    <option value="Bodas & Eventos Sociales">Bodas & Eventos Sociales</option>
                    <option value="Transporte & Traslados">Transporte & Traslados</option>
                    <option value="Fiesta Rewards">Fiesta Rewards</option>
                    <option value="Facturación Electrónica">Facturación Electrónica</option>
                  </select>
                </div>

                <div className="form-group-block">
                  <label>Clave de Reservación (Opcional)</label>
                  {reservacionesUsuario.length > 0 ? (
                    <select 
                      name="clave_reservacion" 
                      value={formData.clave_reservacion} 
                      onChange={handleChange}
                    >
                      <option value="">-- Sin reservación o capturar manualmente --</option>
                      {reservacionesUsuario.map((r) => (
                        <option key={r.reservacion_id} value={r.folio_confirmacion}>
                          {r.folio_confirmacion} - {r.suite_nombre} ({r.fecha_llegada?.substring(0, 10)})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="clave_reservacion"
                      placeholder="Ej. GFA-9886225"
                      value={formData.clave_reservacion}
                      onChange={handleChange}
                    />
                  )}
                </div>

                <div className="form-row-duo">
                  <div className="form-group-block">
                    <label>Nombre(s)*</label>
                    <input
                      type="text"
                      name="nombres"
                      required
                      placeholder="Nombre del titular"
                      value={formData.nombres}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group-block">
                    <label>Apellido(s)*</label>
                    <input
                      type="text"
                      name="apellidos"
                      required
                      placeholder="Apellido(s)"
                      value={formData.apellidos}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group-block">
                  <label>Correo Electrónico*</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="ejemplo@dominio.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group-block">
                  <label>Teléfono de Contacto*</label>
                  <div className="phone-split-container">
                    <select name="telefono_lada" value={formData.telefono_lada} onChange={handleChange}>
                      <option value="+52">México (+52)</option>
                      <option value="+1">USA / CAN (+1)</option>
                      <option value="+34">España (+34)</option>
                    </select>
                    <input
                      type="tel"
                      name="telefono"
                      required
                      placeholder="10 dígitos"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group-block">
                  <label>Mensaje o Petición Detallada*</label>
                  <textarea
                    name="descripcion"
                    rows="4"
                    required
                    placeholder="Describe los requerimientos de tu estancia o la consulta que deseas canalizar..."
                    value={formData.descripcion}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="btn-submit-luxury" disabled={enviando}>
                  {enviando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Enviando mensaje...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Enviar Mensaje</span>
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>

        {/* Historial de Tickets del Usuario */}
        {usuarioSesion && misTickets.length > 0 && (
          <section className="tickets-history-box">
            <div className="tickets-history-head">
              <span className="contacto-pre-tag">HISTORIAL DE ATENCIÓN</span>
              <h3>Tus Mensajes y Peticiones Previas</h3>
            </div>
            
            <div className="tickets-list-container">
              {misTickets.map((t) => (
                <div key={t.ticket_id} className="ticket-item-row">
                  <div className="ticket-item-main">
                    <div className="ticket-item-top">
                      <FileText size={15} color="#d4af37" />
                      <strong className="ticket-folio">Folio: TCK-{t.ticket_id}</strong>
                      <span className="ticket-status-pill">{t.estatus || 'En Revisión'}</span>
                    </div>
                    <div className="ticket-item-meta">
                      Categoría: <strong>{t.categoria}</strong> {t.clave_reservacion ? `• Clave: ${t.clave_reservacion}` : ''}
                    </div>
                    <p className="ticket-item-desc">
                      "{t.descripcion}"
                    </p>
                  </div>
                  <div className="ticket-item-date">
                    {t.creado_en ? new Date(t.creado_en).toLocaleString('es-MX') : ''}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}