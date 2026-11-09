import React, { useState, useEffect } from 'react';
import './LoginModal.css';

const generarCaptcha = () => {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 5; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [vista, setVista] = useState('login');
  const [loading, setLoading] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Credenciales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');

  // Recuperación & Captcha
  const [captchaTexto, setCaptchaTexto] = useState('');
  const [inputCaptcha, setInputCaptcha] = useState('');
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCaptchaTexto(generarCaptcha());
      setErrorMsg('');
      setMensajeExito('');
    }
  }, [isOpen, vista]);

  if (!isOpen) return null;

  const refrescarCaptcha = () => {
    setCaptchaTexto(generarCaptcha());
    setInputCaptcha('');
  };

  // Mapeo seguro de textos (evita fallos de removeChild en React DOM)
  const obtenerTitulo = () => {
    switch (vista) {
      case 'registro': return 'Registro Fiesta Rewards';
      case 'recuperar_solicitud': return 'Recuperación de Cuenta';
      case 'recuperar_codigo': return 'Nueva Credencial';
      default: return 'Acceso a Socios';
    }
  };

  const obtenerDescripcion = () => {
    switch (vista) {
      case 'registro': return 'Crea tu cuenta de socio para recibir beneficios exclusivos y tu Fiesta Card.';
      case 'recuperar_solicitud': return 'Verificación de identidad mediante Captcha de alta seguridad.';
      case 'recuperar_codigo': return 'Ingresa el código de 6 dígitos para validar el cambio seguro.';
      default: return 'Ingresa con tus credenciales registradas para administrar tus estancias.';
    }
  };

  const handleSubmitAcceso = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const esRegistro = vista === 'registro';
    const endpoint = esRegistro
      ? 'http://localhost:5000/api/usuarios/registro'
      : 'http://localhost:5000/api/usuarios/login';

    const payload = esRegistro
      ? { nombres, apellidos, email, password, telefono }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas.');

      const usuarioJson = JSON.stringify(data.usuario);
      localStorage.setItem('token', data.token);
      localStorage.setItem('token_gfa', data.token);
      localStorage.setItem('usuario', usuarioJson);
      localStorage.setItem('usuario_gfa', usuarioJson);
      localStorage.setItem('gfa_user', usuarioJson);

      window.dispatchEvent(new Event('gfa_sesion_cambiada'));
      window.dispatchEvent(new Event('storage'));

      if (onLoginSuccess) onLoginSuccess(data.usuario, data.token);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (inputCaptcha.trim().toUpperCase() !== captchaTexto.toUpperCase()) {
      setErrorMsg('El código de verificación Captcha es incorrecto.');
      refrescarCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/usuarios/recuperar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'No se pudo procesar la recuperación.');

      setMensajeExito('Código emitido: ' + (data.codigo_simulado || 'Revisa tu terminal') + '. Ingrésalo abajo.');
      setVista('recuperar_codigo');
    } catch (err) {
      setErrorMsg(err.message);
      refrescarCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecerPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (nuevaPassword.length < 6) {
      setErrorMsg('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/usuarios/restablecer-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          codigo_token: codigoIngresado,
          nueva_password: nuevaPassword
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al restablecer la contraseña.');

      setMensajeExito('¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.');
      setPassword('');
      setTimeout(() => {
        setVista('login');
        setErrorMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <button className="login-modal-close" onClick={onClose} type="button">&times;</button>

        <div className="login-modal-header">
          <p className="login-modal-sub">GRAND FIESTA AMERICANA</p>
          <h2 className="login-modal-title">{obtenerTitulo()}</h2>
          <p className="login-modal-desc">{obtenerDescripcion()}</p>
        </div>

        {(vista === 'login' || vista === 'registro') && (
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab-btn ${vista === 'login' ? 'active' : ''}`}
              onClick={() => { setVista('login'); setErrorMsg(''); setMensajeExito(''); }}
            >
              INICIAR SESIÓN
            </button>
            <button
              type="button"
              className={`login-tab-btn ${vista === 'registro' ? 'active' : ''}`}
              onClick={() => { setVista('registro'); setErrorMsg(''); setMensajeExito(''); }}
            >
              CREAR CUENTA FR
            </button>
          </div>
        )}

        {errorMsg ? <div className="login-error-banner">{errorMsg}</div> : null}
        {mensajeExito ? <div className="login-success-banner">{mensajeExito}</div> : null}

        {(vista === 'login' || vista === 'registro') && (
          <form onSubmit={handleSubmitAcceso} className="login-form">
            {vista === 'registro' && (
              <div className="login-input-row">
                <div className="login-input-group">
                  <label>Nombre(s)</label>
                  <input
                    type="text"
                    required
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Mauricio"
                  />
                </div>
                <div className="login-input-group">
                  <label>Apellido(s)</label>
                  <input
                    type="text"
                    required
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Garza Sada"
                  />
                </div>
              </div>
            )}

            <div className="login-input-group">
              <label>CORREO ELECTRÓNICO</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="socio@posadas.com"
              />
            </div>

            {vista === 'registro' && (
              <div className="login-input-group">
                <label>Teléfono de Contacto</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="5548166341"
                />
              </div>
            )}

            <div className="login-input-group">
              <label>CONTRASEÑA</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {vista === 'login' && (
              <div className="login-options-row">
                <label className="login-remember-me">
                  <input type="checkbox" defaultChecked /> Recordar mi sesión
                </label>
                <button
                  type="button"
                  className="login-forgot-link"
                  onClick={() => {
                    setVista('recuperar_solicitud');
                    setErrorMsg('');
                    setMensajeExito('');
                  }}
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Validando...' : (vista === 'login' ? 'INGRESAR A MI CUENTA →' : 'CREAR MI CUENTA FR →')}
            </button>
          </form>
        )}

        {vista === 'recuperar_solicitud' && (
          <form onSubmit={handleSolicitarCodigo} className="login-form">
            <div className="login-input-group">
              <label>CORREO ASOCIADO A LA CUENTA</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="socio@posadas.com"
              />
            </div>

            <div className="login-captcha-container">
              <label>VERIFICACIÓN DE SEGURIDAD (CAPTCHA)</label>
              <div className="login-captcha-box">
                <span className="login-captcha-code">{captchaTexto}</span>
                <button type="button" className="login-captcha-refresh" onClick={refrescarCaptcha} title="Cambiar código">
                  ↻
                </button>
              </div>
              <input
                type="text"
                required
                value={inputCaptcha}
                onChange={(e) => setInputCaptcha(e.target.value)}
                placeholder="Escribe el código mostrado"
                maxLength={6}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Verificando...' : 'ENVIAR CÓDIGO DE SEGURIDAD →'}
            </button>

            <button
              type="button"
              className="login-back-btn"
              onClick={() => { setVista('login'); setErrorMsg(''); }}
            >
              ← Volver al Inicio de Sesión
            </button>
          </form>
        )}

        {vista === 'recuperar_codigo' && (
          <form onSubmit={handleRestablecerPassword} className="login-form">
            <div className="login-input-group">
              <label>CÓDIGO DE 6 DÍGITOS</label>
              <input
                type="text"
                required
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
                placeholder="Ej. 592814"
                maxLength={6}
                className="login-input-code"
              />
            </div>

            <div className="login-input-group">
              <label>NUEVA CONTRASEÑA</label>
              <input
                type="password"
                required
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="login-input-group">
              <label>CONFIRMAR NUEVA CONTRASEÑA</label>
              <input
                type="password"
                required
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite la contraseña"
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Actualizando...' : 'GUARDAR Y RESTABLECER CLAVE →'}
            </button>

            <button
              type="button"
              className="login-back-btn"
              onClick={() => { setVista('recuperar_solicitud'); setErrorMsg(''); }}
            >
              ← Reintentar con otro código
            </button>
          </form>
        )}

        <div className="login-modal-footer-note">
          Conexión segura cifrada con HotelGranFiestaAmericanaDB
        </div>
      </div>
    </div>
  );
};

export default LoginModal;