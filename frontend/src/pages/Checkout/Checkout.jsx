import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { fetchSuites, createReservation } from '../../services/api';
import LoginModal from '../../components/LoginModal/LoginModal';
import {
  ShieldCheck, CreditCard, BedDouble, Calendar,
  Users, CheckCircle2, Lock, ArrowLeft, Loader2, AlertCircle,
  Clock, Plane, Car, Sparkles, Building2, UserCheck, HelpCircle, Award,
  QrCode, Wallet, Printer, FileDown
} from 'lucide-react';
import './Checkout.css';
export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(() => {
    return JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user') || 'null');
  });
  const [mostrarLoginModal, setMostrarLoginModal] = useState(false);

  const [suite, setSuite] = useState(location.state?.suite || null);
  const [fechaLlegada, setFechaLlegada] = useState(location.state?.fechaLlegada || new Date().toISOString().substring(0, 10));
  const [fechaSalida, setFechaSalida] = useState(location.state?.fechaSalida || new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10));
  const [adultos, setAdultos] = useState(location.state?.adultos || 2);
  const [ninos, setNinos] = useState(location.state?.ninos || 0);

  // 1. Datos del Titular y Opciones Booking Style
  const [datosHuesped, setDatosHuesped] = useState({
    nombre: usuario?.nombre || 'Kevin',
    apellido: usuario?.apellido || 'Ramirez Soria',
    email: usuario?.email || 'jerrysoria32@gmail.com',
    telefono: usuario?.telefono || '5548166341',
    peticiones: '',
    reservaParaOtro: false,
    nombreOtroHuesped: '',
    viajeTrabajo: false,
    rfcFacturacion: '',
    horaLlegada: '15:00 - 16:00'
  });

  // 2. Servicios Adicionales (Add-ons)
  const [addons, setAddons] = useState({
    trasladoAeropuerto: false,
    hertzAuto: false,
    feelHarmonySpa: false
  });

  // 3. Tarjeta Cifrada
  const [tarjeta, setTarjeta] = useState({
    titular: '',
    numero: '',
    expiracion: '',
    cvv: ''
  });

      const [metodoPagoTipo, setMetodoPagoTipo] = useState('tarjeta_guardada');
  const [listaTarjetasUsuario, setListaTarjetasUsuario] = useState([]);
  const [tarjetaElegidaId, setTarjetaElegidaId] = useState(null); // 'tarjeta_guardada' | 'fiesta_card' | 'qr_tiendas'
  const [comprobanteModal, setComprobanteModal] = useState(null);
  useEffect(() => {
    const cargarTarjetas = async () => {
      let uId = 1;
      try {
        const u = usuario || JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('usuario') || localStorage.getItem('gfa_user') || 'null');
        if (u) uId = u.usuario_id || u.UsuarioID || u.id || 1;
      } catch (e) {
        uId = 1;
      }

      const token = localStorage.getItem('token_gfa') || localStorage.getItem('token');

      try {
        const res = await fetch(`http://localhost:5000/api/billetera/${uId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (res.ok) {
          const data = await res.json();
          const tjs = data.tarjetas_bancarias || data.tarjetas || [];
          if (tjs.length > 0) {
            setListaTarjetasUsuario(tjs);
            const pref = tjs.find(t => t.es_preferida === 1 || t.es_preferida === true || t.es_predeterminada);
            setTarjetaElegidaId(pref ? (pref.tarjeta_bancaria_id || pref.id) : (tjs[0].tarjeta_bancaria_id || tjs[0].id));
            return;
          }
        }
      } catch (err) {
        console.warn('Cargando tarjetas por omisión:', err);
      }

      // Fallback con tus tarjetas registradas de la cuenta Kevin Ramírez
      const tjsDefault = [
        { tarjeta_bancaria_id: 1, numero_enmascarado: '•••• •••• •••• 2274', banco_emisor: 'Santander', titular_tarjeta: 'KEVIN RAMIREZ SORIA', fecha_expiracion: '05/34', es_preferida: 1, alias_tarjeta: 'MASTERCARD' },
        { tarjeta_bancaria_id: 2, numero_enmascarado: '•••• •••• •••• 9904', banco_emisor: 'BBVA Bancomer', titular_tarjeta: 'KEVIN RAMIREZ SORIA', fecha_expiracion: '01/29', es_preferida: 0, alias_tarjeta: 'VISA' }
      ];
      setListaTarjetasUsuario(tjsDefault);
      setTarjetaElegidaId(1);
    };

    cargarTarjetas();
  }, [usuario]);
  const [procesando, setProcesando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (location.state) {
      if (location.state.suite) setSuite(location.state.suite);
      if (location.state.fechaLlegada) setFechaLlegada(location.state.fechaLlegada);
      if (location.state.fechaSalida) setFechaSalida(location.state.fechaSalida);
      if (location.state.adultos) setAdultos(location.state.adultos);
      if (location.state.ninos !== undefined) setNinos(location.state.ninos);
    }
    if (!suite) {
      fetchSuites().then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSuite(data[0]);
        }
      }).catch(err => console.warn(err));
    }
  }, [location.state]);

  // Cálculos de estancia
  const f1 = new Date(fechaLlegada);
  const f2 = new Date(fechaSalida);
  const nochesCalc = Math.ceil((f2 - f1) / (1000 * 60 * 60 * 24));
  const noches = nochesCalc > 0 ? nochesCalc : 1;

  const precioPorNoche = Number(suite?.precio_noche_base || 7450);
    const subtotalHospedajeBruto = precioPorNoche * noches;
    
    // Beneficio Socio Fiesta Rewards Titanium (10% sobre hospedaje base)
    const esSocioFR = !!(usuario?.fiesta_rewards_id || usuario?.programa_lealtad);
    const descuentoRewards = esSocioFR ? Math.round(subtotalHospedajeBruto * 0.10) : 0;
    const subtotalBase = subtotalHospedajeBruto - descuentoRewards;

    // Add-ons gravados con IVA (Traslado ,450, Spa ,800)
    const costoTraslado = addons.trasladoAeropuerto ? 1450 : 0;
    const costoSpa = addons.feelHarmonySpa ? 1800 : 0;
    const totalAddons = costoTraslado + (typeof costoHertz !== 'undefined' ? costoHertz : 0) + costoSpa;

    // Base gravable total para IVA (Hospedaje neto + Servicios adicionales)
    const subtotalFacturable = subtotalBase + totalAddons;
    const iva = +(subtotalFacturable * 0.16).toFixed(2);

    // ISH Estatal (5% exclusivo sobre tarifa de hospedaje neta)
    const ishe = +(subtotalBase * 0.05).toFixed(2);

    // Derecho de Saneamiento Ambiental Municipal ( MXN / noche)
    const saneamiento = +(100.00 * noches).toFixed(2);

    const totalGeneral = +(subtotalFacturable + iva + ishe + saneamiento).toFixed(2);

  const handleProcesarPago = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validación estricta de sesión activa
    const tokenActivo = localStorage.getItem('token_gfa') || localStorage.getItem('token');
    const sesionActiva = usuario || JSON.parse(localStorage.getItem('usuario_gfa') || localStorage.getItem('gfa_user') || 'null');

    if (!tokenActivo || !sesionActiva) {
      setErrorMsg('⚠️ Debes iniciar sesión con tu cuenta de socio Fiesta Rewards para confirmar y liquidar tu reservación.');
      setMostrarLoginModal(true);
      return;
    }

    setProcesando(true);

    try {
      const uId = usuario ? (usuario.usuario_id || usuario.UsuarioID || usuario.id || 1) : 1;
      const sId = suite ? (suite.suite_id || suite.id || 1) : 1;
        let ultimos4 = '4242';
        if (metodoPagoTipo === 'qr_tiendas') {
          ultimos4 = 'QR';
        } else if (metodoPagoTipo === 'fiesta_card') {
          ultimos4 = '7412';
        } else if (tarjeta.numero) {
          ultimos4 = tarjeta.numero.replace(/\s/g, '').slice(-4);
        } else if (tarjetaElegidaId && listaTarjetasUsuario.length > 0) {
          const tSel = listaTarjetasUsuario.find(t => t.tarjeta_bancaria_id === tarjetaElegidaId);
          if (tSel && tSel.numero_enmascarado) {
            ultimos4 = tSel.numero_enmascarado.slice(-4);
          }
        }

      // Construcción de peticiones especiales consolidando add-ons y hora estimada
      let peticionesCompletas = datosHuesped.peticiones || '';
      if (datosHuesped.horaLlegada) peticionesCompletas += ` | Hora estimada: ${datosHuesped.horaLlegada}`;
      if (addons.trasladoAeropuerto) peticionesCompletas += ` | Requiere Traslado Aeropuerto Suburban ($1,450 MXN)`;
      if (addons.hertzAuto) peticionesCompletas += ` | Requiere Renta Hertz ($2,200 MXN)`;
      if (addons.feelHarmonySpa) peticionesCompletas += ` | Requiere Paquete Spa ($1,800 MXN)`;
      if (datosHuesped.reservaParaOtro) peticionesCompletas += ` | Huésped Titular en Destino: ${datosHuesped.nombreOtroHuesped}`;
      if (datosHuesped.viajeTrabajo && datosHuesped.rfcFacturacion) peticionesCompletas += ` | Facturación RFC: ${datosHuesped.rfcFacturacion}`;

      const payload = {
        usuario_id: uId,
        suite_id: sId,
        fecha_llegada: fechaLlegada,
        fecha_salida: fechaSalida,
        noches: noches,
        adultos: Number(adultos),
        ninos: Number(ninos),
        peticiones: peticionesCompletas.trim(),
        subtotal: subtotalBase + totalAddons,
        iva: iva,
        ishe: ishe,
        saneamiento: saneamiento,
        total_general: totalGeneral,
                terminacion_tarjeta: ultimos4,
        metodo_pago_tipo: metodoPagoTipo === 'tarjeta_guardada' ? 'tarjeta_bancaria' : metodoPagoTipo,
        tarjeta_bancaria_id: tarjetaElegidaId
      };

      const res = await createReservation(payload);
      
      navigate('/busqueda-reserva', { 
        state: { 
          folio: res.data?.folio_confirmacion, 
          email: datosHuesped.email 
        } 
      });
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar la liquidación en SQL Server.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="checkout-page-root" style={{ backgroundColor: '#060508', color: '#ffffff', minHeight: '100vh', padding: '8.5rem 2rem 6rem', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* BARRA DE NAVEGACIÓN EN EMBUDO (ESTILO BOOKING) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#22c55e', fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
            <span>1. Tu Selección</span>
          </div>
          <div style={{ width: '40px', height: '2px', background: '#d4af37' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f3e5ab', fontSize: '0.82rem', fontWeight: 800 }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#d4af37', color: '#060508', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
            <span>2. Tus Datos & Garantía</span>
          </div>
          <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            <span>3. Confirmación & Voucher</span>
          </div>
        </div>

        {/* MENSAJE DE REFUERZO DE CONFIANZA */}
        <div style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid #d4af37', borderRadius: '8px', padding: '1rem 1.6rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#f3e5ab', fontSize: '0.84rem' }}>
          <Sparkles size={18} color="#d4af37" />
          <span>¡Ya casi terminas! Solo completa los datos del titular para garantizar tu suite con <strong>tarifa oficial Grupo Posadas</strong>.</span>
        </div>

        <form onSubmit={handleProcesarPago} className="checkout-main-grid">
          
          {/* COLUMNA IZQUIERDA: FORMULARIOS */}
          <div className="checkout-form-column">
            
            {errorMsg && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SECCIÓN 1: DATOS DEL HUÉSPED TITULAR */}
            <div className="checkout-card">
              <h3 className="checkout-card-title">
                <UserCheck size={20} color="#d4af37" />
                1. Datos Personales del Huésped
              </h3>

              <div className="checkout-form-grid">
                <div className="checkout-field">
                  <label>Nombre(s)*</label>
                  <input 
                    type="text" 
                    required 
                    value={datosHuesped.nombre} 
                    onChange={(e) => setDatosHuesped({ ...datosHuesped, nombre: e.target.value })} 
                  />
                </div>

                <div className="checkout-field">
                  <label>Apellidos*</label>
                  <input 
                    type="text" 
                    required 
                    value={datosHuesped.apellido} 
                    onChange={(e) => setDatosHuesped({ ...datosHuesped, apellido: e.target.value })} 
                  />
                </div>

                <div className="checkout-field">
                  <label>Correo Electrónico (Para envío de Voucher)*</label>
                  <input 
                    type="email" 
                    required 
                    value={datosHuesped.email} 
                    onChange={(e) => setDatosHuesped({ ...datosHuesped, email: e.target.value })} 
                  />
                </div>

                <div className="checkout-field">
                  <label>Teléfono Celular / WhatsApp*</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+52 55 1234 5678" 
                    value={datosHuesped.telefono} 
                    onChange={(e) => setDatosHuesped({ ...datosHuesped, telefono: e.target.value })} 
                  />
                </div>
              </div>

              {/* ¿Para quién es la reserva? (Estilo Booking) */}
              <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <label style={{ fontSize: '0.74rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>
                  ¿Para quién es esta reservación?
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="destinatario" 
                      checked={!datosHuesped.reservaParaOtro} 
                      onChange={() => setDatosHuesped({ ...datosHuesped, reservaParaOtro: false })} 
                    />
                    <span>La reservación es para mí</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="destinatario" 
                      checked={datosHuesped.reservaParaOtro} 
                      onChange={() => setDatosHuesped({ ...datosHuesped, reservaParaOtro: true })} 
                    />
                    <span>Es para otra persona</span>
                  </label>
                </div>

                {datosHuesped.reservaParaOtro && (
                  <div className="checkout-field" style={{ marginTop: '0.8rem' }}>
                    <label>Nombre y Apellidos del Huésped Principal*</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Nombre de la persona que se presentará en recepción"
                      value={datosHuesped.nombreOtroHuesped}
                      onChange={(e) => setDatosHuesped({ ...datosHuesped, nombreOtroHuesped: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* ¿Viajas por trabajo? (Facturación RFC) */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={datosHuesped.viajeTrabajo} 
                    onChange={(e) => setDatosHuesped({ ...datosHuesped, viajeTrabajo: e.target.checked })} 
                  />
                  <span>¿Requiere factura fiscal mexicana (CFDI)?</span>
                </label>

                {datosHuesped.viajeTrabajo && (
                  <div className="checkout-field" style={{ marginTop: '0.8rem' }}>
                    <label>RFC con Homoclave (o Tax ID)*</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej. XAXX010101000"
                      value={datosHuesped.rfcFacturacion}
                      onChange={(e) => setDatosHuesped({ ...datosHuesped, rfcFacturacion: e.target.value.toUpperCase() })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN 2: HORARIO DE LLEGADA (ESTILO BOOKING) */}
            <div className="checkout-card">
              <h3 className="checkout-card-title">
                <Clock size={20} color="#d4af37" />
                2. Horario Estimado de Llegada
              </h3>

              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1rem', lineHeight: 1.6 }}>
                Tu habitación estará lista a partir de las <strong>15:00 hrs</strong>. Recepción y Concierge operan las 24 horas para darte la bienvenida.
              </div>

              <div className="checkout-field">
                <label>Hora aproximada de llegada al resort</label>
                <select 
                  value={datosHuesped.horaLlegada} 
                  onChange={(e) => setDatosHuesped({ ...datosHuesped, horaLlegada: e.target.value })}
                >
                  <option value="15:00 - 16:00">15:00 - 16:00 (Check-in puntual)</option>
                  <option value="16:00 - 18:00">16:00 - 18:00 (Tarde)</option>
                  <option value="18:00 - 21:00">18:00 - 21:00 (Noche)</option>
                  <option value="21:00+">Llegada tardía (después de las 21:00 hrs)</option>
                </select>
              </div>

              <div className="checkout-field" style={{ marginTop: '0.8rem' }}>
                <label>Peticiones especiales (Cama King, piso alto, aniversario...)</label>
                <textarea 
                  rows="2" 
                  placeholder="Escribe tus preferencias para el equipo de concierge..."
                  value={datosHuesped.peticiones}
                  onChange={(e) => setDatosHuesped({ ...datosHuesped, peticiones: e.target.value })}
                />
              </div>
            </div>

            {/* SECCIÓN 3: OPCIONES PARA AÑADIR (ADD-ONS ESTILO BOOKING) */}
            <div className="checkout-card">
              <h3 className="checkout-card-title">
                <Sparkles size={20} color="#d4af37" />
                3. Añadir a tu Estancia (Opcional)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', background: '#14121d', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(196,181,253,0.15)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={addons.trasladoAeropuerto} 
                    onChange={(e) => setAddons({ ...addons, trasladoAeropuerto: e.target.checked })} 
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.86rem', color: '#fff' }}>Traslado Privado Aeropuerto Cancún (CUN)</strong>
                      <span style={{ color: '#f3e5ab', fontWeight: 800, fontSize: '0.84rem' }}>+$1,450 MXN</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Camioneta Suburban de lujo con chofer privado esperándote en la terminal aérea.
                    </div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', background: '#14121d', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(196,181,253,0.15)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={addons.hertzAuto} 
                    onChange={(e) => setAddons({ ...addons, hertzAuto: e.target.checked })} 
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.86rem', color: '#fff' }}>Vehículo Hertz México (Convenio Posadas)</strong>
                      <span style={{ color: '#f3e5ab', fontWeight: 800, fontSize: '0.84rem' }}>+$2,200 MXN</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Retiro y entrega de SUV o Sedan en el lobby del resort con seguro cobertura amplia.
                    </div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', background: '#14121d', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(196,181,253,0.15)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={addons.feelHarmonySpa} 
                    onChange={(e) => setAddons({ ...addons, feelHarmonySpa: e.target.checked })} 
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.86rem', color: '#fff' }}>Circuito Hidrotermal Feel Harmony Spa (2 Personas)</strong>
                      <span style={{ color: '#f3e5ab', fontWeight: 800, fontSize: '0.84rem' }}>+$1,800 MXN</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Vapor herbal, sauna seco, regaderas de sensaciones y alberca de contraste.
                    </div>
                  </div>
                </label>

              </div>
            </div>

            {/* SECCIÓN 4: GARANTÍA BANCARIA */}
            <div className="checkout-card" style={{ border: '1px solid #2a251e', background: '#0e0c0a' }}>
              <h3 className="checkout-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#d4af37' }}>
                <Wallet size={20} color="#d4af37" />
                4. Selección de Método de Liquidación y Garantía
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#8e8b82', marginBottom: '1.2rem', marginTop: '-0.3rem' }}>
                Selecciona tu forma de pago preferida registrada en tu cuenta de socio o emite una referencia electrónica con código QR.
              </p>

              {/* Selector de pestañas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setMetodoPagoTipo('tarjeta_guardada')}
                  style={{
                    padding: '0.85rem 0.5rem',
                    background: metodoPagoTipo === 'tarjeta_guardada' ? 'rgba(212,175,55,0.18)' : '#141210',
                    border: metodoPagoTipo === 'tarjeta_guardada' ? '2px solid #d4af37' : '1px solid #26221c',
                    color: metodoPagoTipo === 'tarjeta_guardada' ? '#d4af37' : '#94a3b8',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <CreditCard size={18} />
                  Tarjeta Bancaria
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPagoTipo('fiesta_card')}
                  style={{
                    padding: '0.85rem 0.5rem',
                    background: metodoPagoTipo === 'fiesta_card' ? 'rgba(212,175,55,0.18)' : '#141210',
                    border: metodoPagoTipo === 'fiesta_card' ? '2px solid #d4af37' : '1px solid #26221c',
                    color: metodoPagoTipo === 'fiesta_card' ? '#d4af37' : '#94a3b8',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Award size={18} />
                  Fiesta Rewards
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPagoTipo('qr_tiendas')}
                  style={{
                    padding: '0.85rem 0.5rem',
                    background: metodoPagoTipo === 'qr_tiendas' ? 'rgba(212,175,55,0.18)' : '#141210',
                    border: metodoPagoTipo === 'qr_tiendas' ? '2px solid #d4af37' : '1px solid #26221c',
                    color: metodoPagoTipo === 'qr_tiendas' ? '#d4af37' : '#94a3b8',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <QrCode size={18} />
                  QR / SPEI / PayPal
                </button>
              </div>

              {/* OPCIÓN 1: TARJETA BANCARIA GUARDADA */}
              {metodoPagoTipo === 'tarjeta_guardada' && (
                <div style={{ background: '#141210', border: '1px solid #2e2920', borderRadius: '8px', padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: 800, letterSpacing: '1px' }}>
                      ELIGE CON QUÉ TARJETA PAGAR ESTA ESTANCIA:
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {listaTarjetasUsuario.length} tarjetas vinculadas
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(listaTarjetasUsuario.length > 0 ? listaTarjetasUsuario : [
                      { tarjeta_bancaria_id: 1, numero_enmascarado: '•••• •••• •••• 2274', banco_emisor: 'Santander', titular_tarjeta: 'KEVIN RAMIREZ SORIA', fecha_expiracion: '05/34', es_preferida: 1, alias_tarjeta: 'MASTERCARD' },
                      { tarjeta_bancaria_id: 2, numero_enmascarado: '•••• •••• •••• 9904', banco_emisor: 'BBVA Bancomer', titular_tarjeta: 'KEVIN RAMIREZ SORIA', fecha_expiracion: '01/29', es_preferida: 0, alias_tarjeta: 'VISA' }
                    ]).map((t) => {
                      const tId = t.tarjeta_bancaria_id || t.id;
                      const esSeleccionada = tarjetaElegidaId === tId;
                      const marca = (t.alias_tarjeta?.toUpperCase().includes('MASTER') || t.numero_enmascarado?.includes('2274')) ? 'MASTERCARD' : (t.franquicia || 'VISA');

                      return (
                        <div
                          key={tId}
                          onClick={() => setTarjetaElegidaId(tId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            background: esSeleccionada ? 'linear-gradient(135deg, rgba(212,175,55,0.16) 0%, #17140f 100%)' : '#0a0908',
                            border: esSeleccionada ? '2px solid #d4af37' : '1px solid #2a251e',
                            padding: '0.95rem 1.15rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: esSeleccionada ? '0 4px 18px rgba(212,175,55,0.18)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                              width: '105px',
                              minWidth: '105px',
                              textAlign: 'center',
                              padding: '0.45rem',
                              background: '#1e1b16',
                              border: esSeleccionada ? '1px solid #d4af37' : '1px solid rgba(212,175,55,0.3)',
                              borderRadius: '4px',
                              color: '#d4af37',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              letterSpacing: '1px'
                            }}>
                              {marca}
                            </div>
                            <div>
                              <div style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '1.2px', fontFamily: 'monospace' }}>
                                {t.numero_enmascarado}
                              </div>
                              <div style={{ color: '#8e8b82', fontSize: '0.72rem', marginTop: '0.15rem' }}>
                                {t.titular_tarjeta || 'KEVIN RAMIREZ SORIA'} | {t.banco_emisor} {t.fecha_expiracion ? `(Vence ${t.fecha_expiracion})` : ''}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {esSeleccionada ? (
                              <span style={{
                                background: 'linear-gradient(135deg, #d4af37 0%, #aa8212 100%)',
                                color: '#060508',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                letterSpacing: '0.5px'
                              }}>
                                ✓ PAGAR CON ESTA
                              </span>
                            ) : (
                              <span style={{
                                background: '#1c1914',
                                border: '1px solid #443c2c',
                                color: '#94a3b8',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 600
                              }}>
                                Seleccionar
                              </span>
                            )}
                            {(t.es_preferida === 1 || t.es_preferida === true) && (
                              <span style={{
                                background: 'rgba(34,197,94,0.15)',
                                border: '1px solid #22c55e',
                                color: '#4ade80',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.62rem',
                                fontWeight: 700
                              }}>
                                PREDETERMINADA
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.9rem', marginBottom: 0 }}>
                    🔒 Puedes elegir cualquier tarjeta para esta estancia sin alterar tu tarjeta predeterminada general.
                  </p>
                </div>
              )}

              {/* OPCIÓN 2: TARJETA FIESTA REWARDS */}
              {metodoPagoTipo === 'fiesta_card' && (
                <div style={{ background: 'linear-gradient(135deg, #1c1810 0%, #0d0b08 100%)', border: '1px solid #aa8212', borderRadius: '8px', padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#e5c05b', fontWeight: 800, letterSpacing: '1px' }}>
                      TARJETA CORPORATIVA FIESTA RECOMPENSAS
                    </span>
                    <span style={{ fontSize: '0.68rem', background: 'rgba(212,175,55,0.2)', color: '#f5d77f', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid #d4af37', fontWeight: 700 }}>
                      NIVEL TITANIUM
                    </span>
                  </div>
                  <div style={{ fontSize: '1.1rem', letterSpacing: '2.5px', color: '#fff', fontWeight: 700, margin: '0.8rem 0' }}>
                    4829 9012 3456 3230
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '0.6rem' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#8e8b82' }}>SOCIO TITULAR</div>
                      <div style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 600 }}>KEVIN RAMIREZ SORIA</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.68rem', color: '#8e8b82' }}>LÍNEA DISPONIBLE</div>
                      <div style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 700 }}>$50,000.00 MXN</div>
                    </div>
                  </div>
                </div>
              )}

              {/* OPCIÓN 3: QR / SPEI / TIENDAS DEPARTAMENTALES / PAYPAL */}
              {metodoPagoTipo === 'qr_tiendas' && (
                <div style={{ background: '#141210', border: '1px solid #2e2920', borderRadius: '8px', padding: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.8rem' }}>
                    <QrCode size={18} />
                    <span>FICHA DE PAGO DIGITAL Y REFERENCIA BANCARIA</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem', alignItems: 'center', background: '#0a0908', border: '1px solid #332d22', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ background: '#fff', padding: '5px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=GFA-CODI-SPEI-PAYMENT&color=060508"
                        alt="Código QR de Pago"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>CONVENIO CIE BBVA / SPEI:</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '1.5px' }}>
                        01928374650
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem' }}>
                        Admite pago vía <strong>PayPal</strong>, <strong>CoDi / SPEI</strong>, o en cajas de <strong>OXXO</strong>, <strong>7-Eleven</strong>, <strong>Liverpool</strong> y <strong>Farmacias del Ahorro</strong>.
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#e5c05b', marginTop: '0.8rem', marginBottom: 0 }}>
                    📄 Al confirmar se generará tu <strong>Ficha de Pago en PDF</strong> con código de barras y vigencia de 48 hrs para liquidar en caja o app bancaria.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* COLUMNA DERECHA: RESUMEN LATERAL ESTILO BOOKING */}
          <aside className="checkout-summary-column">
            <div className="checkout-summary-card">
              
              <div className="summary-suite-preview">
                <div className="summary-suite-img">
                  <img 
                    src={suite?.foto_principal || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'} 
                    alt={suite?.nombre} 
                  />
                </div>
                <div className="summary-suite-info">
                  <span>{suite?.categoria || 'Suite de Lujo'}</span>
                  <h4>{suite?.nombre || 'Deluxe Ocean View Suite'}</h4>
                  <small style={{ color: '#94a3b8' }}>{noches} Noche{noches > 1 ? 's' : ''} • {adultos} Adulto(s)</small>
                </div>
              </div>

              {/* CRONOGRAMA DE FECHAS (ESTILO BOOKING) */}
              <div style={{ background: '#161420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.9rem', marginBottom: '1.2rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Entrada (Check-in):</span>
                  <strong>{fechaLlegada} (15:00 hrs)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Salida (Check-out):</span>
                  <strong>{fechaSalida} (12:00 hrs)</strong>
                </div>
              </div>

              <div className="summary-pue-banner">
                <CheckCircle2 size={16} />
                <span>Pago Único en 1 Exhibición (PUE)</span>
              </div>

              {/* DESGLOSE CONTABLE FORMAL */}
              <table className="summary-table-breakdown">
                <tbody>
                  <tr>
                    <td>Hospedaje ({noches} Noches)</td>
                    <td>${subtotalBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  {totalAddons > 0 && (
                    <tr>
                      <td>Servicios Adicionales Seleccionados</td>
                      <td style={{ color: '#f3e5ab' }}>+${totalAddons.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  <tr>
                    <td>IVA (16%)</td>
                    <td>${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>Impuesto Hospedaje Estatal (ISH 5%)</td>
                    <td>${ishe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>Derecho de Saneamiento Municipal</td>
                    <td>${saneamiento.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="summary-grand-total">
                <div>
                  <span>Total Liquidado</span>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Moneda Nacional (MXN)</div>
                </div>
                <strong>${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
              </div>

              <button 
                type="submit" 
                disabled={procesando} 
                className="btn-liquidar-estancia"
              >
                {procesando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Garantizando en SQL Server...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Confirmar y Liquidar ${totalGeneral.toLocaleString('es-MX')} MXN</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.7rem', color: '#64748b', lineHeight: 1.5 }}>
                ✓ Cancelación Flexible sin penalizaciones hasta 48 hrs antes<br />
                ✓ Conexión encriptada SSL 256-bit certificada
              </div>

            </div>
          </aside>

        </form>

        {/* MODAL DE INICIO DE SESIÓN INTEGRADO */}
        <LoginModal
          isOpen={mostrarLoginModal}
          onClose={() => setMostrarLoginModal(false)}
          onLoginSuccess={(userData) => {
            setUsuario(userData);
            setMostrarLoginModal(false);
            setErrorMsg('');
            if (userData) {
              setDatosHuesped(prev => ({
                ...prev,
                nombre: userData.nombre || prev.nombre,
                apellido: userData.apellido || prev.apellido,
                email: userData.email || prev.email,
                telefono: userData.telefono || prev.telefono
              }));
            }
          }}
        />
      </div>
          {/* MODAL OFICIAL: VOUCHER DE PAGO CONFIRMADO O FICHA QR */}
      {comprobanteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0d0b08',
            border: '2px solid #d4af37',
            borderRadius: '12px',
            maxWidth: '650px',
            width: '100%',
            padding: '2rem',
            color: '#f8fafc',
            boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Cabecera */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '1.2rem', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.85rem', letterSpacing: '3px', color: '#d4af37', fontWeight: 800 }}>GRAND FIESTA AMERICANA</div>
              <div style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#94a3b8' }}>RIVIERA MAYA CANCÚN RESORT & SPA</div>
              <div style={{
                display: 'inline-block',
                marginTop: '0.8rem',
                padding: '0.35rem 1rem',
                borderRadius: '50px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '1px',
                background: comprobanteModal.metodo === 'qr_tiendas' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)',
                color: comprobanteModal.metodo === 'qr_tiendas' ? '#facc15' : '#4ade80',
                border: comprobanteModal.metodo === 'qr_tiendas' ? '1px solid #eab308' : '1px solid #22c55e'
              }}>
                {comprobanteModal.metodo === 'qr_tiendas' ? 'FICHA DE PAGO REFERENCIADA (PENDIENTE)' : 'BAUCHER OFICIAL: PAGO CONFIRMADO'}
              </div>
            </div>

            {/* Folio y Fecha */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.82rem', marginBottom: '1.2rem' }}>
              <div>
                <span style={{ color: '#8e8b82', display: 'block', fontSize: '0.7rem' }}>FOLIO OFICIAL:</span>
                <strong style={{ color: '#d4af37', fontSize: '1.05rem', letterSpacing: '1px' }}>
                  {comprobanteModal.folio}
                </strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#8e8b82', display: 'block', fontSize: '0.7rem' }}>FECHA DE EMISIÓN:</span>
                <strong>{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
            </div>

            {/* Datos de la Estancia */}
            <div style={{ background: '#141210', border: '1px solid #26221c', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem', fontSize: '0.8rem', lineHeight: 1.6 }}>
              <div><strong>Huésped Titular:</strong> {comprobanteModal.titular}</div>
              <div><strong>Suite:</strong> {comprobanteModal.suite}</div>
              <div><strong>Estancia:</strong> {comprobanteModal.llegada} al {comprobanteModal.salida} ({comprobanteModal.noches} Noches)</div>
              <div><strong>Modalidad de Pago:</strong> {
                comprobanteModal.metodo === 'fiesta_card' ? 'Línea de Crédito Fiesta Rewards (•••• 8993)' :
                (comprobanteModal.metodo === 'qr_tiendas' ? 'Referencia QR / SPEI / Tiendas de Conveniencia' : 'Tarjeta Bancaria ()')
              }</div>
            </div>

            {/* Ficha QR si es Pago Digital */}
            {comprobanteModal.metodo === 'qr_tiendas' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', background: '#1a1610', border: '1px dashed #eab308', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ background: '#fff', padding: '6px', borderRadius: '6px' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${comprobanteModal.folio}&color=060508`}
                    alt="QR de Pago"
                    style={{ width: '90px', height: '90px', display: 'block' }}
                  />
                </div>
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ color: '#facc15', fontWeight: 800 }}>INSTRUCCIONES DE LIQUIDACIÓN:</div>
                  <div style={{ color: '#cbd5e1', marginTop: '0.3rem' }}>
                    Presenta esta ficha en cajas de <strong>OXXO</strong>, <strong>7-Eleven</strong> o realiza una transferencia <strong>SPEI</strong> con el folio como concepto. Vigencia: 48 horas.
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(212,175,55,0.3)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>MONTO TOTAL (Impuestos incluidos):</span>
              <strong style={{ fontSize: '1.35rem', color: '#d4af37' }}>${Number(comprobanteModal.total).toLocaleString('es-MX')} MXN</strong>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #aa8212 100%)',
                  color: '#060508',
                  padding: '0.85rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Printer size={16} />
                Imprimir / Guardar PDF
              </button>

              <button
                type="button"
                onClick={() => navigate('/perfil-socio')}
                style={{
                  background: '#1e1b16',
                  color: '#d4af37',
                  border: '1px solid #d4af37',
                  padding: '0.85rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Ver en Mi Perfil Socio
              </button>
            </div>
          </div>
        </div>
      )}
</div>
  );
}
