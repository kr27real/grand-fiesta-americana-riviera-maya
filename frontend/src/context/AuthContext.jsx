import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem('usuario_gfa') || localStorage.getItem('usuario') || localStorage.getItem('gfa_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token_gfa') || localStorage.getItem('token') || null;
  });

  const [loginModalAbierto, setLoginModalAbierto] = useState(false);

  // Sincronización entre pestañas y eventos personalizados
  useEffect(() => {
    const handleStorage = () => {
      try {
        const rawUser = localStorage.getItem('usuario_gfa') || localStorage.getItem('usuario') || localStorage.getItem('gfa_user');
        const currentToken = localStorage.getItem('token_gfa') || localStorage.getItem('token');
        setUsuario(rawUser ? JSON.parse(rawUser) : null);
        setToken(currentToken || null);
      } catch {
        setUsuario(null);
        setToken(null);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('gfa_sesion_cambiada', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('gfa_sesion_cambiada', handleStorage);
    };
  }, []);

  const iniciarSesion = (nuevoUsuario, nuevoToken) => {
    localStorage.setItem('usuario_gfa', JSON.stringify(nuevoUsuario));
    localStorage.setItem('token_gfa', nuevoToken);
    // Compatibilidad retroactiva
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
    localStorage.setItem('token', nuevoToken);

    setUsuario(nuevoUsuario);
    setToken(nuevoToken);
    setLoginModalAbierto(false);
    window.dispatchEvent(new Event('gfa_sesion_cambiada'));
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuario_gfa');
    localStorage.removeItem('token_gfa');
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('gfa_user');

    setUsuario(null);
    setToken(null);
    window.dispatchEvent(new Event('gfa_sesion_cambiada'));
  };

  const abrirLogin = () => setLoginModalAbierto(true);
  const cerrarLogin = () => setLoginModalAbierto(false);

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      estaAutenticado: Boolean(token && usuario),
      loginModalAbierto,
      abrirLogin,
      cerrarLogin,
      iniciarSesion,
      cerrarSesion
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
