import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import './ScrollToTopButton.css';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Aparece al descender más de 350 píxeles
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      type="button"
      className={`gfa-scroll-top-btn ${visible ? 'visible' : ''}`}
      onClick={scrollToTop}
      title="Volver al inicio de la página"
      aria-label="Volver arriba"
    >
      <ChevronUp size={22} strokeWidth={2.5} />
    </button>
  );
}