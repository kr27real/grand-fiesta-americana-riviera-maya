import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ShieldCheck, UserCheck, RefreshCw, Lock, Mail, Phone, Globe, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.css';

const generarCaptcha = () => {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 5; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { iniciarSesion } = useAuth();
  const [vista, setVista] = useState('login'); // 'login' | 'registro' | 'recuperar_solicitud' | 'recuperar_codigo'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Estados de visualización de contraseña
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  // Formulario Login
  const [identificador, setIdentificador] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [recordarSesion, setRecordarSesion] = useState(true);

  // Formulario Registro
  const [tratamiento, setTratamiento] = useState('Sr.');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [emailRegistro, setEmailRegistro] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pais, setPais] = useState('México');
  const [passwordRegistro, setPasswordRegistro] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Recuperación & Captcha
  const [emailRecuperacion, setEmailRecuperacion] = useState('');
  const [captchaTexto, setCaptchaTexto] = useState('');
  const [inputCaptcha, setInputCaptcha] = useState('');
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarNuevaPassword, setConfirmarNuevaPassword] = useState('');

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

  // Cálculo visual de fortaleza de contraseña
  const evaluarFortaleza = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { texto: 'Débil', color: '#ff4d4f', width: '30%' };
    if (score === 2 || score === 3) return { texto: 'Media', color: '#faad14', width: '65%' };
    return { texto: 'Robusta', color: '#52c41a', width: '100%' };
  };

  const fortaleza = evaluarFortaleza(passwordRegistro);

  // Submit Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificador, password: passwordLogin })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas.');

      if (iniciarSesion) {
        iniciarSesion(data.usuario, data.token);
      } else {
        localStorage.setItem('usuario_gfa', JSON.stringify(data.usuario));
        localStorage.setItem('token_gfa', data.token);
        window.dispatchEvent(new Event('gfa_sesion_cambiada'));
      }

      if (onLoginSuccess) onLoginSuccess(data.usuario, data.token);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Registro
  const handleRegistro = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (passwordRegistro.length < 8) {
      setErrorMsg('La contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }

    if (passwordRegistro !== confirmarPassword) {
      setErrorMsg('Las contraseñas ingresadas no coinciden.');
      return;
    }

    if (!aceptaTerminos) {
      setErrorMsg('Debes aceptar los Términos y Condiciones y el Aviso de Privacidad.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tratamiento,
          nombres,
          apellidos,
          email: emailRegistro,
          telefono,
          pais,
          password: passwordRegistro
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo completar el registro.');

      if (iniciarSesion) {
        iniciarSesion(data.usuario, data.token);
      } else {
        localStorage.setItem('usuario_gfa', JSON.stringify(data.usuario));
        localStorage.setItem('token_gfa', data.token);
        window.dispatchEvent(new Event('gfa_sesion_cambiada'));
      }

      if (onLoginSuccess) onLoginSuccess(data.usuario, data.token);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Recuperar Contraseña - Solicitud
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (inputCaptcha.trim().toUpperCase() !== captchaTexto.toUpperCase()) {
      setErrorMsg('Código Captcha incorrecto. Intenta con uno nuevo.');
      refrescarCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/usuarios/recuperar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailRecuperacion })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo generar el código.');

      setMensajeExito(`Código de seguridad emitido: ${data.codigo_simulado || 'Revisa tu terminal'}.`);
      setVista('recuperar_codigo');
    } catch (err) {
      setErrorMsg(err.message);
      refrescarCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Submit Recuperar Contraseña - Cambio
  const handleRestablecerPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (nuevaPassword.length < 8) {
      setErrorMsg('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarNuevaPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/usuarios/restablecer-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailRecuperacion,
          codigo_token: codigoIngresado,
          nueva_password: nuevaPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al restablecer contraseña.');

      setMensajeExito('Contraseña actualizada con éxito. Ya puedes iniciar sesión.');
      setVista('login');
      setPasswordLogin('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose} title="Cerrar modal">&times;</button>

        {/* Encabezado Corporativo */}
        <div className="login-modal-header">
          <div className="login-brand-icon">
            <Award size={24} color="#d4af37" />
          </div>
          <h2 className="login-title">
            {vista === 'registro' && 'Registro Fiesta Rewards'}
            {vista === 'login' && 'Acceso a Socios'}
            {vista === 'recuperar_solicitud' && 'Recuperación de Cuenta'}
            {vista === 'recuperar_codigo' && 'Nueva Credencial'}
          </h2>
          <p className="login-subtitle">
            {vista === 'registro' && 'Crea tu cuenta institucional y recibe tu Fiesta Card de cortesía con 2,500 puntos.'}
            {vista === 'login' && 'Ingresa con tu correo electrónico o número de socio Fiesta Rewards.'}
            {vista === 'recuperar_solicitud' && 'Ingresa tu correo registrado y valida el código Captcha de seguridad.'}
            {vista === 'recuperar_codigo' && 'Digita el código de 6 dígitos para asignar una nueva contraseña segura.'}
          </p>
        </div>

        {/* Mensajes de Alerta */}
        {errorMsg && <div className="login-alert login-alert-danger">{errorMsg}</div>}
        {mensajeExito && <div className="login-alert login-alert-success">{mensajeExito}</div>}

        {/* 1. VISTA LOGIN */}
        {vista === 'login' && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Correo Electrónico o No. Fiesta Rewards</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  type="text"
                  required
                  placeholder="ej. socio@hotel.com o FR-222466"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  className="form-input"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-link">
                <label className="form-label">Contraseña</label>
                <button
                  type="button"
                  onClick={() => { setVista('recuperar_solicitud'); setErrorMsg(''); setMensajeExito(''); }}
                  className="link-btn"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={16} className="field-icon" />
                <input
                  type={verPassword ? 'text' : 'password'}
                  required
                  placeholder="Introduce tu contraseña"
                  value={passwordLogin}
                  onChange={(e) => setPasswordLogin(e.target.value)}
                  className="form-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  className="toggle-pwd-btn"
                  tabIndex={-1}
                >
                  {verPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-row-remember">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={recordarSesion}
                  onChange={(e) => setRecordarSesion(e.target.checked)}
                />
                <span className="checkbox-label">Mantener sesión iniciada</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-gold-submit">
              {loading ? 'Validando credenciales...' : 'Iniciar Sesión'}
            </button>

            <div className="login-footer-switch">
              <span>¿Aún no eres socio? </span>
              <button
                type="button"
                onClick={() => { setVista('registro'); setErrorMsg(''); setMensajeExito(''); }}
                className="link-switch"
              >
                Inscríbete a Fiesta Rewards aquí
              </button>
            </div>
          </form>
        )}

        {/* 2. VISTA REGISTRO */}
        {vista === 'registro' && (
          <form onSubmit={handleRegistro} className="login-form">
            <div className="form-row-2col">
              <div className="form-group" style={{ flex: '0 0 90px' }}>
                <label className="form-label">Tratamiento</label>
                <select
                  value={tratamiento}
                  onChange={(e) => setTratamiento(e.target.value)}
                  className="form-input"
                >
                  <option value="Sr.">Sr.</option>
                  <option value="Sra.">Sra.</option>
                  <option value="Lic.">Lic.</option>
                  <option value="Dr.">Dr.</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Nombre(s) *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Kevin"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Apellido(s) *</label>
              <input
                type="text"
                required
                placeholder="ej. Ramírez Soria"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Correo Electrónico *</label>
                <div className="input-with-icon">
                  <Mail size={16} className="field-icon" />
                  <input
                    type="email"
                    required
                    placeholder="socio@ejemplo.com"
                    value={emailRegistro}
                    onChange={(e) => setEmailRegistro(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono Móvil *</label>
                <div className="input-with-icon">
                  <Phone size={16} className="field-icon" />
                  <input
                    type="tel"
                    required
                    placeholder="ej. 5548166341"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">País de Residencia</label>
              <div className="input-with-icon">
                <Globe size={16} className="field-icon" />
                <select
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="form-input"
                >
                  <option value="México">México</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  <option value="Canadá">Canadá</option>
                  <option value="España">España</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Contraseña (Mín. 8 caracteres) *</label>
                <div className="input-with-icon">
                  <Lock size={16} className="field-icon" />
                  <input
                    type={verPassword ? 'text' : 'password'}
                    required
                    placeholder="Contraseña robusta"
                    value={passwordRegistro}
                    onChange={(e) => setPasswordRegistro(e.target.value)}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword(!verPassword)}
                    className="toggle-pwd-btn"
                    tabIndex={-1}
                  >
                    {verPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar Contraseña *</label>
                <div className="input-with-icon">
                  <Lock size={16} className="field-icon" />
                  <input
                    type={verConfirmar ? 'text' : 'password'}
                    required
                    placeholder="Repite la contraseña"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setVerConfirmar(!verConfirmar)}
                    className="toggle-pwd-btn"
                    tabIndex={-1}
                  >
                    {verConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Medidor de Fortaleza */}
            {passwordRegistro.length > 0 && (
              <div className="strength-meter-container">
                <div className="strength-bar-bg">
                  <div
                    className="strength-bar-fill"
                    style={{ width: fortaleza.width, backgroundColor: fortaleza.color }}
                  />
                </div>
                <span className="strength-label" style={{ color: fortaleza.color }}>
                  Seguridad: {fortaleza.texto}
                </span>
              </div>
            )}

            <div className="terms-checkbox-box">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  required
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                />
                <span className="checkbox-label">
                  Acepto los Términos del programa Fiesta Rewards y el Aviso de Privacidad conforme a la LFPDPPP.
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-gold-submit">
              {loading ? 'Creando membresía de socio...' : 'Completar Registro y Obtener Fiesta Card'}
            </button>

            <div className="login-footer-switch">
              <span>¿Ya tienes membresía? </span>
              <button
                type="button"
                onClick={() => { setVista('login'); setErrorMsg(''); setMensajeExito(''); }}
                className="link-switch"
              >
                Inicia sesión aquí
              </button>
            </div>
          </form>
        )}

        {/* 3. VISTA RECUPERACIÓN - PASO 1 (SOLICITUD) */}
        {vista === 'recuperar_solicitud' && (
          <form onSubmit={handleSolicitarCodigo} className="login-form">
            <div className="form-group">
              <label className="form-label">Correo Electrónico Registrado</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  type="email"
                  required
                  placeholder="ej. socio@hotel.com"
                  value={emailRecuperacion}
                  onChange={(e) => setEmailRecuperacion(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Código de Verificación Captcha</label>
              <div className="captcha-wrapper">
                <div className="captcha-badge">{captchaTexto}</div>
                <button
                  type="button"
                  onClick={refrescarCaptcha}
                  className="btn-refresh-captcha"
                  title="Cambiar código Captcha"
                >
                  <RefreshCw size={16} />
                </button>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="Ingresa código"
                  value={inputCaptcha}
                  onChange={(e) => setInputCaptcha(e.target.value)}
                  className="form-input captcha-input"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gold-submit">
              {loading ? 'Enviando código...' : 'Solicitar Código de Seguridad'}
            </button>

            <div className="login-footer-switch">
              <button
                type="button"
                onClick={() => { setVista('login'); setErrorMsg(''); setMensajeExito(''); }}
                className="link-switch"
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}

        {/* 4. VISTA RECUPERACIÓN - PASO 2 (VALIDAR CÓDIGO Y NUEVA CLAVE) */}
        {vista === 'recuperar_codigo' && (
          <form onSubmit={handleRestablecerPassword} className="login-form">
            <div className="form-group">
              <label className="form-label">Código de Verificación (6 dígitos)</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
                className="form-input code-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nueva Contraseña (Mín. 8 caracteres)</label>
              <div className="input-with-icon">
                <Lock size={16} className="field-icon" />
                <input
                  type={verPassword ? 'text' : 'password'}
                  required
                  placeholder="Introduce nueva contraseña"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Nueva Contraseña</label>
              <div className="input-with-icon">
                <Lock size={16} className="field-icon" />
                <input
                  type={verConfirmar ? 'text' : 'password'}
                  required
                  placeholder="Repite la nueva contraseña"
                  value={confirmarNuevaPassword}
                  onChange={(e) => setConfirmarNuevaPassword(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gold-submit">
              {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
            </button>

            <div className="login-footer-switch">
              <button
                type="button"
                onClick={() => { setVista('login'); setErrorMsg(''); setMensajeExito(''); }}
                className="link-switch"
              >
                ← Cancelar y volver al inicio
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
