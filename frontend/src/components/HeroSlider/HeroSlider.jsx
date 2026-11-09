import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import './HeroSlider.css';

const slides = [
  {
    id: 1,
    image: 'https://image-tc.galaxy.tf/wijpeg-asw61us5xgymd93dt3nu9y1nz/_photo.jpg',
    title: 'Grand Fiesta Americana',
    subtitle: 'Riviera Cancún / Riviera Maya by Hilton — Donde el Caribe cobra vida'
  },
  {
    id: 2,
    image: 'https://image-tc.galaxy.tf/wijpeg-8f436tlgefhnfu48zvpns3run/_photo.jpg',
    title: 'Suites de Lujo Frente al Mar',
    subtitle: 'Arquitectura contemporánea integrada a la calidez de la costa mexicana'
  },
  {
    id: 3,
    image: 'https://image-tc.galaxy.tf/wijpeg-f4wozq3zmjrw9eececnvff107/_photo.jpg',
    title: 'Gastronomía de Alta Gama',
    subtitle: 'Seis restaurantes de especialidad y experiencias culinarias exclusivas'
  },
  {
    id: 4,
    image: 'https://image-tc.galaxy.tf/wijpeg-keenuzs88sxwkosbzny52srv/_photo.jpg',
    title: 'Piscinas y Playas Infinitas',
    subtitle: 'Días diseñados para transcurrir completamente a tu propio ritmo'
  }
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="hero-slider-wrapper">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-overlay" />
          <div className="hero-slide-content">
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Flechas de navegación */}
      <button className="slider-nav-btn prev-btn" onClick={handlePrev} aria-label="Slide anterior">
        <ChevronLeft size={28} />
      </button>
      <button className="slider-nav-btn next-btn" onClick={handleNext} aria-label="Slide siguiente">
        <ChevronRight size={28} />
      </button>

      {/* Control de pausa/play e indicadores */}
      <div className="slider-footer-controls">
        <button
          className="play-pause-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pausar slider' : 'Reproducir slider'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <div className="dots-container">
          {slides.map((_, dotIdx) => (
            <span
              key={dotIdx}
              className={`dot ${dotIdx === currentIndex ? 'active-dot' : ''}`}
              onClick={() => setCurrentIndex(dotIdx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
