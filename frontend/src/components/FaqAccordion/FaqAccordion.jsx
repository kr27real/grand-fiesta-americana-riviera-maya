import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import './FaqAccordion.css';

const faqs = [
  {
    id: 1,
    question: "¿Dónde se encuentra Grand Fiesta Americana Riviera Cancún?",
    answer: "El resort se encuentra frente a las costas de Riviera Cancún, entre la Zona Hotelera de Cancún y el corredor de la Riviera Maya, aproximadamente a 25 minutos del Aeropuerto Internacional de Cancún."
  },
  {
    id: 2,
    question: "¿El resort es ideal para familias?",
    answer: "Sí. Grand Fiesta Americana Riviera Cancún fue diseñado pensando en familias y viajeros multigeneracionales, con espacios dedicados de Kids & Teens Club, áreas de piscina familiares y propuestas gastronómicas para todas las edades."
  },
  {
    id: 3,
    question: "¿Qué opciones gastronómicas ofrece el resort?",
    answer: "El complejo cuenta con seis restaurantes de servicio completo que abarcan gastronomía mexicana, italiana, japonesa, cocina costera y cortes finos, además de bares de mixología, sushi bar en terraza y el Grand Club Lounge."
  },
  {
    id: 4,
    question: "¿El resort cuenta con spa?",
    answer: "Sí. El spa del resort ofrece una completa selección de tratamientos holísticos, hidroterapia, rituales corporales y experiencias de bienestar inspiradas en las tradiciones ancestrales y el entorno natural de México."
  },
  {
    id: 5,
    question: "¿Cuenta con espacios para eventos y bodas?",
    answer: "Dispone de un centro de convenciones con capacidad para hasta 2,100 huéspedes, complementado por salones multifuncionales y amplias terrazas al aire libre frente al mar diseñadas para bodas y celebraciones privadas."
  },
  {
    id: 6,
    question: "¿Qué es Grand Club?",
    answer: "Grand Club es la experiencia de acceso premium del resort. Incluye un lounge privado, selección gastronómica y bebidas de cortesía durante todo el día, área VIP en playa y piscina, y servicio de concierge personalizado."
  },
  {
    id: 7,
    question: "¿Cómo puedo acumular y utilizar puntos Fiesta Rewards?",
    answer: "Fiesta Rewards es el programa de lealtad oficial de Grupo Posadas. Los socios acumulan puntos en cada estancia para canjearlos por noches gratis, upgrades de habitación y experiencias exclusivas dentro del hotel."
  }
];

export default function FaqAccordion() {
  const [openId, setOpenId] = useState(1);

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container">
        <div className="faq-header">
          <span className="faq-tagline">RESOLVEMOS TUS DUDAS</span>
          <h3 className="faq-main-title">Preguntas Frecuentes</h3>
          <div className="gold-divider-small" />
        </div>

        <div className="faq-accordion-list">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id} 
                className={`faq-item ${isOpen ? 'active-faq' : ''}`}
              >
                <button 
                  className="faq-question-btn" 
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span className="question-text">
                    <HelpCircle size={17} className="faq-icon" />
                    {faq.question}
                  </span>
                  <ChevronDown size={19} className="faq-chevron" />
                </button>

                {isOpen && (
                  <div className="faq-answer-panel">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
