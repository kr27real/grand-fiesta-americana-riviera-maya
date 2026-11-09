import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, UtensilsCrossed, Clock } from 'lucide-react';
import './DiningSlider.css';

const restaurants = [
  {
    id: 1,
    name: 'Rosato',
    specialty: 'COCINA ITALIANA CONTEMPORÁNEA',
    schedule: 'Cena: 18:00 - 23:00 hrs',
    description: 'Vibrante, cálida y auténticamente italiana. Un espacio íntimo donde la buena mesa, recetas artesanales y la mejor selección de vinos siempre se encuentran.',
    image: 'https://image-tc.galaxy.tf/wijpeg-1u6qtwbl793pz2r84bef32xsb/image-112_standard.jpg?crop=160%2C0%2C960%2C720&width=1200',
    link: '#rosato'
  },
  {
    id: 2,
    name: 'Península',
    specialty: 'COCINA COSTERA Y MARISCOS FRESCOS',
    schedule: 'Almuerzo y Cena: 12:30 - 22:30 hrs',
    description: 'Donde las mañanas comienzan con el sonido del mar y las noches invitan a quedarse frente a la costa disfrutando lo mejor de la pesca del día y coctelería caribeña.',
    image: 'https://image-tc.galaxy.tf/wijpeg-aiwi12y61alhuzqbpmywy5gs9/camera-04-0000-png_standard.jpg?crop=0%2C18%2C1584%2C1188&width=1200',
    link: '#peninsula'
  },
  {
    id: 3,
    name: 'Viña del Mar',
    specialty: 'EXPERIENCIA GASTRONÓMICA INTERNACIONAL',
    schedule: 'Desayuno, Almuerzo y Cena: 07:00 - 22:00 hrs',
    description: 'El corazón culinario del resort: un espacio para reunirse a cualquier hora, donde cada comida se convierte en un momento para disfrutar sin prisa.',
    image: 'https://image-tc.galaxy.tf/wijpeg-1dw3841ug4yola1lq9uzgmvd/camera-07-0000-png_standard.jpg?crop=0%2C18%2C1584%2C1188&width=1200',
    link: '#vina-del-mar'
  }
];

export default function DiningSlider() {
  const [startIndex, setStartIndex] = useState(0);

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % restaurants.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + restaurants.length) % restaurants.length);
  };

  return (
    <section className="dining-section" id="restaurantes">
      <div className="dining-container">
        {/* Encabezado */}
        <div className="dining-header">
          <div>
            <span className="dining-tagline">EXPERIENCIAS CULINARIAS</span>
            <h3 className="dining-main-title">Restaurantes & Bares</h3>
          </div>
          <div className="dining-header-actions">
            <a href="#todos-restaurantes" className="see-all-dining">
              Ver todos los restaurantes <ArrowRight size={14} />
            </a>
            <div className="dining-nav-arrows">
              <button onClick={handlePrev} className="dining-arrow" aria-label="Restaurante anterior">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNext} className="dining-arrow" aria-label="Restaurante siguiente">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Grilla de Restaurantes */}
        <div className="dining-grid">
          {restaurants.map((place, idx) => (
            <article 
              key={place.id} 
              className={`dining-card ${idx === startIndex ? 'active-dining' : ''}`}
            >
              <div className="dining-image-wrap">
                <img src={place.image} alt={place.name} className="dining-img" />
                <span className="dining-specialty-badge">{place.specialty}</span>
              </div>
              <div className="dining-content">
                <h4 className="dining-name">{place.name}</h4>
                <div className="dining-schedule">
                  <Clock size={13} /> <span>{place.schedule}</span>
                </div>
                <p className="dining-desc">{place.description}</p>
                <div className="dining-actions">
                  <a href={place.link} className="btn-dining-view">
                    <UtensilsCrossed size={14} /> Ver Menú y Horarios
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
