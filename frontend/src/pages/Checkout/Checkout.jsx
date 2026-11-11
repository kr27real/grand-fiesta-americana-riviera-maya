import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSuites, createReservation } from '../../services/api';
import { 
  Building2, Users, Baby, Calendar, Sparkles, CreditCard, ShieldCheck, 
  Printer, CheckCircle2, AlertCircle, FileText, Lock, ChevronRight, ArrowLeft, Tag
} from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state || {};

  // 1. Catálogos y Estado Global
  const [suitesDisponibles, setSuitesDisponibles] = useState([]);
  const [suiteSeleccionada, setSuiteSeleccionada] = useState(null);
  const [tarjetasBoveda, setTarjetasBoveda] = useState([]);
  const [fiestaCard, setFiestaCard] = useState(null);

  // 2. Parámetros de Estancia recibidos de Disponibilidad.jsx
  const [fechaLlegada, setFechaLlegada] = useState(stateData.fecha_llegada || '2026-12-01');
  const [fechaSalida, setFechaSalida] = useState(stateData.fecha_salida || '2026-12-04');
  const [adultos, setAdultos] = useState(stateData.adultos || 2);
  const [ninos, setNinos] = useState(stateData.ninos || 0);
  const [planTarifarioNombre, setPlanTarifarioNombre] = useState(stateData.plan_tarifario || 'Tarifa Flexible All-Inclusive');
  const [precioNocheAplicado, setPrecioNocheAplicado] = useState(stateData.precio_noche_base || 6200);

  // 3. Personalización de Confort & Servicios Extras (Enhancements)
  const [preferenciaAlmohada, setPreferenciaAlmohada] = useState('Pluma de Ganso Hipoalergénica');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState({
    trasladoSuburban: false,
    cenaPlaya: false,
    masajePareja: false,
    champagneMoet: false,
    earlyCheckin: false
  });
  const [peticionesEspeciales, setPeticionesEspeciales] = useState('');

  // 4. Datos del Huésped
  const [datosHuesped, setDatosHuesped] = useState({
    nombres: 'Kevin',
    apellidos: 'Ramirez Soria',
    email: 'jerrysoria32@gmail.com',
    telefono: '5548166341',
    pais: 'México',
    fiestaRewardsId: 'FR-849201'
  });

  // 5. Método de Pago
  const [metodoPago, setMetodoPago] = useState('tarjeta_guardada');
  const [tarjetaIdSeleccionada, setTarjetaIdSeleccionada] = useState(null);
  const [nuevaTarjeta, setNuevaTarjeta] = useState({
    titular: '',
    numero: '',
    exp: '',
    cvv: ''
  });

  // 6. Estados de Control Transaccional
  const [procesando, setProcesando] = useState(false);
  const [errorTransaccion, setErrorTransaccion] = useState('');
  const [reservacionExitosa, setReservacionExitosa] = useState(null);

  useEffect(() => {
    async function inicializar() {
      try {
        const suites = await fetchSuites();
        setSuitesDisponibles(suites);

        if (stateData.suite_id) {
          const match = suites.find(s => s.suite_id === Number(stateData.suite_id));
          if (match) {
            setSuiteSeleccionada(match);
            if (!stateData.precio_noche_base) {
              setPrecioNocheAplicado(Number(match.precio_noche_base));
            }
          }
        } else if (suites.length > 0) {
          setSuiteSeleccionada(suites[0]);
          setPrecioNocheAplicado(Number(suites[0].precio_noche_base));
        }

        const usuarioId = localStorage.getItem('usuario_id') || 1;
        const resBilletera = await fetch(`http://localhost:5000/api/billetera/usuario/${usuarioId}`).catch(() => null);
        if (resBilletera && resBilletera.ok) {
          const dataBilletera = await resBilletera.json();
          if (dataBilletera.tarjetas_bancarias) {
            setTarjetasBoveda(dataBilletera.tarjetas_bancarias);
            if (dataBilletera.tarjetas_bancarias.length > 0) {
              setTarjetaIdSeleccionada(dataBilletera.tarjetas_bancarias[0].tarjeta_bancaria_id);
            }
          }
          if (dataBilletera.fiesta_card) {
            setFiestaCard(dataBilletera.fiesta_card);
          }
        }
      } catch (err) {
        console.error('Error al inicializar checkout:', err);
      }
    }
    inicializar();
  }, []);

  const catalogoExtras = [
    { id: 'trasladoSuburban', dbId: 5, nombre: 'Traslado Redondo Privado en Suburban Luxury', precio: 3200.00 },
    { id: 'cenaPlaya', dbId: 7, nombre: 'Cena Romántica 4 Tiempos Frente al Arrecife', precio: 4500.00 },
    { id: 'masajePareja', dbId: 9, nombre: 'Masaje Holístico Maya en Pareja (80 min)', precio: 5400.00 },
    { id: 'champagneMoet', dbId: 8, nombre: 'Botella Moët & Chandon Brut Imperial en Suite', precio: 2900.00 },
    { id: 'earlyCheckin', dbId: 10, nombre: 'Check-in Temprano Garantizado (11:00 hrs)', precio: 1200.00 }
  ];

  const calcularNoches = () => {
    const d1 = new Date(fechaLlegada);
    const d2 = new Date(fechaSalida);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };
  const totalNoches = calcularNoches();

  // Matriz Contable SAT Quintana Roo
  const subtotalHospedaje = Number(precioNocheAplicado) * totalNoches;

  const totalExtras = catalogoExtras.reduce((acc, item) => {
    return serviciosSeleccionados[item.id] ? acc + item.precio : acc;
  }, 0);

  const subtotalGravable = subtotalHospedaje + totalExtras;
  const impuestoIVA = parseFloat((subtotalGravable * 0.16).toFixed(2));
  const impuestoISH = parseFloat((subtotalHospedaje * 0.05).toFixed(2));
  const saneamientoAmbiental = parseFloat((76.00 * totalNoches).toFixed(2));
  const totalGeneral = parseFloat((subtotalGravable + impuestoIVA + impuestoISH + saneamientoAmbiental).toFixed(2));

  const toggleExtra = (id) => {
    setServiciosSeleccionados(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmarReservacion = async (e) => {
    e.preventDefault();
    setErrorTransaccion('');
    setProcesando(true);

    try {
      if (suiteSeleccionada && (suiteSeleccionada.suite_id === 3 || suiteSeleccionada.suite_id === 6) && ninos > 0) {
        throw new Error('Esta suite se ubica en sección Adults-Only (+18). No se admiten menores.');
      }

      const extrasArray = catalogoExtras
        .filter(item => serviciosSeleccionados[item.id])
        .map(item => ({
          servicio_id: item.dbId,
          nombre: item.nombre,
          cantidad: 1,
          precio_unitario: item.precio,
          subtotal: item.precio
        }));

      let terminacion = '4829';
      if (metodoPago === 'tarjeta_guardada' && tarjetasBoveda.length > 0) {
        const tarjetaElegida = tarjetasBoveda.find(t => t.tarjeta_bancaria_id === tarjetaIdSeleccionada);
        if (tarjetaElegida) terminacion = tarjetaElegida.numero_enmascarado.slice(-4);
      } else if (metodoPago === 'nueva_tarjeta') {
        terminacion = nuevaTarjeta.numero.replace(/\s+/g, '').slice(-4) || '7712';
      } else if (metodoPago === 'fiesta_card') {
        terminacion = 'FCARD';
      }

      const payload = {
        usuario_id: localStorage.getItem('usuario_id') || 1,
        suite_id: suiteSeleccionada.suite_id,
        fecha_llegada: fechaLlegada,
        fecha_salida: fechaSalida,
        noches: totalNoches,
        adultos: adultos,
        ninos: ninos,
        preferencia_almohada: preferenciaAlmohada,
        servicios_adicionales: extrasArray,
        peticiones_especiales: peticionesEspeciales,
        subtotal: subtotalGravable,
        iva: impuestoIVA,
        ishe: impuestoISH,
        saneamiento_ambiental: saneamientoAmbiental,
        total_general: totalGeneral,
        metodo_pago_tipo: metodoPago === 'fiesta_card' ? 'fiesta_card' : 'tarjeta_credito',
        terminacion_tarjeta: terminacion,
        estatus_reservacion: 'Confirmada'
      };

      const res = await createReservation(payload);

      if (res && (res.folio || res.reservacion)) {
        setReservacionExitosa({
          folio: res.folio || res.reservacion.folio_confirmacion,
          ...payload,
          nombre_suite: suiteSeleccionada.nombre,
          plan_tarifario: planTarifarioNombre,
          nombres: datosHuesped.nombres,
          apellidos: datosHuesped.apellidos,
          email: datosHuesped.email,
          telefono: datosHuesped.telefono
        });
      } else {
        throw new Error(res.error || 'No se pudo generar el folio en SQL Server.');
      }
    } catch (err) {
      setErrorTransaccion(err.message || 'Error transaccional en el procesamiento del pago.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="checkout-master-page">
      
      {/* 1. BREADCRUMB DEL EMBUDO COMERCIAL */}
      <div className="checkout-stepper-header">
        <div className="checkout-container stepper-content">
          <button type="button" className="btn-back" onClick={() => navigate('/disponibilidad')}>
            <ArrowLeft size={16} /> Volver a Selección de Tarifas
          </button>
          
          <div className="stepper-track">
            <span className="step-badge completed">1. Catálogo Suites</span>
            <span className="step-arrow">›</span>
            <span className="step-badge completed">2. Fechas & Tarifas</span>
            <span className="step-arrow">›</span>
            <span className="step-badge current">3. Personalización & Pago</span>
          </div>
        </div>
      </div>

      <div className="checkout-container">

        {/* RESERVACIÓN CONFIRMADA CON ÉXITO */}
        {reservacionExitosa ? (
          <div className="checkout-success-box">
            <div className="success-header">
              <CheckCircle2 size={56} color="#22c55e" />
              <span className="gold-subtitle">TRANSACCIÓN COMPLETADA EN SQL SERVER</span>
              <h1>¡Estancia Confirmada en Grand Fiesta Americana!</h1>
              <p>Tu reservación ha sido garantizada bajo el plan {reservacionExitosa.plan_tarifario}.</p>
            </div>

            <div className="voucher-preview-card" id="voucher-imprimible">
              <div className="voucher-card-top">
                <div>
                  <h3 className="serif-title">Grand Fiesta Americana</h3>
                  <span>Riviera Cancún Resort & Spa — All-Inclusive Luxury</span>
                </div>
                <div className="folio-stamp">
                  <small>FOLIO OFICIAL</small>
                  <strong>{reservacionExitosa.folio}</strong>
                </div>
              </div>

              <div className="voucher-grid-details">
                <div>
                  <label>Titular de la Cuenta</label>
                  <strong>{reservacionExitosa.nombres} {reservacionExitosa.apellidos}</strong>
                  <span>{reservacionExitosa.email}</span>
                </div>
                <div>
                  <label>Suite y Plan</label>
                  <strong>{reservacionExitosa.nombre_suite}</strong>
                  <span>{reservacionExitosa.plan_tarifario}</span>
                </div>
                <div>
                  <label>Fechas de Estancia</label>
                  <strong>{reservacionExitosa.fecha_llegada} al {reservacionExitosa.fecha_salida}</strong>
                  <span>{reservacionExitosa.noches} noche(s) • {reservacionExitosa.adultos} adultos {reservacionExitosa.ninos > 0 ? `• ${reservacionExitosa.ninos} niños` : ''}</span>
                </div>
                <div>
                  <label>Total Liquidado SAT</label>
                  <strong className="text-gold">${Number(reservacionExitosa.total_general).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                  <span>Método: **** {reservacionExitosa.terminacion_tarjeta}</span>
                </div>
              </div>

              <div className="voucher-qr-section">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=GFA:${reservacionExitosa.folio}`} 
                  alt="QR Acceso" 
                />
                <div className="qr-text">
                  <strong>Pase de Recepción Inmediato (Fast Check-in)</strong>
                  <p>Presenta este código al ingresar al lobby o helipuerto para entrega de llaves RFID y brazalete All-Inclusive.</p>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <button type="button" className="btn-gold" onClick={() => window.print()}>
                <Printer size={16} /> Imprimir / Descargar Voucher PDF
              </button>
              <button type="button" className="btn-dark" onClick={() => navigate('/perfil-socio')}>
                Ir a mi Perfil de Socio <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE CHECKOUT Y CUENTA MAESTRA */
          <div className="checkout-layout-grid">

            <div className="checkout-main-content">
              <div className="checkout-header-title">
                <span className="gold-subtitle">PASARELA TRANSACCIONAL HOTELERA</span>
                <h1>Personalización y Pago de Estancia</h1>
                <p>Configura tus preferencias exclusivas y liquida tu reservación de forma blindada.</p>
              </div>

              {errorTransaccion && (
                <div className="checkout-alert-error">
                  <AlertCircle size={20} color="#ef4444" />
                  <span>{errorTransaccion}</span>
                </div>
              )}

              <form onSubmit={handleConfirmarReservacion}>
                
                {/* 1. SUITE SELECCIONADA Y PLAN TARIFARIO */}
                <div className="checkout-section-card">
                  <div className="section-title">
                    <Building2 size={20} color="#c7af8b" />
                    <h3>1. Suite y Plan Asignado</h3>
                  </div>

                  <div className="suite-assigned-banner">
                    <div>
                      <strong>{suiteSeleccionada ? suiteSeleccionada.nombre : 'Cargando suite...'}</strong>
                      <span className="plan-tag-assigned"><Tag size={12} /> {planTarifarioNombre}</span>
                    </div>
                    <button type="button" className="btn-change-suite" onClick={() => navigate('/disponibilidad')}>
                      Modificar
                    </button>
                  </div>

                  <div className="form-row-2" style={{ marginTop: '1rem' }}>
                    <div className="input-group">
                      <label>Fechas de Hospedaje</label>
                      <input 
                        type="text" 
                        value={`${fechaLlegada} al ${fechaSalida} (${totalNoches} noches)`} 
                        disabled 
                      />
                    </div>
                    <div className="input-group">
                      <label>Aforo Registrado</label>
                      <input 
                        type="text" 
                        value={`${adultos} Adulto(s) ${ninos > 0 ? `• ${ninos} Niño(s)` : ''}`} 
                        disabled 
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PERSONALIZACIÓN DE ESTANCIA (ENHANCEMENTS) */}
                <div className="checkout-section-card">
                  <div className="section-title">
                    <Sparkles size={20} color="#c7af8b" />
                    <h3>2. Personalización de Confort & Experiencias</h3>
                  </div>

                  <div className="input-group" style={{ marginBottom: '1.2rem' }}>
                    <label>Menú de Almohadas de Cortesía (Garantizado en Suite)</label>
                    <select 
                      value={preferenciaAlmohada} 
                      onChange={(e) => setPreferenciaAlmohada(e.target.value)}
                    >
                      <option value="Pluma de Ganso Hipoalergénica">Pluma de Ganso Hipoalergénica (Suavidad Pluma)</option>
                      <option value="Memory Foam Anatómica">Memory Foam Anatómica con Gel Refrigerante</option>
                      <option value="Aromaterapia de Lavanda Relajante">Aromaterapia de Lavanda Francesa</option>
                      <option value="Ortopédica Firmeza Alta">Ortopédica con Soporte Cervical Firme</option>
                    </select>
                  </div>

                  <label className="extras-title">Servicios Adicionales Oficiales del Resort:</label>
                  <div className="extras-grid">
                    {catalogoExtras.map(item => (
                      <div 
                        key={item.id} 
                        className={`extra-item-card ${serviciosSeleccionados[item.id] ? 'selected' : ''}`}
                        onClick={() => toggleExtra(item.id)}
                      >
                        <input 
                          type="checkbox" 
                          checked={serviciosSeleccionados[item.id]} 
                          readOnly 
                        />
                        <div className="extra-info">
                          <strong>{item.nombre}</strong>
                          <span>+ ${item.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="input-group" style={{ marginTop: '1.2rem' }}>
                    <label>Instrucciones de Mayordomía y Concierge</label>
                    <textarea 
                      rows="2" 
                      placeholder="Ej. Arribo en vuelo vespertino, celebración de aniversario, etc."
                      value={peticionesEspeciales}
                      onChange={(e) => setPeticionesEspeciales(e.target.value)}
                    />
                  </div>
                </div>

                {/* 3. INFORMACIÓN DEL HUÉSPED */}
                <div className="checkout-section-card">
                  <div className="section-title">
                    <Users size={20} color="#c7af8b" />
                    <h3>3. Información del Huésped Titular</h3>
                  </div>

                  <div className="form-row-2">
                    <div className="input-group">
                      <label>Nombre(s)</label>
                      <input 
                        type="text" 
                        value={datosHuesped.nombres} 
                        onChange={(e) => setDatosHuesped({ ...datosHuesped, nombres: e.target.value })} 
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>Apellido(s)</label>
                      <input 
                        type="text" 
                        value={datosHuesped.apellidos} 
                        onChange={(e) => setDatosHuesped({ ...datosHuesped, apellidos: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="input-group">
                      <label>Correo Electrónico (Para envío de voucher)</label>
                      <input 
                        type="email" 
                        value={datosHuesped.email} 
                        onChange={(e) => setDatosHuesped({ ...datosHuesped, email: e.target.value })} 
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>Teléfono Celular (10 dígitos)</label>
                      <input 
                        type="tel" 
                        value={datosHuesped.telefono} 
                        onChange={(e) => setDatosHuesped({ ...datosHuesped, telefono: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* 4. PASARELA BANCARIA Y FIESTA CARD */}
                <div className="checkout-section-card">
                  <div className="section-title">
                    <CreditCard size={20} color="#c7af8b" />
                    <h3>4. Pasarela y Bóveda Bancaria</h3>
                  </div>

                  <div className="payment-method-selector">
                    {tarjetasBoveda.length > 0 && (
                      <button 
                        type="button" 
                        className={`pm-btn ${metodoPago === 'tarjeta_guardada' ? 'active' : ''}`}
                        onClick={() => setMetodoPago('tarjeta_guardada')}
                      >
                        Bóveda de Tarjetas ({tarjetasBoveda.length})
                      </button>
                    )}
                    <button 
                      type="button" 
                      className={`pm-btn ${metodoPago === 'nueva_tarjeta' ? 'active' : ''}`}
                      onClick={() => setMetodoPago('nueva_tarjeta')}
                    >
                      Nueva Tarjeta Bancaria
                    </button>
                    {fiestaCard && (
                      <button 
                        type="button" 
                        className={`pm-btn ${metodoPago === 'fiesta_card' ? 'active' : ''}`}
                        onClick={() => setMetodoPago('fiesta_card')}
                      >
                        Fiesta Card Digital
                      </button>
                    )}
                  </div>

                  {metodoPago === 'tarjeta_guardada' && tarjetasBoveda.length > 0 && (
                    <div className="saved-cards-list">
                      {tarjetasBoveda.map(t => (
                        <label key={t.tarjeta_bancaria_id} className={`card-radio-box ${tarjetaIdSeleccionada === t.tarjeta_bancaria_id ? 'checked' : ''}`}>
                          <input 
                            type="radio" 
                            name="tarjeta_guardada" 
                            checked={tarjetaIdSeleccionada === t.tarjeta_bancaria_id}
                            onChange={() => setTarjetaIdSeleccionada(t.tarjeta_bancaria_id)}
                          />
                          <div className="card-radio-info">
                            <strong>{t.alias_tarjeta} • {t.marca_tarjeta}</strong>
                            <span>{t.numero_enmascarado} (Vence: {t.mes_expiracion}/{t.anio_expiracion})</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {metodoPago === 'nueva_tarjeta' && (
                    <div className="new-card-form">
                      <div className="input-group">
                        <label>Titular de la Tarjeta</label>
                        <input 
                          type="text" 
                          placeholder="KEVIN RAMIREZ SORIA"
                          value={nuevaTarjeta.titular}
                          onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, titular: e.target.value.toUpperCase() })}
                          required={metodoPago === 'nueva_tarjeta'}
                        />
                      </div>
                      <div className="input-group">
                        <label>Número de Tarjeta</label>
                        <input 
                          type="text" 
                          placeholder="4829 •••• •••• 7712"
                          maxLength="19"
                          value={nuevaTarjeta.numero}
                          onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, numero: e.target.value })}
                          required={metodoPago === 'nueva_tarjeta'}
                        />
                      </div>
                      <div className="form-row-2">
                        <div className="input-group">
                          <label>Expiración (MM/AA)</label>
                          <input 
                            type="text" 
                            placeholder="12/28" 
                            maxLength="5"
                            value={nuevaTarjeta.exp}
                            onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, exp: e.target.value })}
                            required={metodoPago === 'nueva_tarjeta'}
                          />
                        </div>
                        <div className="input-group">
                          <label>CVV / CVC</label>
                          <input 
                            type="password" 
                            placeholder="•••" 
                            maxLength="4"
                            value={nuevaTarjeta.cvv}
                            onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, cvv: e.target.value })}
                            required={metodoPago === 'nueva_tarjeta'}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {metodoPago === 'fiesta_card' && fiestaCard && (
                    <div className="fiesta-card-pay-box">
                      <div className="fc-header">
                        <span className="fc-chip"></span>
                        <strong className="fc-brand">FIESTA REWARDS PRIVILEGE</strong>
                      </div>
                      <span className="fc-num">{fiestaCard.numero_enmascarado}</span>
                      <div className="fc-footer">
                        <span>Línea Disponible: ${Number(fiestaCard.saldo_disponible).toLocaleString('es-MX')} MXN</span>
                        <span>Exp: {fiestaCard.fecha_expiracion}</span>
                      </div>
                    </div>
                  )}

                  <div className="security-badge">
                    <Lock size={15} color="#22c55e" />
                    <span>Transacción bancaria cifrada TLS 1.3 con tokenización y bloqueo pesimista en SQL Server.</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={procesando} 
                  className={`btn-confirmar-pago ${procesando ? 'btn-loading' : ''}`}
                >
                  {procesando ? (
                    'Procesando Transacción en SQL Server...'
                  ) : (
                    <>Confirmar y Liquidar Estancia (${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN) <ChevronRight size={18} /></>
                  )}
                </button>
              </form>
            </div>

            {/* RESUMEN CONTABLE LATERAL STICKY */}
            <div className="checkout-summary-sidebar">
              <div className="summary-card">
                <span className="gold-subtitle">CUENTA MAESTRA DE ESTANCIA</span>
                <h2>Resumen Contable</h2>

                {suiteSeleccionada && (
                  <div className="summary-suite-thumb">
                    <img src={suiteSeleccionada.foto_principal} alt={suiteSeleccionada.nombre} />
                    <div className="thumb-info">
                      <strong>{suiteSeleccionada.nombre}</strong>
                      <span className="plan-name-summary">{planTarifarioNombre}</span>
                      <span>{totalNoches} noche(s) • {adultos} adultos {ninos > 0 ? `• ${ninos} niños` : ''}</span>
                    </div>
                  </div>
                )}

                <div className="summary-ledger">
                  <div className="ledger-row">
                    <span>Hospedaje All-Inclusive ({totalNoches} noches)</span>
                    <strong>${subtotalHospedaje.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                  </div>

                  {totalExtras > 0 && (
                    <div className="ledger-row">
                      <span>Servicios Extras & Confort</span>
                      <strong>${totalExtras.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  )}

                  <div className="ledger-row tax">
                    <span>IVA Trasladado (16%)</span>
                    <span>${impuestoIVA.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="ledger-row tax">
                    <span>Impuesto Sobre Hospedaje (ISH 5%)</span>
                    <span>${impuestoISH.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="ledger-row tax">
                    <span>Saneamiento Ambiental Mpal. (Q. Roo)</span>
                    <span>${saneamientoAmbiental.toFixed(2)}</span>
                  </div>

                  <div className="ledger-total">
                    <span>TOTAL GENERAL SAT:</span>
                    <strong>${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                  </div>
                </div>

                <div className="summary-rewards-badge">
                  <Sparkles size={16} color="#c7af8b" />
                  <span>Esta estancia genera <strong>{Math.floor(totalGeneral * 0.10)} Puntos Fiesta Rewards</strong> y {totalNoches} noches de estatus para tu cuenta.</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}