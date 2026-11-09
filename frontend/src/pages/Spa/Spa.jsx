import React, { useState } from 'react';
import { Sparkles, Award, Clock, Heart, Calendar, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './Spa.css';

const heroSlides = [
  {
    id: 1,
    title: 'Feel Harmony Spa',
    subtitle: 'Un santuario de calma y equilibrio en las costas del Caribe Mexicano',
    image: 'https://image-tc.galaxy.tf/wijpeg-5w42r7ohhi2iqzalg9xui1nf7/al-spa-cabinas-02_wide.jpg?crop=0%2C0%2C1920%2C1080&width=1600'
  },
  {
    id: 2,
    title: 'Bridal Suite & Parejas',
    subtitle: 'Espacios privados diseñados para rituales compartidos y momentos inolvidables',
    image: 'https://image-tc.galaxy.tf/wijpeg-2nzsrvkg6biv0figqrme6dndy/al-spa-bridal-suite-01_wide.jpg?crop=0%2C0%2C1920%2C1080&width=1600'
  },
  {
    id: 3,
    title: 'Estética & Salón de Belleza',
    subtitle: 'Servicios integrales de estilismo, cuidado capilar y bienestar personal',
    image: 'https://image-tc.galaxy.tf/wijpeg-1qh76h8laaqcj55k4z92w6636/al-spa-estetica_wide.jpg?crop=0%2C0%2C1920%2C1080&width=1600'
  }
];

const treatments = [
  {
    id: 1,
    name: 'Masaje Signature Feel Harmony',
    category: 'Corporal',
    duration: '80 min',
    partner: 'Aceites Botánicos Naturales',
    description: 'Terapia personalizada que combina técnicas suecas y tejido profundo con aromaterapia tibia para disolver tensiones y restablecer el equilibrio energético.',
    price: '$3,850 MXN'
  },
  {
    id: 2,
    name: 'Facial Revitalizante Natura Bissé',
    category: 'Facial',
    duration: '60 min',
    partner: 'Prestige Partner Natura Bissé',
    description: 'Tratamiento oxigenante y reafirmante con vitamina C de alta biodisponibilidad que devuelve la luminosidad, frescura y juventud al rostro.',
    price: '$4,200 MXN'
  },
  {
    id: 3,
    name: 'Ritual en Pareja en Bridal Suite',
    category: 'Exclusivo',
    duration: '110 min',
    partner: 'Suite Privada con Jacuzzi',
    description: 'Exfoliación suave, masaje en sincronía con aceites aromáticos, inmersión en jacuzzi privado con pétalos y degustación de champaña.',
    price: '$7,900 MXN'
  },
  {
    id: 4,
    name: 'Terapia de Piedras Volcánicas Calientes',
    category: 'Holístico',
    duration: '80 min',
    partner: 'Piedras Basálticas Ancestrales',
    description: 'Calor focalizado sobre los centros energéticos que alivia la fatiga muscular profunda, estimula la circulación y promueve un sueño reparador.',
    price: '$3,950 MXN'
  }
];

const galleryImages = [
  {
    id: 1,
    url: 'https://image-tc.galaxy.tf/wijpeg-5w42r7ohhi2iqzalg9xui1nf7/al-spa-cabinas-02_standard.jpg?crop=240%2C0%2C1440%2C1080&width=800',
    caption: 'Cabinas individuales con iluminación tenue'
  },
  {
    id: 2,
    url: 'https://image-tc.galaxy.tf/wijpeg-2nzsrvkg6biv0figqrme6dndy/al-spa-bridal-suite-01_standard.jpg?crop=240%2C0%2C1440%2C1080&width=800',
    caption: 'Bridal Suite con sala lounge privada'
  },
  {
    id: 3,
    url: 'https://image-tc.galaxy.tf/wijpeg-1qh76h8laaqcj55k4z92w6636/al-spa-estetica_standard.jpg?crop=240%2C0%2C1440%2C1080&width=800',
    caption: 'Área de estética y cuidado personal'
  },
  {
    id: 4,
    url: 'https://image-tc.galaxy.tf/wijpeg-a873ao0kglwy0kq3hrhvpk735/al-spa-cabinas-01_standard.jpg?crop=240%2C0%2C1440%2C1080&width=800',
    caption: 'Cabinas de hidroterapia y masajes'
  },
  {
    id: 5,
    url: 'https://image-tc.galaxy.tf/wijpeg-2dlxax1kk9l8c28wf9ss4vlkc/al-spa-bridal-suite-02_standard.jpg?crop=240%2C0%2C1440%2C1080&width=800',
    caption: 'Detalle de confort en Bridal Suite'
  }
];

export default function Spa() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bookingTreatment, setBookingTreatment] = useState(null);
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    nombre: '',
    email: '',
    fecha: '',
    hora: '10:00'
  });

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookedSuccess(true);
  };

  return (
    <div className="spa-page-wrapper">
      {/* 1. Hero Slider de Cabinas del Spa */}
      <section className="spa-hero-slider">
        <div 
          className="spa-hero-slide" 
          style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
        >
          <div className="spa-hero-overlay" />
          <div className="spa-hero-content">
            <span className="spa-tag-badge">BIENESTAR & ARMONÍA</span>
            <h1>{heroSlides[currentSlide].title}</h1>
            <p>{heroSlides[currentSlide].subtitle}</p>
          </div>
        </div>

        <button className="spa-slider-nav prev" onClick={prevSlide} aria-label="Anterior">
          <ChevronLeft size={24} />
        </button>
        <button className="spa-slider-nav next" onClick={nextSlide} aria-label="Siguiente">
          <ChevronRight size={24} />
        </button>
      </section>

      {/* 2. Filosofía y Reseña Oficial */}
      <section className="spa-intro-section">
        <div className="spa-page-container">
          <div className="spa-intro-head">
            <span className="spa-sub-tag">SANTO REFUGIO DE SERENIDAD</span>
            <h2 className="spa-main-title">Feel Harmony Spa</h2>
            <div className="gold-divider-center" />
          </div>

          <div className="spa-editorial-body">
            <p>
              Hay momentos de una estancia que invitan a hacer, y otros que simplemente piden detenerse. 
              <strong> Feel Harmony Spa</strong> nace para lo segundo: un espacio dedicado por completo a dejar atrás 
              el ritmo cotidiano, hacer una pausa y dar al cuerpo, la mente y el espíritu el tiempo necesario para renovarse.
            </p>
            <p>
              Inspirado en tradiciones de bienestar del mundo, Feel Harmony Spa ofrece una selección de rituales aromáticos 
              y tratamientos terapéuticos diseñados para despertar los sentidos con intención. Desde masajes profundamente restauradores 
              hasta tratamientos faciales revitalizantes, cada experiencia es guiada por terapeutas certificados.
            </p>
          </div>

          {/* Distintivo de Marca: Natura Bissé */}
          <div className="natura-bisse-callout">
            <Award size={36} className="award-icon" />
            <div className="natura-text">
              <h4>Prestige Partner de Natura Bissé</h4>
              <p>
                Reconocida por los <strong>World Spa Awards™</strong> como la mejor marca de spa del mundo, distinción que se refleja 
                en cada producto utilizado y en cada tratamiento ofrecido en Grand Fiesta Americana Riviera Cancún.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Menú de Tratamientos */}
      <section className="spa-treatments-section">
        <div className="spa-page-container">
          <div className="section-head-left">
            <span className="spa-sub-tag">CATÁLOGO DE EXPERIENCIAS</span>
            <h3 className="section-title">Tratamientos & Rituales</h3>
          </div>

          <div className="treatments-grid">
            {treatments.map((item) => (
              <article key={item.id} className="treatment-card">
                <div className="treatment-top-row">
                  <span className="treatment-category">{item.category}</span>
                  <span className="treatment-duration">
                    <Clock size={13} /> {item.duration}
                  </span>
                </div>

                <h4 className="treatment-name">{item.name}</h4>
                <span className="treatment-partner">{item.partner}</span>
                <p className="treatment-desc">{item.description}</p>

                <div className="treatment-card-footer">
                  <div className="treatment-price-wrap">
                    <span className="price-label">Tarifa por persona</span>
                    <strong className="price-amount">{item.price}</strong>
                  </div>
                  <button 
                    className="btn-book-treatment"
                    onClick={() => {
                      setBookingTreatment(item);
                      setBookedSuccess(false);
                    }}
                  >
                    Agendar Cita
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Galería de Instalaciones */}
      <section className="spa-gallery-section">
        <div className="spa-page-container">
          <div className="section-head-left">
            <span className="spa-sub-tag">INSTALACIONES DE LUJO</span>
            <h3 className="section-title">Galería del Spa</h3>
          </div>

          <div className="spa-gallery-grid">
            {galleryImages.map((img) => (
              <div key={img.id} className="gallery-photo-item">
                <img src={img.url} alt={img.caption} className="gallery-photo-img" />
                <span className="gallery-photo-caption">{img.caption}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de Cita */}
      {bookingTreatment && (
        <div className="modal-backdrop" onClick={() => setBookingTreatment(null)}>
          <div className="modal-spa-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-spa-modal" onClick={() => setBookingTreatment(null)}>
              <X size={20} />
            </button>

            {bookedSuccess ? (
              <div className="spa-success-pane">
                <CheckCircle2 size={46} className="success-icon-spa" />
                <h3>¡Cita Solicitada con Éxito!</h3>
                <p>
                  Hemos recibido tu solicitud para <strong>{bookingTreatment.name}</strong> para el día <strong>{appointmentData.fecha || 'Próxima estancia'}</strong> a las <strong>{appointmentData.hora} hrs</strong>.
                </p>
                <p className="concierge-note">El equipo de concierge de Feel Harmony Spa te contactará para confirmar tu cabina.</p>
                <button className="btn-done-spa" onClick={() => setBookingTreatment(null)}>
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="spa-form-pane">
                <span className="modal-tag">RESERVACIÓN DE SPA</span>
                <h3>{bookingTreatment.name}</h3>
                <p className="treatment-modal-sub">{bookingTreatment.duration} | {bookingTreatment.price}</p>

                <div className="spa-input-group">
                  <label>Nombre del Huésped</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ej. Kevin Ramírez"
                    value={appointmentData.nombre}
                    onChange={(e) => setAppointmentData({ ...appointmentData, nombre: e.target.value })}
                  />
                </div>

                <div className="spa-input-group">
                  <label>Correo Electrónico</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="correo@ejemplo.com"
                    value={appointmentData.email}
                    onChange={(e) => setAppointmentData({ ...appointmentData, email: e.target.value })}
                  />
                </div>

                <div className="spa-inputs-row">
                  <div className="spa-input-group">
                    <label>Fecha Deseada</label>
                    <input 
                      type="date" 
                      required 
                      value={appointmentData.fecha}
                      onChange={(e) => setAppointmentData({ ...appointmentData, fecha: e.target.value })}
                    />
                  </div>
                  <div className="spa-input-group">
                    <label>Horario</label>
                    <select 
                      value={appointmentData.hora}
                      onChange={(e) => setAppointmentData({ ...appointmentData, hora: e.target.value })}
                    >
                      <option value="09:00">09:00 hrs</option>
                      <option value="11:00">11:00 hrs</option>
                      <option value="13:00">13:00 hrs</option>
                      <option value="16:00">16:00 hrs</option>
                      <option value="18:00">18:00 hrs</option>
                    </select>
                  </div>
                </div>

                <div className="spa-form-actions">
                  <button type="submit" className="btn-confirm-spa">
                    Confirmar Cita
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
