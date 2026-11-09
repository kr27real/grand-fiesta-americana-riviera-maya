import React, { useState } from 'react';
import { Calendar, Users, MapPin, Tag, Plane, Search } from 'lucide-react';
import './BookingBar.css';

export default function BookingBar() {
  const [destino, setDestino] = useState('Grand Fiesta Americana Riviera Cancún');
  const [llegada, setLlegada] = useState('');
  const [salida, setSalida] = useState('');
  const [adultos, setAdultos] = useState('02');
  const [ninos, setNinos] = useState('00');
  const [showGuests, setShowGuests] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showPromo, setShowPromo] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log({ destino, llegada, salida, adultos, ninos, promoCode });
  };

  return (
    <div className="booking-mask-wrapper">
      <form className="booking-bar-container" onSubmit={handleSearch}>
        {/* Destino */}
        <div className="bm-col bm-col-destination">
          <label className="bm-label">
            <MapPin size={13} className="bm-label-icon" /> ¿A dónde quieres viajar?
          </label>
          <div className="bm-field-display">
            <select 
              value={destino} 
              onChange={(e) => setDestino(e.target.value)}
              className="bm-select"
            >
              <option value="Grand Fiesta Americana Riviera Cancún">
                Grand Fiesta Americana Riviera Cancún
              </option>
              <option value="Grand Fiesta Americana Coral Beach Cancún">
                Grand Fiesta Americana Coral Beach Cancún
              </option>
              <option value="Grand Fiesta Americana Los Cabos">
                Grand Fiesta Americana Los Cabos
              </option>
            </select>
          </div>
        </div>

        {/* Fecha Llegada */}
        <div className="bm-col bm-col-date">
          <label className="bm-label">
            <Calendar size={13} className="bm-label-icon" /> Llegada
          </label>
          <input 
            type="date" 
            className="bm-input-date" 
            value={llegada}
            onChange={(e) => setLlegada(e.target.value)}
          />
        </div>

        {/* Fecha Salida */}
        <div className="bm-col bm-col-date">
          <label className="bm-label">
            <Calendar size={13} className="bm-label-icon" /> Salida
          </label>
          <input 
            type="date" 
            className="bm-input-date" 
            value={salida}
            onChange={(e) => setSalida(e.target.value)}
          />
        </div>

        {/* Huéspedes */}
        <div className="bm-col bm-col-guests">
          <label className="bm-label">
            <Users size={13} className="bm-label-icon" /> Huéspedes
          </label>
          <div 
            className="bm-guests-toggle" 
            onClick={() => setShowGuests(!showGuests)}
          >
            <span>{adultos} Adultos, {ninos} Niños</span>
          </div>

          {showGuests && (
            <div className="bm-dropdown-panel">
              <div className="dropdown-row">
                <span>Adultos</span>
                <select value={adultos} onChange={(e) => setAdultos(e.target.value)}>
                  {['01', '02', '03', '04', '05'].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="dropdown-row">
                <span>Niños (5-12 años)</span>
                <select value={ninos} onChange={(e) => setNinos(e.target.value)}>
                  {['00', '01', '02', '03'].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Botón Reservar */}
        <div className="bm-col bm-col-action">
          <button type="submit" className="btn-bm-submit">
            <Search size={15} /> Reservar
          </button>
          <button 
            type="button" 
            className="btn-promo-toggle"
            onClick={() => setShowPromo(!showPromo)}
          >
            <Tag size={12} /> Código promocional
          </button>
        </div>
      </form>

      {/* Input de código promocional expandible */}
      {showPromo && (
        <div className="promo-expanded-row">
          <input 
            type="text" 
            placeholder="Ingresa tu código de descuento"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="promo-input"
          />
        </div>
      )}

      {/* Cintillo inferior de Paquetes Hotel + Avión */}
      <div className="bm-air-strip">
        <Plane size={15} className="plane-icon" />
        <a href="#paquetes" className="air-link">Clic aquí</a>
        <span>— Paquetes Hotel + Avión</span>
      </div>
    </div>
  );
}
