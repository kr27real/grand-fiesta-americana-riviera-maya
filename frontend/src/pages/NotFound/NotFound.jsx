import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Home, BedDouble } from 'lucide-react';

export default function NotFound() {
  return (
    <div 
      style={{
        backgroundColor: '#060508',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '7rem 2rem 4rem',
        textAlign: 'center',
        fontFamily: 'Montserrat, sans-serif'
      }}
    >
      <div 
        style={{
          maxWidth: '680px',
          background: 'linear-gradient(165deg, rgba(20, 18, 28, 0.95) 0%, rgba(10, 8, 14, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.45)',
          borderRadius: '10px',
          padding: '3.5rem 2.5rem',
          boxShadow: '0 25px 70px rgba(0,0,0,0.92)'
        }}
      >
        <span style={{ fontSize: '0.72rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 800 }}>
          Grupo Posadas de México • Riviera Cancún
        </span>

        <h1 
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(4.5rem, 9vw, 7.5rem)',
            color: '#f3e5ab',
            margin: '0.5rem 0 0',
            lineHeight: 1,
            letterSpacing: '3px'
          }}
        >
          404
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: '#d4af37', margin: '1rem 0 1.2rem' }}>
          <Compass size={20} />
          <span style={{ fontSize: '0.86rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
            Destino No Encontrado
          </span>
        </div>

        <p style={{ color: '#cbd5e1', fontSize: '0.96rem', lineHeight: 1.7, margin: '0 auto 2.5rem', maxWidth: '520px' }}>
          La página que buscas no está disponible en este momento o la dirección ha cambiado. Permítenos guiarte de vuelta a nuestras experiencias exclusivas.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #aa8212 100%)',
              color: '#060508',
              padding: '0.75rem 1.6rem',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 800,
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 18px rgba(212,175,55,0.4)'
            }}
          >
            <Home size={15} /> Volver a Inicio
          </Link>

          <Link
            to="/habitaciones"
            style={{
              background: '#161420',
              border: '1px solid rgba(196,181,253,0.3)',
              color: '#f3e5ab',
              padding: '0.75rem 1.6rem',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 800,
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <BedDouble size={15} /> Explorar Suites
          </Link>
        </div>
      </div>
    </div>
  );
}