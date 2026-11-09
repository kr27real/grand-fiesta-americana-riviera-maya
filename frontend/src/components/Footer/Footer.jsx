import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageSquare, Award, ShieldCheck, Globe, ExternalLink } from 'lucide-react';
import './Footer.css';

// SVG nativo y seguro para Instagram
function InstagramIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// SVG nativo y seguro para Facebook
function FacebookIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

// SVG nativo para X (Twitter)
function TwitterIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// SVG nativo para TikTok
function TikTokIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49c1.94-1.94 2.07-5.06 2.07-5.06V7.87a8.28 8.28 0 0 0 3.7 1.13V5.55c0 .38 0 .75 0 1.14z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="gfa-footer-root">
      <div className="gfa-footer-inner">
        
        {/* RETÍCULA PRINCIPAL DE 5 COLUMNAS EXPANDIDA */}
        <div className="gfa-footer-columns">
          
          {/* Columna 1: Marca & Filosofía */}
          <div className="gfa-col-brand">
            <h3>Grand Fiesta Americana</h3>
            <span className="gfa-brand-tagline">Riviera Cancún Resort & Spa</span>
            <p>
              Un santuario de ultra lujo frente al Caribe Mexicano operado por Grupo Posadas. Arquitectura contemporánea de vanguardia, confort absoluto, alta gastronomía de autor y la distinción del programa de lealtad Fiesta Rewards.
            </p>
            <div className="gfa-social-bar">
              <a href="https://instagram.com/grandfiestaamericanamex" target="_blank" rel="noreferrer" className="gfa-social-btn" aria-label="Instagram">
                <InstagramIcon size={16} />
              </a>
              <a href="https://facebook.com/grandfiestamericana" target="_blank" rel="noreferrer" className="gfa-social-btn" aria-label="Facebook">
                <FacebookIcon size={16} />
              </a>
              <a href="https://twitter.com/FA_Grand_Hotel" target="_blank" rel="noreferrer" className="gfa-social-btn" aria-label="Twitter">
                <TwitterIcon size={14} color="#d4af37" />
              </a>
              <a href="https://tiktok.com/@grandfiestaamericana" target="_blank" rel="noreferrer" className="gfa-social-btn" aria-label="TikTok">
                <TikTokIcon size={14} color="#d4af37" />
              </a>
            </div>
          </div>

          {/* Columna 2: Experiencias & Resort */}
          <div>
            <h4 className="gfa-col-heading">El Resort</h4>
            <ul className="gfa-nav-links-box">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/habitaciones">Suites & Residencias</Link></li>
              <li><Link to="/restaurantes">Restaurantes & Cava</Link></li>
              <li><Link to="/galeria">Galería Fotográfica</Link></li>
              <li><Link to="/ofertas">Ofertas & Temporadas</Link></li>
              <li><Link to="/disponibilidad">Motor de Reservas IBE</Link></li>
            </ul>
          </div>

          {/* Columna 3: Asistencia & Políticas */}
          <div>
            <h4 className="gfa-col-heading">Atención & Legal</h4>
            <ul className="gfa-nav-links-box">
              <li><Link to="/contacto">Contacto & Ubicación</Link></li>
              <li><Link to="/contacto">Aclaraciones & Facturación</Link></li>
              <li><a href="https://cms.posadas.com/documents/3110971/3167446/Aviso_de_Privacidad_Clientes_Web_VE0712.pdf" target="_blank" rel="noreferrer">Aviso de Privacidad</a></li>
              <li><Link to="/contacto">Términos & Condiciones</Link></li>
              <li><Link to="/contacto">Aviso de Seguridad</Link></li>
              <li><Link to="/contacto">Preguntas Frecuentes (FAQ)</Link></li>
            </ul>
          </div>

          {/* Columna 4: Lealtad & Corporativo */}
          <div>
            <h4 className="gfa-col-heading">Grupo Posadas</h4>
            <ul className="gfa-nav-links-box">
              <li><Link to="/perfil-socio">Socio Fiesta Rewards</Link></li>
              <li><a href="https://www.fiestamericanatravelty.com" target="_blank" rel="noreferrer">Fiesta Americana Travelty</a></li>
              <li><a href="https://fiestaamericanatraveltymeetings.com/es/" target="_blank" rel="noreferrer">Meetings México & Convenciones</a></li>
              <li><a href="https://autos.fiestamericanatravelty.com/es/" target="_blank" rel="noreferrer">Renta tu Auto con Hertz</a></li>
              <li><a href="http://www.posadas.com/es/responsabilidad-social" target="_blank" rel="noreferrer">Responsabilidad Social (ESR)</a></li>
              <li><Link to="/contacto">Agentes de Viajes & IATA</Link></li>
            </ul>
          </div>

          {/* Columna 5: Recepción & Concierge 24/7 */}
          <div>
            <h4 className="gfa-col-heading">Recepción & Citas</h4>
            <ul className="gfa-contact-list">
              <li className="gfa-contact-entry">
                <Phone size={16} color="#d4af37" />
                <span>+52 (443) 310 81 37 (Call Center)</span>
              </li>
              <li className="gfa-contact-entry">
                <Mail size={16} color="#c4b5fd" />
                <span>concierge@grandfiestaamericana.com</span>
              </li>
              <li className="gfa-contact-entry">
                <MapPin size={16} color="#d4af37" />
                <span>Carretera Cancún-Tulum Km 335, Puerto Morelos, CP 77580, Quintana Roo, México</span>
              </li>
            </ul>

            <div className="gfa-concierge-panel">
              <p>
                ¿Deseas personalizar tu suite, coordinar transporte privado o solicitar asesoría personalizada?
              </p>
              <Link to="/contacto" className="gfa-btn-concierge">
                <MessageSquare size={14} />
                <span>Asistencia en Vivo</span>
              </Link>
            </div>
          </div>

        </div>

        {/* PORTAFOLIO DE MARCAS DE GRUPO POSADAS */}
        <div className="gfa-corporate-brands-row">
          <span className="gfa-corp-label">Marcas que integran la Colección de Hospitalidad Posadas</span>
          <div className="gfa-brands-pills-wrap">
            <span className="gfa-brand-item" style={{ borderColor: '#d4af37', color: '#f3e5ab' }}>Grand Fiesta Americana</span>
            <span className="gfa-brand-item">Live Aqua Resorts & Residence</span>
            <span className="gfa-brand-item">Curamoria Collection</span>
            <span className="gfa-brand-item">Fiesta Americana</span>
            <span className="gfa-brand-item">The Explorean</span>
            <span className="gfa-brand-item">Funeeq</span>
            <span className="gfa-brand-item">Sunvivia</span>
            <span className="gfa-brand-item">Fiesta Inn</span>
            <span className="gfa-brand-item">Gamma Hoteles</span>
            <span className="gfa-brand-item">One Hoteles</span>
          </div>
        </div>

        {/* CERTIFICACIONES & RECONOCIMIENTOS OFICIALES */}
        <div className="gfa-awards-row">
          <div className="gfa-award-chip">
            <Award size={18} color="#d4af37" />
            <span>Forbes Travel Guide Official Award</span>
          </div>
          <div className="gfa-award-chip">
            <ShieldCheck size={18} color="#c4b5fd" />
            <span>AAA Four Diamond Award Standards</span>
          </div>
          <div className="gfa-award-chip">
            <Globe size={18} color="#d4af37" />
            <span>Green Key International Eco-Rating</span>
          </div>
          <div className="gfa-award-chip">
            <Award size={18} color="#c4b5fd" />
            <span>Empresa Socialmente Responsable (ESR)</span>
          </div>
          <div className="gfa-award-chip">
            <Award size={18} color="#d4af37" />
            <span>TripAdvisor Traveller's Choice 2026</span>
          </div>
        </div>

        {/* BARRA INFERIOR DE DERECHOS */}
        <div className="gfa-footer-bottom-bar">
          <span>© {new Date().getFullYear()} Posadas de México S.A. de C.V. Todos los derechos reservados.</span>
          <span>Tecnológico de Estudios Superiores • Taller de Investigación I</span>
        </div>

      </div>
    </footer>
  );
}