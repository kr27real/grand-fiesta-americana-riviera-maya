import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bed, Users, Maximize2, ArrowRight } from 'lucide-react';
import './RoomsSlider.css';

const rooms = [
  {
    id: 1,
    title: 'Deluxe Tropical Reserve View 1 King',
    tagline: 'VISTA A LA RESERVA NATURAL',
    price: '$8,180 MXN',
    priceUsd: '$454 USD',
    capacity: '2 Adultos | 1 Cama King',
    size: '54 m²',
    description: 'Disponibles con cama King, estas suites con vista a la laguna combinan texturas naturales, acabados refinados y balcones privados en un refugio confortable frente a la serenidad caribeña.',
    image: 'https://image-tc.galaxy.tf/wipng-ewud5ufube3uynaref2e2bpvy/render-hab-king-5_standard.png?crop=121%2C0%2C725%2C544&width=1200'
  },
  {
    id: 2,
    title: 'Deluxe Tropical Reserve View 2 Double',
    tagline: 'ESPACIO FAMILIAR DE LUJO',
    price: '$8,650 MXN',
    priceUsd: '$480 USD',
    capacity: '4 Personas | 2 Camas Dobles',
    size: '58 m²',
    description: 'Disponibles con dos camas matrimoniales de alta gama, diseñadas para familias o estancias grupales que buscan amplitud, confort superior y terrazas privadas con vista tropical.',
    image: 'https://image-tc.galaxy.tf/wijpeg-6s4u7kfatqrr7gqcx21hiugsr/hab-doble2_standard.jpg?crop=160%2C0%2C960%2C720&width=1200'
  },
  {
    id: 3,
    title: 'Deluxe Ocean Front 1 King',
    tagline: 'FRENTE AL MAR CARIBE',
    price: '$9,550 MXN',
    priceUsd: '$530 USD',
    capacity: '2 Adultos | 1 Cama King',
    size: '62 m²',
    description: 'Nuestra suite insignia frente al mar caribeño. Despierta con el sonido de las olas y disfruta de un balcón panorámico con vistas infinitas al océano turquesa.',
    image: 'https://image-tc.galaxy.tf/wijpeg-ds2hxf7l75z15br6m9wy4w9xe/render-js-tipo-3-2_standard.jpg?crop=160%2C0%2C960%2C720&width=1200'
  }
];

export default function RoomsSlider() {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % rooms.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + rooms.length) % rooms.length);
  };

  const currentRoom = rooms[activeIdx];

  return (
    <section className="rooms-section" id="habitaciones">
      <div className="rooms-container">
        {/* Cabecera de la sección */}
        <div className="rooms-header">
          <div>
            <span className="rooms-tagline">HOSPEDAJE EXCLUSIVO</span>
            <h3 className="rooms-main-title">Habitaciones & Suites</h3>
          </div>
          <div className="rooms-header-actions">
            <a href="#catalogo-completo" className="see-all-rooms">
              Ver todas las habitaciones <ArrowRight size={14} />
            </a>
            <div className="rooms-nav-arrows">
              <button onClick={handlePrev} className="room-nav-btn" aria-label="Habitación anterior">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNext} className="room-nav-btn" aria-label="Habitación siguiente">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tarjeta Detallada de Habitación Destacada */}
        <div className="room-showcase-card">
          <div className="room-media-pane">
            <img src={currentRoom.image} alt={currentRoom.title} className="room-media-img" />
            <div className="room-price-badge">
              <span>Desde</span>
              <strong>{currentRoom.price}</strong>
              <small>/ noche ({currentRoom.priceUsd})</small>
            </div>
          </div>

          <div className="room-info-pane">
            <span className="room-category-label">{currentRoom.tagline}</span>
            <h4 className="room-name">{currentRoom.title}</h4>

            <div className="room-specs-list">
              <div className="spec-pill">
                <Users size={15} /> <span>{currentRoom.capacity}</span>
              </div>
              <div className="spec-pill">
                <Maximize2 size={15} /> <span>{currentRoom.size}</span>
              </div>
              <div className="spec-pill">
                <Bed size={15} /> <span>Balcón Privado</span>
              </div>
            </div>

            <p className="room-summary">{currentRoom.description}</p>

            <div className="room-actions-row">
              <a href="#reservar-directo" className="btn-room-reserve">
                Reservar Habitación
              </a>
              <a href="#detalles-suite" className="btn-room-details">
                Ver Detalles
              </a>
            </div>

            {/* Paginador inferior de suites */}
            <div className="room-tabs-nav">
              {rooms.map((rm, idx) => (
                <button
                  key={rm.id}
                  className={`room-tab-item ${idx === activeIdx ? 'selected' : ''}`}
                  onClick={() => setActiveIdx(idx)}
                >
                  Suite {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
