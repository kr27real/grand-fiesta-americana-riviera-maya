import React from 'react';
import './FiestaCard.css';

const FiestaCard = ({ saldoDisponible, lineaCredito, numeroEnmascarado, titular, expiracion, puntosRewards }) => {
  return (
    <div className="fiesta-card-container">
      <div className="card-header">
        <span className="card-logo">GRAND FIESTA AMERICANA</span>
      </div>
      <div className="card-chip"></div>
      <div className="card-number">{numeroEnmascarado || '4829 •••• •••• 7788'}</div>
      <div className="card-footer">
        <div className="card-holder">
          <span className="card-label">Socio Titular</span>
          <span className="card-name">{titular || 'SOCIO POSADAS'}</span>
          <span className="card-exp">VENCE {expiracion || '11/30'}</span>
        </div>
        <div className="card-balance-badge">
          <span className="card-label">Crédito Disponible</span>
          <div className="card-balance-amount">
            ${parseFloat(saldoDisponible || 50000).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiestaCard;