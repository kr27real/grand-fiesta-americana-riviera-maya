import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import './OffersSlider.css';

const offers = [
  {
    id: 1,
    title: 'Oferta de Apertura | Grand Fiesta Americana',
    description: 'Sé de los primeros en vivir la nueva experiencia frente al mar con una tarifa especial por tiempo limitado.',
    image: 'https://image-tc.galaxy.tf/wijpeg-4igidvyvqodm5sxe421766hni/1-980x650_standard.jpg?crop=57%2C0%2C867%2C650&width=1000',
    link: '#reservar'
  },
  {
    id: 2,
    title: 'Hasta 30% OFF + Transporte Incluido',
    description: 'Vuelve realidad tu viaje soñado. Regálate unos días en las costas más exclusivas del Caribe Mexicano con traslado sin costo.',
    image: 'https://image-tc.galaxy.tf/wijpeg-1yh6now1u4zd96vlwee14353/980x650_standard.jpg?crop=57%2C0%2C867%2C650&width=1000',
    link: '#reservar'
  },
  {
    id: 3,
    title: 'Paquetes Hotel + Avión',
    description: 'Reserva tu siguiente aventura con hasta 50% de descuento reservando vuelo y estancia en un mismo paquete.',
    image: 'https://image-tc.galaxy.tf/wijpeg-7wiz39kp6pp2a2co4vf9m1vss/bn-h-a-980x650-px_standard.jpg?crop=57%2C0%2C867%2C650&width=1000',
    link: '#paquetes'
  },
  {
    id: 4,
    title: 'Renta de Auto con Hertz hasta 65% OFF',
    description: 'Obtén tarifas y beneficios preferenciales al rentar tu vehículo para recorrer la Riviera con total libertad.',
    image: 'https://image-tc.galaxy.tf/wijpeg-b2351bdw0a1a4bx0uxvue35nb/1-bns-fat-mood-hertz-980-x-650-px_standard.jpg?crop=57%2C0%2C867%2C650&width=1000',
    link: '#hertz'
  }
];

export default function OffersSlider() {
  const [startIndex, setStartIndex] = useState(0);

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % offers.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  // Mostrar 2 ofertas por vista en desktop
  const visibleOffers = [
    offers[startIndex],
    offers[(startIndex + 1) % offers.length]
  ];

  return (
    <section className="offers-section">
      <div className="offers-container">
        {/* Cabecera de la sección */}
        <div className="offers-header">
          <div>
            <span className="offers-tagline">PROMOCIONES EXCLUSIVAS</span>
            <h3 className="offers-main-title">Ofertas Especiales</h3>
          </div>
          <div className="offers-header-actions">
            <a href="#todas-las-ofertas" className="see-all-link">
              Ver todas las ofertas <ArrowRight size={14} />
            </a>
            <div className="offers-nav-buttons">
              <button onClick={handlePrev} className="offer-arrow" aria-label="Anterior">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNext} className="offer-arrow" aria-label="Siguiente">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Cuadrícula de tarjetas */}
        <div className="offers-grid">
          {visibleOffers.map((offer) => (
            <article key={offer.id} className="offer-card">
              <div className="offer-image-wrap">
                <img src={offer.image} alt={offer.title} className="offer-img" />
              </div>
              <div className="offer-content">
                <h4 className="offer-title">{offer.title}</h4>
                <p className="offer-desc">{offer.description}</p>
                <div className="offer-buttons">
                  <a href={offer.link} className="btn-offer-primary">
                    Reservar
                  </a>
                  <a href={offer.link} className="btn-offer-secondary">
                    Ver Más
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
