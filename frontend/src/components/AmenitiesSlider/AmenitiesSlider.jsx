import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Plane, Wifi, Waves } from 'lucide-react';
import './AmenitiesSlider.css';

const amenities = [
  {
    id: 1,
    title: 'Traslado gratuito al aeropuerto',
    description: 'Reserva a través de nuestra plataforma web y obtén transportación incluida y segura para tu llegada y salida.',
    image: 'https://image-tc.galaxy.tf/wijpeg-beble8cdq3iko33yh2hyu6msp/free-transfer_standard.jpg?crop=40%2C0%2C1800%2C1350&width=1000',
    icon: Plane,
    link: '#transporte'
  },
  {
    id: 2,
    title: 'WiFi de Alta Velocidad',
    description: 'Mantente conectado en cualquier área del resort gracias a una red inalámbrica veloz, estable y sin costo adicional.',
    image: 'https://image-tc.galaxy.tf/wijpeg-7n7rhefshu7m0zbbf9dfteuiq/render-js-tipo-3-3_standard.jpg?crop=160%2C0%2C960%2C720&width=1000',
    icon: Wifi,
    link: '#wifi'
  },
  {
    id: 3,
    title: 'Piscinas Relajantes',
    description: 'Finaliza tu día descansando en nuestras albercas infinity con vista al mar y coctelería premium de primer nivel.',
    image: 'https://image-tc.galaxy.tf/wijpeg-4igidvyvqodm5sxe421766hni/1-980x650_standard.jpg?crop=57%2C0%2C867%2C650&width=1000',
    icon: Waves,
    link: '#piscinas'
  }
];

export default function AmenitiesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % amenities.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + amenities.length) % amenities.length);
  };

  return (
    <section className="amenities-section">
      <div className="amenities-container">
        {/* Cabecera */}
        <div className="amenities-header">
          <div>
            <span className="amenities-tagline">CONFORT Y EXCLUSIVIDAD</span>
            <h3 className="amenities-main-title">Servicios y Amenidades</h3>
          </div>
          <div className="amenities-header-actions">
            <a href="#todas-amenidades" className="see-all-amenities">
              Ver Más <ArrowRight size={14} />
            </a>
            <div className="amenities-nav-buttons">
              <button onClick={handlePrev} className="amenity-arrow" aria-label="Anterior">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNext} className="amenity-arrow" aria-label="Siguiente">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="amenities-grid">
          {amenities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                className={`amenity-card ${idx === currentIndex ? 'highlighted' : ''}`}
              >
                <div className="amenity-image-wrap">
                  <img src={item.image} alt={item.title} className="amenity-img" />
                  <div className="amenity-icon-badge">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="amenity-content">
                  <h4 className="amenity-title">{item.title}</h4>
                  <p className="amenity-desc">{item.description}</p>
                  <a href={item.link} className="amenity-link">
                    Conoce más &rsaquo;
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
