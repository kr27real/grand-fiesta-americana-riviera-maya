import React from 'react';
import { Sparkles } from 'lucide-react';
import './IntroSection.css';

export default function IntroSection() {
  return (
    <section className="intro-section">
      <div className="intro-container">
        <header className="intro-header">
          <span className="intro-tagline">BIENVENIDOS AL CARIBE MEXICANO</span>
          <h2 className="intro-main-title">Grand Fiesta Americana Riviera Cancún</h2>
          <h3 className="intro-subtitle">Donde el Caribe cobra vida</h3>
          <div className="gold-divider" />
        </header>

        <div className="intro-body">
          <p>
            Donde el Caribe se encuentra con el diseño contemporáneo, Grand Fiesta Americana Riviera Cancún 
            ofrece una nueva forma de vivir una escapada frente al mar: una experiencia definida por la amplitud, 
            la calidez y el ritmo pausado de la costa mexicana.
          </p>
          <p>
            Amplias playas, arquitectura abierta y espacios cuidadosamente diseñados para convivir crean el 
            escenario perfecto para días que transcurren completamente a tu propio ritmo. Las horas bajo el sol 
            fluyen naturalmente de la orilla del mar a una propuesta gastronómica elevada, piscinas para disfrutar 
            y noches pensadas para compartir con quienes más importan.
          </p>
        </div>

        {/* Recuadro de anuncio oficial de gran apertura */}
        <div className="opening-callout">
          <div className="callout-icon-box">
            <Sparkles size={28} className="callout-icon" />
          </div>
          <div className="callout-content">
            <h4>¡La gran apertura se acerca!</h4>
            <p>
              A partir del <strong>1 de noviembre 2026</strong>. ¡Prepárate para descubrir una experiencia única de lujo y hospitalidad!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
