import React from 'react';
import { Award, Gift, Car, ArrowRight } from 'lucide-react';
import './CalloutBanners.css';

const callouts = [
  {
    id: 1,
    badge: 'RECONOCIMIENTO INTERNACIONAL',
    title: 'Forbes Travel Guide Award',
    description: 'Los distinguidos galardones de Forbes Travel Guide se otorgan a establecimientos con los más altos niveles de servicio e instalaciones del mundo. Estamos orgullosos de contar con calificaciones sobresalientes en hospitalidad de lujo.',
    logo: 'https://image-tc.galaxy.tf/wijpeg-8ov3jgi4ya6scml3xwzbi3cvv/forbes-980x650.jpg?width=270',
    icon: Award,
    primaryBtn: { text: 'Ver Reconocimientos', link: '#reconocimientos' },
    reversed: false
  },
  {
    id: 2,
    badge: 'PROGRAMA DE LEALTAD',
    title: 'Obtén Promociones Exclusivas con Fiesta Rewards',
    description: 'Sé parte de Fiesta Rewards y vive experiencias selectas en cada estancia. Disfruta acumulación de puntos canjeables por noches gratis, ascensos de habitación y beneficios exclusivos en el portafolio de Grupo Posadas.',
    logo: 'https://image-tc.galaxy.tf/wisvg-99ul50jzxbhlpgwx4rpyxv22a/fr-pleca.svg?width=1000',
    icon: Gift,
    primaryBtn: { text: 'Registrarse Gratis', link: '#registro-fr' },
    secondaryBtn: { text: 'Conocer Beneficios', link: '#beneficios-fr' },
    reversed: true
  },
  {
    id: 3,
    badge: 'MOVILIDAD SIN LÍMITES',
    title: 'Renta tu Auto con Hertz y Obtén hasta 65% OFF',
    description: 'Recorre Cancún y la Riviera Maya con total comodidad. Reserva con nosotros y recibe descuentos y condiciones especiales en una amplia gama de vehículos con Hertz Avasa.',
    logo: 'https://image-tc.galaxy.tf/wipng-bq7zfxs4cklop1ntwfuqcpsq/image.png?width=270',
    icon: Car,
    primaryBtn: { text: 'Rentar Auto', link: 'https://autos.fiestamericanatravelty.com/' },
    reversed: false
  }
];

export default function CalloutBanners() {
  return (
    <section className="callouts-section">
      <div className="callouts-container">
        {callouts.map((item) => {
          const Icon = item.icon;
          return (
            <article 
              key={item.id} 
              className={`callout-card ${item.reversed ? 'callout-reversed' : ''}`}
            >
              <div className="callout-logo-pane">
                <img src={item.logo} alt={item.title} className="callout-logo-img" />
              </div>

              <div className="callout-info-pane">
                <span className="callout-badge">
                  <Icon size={14} className="badge-icon" /> {item.badge}
                </span>
                <h3 className="callout-title">{item.title}</h3>
                <p className="callout-desc">{item.description}</p>

                <div className="callout-buttons">
                  <a href={item.primaryBtn.link} className="btn-callout-primary">
                    {item.primaryBtn.text} <ArrowRight size={14} />
                  </a>
                  {item.secondaryBtn && (
                    <a href={item.secondaryBtn.link} className="btn-callout-secondary">
                      {item.secondaryBtn.text}
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
