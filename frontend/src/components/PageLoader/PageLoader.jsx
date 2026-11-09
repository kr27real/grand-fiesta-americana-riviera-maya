import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PageLoader.css';

export default function PageLoader() {
  const [visible, setVisible] = useState(false);
  const [animandoSalida, setAnimandoSalida] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Activar loader en cada cambio de ruta
    setVisible(true);
    setAnimandoSalida(false);

    // Duración calibrada de bienvenida (550ms + 350ms fade-out)
    const timerAnim = setTimeout(() => {
      setAnimandoSalida(true);
    }, 550);

    const timerOcultar = setTimeout(() => {
      setVisible(false);
      setAnimandoSalida(false);
    }, 900);

    return () => {
      clearTimeout(timerAnim);
      clearTimeout(timerOcultar);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className={`gfa-pageloader-root ${animandoSalida ? 'fade-out' : ''}`}>
      <div className="pageloader-center-box">
        
        {/* Monograma de Hospitalidad */}
        <div className="pageloader-crest">
          <span>G</span>
        </div>

        {/* Título de Marca Oficial */}
        <h2 className="pageloader-brand-title">Grand Fiesta Americana</h2>
        <span className="pageloader-brand-sub">Riviera Cancún Resort & Spa</span>

        {/* Barra de Progreso Oro & Lila */}
        <div className="pageloader-progress-track">
          <div className="pageloader-progress-bar" />
        </div>

      </div>
    </div>
  );
}