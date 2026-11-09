import React, { useState } from 'react';
import { MapPin, Compass, Waves, Sun, Navigation, ArrowRight, X } from 'lucide-react';
import './Destino.css';

const attractions = [
  {
    id: 'acuario',
    title: 'Acuario Interactivo de Cancún',
    subtitle: '¡Llegó el momento de conocer más de 140 especies marinas!',
    desc: 'Elige entre múltiples actividades que te ofrece el Acuario de Cancún y vive momentos fascinantes al lado de tu familia y amigos en Plaza La Isla.',
    distance: 'A 20 min del Resort',
    image: 'https://image-tc.galaxy.tf/wijpeg-8gvz88uj76ujkjdk7ifdwbq5m/acuario-interactivo-de-cancun_standard.jpg?crop=300%2C0%2C1200%2C900'
  },
  {
    id: 'isla-mujeres',
    title: 'Isla Mujeres',
    subtitle: 'Disfruta la espectacular belleza y enamórate del Caribe Mexicano.',
    desc: 'Esta isla virgen es mundialmente conocida por sus playas paradisíacas de aguas cristalinas. Podrás practicar esnórquel y buceo en arrecifes de coral vivos, visitar el faro de Punta Sur y un fascinante santuario de tortugas marinas.',
    distance: 'Ferry a 25 min',
    image: 'https://image-tc.galaxy.tf/wijpeg-4rednej3itcfd7mt9a9ox2o8m/09-isla-mujeres_standard.jpg?crop=38%2C0%2C1725%2C1294'
  },
  {
    id: 'xel-ha',
    title: 'Xel-Há',
    subtitle: 'Descubre una de las grandes maravillas naturales de la Riviera Maya.',
    desc: 'Este increíble parque ecológico ofrece al visitante esnórquel ilimitado, tirolesas acuáticas, cenotes, lagunas y ríos subterráneos en medio de la selva tropical.',
    distance: 'A 45 min hacia el sur',
    image: 'https://image-tc.galaxy.tf/wijpeg-55s543x0gn0k5mq2mijquutqn/xel-ha_standard.jpg?crop=300%2C0%2C1200%2C900'
  },
  {
    id: 'tulum',
    title: 'Zona Arqueológica de Tulum',
    subtitle: 'Conoce la emblemática ciudad amurallada maya frente al mar.',
    desc: 'Tulum se ubica sobre un acantilado frente a las aguas turquesa del Caribe y es uno de los vestigios culturales mayas más fotografiados y visitados de México.',
    distance: 'A 1 hora sobre la carretera',
    image: 'https://image-tc.galaxy.tf/wijpeg-8uqsop70z9u14g54xq6xrqb1e/tulum_standard.jpg?crop=0%2C0%2C1603%2C1202'
  }
];

const gallery = [
  { id: 1, title: 'Playas de Cancún', url: 'https://image-tc.galaxy.tf/wijpeg-nwgc95w5lyjukds31ydn66g1/cancu-n_standard.jpg?crop=240%2C0%2C1440%2C1080&width=800' },
  { id: 2, title: 'Arrecife de Coral', url: 'https://image-tc.galaxy.tf/wijpeg-bhn5p6tgln915k8jasdnoxyba/cancu-n-result_standard.jpg?crop=240%2C0%2C1440%2C1080&width=800' },
  { id: 3, title: 'Laguna de Bacalar', url: 'https://image-tc.galaxy.tf/wijpeg-5y7d94ujwlduk7fbhmj0nbk98/68-bacalar-lagoon-and-fort-result_standard.jpg?crop=107%2C0%2C1707%2C1280&width=800' },
  { id: 4, title: 'Xcaret Eco-Parque', url: 'https://image-tc.galaxy.tf/wijpeg-8tpl6zblnnuf6zdn9rtzqogwd/xcaret_standard.jpg?crop=300%2C0%2C1200%2C900&width=800' }
];

