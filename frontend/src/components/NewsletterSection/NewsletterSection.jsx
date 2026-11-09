import React, { useState } from 'react';
import { Mail, CheckCircle2, Send } from 'lucide-react';
import './NewsletterSection.css';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <div className="newsletter-header">
          <div className="newsletter-icon-wrap">
            <Mail size={26} className="newsletter-mail-icon" />
          </div>
          <div className="newsletter-titles">
            <span className="newsletter-tagline">EXPERIENCIAS EXCLUSIVAS</span>
            <h3 className="newsletter-title">Obtén ofertas exclusivas</h3>
            <p className="newsletter-subtitle">
              Suscríbete y sé el primero en enterarte de promociones especiales, aperturas y tarifas preferenciales.
            </p>
          </div>
        </div>

        {subscribed ? (
          <div className="newsletter-success-box">
            <CheckCircle2 size={22} className="success-icon" />
            <span>¡Gracias por suscribirte! Pronto recibirás beneficios exclusivos en tu bandeja de entrada.</span>
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="input-group-nl">
              <input
                type="email"
                placeholder="Ingresar tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className="btn-newsletter-submit">
                <span>Suscribir</span>
                <Send size={15} />
              </button>
            </div>
            <p className="privacy-note">
              Al suscribirte aceptas nuestro aviso de privacidad y términos del programa.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
