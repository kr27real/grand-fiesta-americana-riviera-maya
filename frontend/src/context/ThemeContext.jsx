import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Modos posibles: 'auto' | 'light' | 'dark'
  const [modo, setModo] = useState(() => {
    return localStorage.getItem('gfa_theme_mode') || 'auto';
  });

  // Tema resuelto en pantalla: 'light' | 'dark'
  const [temaActivo, setTemaActivo] = useState('dark');

  // Función que evalúa la hora local y preferencias del sistema
  const calcularTemaInteligente = () => {
    const hora = new Date().getHours();
    // Horario diurno de 07:00 a 18:30
    const esDeDia = hora >= 7 && hora < 19;
    return esDeDia ? 'light' : 'dark';
  };

  useEffect(() => {
    let temaEfectivo = 'dark';

    if (modo === 'auto') {
      temaEfectivo = calcularTemaInteligente();
    } else {
      temaEfectivo = modo;
    }

    setTemaActivo(temaEfectivo);
    document.documentElement.setAttribute('data-theme', temaEfectivo);
    document.body.setAttribute('data-theme', temaEfectivo);
    localStorage.setItem('gfa_theme_mode', modo);

    // Si está en 'auto', checar cada minuto si cambió el horario diurno/nocturno
    if (modo === 'auto') {
      const interval = setInterval(() => {
        const nuevoTema = calcularTemaInteligente();
        setTemaActivo(nuevoTema);
        document.documentElement.setAttribute('data-theme', nuevoTema);
        document.body.setAttribute('data-theme', nuevoTema);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [modo]);

  const rotarModo = () => {
    setModo((prev) => {
      if (prev === 'auto') return 'light';
      if (prev === 'light') return 'dark';
      return 'auto';
    });
  };

  return (
    <ThemeContext.Provider value={{ modo, setModo, rotarModo, temaActivo }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}