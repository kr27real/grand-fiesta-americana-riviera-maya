import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSuites, createReservation } from '../../services/api';
import { 
  Building2, Users, Sparkles, CreditCard, 
  Printer, CheckCircle2, AlertCircle, Lock, ChevronRight, ArrowLeft, Tag, Award
} from 'lucide-react';
import './Checkout.css';

const API_BASE = 'http://localhost:5000/api';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state || {};

  // Obtener sesión real de SQL Server desde localStorage
  const [usuarioActivo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || localStorage.getItem('usuario_gfa') || 'null');
    } catch {
      return null;
    }
  });

  // 1. Catálogos y Estado Global
  const [suitesDisponibles, setSuitesDisponibles] = useState([]);
  const [suiteSeleccionada, setSuiteSeleccionada] = useState(null);
  const [tarjetasBoveda, setTarjetasBoveda] = useState([]);
  const [fiestaCard, setFiestaCard] = useState({
    saldo_disponible: 50000.00,
    linea_credito_total: 50000.00,
    numero_enmascarado: '4829 •••• •••• 7788',
    puntos_rewards_acumulados: 500,
    fecha_expiracion: '11/30'
  });

  // 2. Parámetros de Estancia recibidos de Disponibilidad.jsx
  const [fechaLlegada] = useState(stateData.fecha_llegada || '2026-12-01');
  const [fechaSalida] = useState(stateData.fecha_salida || '2026-12-05');
  const [adultos] = useState(Number(stateData.adultos) || 2);
  const [ninos] = useState(Number(stateData.ninos) || 0);
  const [planTarifarioNombre] = useState(stateData.plan_tarifario || 'Tarifa Flexible All-Inclusive');
  const [codigoPromocion] = useState(stateData.codigo_promocion || null);
  const [precioNocheAplicado, setPrecioNocheAplicado] = useState(Number(stateData.precio_noche_base) || 6200);

  // 3. Personalización de Confort & Servicios Extras
  const [preferenciaAlmohada, setPreferenciaAlmohada] = useState('Pluma de Ganso Hipoalergénica');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState({
    trasladoSuburban: false,
    cenaPlaya: false,
    masajePareja: false,
    champagneMoet: false,
    earlyCheckin: false
  });
  const [peticionesEspeciales, setPeticionesEspeciales] = useState('');

  // 4. Datos del Huésped (Precargados dinámicamente desde la sesión real SQL)
  const [datosHuesped, setDatosHuesped] = useState({
    nombres: usuarioActivo?.nombres || usuarioActivo?.nombre || 'Kevin',
    apellidos: usuarioActivo?.apellidos || usuarioActivo?.apellido || 'Ramirez Soria',
    email: usuarioActivo?.email || 'jerrysoria32@gmail.com',
    telefono: usuarioActivo?.telefono || '5548166341',
    pais: usuarioActivo?.pais || 'México',
    fiestaRewardsId: usuarioActivo?.fiesta_rewards_id || 'FR-412600'
  });

  // 5. Método de Pago y Pasarela 3D
  const [metodoPago, setMetodoPago] = useState('nueva_tarjeta');
  const [tarjetaIdSeleccionada, setTarjetaIdSeleccionada] = useState(null);
  const [nuevaTarjeta, setNuevaTarjeta] = useState({
    titular: `${usuarioActivo?.nombres || ''} ${usuarioActivo?.apellidos || ''}`.trim().toUpperCase(),
    numero: '',
    exp: '',
    cvv: ''
  });
  const [mesesSinIntereses, setMesesSinIntereses] = useState(1); // 1 | 3 | 6 | 12 | 18
  const [usarPuntosRewards, setUsarPuntosRewards] = useState(false);
  const [guardarNuevaEnBoveda, setGuardarNuevaEnBoveda] = useState(true);
  const [cvvEnfocado, setCvvEnfocado] = useState(false);
  const [cvvBovedaConfirm, setCvvBovedaConfirm] = useState('');

  // 6. Estados de Control Transaccional
  const [procesando, setProcesando] = useState(false);
  const [errorTransaccion, setErrorTransaccion] = useState('');
  const [reservacionExitosa, setReservacionExitosa] = useState(null);

  useEffect(() => {
    async function inicializar() {
      const uid = usuarioActivo?.usuario_id || usuarioActivo?.id || 1;
      const token = localStorage.getItem('token') || localStorage.getItem('token_gfa');

      try {
        const suites = await fetchSuites().catch(() => []);
        const listaSuites = Array.isArray(suites) ? suites : [];
        setSuitesDisponibles(listaSuites);

        if (stateData.suite_id) {
          const match = listaSuites.find(s => Number(s.suite_id) === Number(stateData.suite_id));
          if (match) {
            setSuiteSeleccionada(match);
            if (!stateData.precio_noche_base) {
              setPrecioNocheAplicado(Number(match.precio_noche_base));
            }
          } else {
            setSuiteSeleccionada({
              suite_id: stateData.suite_id,
              nombre: stateData.nombre_suite || 'Deluxe Suite Riviera',
              foto_principal: stateData.foto_principal || 'https://image-tc.galaxy.tf/wipng-ewud5ufube3uynaref2e2bpvy/render-hab-king-5_standard.png',
              capacidad_ninos: 2
            });
          }
        } else if (listaSuites.length > 0) {
          setSuiteSeleccionada(listaSuites[0]);
          setPrecioNocheAplicado(Number(listaSuites[0].precio_noche_base));
        }

        // Cargar Billetera y Fiesta Card desde SQL Server
        const resBilletera = await fetch(`${API_BASE}/billetera/${uid}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }).catch(() => null);

        if (resBilletera && resBilletera.ok) {
          const dataBilletera = await resBilletera.json();
          if (Array.isArray(dataBilletera.tarjetas_bancarias) && dataBilletera.tarjetas_bancarias.length > 0) {
            setTarjetasBoveda(dataBilletera.tarjetas_bancarias);
            const pred = dataBilletera.tarjetas_bancarias.find(t => t.es_preferida || t.es_predeterminada) || dataBilletera.tarjetas_bancarias[0];
            setTarjetaIdSeleccionada(pred.tarjeta_bancaria_id);
            setMetodoPago('tarjeta_guardada');
          }
          const fc = dataBilletera.fiesta_card || dataBilletera;
          if (fc && fc.saldo_disponible !== undefined) {
            setFiestaCard({
              saldo_disponible: parseFloat(fc.saldo_disponible) || 50000.00,
              linea_credito_total: parseFloat(fc.linea_credito_total) || 50000.00,
              numero_enmascarado: fc.numero_enmascarado || '4829 •••• •••• 7788',
              puntos_rewards_acumulados: fc.puntos_rewards_acumulados || 500,
              fecha_expiracion: fc.fecha_expiracion || '11/30'
            });
          }
        }
      } catch (err) {
        console.error('Error al inicializar checkout:', err);
      }
    }
    inicializar();
  }, []);

  // Helpers visuales de tarjeta 3D
  const detectarFranquicia = (num) => {
    const limpio = (num || '').replace(/\D/g, '');
    if (limpio.startsWith('4')) return { marca: 'VISA', clase: 'card-visa' };
    if (/^(5[1-5]|2[2-7])/.test(limpio)) return { marca: 'MASTERCARD', clase: 'card-mc' };
    if (/^3[47]/.test(limpio)) return { marca: 'AMEX', clase: 'card-amex' };
    return { marca: 'POSADAS PAY', clase: 'card-default' };
  };

  const formatearNumeroTarjeta = (valor) => {
    const soloDigitos = valor.replace(/\D/g, '').slice(0, 16);
    return soloDigitos.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatearExpiracion = (valor) => {
    const soloDigitos = valor.replace(/\D/g, '').slice(0, 4);
    if (soloDigitos.length >= 3) return `${soloDigitos.slice(0, 2)}/${soloDigitos.slice(2)}`;
    return soloDigitos;
  };

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

  // Matriz Contable Unificada SAT Quintana Roo + Puntos Rewards + MSI
  const subtotalHospedaje = Number(precioNocheAplicado) * totalNoches;

  const totalExtras = catalogoExtras.reduce((acc, item) => {
    return serviciosSeleccionados[item.id] ? acc + item.precio : acc;
  }, 0);

  const puntosDisponibles = Number(fiestaCard?.puntos_rewards_acumulados || 500);
  const valorPuntosMxn = puntosDisponibles * 0.50;
  const descuentoPuntos = usarPuntosRewards ? Math.min(valorPuntosMxn, subtotalHospedaje * 0.25) : 0;

  const subtotalGravable = Math.max(0, (subtotalHospedaje - descuentoPuntos) + totalExtras);
  const impuestoIVA = parseFloat((subtotalGravable * 0.16).toFixed(2));
  const impuestoISH = parseFloat((Math.max(0, subtotalHospedaje - descuentoPuntos) * 0.05).toFixed(2));
  const saneamientoAmbiental = parseFloat((33.00 * totalNoches).toFixed(2));
  const totalGeneral = parseFloat((subtotalGravable + impuestoIVA + impuestoISH + saneamientoAmbiental).toFixed(2));
  const montoMensualidad = parseFloat((totalGeneral / mesesSinIntereses).toFixed(2));
  const puntosAGanar = Math.round((subtotalGravable / 18.50) * 10);

  const toggleExtra = (id) => {
    setServiciosSeleccionados(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmarReservacion = async (e) => {
    e.preventDefault();
    setErrorTransaccion('');
    setProcesando(true);

    try {
      if (suiteSeleccionada && Number(suiteSeleccionada.capacidad_ninos) === 0 && ninos > 0) {
        throw new Error('Esta suite se ubica en sección Adults-Only (+18). No se admiten menores.');
      }

      if (metodoPago === 'fiesta_card' && fiestaCard.saldo_disponible < totalGeneral) {
        throw new Error(`Saldo insuficiente en Fiesta Card ($${fiestaCard.saldo_disponible.toLocaleString('es-MX')} MXN disponibles).`);
      }

      if (metodoPago === 'tarjeta_guardada' && cvvBovedaConfirm.length < 3) {
        throw new Error('Ingresa el código de seguridad (CVV) de tu tarjeta seleccionada en bóveda.');
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

      const uid = usuarioActivo?.usuario_id || usuarioActivo?.id || 1;
      let terminacion = '4829';

      if (metodoPago === 'tarjeta_guardada' && tarjetasBoveda.length > 0) {
        const tarjetaElegida = tarjetasBoveda.find(t => t.tarjeta_bancaria_id === tarjetaIdSeleccionada);
        if (tarjetaElegida) {
          terminacion = (tarjetaElegida.ultimos_cuatro || tarjetaElegida.numero_enmascarado || '4829').slice(-4);
        }
      } else if (metodoPago === 'nueva_tarjeta') {
        const cleanNum = nuevaTarjeta.numero.replace(/\s+/g, '');
        if (cleanNum.length < 15) {
          throw new Error('Por favor ingresa un número de tarjeta válido (15 o 16 dígitos).');
        }
        terminacion = cleanNum.slice(-4);

        // Guardar plástico tokenizado en SQL Server si el socio activó la casilla
        if (guardarNuevaEnBoveda) {
          const franquicia = detectarFranquicia(cleanNum);
          const [mExp, aExp] = nuevaTarjeta.exp.split('/');
          await fetch(`${API_BASE}/billetera`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('token_gfa')}`
            },
            body: JSON.stringify({
              usuario_id: uid,
              alias_tarjeta: `Tarjeta ${franquicia.marca}`,
              banco_emisor: franquicia.marca,
              marca_tarjeta: franquicia.marca,
              tipo_cuenta: 'Crédito',
              numero_enmascarado: `${cleanNum.slice(0, 4)} •••• •••• ${terminacion}`,
              titular_nombre: nuevaTarjeta.titular.toUpperCase(),
              mes_expiracion: parseInt(mExp, 10) || 12,
              anio_expiracion: parseInt(aExp, 10) || 29,
              es_preferida: tarjetasBoveda.length === 0 ? 1 : 0
            })
          }).catch(() => null);
        }
      } else if (metodoPago === 'fiesta_card') {
        terminacion = 'FCARD';
      } else if (metodoPago === 'spei_codi') {
        terminacion = 'SPEI';
      }

      const esSpei = metodoPago === 'spei_codi';
      const notasCompletas = [
        codigoPromocion ? `[Cupón: ${codigoPromocion}]` : '',
        `[Plan: ${planTarifarioNombre}]`,
        !esSpei && mesesSinIntereses > 1 ? `[Plazo: ${mesesSinIntereses} MSI]` : '',
        usarPuntosRewards ? `[Canje Puntos FR: -$${descuentoPuntos.toFixed(2)}]` : '',
        peticionesEspeciales
      ].filter(Boolean).join(' ');

      const payload = {
        usuario_id: uid,
        suite_id: suiteSeleccionada.suite_id,
        fecha_llegada: fechaLlegada,
        fecha_salida: fechaSalida,
        noches: totalNoches,
        adultos: adultos,
        ninos: ninos,
        preferencia_almohada: preferenciaAlmohada,
        servicios_adicionales: extrasArray,
        peticiones_especiales: notasCompletas,
        subtotal: subtotalGravable,
        iva: impuestoIVA,
        ishe: impuestoISH,
        saneamiento_ambiental: saneamientoAmbiental,
        total_general: totalGeneral,
        metodo_pago_tipo: esSpei ? 'spei' : (metodoPago === 'fiesta_card' ? 'fiesta_card' : 'tarjeta_credito'),
        terminacion_tarjeta: terminacion,
        estatus_reservacion: esSpei ? 'Pendiente' : 'Confirmada'
      };

      const res = await createReservation(payload);

      if (res && (res.folio || res.reservacion || res.folio_confirmacion)) {
        setReservacionExitosa({
          folio: res.folio || res.folio_confirmacion || res.reservacion?.folio_confirmacion,
          ...payload,
          nombre_suite: suiteSeleccionada.nombre,
          plan_tarifario: planTarifarioNombre,
          nombres: datosHuesped.nombres,
          apellidos: datosHuesped.apellidos,
          email: datosHuesped.email,
          telefono: datosHuesped.telefono,
          meses_msi: mesesSinIntereses
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(res?.error || 'No se pudo generar el folio en SQL Server.');
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
      <div className="checkout-stepper-header no-print">
        <div className="checkout-container stepper-content">
          <button type="button" className="btn-back" onClick={() => navigate('/disponibilidad')}>
            <ArrowLeft size={16} /> Volver a Selección de Tarifas
          </button>
          
          <div className="stepper-track">
            <span className="step-badge completed">1. Catálogo Suites</span>
            <span className="step-arrow">›</span>
            <span className="step-badge completed">2. Fechas &amp; Tarifas</span>
            <span className="step-arrow">›</span>
            <span className="step-badge current">3. Personalización &amp; Pago</span>
          </div>
        </div>
      </div>

      <div className="checkout-container">

        {/* RESERVACIÓN CONFIRMADA CON ÉXITO */}
        {reservacionExitosa ? (
          <div className="checkout-success-box">
            <div className="success-header no-print">
              <CheckCircle2 size={56} color={reservacionExitosa.estatus_reservacion === 'Pendiente' ? '#f59e0b' : '#22c55e'} />
              <span className="gold-subtitle">
                {reservacionExitosa.estatus_reservacion === 'Pendiente' 
                  ? 'ORDEN SPEI / CODI® GENERADA EN SQL SERVER' 
                  : 'TRANSACCIÓN COMPLETADA EN SQL SERVER'}
              </span>
              <h1>
                {reservacionExitosa.estatus_reservacion === 'Pendiente'
                  ? '¡Suite Apartada por 24 Horas!'
                  : '¡Estancia Confirmada en Grand Fiesta Americana!'}
              </h1>
              <p>Tu reservación ha sido registrada bajo el plan <strong>{reservacionExitosa.plan_tarifario}</strong>.</p>
            </div>

            <div className="voucher-preview-card" id="voucher-imprimible">
              <div className="voucher-card-top">
                <div>
                  <h3 className="serif-title">Grand Fiesta Americana</h3>
                  <span>Riviera Cancún Resort &amp; Spa — All-Inclusive Luxury</span>
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
                  <label>{reservacionExitosa.estatus_reservacion === 'Pendiente' ? 'Total por Liquidar (SPEI)' : 'Total Liquidado SAT'}</label>
                  <strong className="text-gold">${Number(reservacionExitosa.total_general).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                  <span>
                    Método: {reservacionExitosa.terminacion_tarjeta === 'SPEI' ? 'Transferencia SPEI / CoDi®' : `**** ${reservacionExitosa.terminacion_tarjeta}`}
                    {reservacionExitosa.meses_msi > 1 && reservacionExitosa.terminacion_tarjeta !== 'SPEI' ? ` (${reservacionExitosa.meses_msi} MSI)` : ''}
                  </span>
                </div>
              </div>

              <div className="voucher-qr-section">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=GFA:${reservacionExitosa.folio}`} 
                  alt="QR Acceso" 
                />
                <div className="qr-text">
                  <strong>
                    {reservacionExitosa.estatus_reservacion === 'Pendiente' 
                      ? 'Código CoDi® / Referencia Bancaria STP (CLABE: 6461 8015 7042 8891 04)' 
                      : 'Pase de Recepción Inmediato (Fast Check-in)'}
                  </strong>
                  <p>
                    {reservacionExitosa.estatus_reservacion === 'Pendiente'
                      ? 'Completa tu transferencia dentro de las próximas 24 horas. Puedes consultar el estatus desde tu Perfil de Socio.'
                      : 'Presenta este código al ingresar al lobby para entrega inmediata de llaves RFID y brazalete All-Inclusive.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="success-actions no-print">
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
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                        <span className="plan-tag-assigned"><Tag size={12} /> {planTarifarioNombre}</span>
                        {codigoPromocion && (
                          <span className="plan-tag-assigned" style={{ borderColor: '#22c55e', color: '#86efac' }}>
                            Cupón: {codigoPromocion}
                          </span>
                        )}
                      </div>
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

                {/* 2. PERSONALIZACIÓN DE ESTANCIA */}
                <div className="checkout-section-card">
                  <div className="section-title">
                    <Sparkles size={20} color="#c7af8b" />
                    <h3>2. Personalización de Confort &amp; Experiencias</h3>
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
                      placeholder="Ej. Arribo en vuelo vespertino, celebración de aniversario, preferencias de minibar..."
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

                {/* 4. PASARELA Y BÓVEDA BANCARIA ULTRA-LUXURY */}
                <div className="checkout-section-card">
                  <div className="section-title" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <CreditCard size={20} color="#c7af8b" />
                      <h3>4. Pasarela y Bóveda Bancaria</h3>
                    </div>
                    <span className="pci-badge">PCI-DSS LEVEL 1 • 256-BIT</span>
                  </div>

                  {/* Canje Rápido de Puntos Fiesta Rewards */}
                  <div className={`points-redeem-bar ${usarPuntosRewards ? 'active' : ''}`} onClick={() => setUsarPuntosRewards(!usarPuntosRewards)}>
                    <div className="points-redeem-left">
                      <input type="checkbox" checked={usarPuntosRewards} readOnly />
                      <div>
                        <strong>Aplicar Puntos Fiesta Rewards ({puntosDisponibles.toLocaleString()} pts disponibles)</strong>
                        <span>Bonificación inmediata de -${Math.min(valorPuntosMxn, subtotalHospedaje * 0.25).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN en esta estancia</span>
                      </div>
                    </div>
                    <span className="points-pill">{usarPuntosRewards ? 'APLICADO' : 'CANJEAR'}</span>
                  </div>

                  {/* Selector de Métodos de Pago */}
                  <div className="payment-method-selector">
                    {tarjetasBoveda.length > 0 && (
                      <button 
                        type="button" 
                        className={`pm-btn ${metodoPago === 'tarjeta_guardada' ? 'active' : ''}`}
                        onClick={() => setMetodoPago('tarjeta_guardada')}
                      >
                        Bóveda ({tarjetasBoveda.length})
                      </button>
                    )}
                    <button 
                      type="button" 
                      className={`pm-btn ${metodoPago === 'nueva_tarjeta' ? 'active' : ''}`}
                      onClick={() => setMetodoPago('nueva_tarjeta')}
                    >
                      Nueva Tarjeta 3D
                    </button>
                    <button 
                      type="button" 
                      className={`pm-btn ${metodoPago === 'fiesta_card' ? 'active' : ''}`}
                      onClick={() => setMetodoPago('fiesta_card')}
                    >
                      Fiesta Card Digital
                    </button>
                    <button 
                      type="button" 
                      className={`pm-btn ${metodoPago === 'spei_codi' ? 'active' : ''}`}
                      onClick={() => setMetodoPago('spei_codi')}
                    >
                      SPEI / CoDi® 24h
                    </button>
                  </div>

                  {/* OPCIÓN A: BÓVEDA DE TARJETAS GUARDADAS */}
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
                            <strong>{t.alias_tarjeta || t.banco_emisor} • {t.marca_tarjeta}</strong>
                            <span>{t.numero_enmascarado} (Vence: {t.mes_expiracion}/{t.anio_expiracion})</span>
                          </div>
                          {tarjetaIdSeleccionada === t.tarjeta_bancaria_id && (
                            <input 
                              type="password" 
                              className="vault-cvv-mini"
                              placeholder="CVV"
                              maxLength={4}
                              value={cvvBovedaConfirm}
                              onChange={(e) => setCvvBovedaConfirm(e.target.value.replace(/\D/g, ''))}
                              onClick={(e) => e.stopPropagation()}
                              required
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* OPCIÓN B: NUEVA TARJETA CON PLÁSTICO 3D EN VIVO */}
                  {metodoPago === 'nueva_tarjeta' && (
                    <div className="new-card-3d-wrapper">
                      {(() => {
                        const franq = detectarFranquicia(nuevaTarjeta.numero);
                        return (
                          <div className={`live-card-3d-container ${cvvEnfocado ? 'flipped' : ''}`}>
                            <div className="live-card-3d-inner">
                              {/* Cara Frontal */}
                              <div className={`live-card-front ${franq.clase}`}>
                                <div className="lc-top">
                                  <span className="lc-chip"></span>
                                  <strong className="lc-brand">{franq.marca}</strong>
                                </div>
                                <div className="lc-number">
                                  {nuevaTarjeta.numero || '•••• •••• •••• ••••'}
                                </div>
                                <div className="lc-bottom">
                                  <div>
                                    <small>TITULAR</small>
                                    <span>{nuevaTarjeta.titular || 'NOMBRE DEL SOCIO'}</span>
                                  </div>
                                  <div>
                                    <small>VENCE</small>
                                    <span>{nuevaTarjeta.exp || 'MM/AA'}</span>
                                  </div>
                                </div>
                              </div>
                              {/* Cara Trasera (CVV) */}
                              <div className="live-card-back">
                                <div className="lc-magstripe"></div>
                                <div className="lc-cvv-strip">
                                  <small>CÓDIGO DE SEGURIDAD</small>
                                  <div className="lc-cvv-box">{nuevaTarjeta.cvv ? '•'.repeat(nuevaTarjeta.cvv.length) : '•••'}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="new-card-form">
                        <div className="input-group">
                          <label>Titular de la Tarjeta</label>
                          <input 
                            type="text" 
                            placeholder="KEVIN RAMIREZ SORIA"
                            value={nuevaTarjeta.titular}
                            onFocus={() => setCvvEnfocado(false)}
                            onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, titular: e.target.value.toUpperCase() })}
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label>Número de Tarjeta (16 dígitos)</label>
                          <input 
                            type="text" 
                            placeholder="4829 3140 1234 7712"
                            maxLength="19"
                            value={nuevaTarjeta.numero}
                            onFocus={() => setCvvEnfocado(false)}
                            onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, numero: formatearNumeroTarjeta(e.target.value) })}
                            required
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
                              onFocus={() => setCvvEnfocado(false)}
                              onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, exp: formatearExpiracion(e.target.value) })}
                              required
                            />
                          </div>
                          <div className="input-group">
                            <label>CVV / CVC</label>
                            <input 
                              type="password" 
                              placeholder="•••" 
                              maxLength="4"
                              value={nuevaTarjeta.cvv}
                              onFocus={() => setCvvEnfocado(true)}
                              onBlur={() => setCvvEnfocado(false)}
                              onChange={(e) => setNuevaTarjeta({ ...nuevaTarjeta, cvv: e.target.value.replace(/\D/g, '') })}
                              required
                            />
                          </div>
                        </div>

                        <label className="save-vault-check">
                          <input 
                            type="checkbox" 
                            checked={guardarNuevaEnBoveda} 
                            onChange={(e) => setGuardarNuevaEnBoveda(e.target.checked)} 
                          />
                          <span>Guardar este plástico tokenizado en mi Bóveda Bancaria SQL Server</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* OPCIÓN C: FIESTA CARD DIGITAL */}
                  {metodoPago === 'fiesta_card' && fiestaCard && (
                    <div className="fiesta-card-pay-box">
                      <div className="fc-header">
                        <span className="fc-chip"></span>
                        <strong className="fc-brand">FIESTA REWARDS TITANIUM CARD</strong>
                      </div>
                      <span className="fc-num">{fiestaCard.numero_enmascarado}</span>
                      <div className="fc-footer">
                        <span>Línea Disponible: ${Number(fiestaCard.saldo_disponible).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                        <span>Exp: {fiestaCard.fecha_expiracion}</span>
                      </div>
                    </div>
                  )}

                  {/* OPCIÓN D: TRANSFERENCIA SPEI / CODI 24H */}
                  {metodoPago === 'spei_codi' && (
                    <div className="spei-box-checkout">
                      <div className="spei-head">
                        <strong>Orden de Pago Interbancario STP / CoDi®</strong>
                        <span className="spei-tag">VIGENCIA: 24 HORAS</span>
                      </div>
                      <p>Tu suite quedará bloqueada en el inventario de SQL Server por 24 horas. Podrás descargar tu ficha de depósito o acreditar el pago desde tu Perfil de Socio.</p>
                      <div className="spei-clabe-row">
                        <span>CLABE Interbancaria STP:</span>
                        <strong>6461 8015 7042 8891 04</strong>
                      </div>
                    </div>
                  )}

                  {/* SELECTOR DE MESES SIN INTERESES (MSI) */}
                  {metodoPago !== 'spei_codi' && (
                    <div className="msi-selector-box">
                      <label>Plan de Financiamiento (Meses Sin Intereses):</label>
                      <div className="msi-pills-grid">
                        {[1, 3, 6, 12, 18].map(meses => (
                          <button
                            key={meses}
                            type="button"
                            className={`msi-pill ${mesesSinIntereses === meses ? 'active' : ''}`}
                            onClick={() => setMesesSinIntereses(meses)}
                          >
                            <strong>{meses === 1 ? '1 Pago' : `${meses} MSI`}</strong>
                            <span>${(totalGeneral / meses).toLocaleString('es-MX', { maximumFractionDigits: 0 })} / mes</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="security-badge">
                    <Lock size={15} color="#22c55e" />
                    <span>Transacción bancaria cifrada TLS 1.3 con tokenización y registro transaccional en SQL Server.</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={procesando} 
                  className={`btn-confirmar-pago ${procesando ? 'btn-loading' : ''}`}
                >
                  {procesando ? (
                    'Procesando Transacción en SQL Server...'
                  ) : metodoPago === 'spei_codi' ? (
                    <>Generar Orden de Pago SPEI / CoDi® (${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN) <ChevronRight size={18} /></>
                  ) : mesesSinIntereses > 1 ? (
                    <>Confirmar a {mesesSinIntereses} MSI de ${montoMensualidad.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN <ChevronRight size={18} /></>
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

                  {descuentoPuntos > 0 && (
                    <div className="ledger-row" style={{ color: '#c084fc' }}>
                      <span>Canje Puntos Fiesta Rewards</span>
                      <strong>-${descuentoPuntos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  )}

                  {totalExtras > 0 && (
                    <div className="ledger-row">
                      <span>Servicios Extras &amp; Confort</span>
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

                  {metodoPago !== 'spei_codi' && mesesSinIntereses > 1 && (
                    <div style={{ textAlign: 'right', fontSize: '0.76rem', color: '#86efac', marginTop: '0.35rem' }}>
                      Parcialidad elegida: <strong>{mesesSinIntereses} pagos de ${montoMensualidad.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                    </div>
                  )}
                </div>

                <div className="summary-rewards-badge">
                  <Award size={16} color="#c7af8b" />
                  <span>Esta estancia genera <strong>+{puntosAGanar.toLocaleString()} Puntos Fiesta Rewards</strong> y {totalNoches} noches de estatus para tu membresía <strong>{datosHuesped.fiestaRewardsId}</strong>.</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}