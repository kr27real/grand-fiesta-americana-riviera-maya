import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSuites } from '../../services/api';
import HeroSlider from '../../components/HeroSlider/HeroSlider';
import { 
  Calendar, Users, Baby, ShieldCheck, Smartphone, CreditCard, 
  Award, MessageSquare, Sparkles, ArrowRight, ChevronDown 
} from 'lucide-react';
import './Inicio.css';

export default function Inicio() {
  const navigate = useNavigate();

  // Estados del Booking Bar
  const [fechaLlegada, setFechaLlegada] = useState('2026-12-01');
  const [fechaSalida, setFechaSalida] = useState('2026-12-05');
  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);

  // FAQ Accordion State
  const [faqAbierta, setFaqAbierta] = useState(null);

  // Suites destacadas cargadas de SQL Server
  const [suitesDestacadas, setSuitesDestacadas] = useState([]);

  useEffect(() => {
    fetchSuites()
      .then(data => {
        if (Array.isArray(data)) setSuitesDestacadas(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (index) => {
    setFaqAbierta(faqAbierta === index ? null : index);
  };

  const handleBuscarDisponibilidad = (e) => {
    e.preventDefault();
    navigate('/disponibilidad', {
      state: { fecha_llegada: fechaLlegada, fecha_salida: fechaSalida, adultos, ninos }
    });
  };

  const faqs = [
    {
      pregunta: "¿Dónde se encuentra Grand Fiesta Americana Riviera Cancún?",
      respuesta: "El resort se encuentra frente a las costas de Riviera Cancún, entre la Zona Hotelera de Cancún y el corredor de la Riviera Maya, aproximadamente a 25 minutos del Aeropuerto Internacional de Cancún."
    },
    {
      pregunta: "¿El resort es ideal para familias?",
      respuesta: "Sí. Grand Fiesta Americana Riviera Cancún fue diseñado pensando en familias y viajeros de varias generaciones, con espacios dedicados de Kids & Teens Club, áreas de piscina para familias y opciones gastronómicas para huéspedes de todas las edades."
    },
    {
      pregunta: "¿Qué opciones gastronómicas ofrece el resort?",
      respuesta: "El resort cuenta con seis restaurantes de servicio completo que abarcan propuestas de cocina mexicana, italiana, japonesa, cocina costera durante todo el día y steakhouse, complementadas por una variedad de bares, espacios adicionales, un bar de sushi en la terraza y el Grand Club Lounge."
    },
    {
      pregunta: "¿El resort cuenta con spa?",
      respuesta: "Sí. El spa del resort ofrece una completa selección de tratamientos holísticos, rituales corporales y experiencias de bienestar inspiradas en el paisaje natural y las tradiciones ancestrales de México."
    },
    {
      pregunta: "¿Cuenta con espacios para eventos y bodas?",
      respuesta: "Grand Fiesta Americana Riviera Cancún cuenta con un centro de convenciones con capacidad para hasta 2,100 huéspedes, además de salones y terrazas exteriores diseñados para bodas, eventos corporativos y celebraciones privadas."
    },
    {
      pregunta: "¿Qué es Grand Club?",
      respuesta: "Grand Club es la experiencia de acceso premium del resort, que ofrece un lounge privado, una selección gastronómica cuidadosamente curada durante todo el día, desde el amanecer hasta la noche, acceso VIP a piscina y playa y servicio personalizado de concierge durante toda la estancia."
    },
    {
      pregunta: "¿Cómo puedo acumular y utilizar puntos Fiesta Rewards?",
      respuesta: "Fiesta Rewards es el programa de lealtad de Grupo Posadas. Los socios acumulan puntos en estancias participantes que pueden utilizar para futuras reservaciones, upgrades y beneficios exclusivos en el portafolio de Posadas."
    }
  ];

  return (
    <div className="posadas-home-page">
      
      {/* 1. SECCIÓN HERO: RENDERIZA EL COMPONENTE HEROSLIDER */}
      <section className="posadas-hero-wrap">
        <HeroSlider />

        {/* 2. BOOKING BAR FLOTANTE INTEGRADA AL PIE DEL HERO */}
        <div className="posadas-hero-booking-bar">
          <div className="posadas-container">
            <form className="hero-bb-card" onSubmit={handleBuscarDisponibilidad}>
              <div className="bb-input-cell">
                <label><Calendar size={13} /> LLEGADA</label>
                <input 
                  type="date" 
                  value={fechaLlegada} 
                  onChange={(e) => setFechaLlegada(e.target.value)} 
                  required 
                />
              </div>

              <div className="bb-input-cell">
                <label><Calendar size={13} /> SALIDA</label>
                <input 
                  type="date" 
                  value={fechaSalida} 
                  onChange={(e) => setFechaSalida(e.target.value)} 
                  required 
                />
              </div>

              <div className="bb-input-cell">
                <label><Users size={13} /> ADULTOS</label>
                <select value={adultos} onChange={(e) => setAdultos(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n < 10 ? `0${n}` : n} Adultos</option>)}
                </select>
              </div>

              <div className="bb-input-cell">
                <label><Baby size={13} /> NIÑOS (0-12)</label>
                <select value={ninos} onChange={(e) => setNinos(Number(e.target.value))}>
                  {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n < 10 ? `0${n}` : n} Niños</option>)}
                </select>
              </div>

              <button type="submit" className="btn-bb-submit">
                RESERVAR AHORA
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. CINTA DE BENEFICIOS Y SERVICIOS */}
      <section className="posadas-services-strip">
        <div className="posadas-container">
          <div className="services-strip-grid">
            <div className="service-strip-item">
              <ShieldCheck size={28} className="text-gold" />
              <div>
                <strong>Cancelación Flexible</strong>
                <p>Sin penalización hasta 48h antes</p>
              </div>
            </div>

            <div className="service-strip-item">
              <Smartphone size={28} className="text-gold" />
              <div>
                <strong>Check-in Digital</strong>
                <p>Llave móvil y acceso exprés</p>
              </div>
            </div>

            <div className="service-strip-item">
              <CreditCard size={28} className="text-gold" />
              <div>
                <strong>Disfruta MSI</strong>
                <p>Meses sin intereses en tarjetas</p>
              </div>
            </div>

            <div className="service-strip-item">
              <Award size={28} className="text-gold" />
              <div>
                <strong>Tarifa Garantizada</strong>
                <p>El mejor precio en nuestro sitio web</p>
              </div>
            </div>

            <div className="service-strip-item">
              <MessageSquare size={28} className="text-gold" />
              <div>
                <strong>Concierge Digital</strong>
                <p>Atención personalizada 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTRODUCCIÓN EDITORIAL & ALERTA DE APERTURA */}
      <section className="posadas-editorial-section">
        <div className="posadas-container-narrow text-center">
          <span className="gold-eyebrow">GRAND FIESTA AMERICANA RIVIERA CANCÚN</span>
          <h2 className="editorial-main-title">Donde el Caribe cobra vida</h2>
          <p className="editorial-lead-text">
            Donde el Caribe se encuentra con el diseño contemporáneo, Grand Fiesta Americana Riviera Cancún 
            ofrece una nueva forma de vivir la costa: una experiencia definida por la amplitud, la elegancia relajada 
            y el ritmo pausado del mar. Amplias y hermosas playas, arquitectura excepcional que se abre hacia el horizonte 
            y espacios concebidos para convivir crean el escenario perfecto para que cada día transcurra a un ritmo propio.
          </p>

          <div className="opening-alert-box">
            <Sparkles size={20} color="#d4af37" />
            <div>
              <strong>¡La gran apertura se acerca!</strong>
              <p>A partir del <strong>16 de enero de 2027</strong>. ¡Prepárate para descubrir una experiencia única!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HABITACIONES DESTACADAS */}
      <section className="posadas-section-rooms">
        <div className="posadas-container">
          <div className="section-head-flex">
            <div>
              <span className="gold-eyebrow">COLECCIÓN DE ALTA HOTELERÍA</span>
              <h2 className="section-serif-title">Habitaciones & Suites</h2>
            </div>
            <button type="button" className="link-see-all" onClick={() => navigate('/habitaciones')}>
              Ver todas las habitaciones <ArrowRight size={14} />
            </button>
          </div>

          <div className="home-rooms-grid">
            {suitesDestacadas.map(suite => (
              <div key={suite.suite_id} className="home-room-card">
                <div className="home-room-img-box">
                  <img src={suite.foto_principal} alt={suite.nombre} loading="lazy" />
                  <span className="home-room-cat">{suite.categoria}</span>
                </div>
                <div className="home-room-body">
                  <h3>{suite.nombre}</h3>
                  <p>{suite.descripcion ? suite.descripcion.slice(0, 120) + '...' : ''}</p>
                  <div className="home-room-rate">
                    <small>Desde</small>
                    <strong>${Number(suite.precio_noche_base).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                  </div>
                  <div className="home-room-actions">
                    <button 
                      type="button" 
                      className="btn-room-outline"
                      onClick={() => navigate('/habitaciones')}
                    >
                      Ver Detalles
                    </button>
                    <button 
                      type="button" 
                      className="btn-room-gold"
                      onClick={() => navigate('/disponibilidad', { state: { suite_id_preseleccionado: suite.suite_id } })}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. AMENIDADES & EXPERIENCIAS DE LUJO */}
      <section className="posadas-amenities-section">
        <div className="posadas-container">
          <div className="section-head-flex">
            <div>
              <span className="gold-eyebrow">EXPERIENCIAS EXCLUSIVAS</span>
              <h2 className="section-serif-title">Servicios y Amenidades</h2>
            </div>
            <button type="button" className="link-see-all" onClick={() => navigate('/experiencias')}>
              Explorar todo <ArrowRight size={14} />
            </button>
          </div>

          <div className="amenities-showcase-grid">
            <div className="amenity-showcase-card">
              <img src="https://image-tc.galaxy.tf/wijpeg-7rlpetq08omp6fzv0mdu2p78w/3-oe-fotos_standard.jpg?crop=22%2C0%2C957%2C718&width=700" alt="Traslados" />
              <div className="amenity-card-info">
                <h4>Traslado Gratuito al Aeropuerto</h4>
                <p>Comienza tus vacaciones sin preocupaciones con transportación redonda en Suburban Luxury.</p>
              </div>
            </div>

            <div className="amenity-showcase-card">
              <img src="https://image-tc.galaxy.tf/wijpeg-4igidvyvqodm5sxe421766hni/1-980x650_standard.jpg?crop=57%2C0%2C867%2C650&width=700" alt="Piscinas" />
              <div className="amenity-card-info">
                <h4>Complejo de 9 Piscinas</h4>
                <p>Desde vibrantes albercas familiares hasta soláriums y canales swim-up exclusivos para adultos.</p>
              </div>
            </div>

            <div className="amenity-showcase-card">
              <img src="https://image-tc.galaxy.tf/wijpeg-9di672cuo86gvwh810o7tlnns/al-spa-area-alberca-01_standard.jpg?crop=240%2C0%2C1440%2C1080&width=700" alt="Spa" />
              <div className="amenity-card-info">
                <h4>Feel Harmony Spa</h4>
                <p>Santuario de hidroterapia y rituales ancestrales mayas para una profunda desconexión.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. RESTAURANTES DESTACADOS */}
      <section className="posadas-dining-section">
        <div className="posadas-container">
          <div className="section-head-flex">
            <div>
              <span className="gold-eyebrow">ALTA COCINA</span>
              <h2 className="section-serif-title">Propuesta Gastronómica</h2>
            </div>
            <button type="button" className="link-see-all" onClick={() => navigate('/restaurantes')}>
              Ver todos los restaurantes <ArrowRight size={14} />
            </button>
          </div>

          <div className="dining-grid-layout">
            <div className="dining-card">
              <div className="dining-img-wrap">
                <img src="https://image-tc.galaxy.tf/wijpeg-aiwi12y61alhuzqbpmywy5gs9/camera-04-0000-png_standard.jpg?crop=0%2C18%2C1584%2C1188&width=800" alt="Península" />
                <span className="dining-badge">Buffet Frente al Mar</span>
              </div>
              <div className="dining-text">
                <h3>Península</h3>
                <p>Donde las mañanas comienzan con el sonido de las olas y las noches invitan a contemplar el arrecife.</p>
              </div>
            </div>

            <div className="dining-card">
              <div className="dining-img-wrap">
                <img src="https://image-tc.galaxy.tf/wijpeg-1dw3841ug4yola1lq9uzgmvd/camera-07-0000-png_standard.jpg?crop=0%2C18%2C1584%2C1188&width=800" alt="Viña Del Mar" />
                <span className="dining-badge">Cocina Internacional</span>
              </div>
              <div className="dining-text">
                <h3>Viña Del Mar</h3>
                <p>El corazón del resort: un espacio de convivencia para disfrutar recetas de autor a cualquier hora.</p>
              </div>
            </div>

            <div className="dining-card">
              <div className="dining-img-wrap">
                <img src="https://image-tc.galaxy.tf/wijpeg-1u6qtwbl793pz2r84bef32xsb/image-112_standard.jpg?crop=160%2C0%2C960%2C720&width=800" alt="Rosato" />
                <span className="dining-badge">Especialidad Italiana</span>
              </div>
              <div className="dining-text">
                <h3>Rosato</h3>
                <p>Vibrante, cálido y auténticamente italiano. Pastas frescas, maridajes selectos y el mejor ambiente.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PREGUNTAS FRECUENTES (FAQ ACORDEÓN) */}
      <section className="posadas-faq-section">
        <div className="posadas-container">
          <div className="text-center mb-5">
            <span className="gold-eyebrow">RESOLVEMOS TUS DUDAS</span>
            <h2 className="section-serif-title">Preguntas Frecuentes</h2>
          </div>

          <div className="faq-accordion-container">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${faqAbierta === index ? 'active' : ''}`}>
                <button 
                  type="button" 
                  className="faq-question-btn"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.pregunta}</span>
                  <ChevronDown size={20} className="faq-icon" />
                </button>
                {faqAbierta === index && (
                  <div className="faq-answer-content">
                    <p>{faq.respuesta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. DISTINTIVOS INSTITUCIONALES (FORBES & FIESTA REWARDS) */}
      <section className="posadas-awards-callout">
        <div className="posadas-container">
          <div className="awards-flex-banner">
            <div className="award-item">
              <img src="https://image-tc.galaxy.tf/wijpeg-8ov3jgi4ya6scml3xwzbi3cvv/forbes-980x650.jpg?width=270" alt="Forbes Award" />
              <div>
                <h4>Forbes Travel Guide Recommended</h4>
                <p>Estándar de hospitalidad de clase mundial reconocido por los evaluadores de viaje más exigentes.</p>
              </div>
            </div>

            <div className="award-item fr-highlight">
              <img src="https://image-tc.galaxy.tf/wisvg-99ul50jzxbhlpgwx4rpyxv22a/fr-pleca.svg?width=300" alt="Fiesta Rewards" />
              <div>
                <h4>Gana Noches Gratis y Puntos</h4>
                <p>Hasta 10% de descuento directo en tus reservas y beneficios exclusivos en Grupo Posadas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}