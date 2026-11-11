import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import './HeroSlider.css';

const slides = [
  {
    id: 1,
    image: 'https://image-tc.galaxy.tf/wijpeg-1vkvkxf8aswz8zp6cnv3al62n/2998_photo.jpg',
    tag: 'GRAND FIESTA AMERICANA RIVIERA CANCÚN',
    title: 'Donde el Caribe cobra vida',
    subtitle: 'Resort & Spa contemporáneo frente al mar, una experiencia definida por la amplitud y el ritmo pausado de la costa.'
  },
  {
    id: 2,
    image: 'https://image-tc.galaxy.tf/wijpeg-keenuzs88sxwkosbzny52srv/2991_photo.jpg',
    tag: 'ARQUITECTURA & HORIZONTE',
    title: 'Arquitectura que abraza el mar',
    subtitle: 'Amplitud, elegancia relajada y vistas infinitas al arrecife turquesa de Puerto Morelos.'
  },
  {
    id: 3,
    image: 'https://image-tc.galaxy.tf/wijpeg-2xx11wxhp9nxv8hnyt0sr7vxf/2993_photo.jpg',
    tag: 'COLECCIÓN EXCLUSIVA',
    title: 'Suites de Lujo Frente al Mar',
    subtitle: 'Espacios de descanso creados a la medida con amenidades L’Occitane y mayordomía de autor.'
  },
  {
    id: 4,
    image: 'https://image-tc.galaxy.tf/wijpeg-f4wozq3zmjrw9eececnvff107/2997_photo.jpg',
    tag: 'ALTA GASTRONOMÍA & BIENESTAR',
    title: 'Experiencias de Alta Gama',
    subtitle: 'Seis restaurantes de especialidad internacional y un santuario holístico de hidroterapia.'
  }
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="hero-slider-master">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide-pane ${index === currentIndex ? 'slide-active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-scrim-layer" />
          
          <div className="hero-content-wrapper">
            <div className="hero-content-glass">
              <span className="hero-eyebrow-pill">{slide.tag}</span>
              <h1 className="hero-display-title">{slide.title}</h1>
              <p className="hero-description-text">{slide.subtitle}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Cápsula de control en la esquina inferior derecha */}
      <div className="hero-control-cockpit">
        <button className="cockpit-btn nav-arrow" onClick={handlePrev} aria-label="Slide anterior">
          <ChevronLeft size={20} />
        </button>

        <button
          className="cockpit-btn nav-play"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>

        <button className="cockpit-btn nav-arrow" onClick={handleNext} aria-label="Slide siguiente">
          <ChevronRight size={20} />
        </button>

        <div className="cockpit-divider" />

        <div className="cockpit-pagination">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`dash-indicator ${idx === currentIndex ? 'active-dash' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir al slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}