export default function Destino() {
  const [selectedAttraction, setSelectedAttraction] = useState(null);

  return (
    <div className="destino-page-wrapper">
      {/* 1. Encabezado Editorial */}
      <section className="destino-hero-section">
        <div className="destino-container">
          <span className="destino-tagline">CARIBE MEXICANO</span>
          <h1 className="destino-main-title">Destino Cancún & Riviera Maya</h1>
          <h2 className="destino-subtitle">
            Un escenario natural privilegiado donde el mar turquesa se encuentra con la riqueza cultural maya.
          </h2>
          <div className="gold-divider-center" />
          <div className="destino-editorial-text">
            <p>
              Reconocido internacionalmente por sus playas de arena blanca y el segundo arrecife de coral más grande del mundo, 
              Cancún y Puerto Morelos ofrecen un entorno idóneo tanto para el descanso absoluto como para la exploración de cenotes sagrados, 
              caletas y senderos de selva viva.
            </p>
            <p>
              Durante tu estancia en <strong>Grand Fiesta Americana Riviera Cancún</strong>, nuestro equipo de concierge 
              estará a tu disposición para organizar excursiones privadas hacia Isla Mujeres, Cozumel, Contoy o las zonas arqueológicas de Tulum y Cobá.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Sección del Mapa y Dirección Física Oficial */}
      <section className="destino-map-section">
        <div className="destino-container">
          <div className="location-info-card">
            <div className="location-badge">
              <MapPin size={22} className="map-icon-gold" />
              <div>
                <h3>Ubicación del Resort</h3>
                <p>Carretera Cancún-Tulum Km 335, Puerto Morelos, CP 77580, Cancún, Quintana Roo, México.</p>
              </div>
            </div>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=20.96812,-86.86330" 
              target="_blank" 
              rel="noreferrer"
              className="btn-open-googlemaps"
            >
              <Navigation size={14} /> Abrir en Google Maps
            </a>
          </div>

          <div className="map-frame-wrapper">
            <iframe
              title="Ubicación Grand Fiesta Americana Riviera Cancún"
              src="https://maps.google.com/maps?q=20.96812,-86.86330&hl=es&z=13&output=embed"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 3. Catálogo de Atracciones Locales */}
      <section className="destino-attractions-section">
        <div className="destino-container">
          <div className="section-head-left">
            <span className="destino-tagline">PUNTOS DE INTERÉS</span>
            <h3 className="section-title">Atracciones Cercanas</h3>
          </div>

          <div className="attractions-grid">
            {attractions.map((item) => (
              <article key={item.id} className="attraction-card">
                <div className="attraction-image-wrap">
                  <img src={item.image} alt={item.title} className="attraction-img" />
                  <span className="distance-badge">{item.distance}</span>
                </div>
                <div className="attraction-content">
                  <h4 className="attraction-name">{item.title}</h4>
                  <p className="attraction-sub">{item.subtitle}</p>
                  <p className="attraction-body">{item.desc}</p>
                  <button 
                    className="btn-attraction-more" 
                    onClick={() => setSelectedAttraction(item)}
                  >
                    Ver Detalles <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Galería Fotográfica del Destino */}
      <section className="destino-gallery-section">
        <div className="destino-container">
          <div className="section-head-left">
            <span className="destino-tagline">POSTALES DEL CARIBE</span>
            <h3 className="section-title">Galería del Destino</h3>
          </div>

          <div className="destino-gallery-grid">
            {gallery.map((img) => (
              <div key={img.id} className="destino-gallery-item">
                <img src={img.url} alt={img.title} className="destino-gallery-img" />
                <span className="destino-gallery-caption">{img.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de Detalle de Atracción */}
      {selectedAttraction && (
        <div className="modal-backdrop" onClick={() => setSelectedAttraction(null)}>
          <div className="modal-attraction-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-attraction-btn" onClick={() => setSelectedAttraction(null)}>
              <X size={20} />
            </button>
            <img src={selectedAttraction.image} alt={selectedAttraction.title} className="modal-attraction-img" />
            <div className="modal-attraction-content">
              <span className="modal-dist-badge">{selectedAttraction.distance}</span>
              <h3>{selectedAttraction.title}</h3>
              <p className="modal-attraction-sub">{selectedAttraction.subtitle}</p>
              <p className="modal-attraction-desc">{selectedAttraction.desc}</p>
              <div className="modal-action-row">
                <a href="/disponibilidad" className="btn-plan-trip">
                  Reservar Estancia
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
