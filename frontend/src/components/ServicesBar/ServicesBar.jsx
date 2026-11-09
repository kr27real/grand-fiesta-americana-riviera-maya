import React, { useState } from 'react';
import { Calendar, KeyRound, CreditCard, Sparkles, Headphones, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import './ServicesBar.css';

const services = [
  {
    id: 1,
    icon: Calendar,
    title: 'Cancelación Flexible',
    description: 'Modifica o cancela sin complicaciones.'
  },
  {
    id: 2,
    icon: KeyRound,
    title: 'Check-in Digital',
    description: 'Acceso ágil desde tu dispositivo móvil.'
  },
  {
    id: 3,
    icon: CreditCard,
    title: 'Disfruta MSI',
    description: 'Facilidades de pago y meses sin intereses.',
    link: '#msi'
  },
  {
    id: 4,
    icon: Sparkles,
    title: 'Ofertas Exclusivas',
    description: 'Tarifas preferenciales reservando directo.'
  },
  {
    id: 5,
    icon: Headphones,
    title: 'Concierge Digital',
    description: 'Atención personalizada durante tu estancia.'
  },
  {
    id: 6,
    icon: ShieldCheck,
    title: 'Canales Verificados',
    description: 'Transacciones y reservas 100% seguras.',
    link: '#seguridad'
  }
];

export default function ServicesBar() {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % services.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  const visibleServices = [];
  for (let i = 0; i < itemsPerPage; i++) {
    visibleServices.push(services[(startIndex + i) % services.length]);
  }

  return (
    <section className="services-bar-section">
      <div className="services-container">
        <button className="service-nav-btn prev" onClick={handlePrev} aria-label="Anterior">
          <ChevronLeft size={20} />
        </button>

        <div className="services-grid">
          {visibleServices.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div key={`${srv.id}-${idx}`} className="service-card">
                <div className="service-icon-box">
                  <Icon size={26} className="service-icon" />
                </div>
                <div className="service-content">
                  <h4 className="service-title">{srv.title}</h4>
                  <p className="service-desc">{srv.description}</p>
                  {srv.link && (
                    <a href={srv.link} className="service-link">
                      Leer más &rsaquo;
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button className="service-nav-btn next" onClick={handleNext} aria-label="Siguiente">
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
