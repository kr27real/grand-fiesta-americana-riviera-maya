import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Tag, Loader2, Sparkles, ArrowRight, ShieldCheck, Percent } from 'lucide-react';
import { fetchOfertas } from '../../services/api';
import './Ofertas.css';

// Catálogo institucional oficial de respaldo
const OFERTAS_FALLBACK = [
  {
    oferta_id: 1,
    titulo: 'Hasta 15% Adicional en Resorts de Playa + Transportación Incluida',
    descuento_etiqueta: '15% OFF + TRASLADO',
    vigencia: 'Válido para viajar hasta dic 2027',
    descripcion: 'Reserva con anticipación y escápate a las costas de Quintana Roo con transportación redonda aeropuerto-hotel en camioneta de lujo incluida sin costo.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-2aft7jlwfj7uxtiyk90dk5fuh/6-fat-playa-1980x1080_standard.jpg?crop=270%2C0%2C1440%2C1080&width=1000',
    codigo_promocion: 'PROMO15'
  },
  {
    oferta_id: 2,
    titulo: 'Oferta de Gran Apertura | Grand Fiesta Americana Riviera Cancún',
    descuento_etiqueta: 'TARIFA INAUGURAL',
    vigencia: 'Apertura oficial 16 de enero de 2027',
    descripcion: 'Sé de los primeros en vivir el lujo contemporáneo frente al Caribe mexicano con acceso preferencial a amenidades Grand Club y tarifa especial.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-4igidvyvqodm5sxe421766hni/1-980x650_standard.jpg?crop=57%2C0%2C867%2C650&width=1000',
    codigo_promocion: 'APERTURA2027'
  },
  {
    oferta_id: 3,
    titulo: 'Vive el Viaje que Imaginas con hasta 30% OFF',
    descuento_etiqueta: 'HASTA 30% OFF',
    vigencia: 'Reservas directas en el portal web',
    descripcion: 'Regálate unos días frente al mar en un escenario definido por la amplitud, elegancia relajada y el ritmo pausado de las olas caribeñas.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-1yh6now1u4zd96vlwee14353/980x650_standard.jpg?crop=57%2C0%2C867%2C650&width=1000',
    codigo_promocion: 'VIVE30'
  },
  {
    oferta_id: 4,
    titulo: 'Paquetes Todo Incluido: Hotel + Avión',
    descuento_etiqueta: 'HASTA 50% COMBO',
    vigencia: 'Temporada completa 2026 - 2027',
    descripcion: 'Combina tus vuelos con una estancia en nuestras suites de alta gama y ahorra significativamente con cancelaciones flexibles y garantía de servicio.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-7wiz39kp6pp2a2co4vf9m1vss/bn-h-a-980x650-px_standard.jpg?crop=57%2C0%2C867%2C650&width=1000',
    codigo_promocion: 'PAQAVION'
  },
  {
    oferta_id: 5,
    titulo: 'Renta tu Auto con Hertz Avasa y Obtén hasta 65% OFF',
    descuento_etiqueta: 'CONVENIO HERTZ',
    vigencia: 'Exclusivo para huéspedes registrados',
    descripcion: 'Explora la Riviera Maya y Cancún con total libertad. Beneficio exclusivo con seguro de cobertura amplia y entrega directa en el lobby del resort.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-b2351bdw0a1a4bx0uxvue35nb/1-bns-fat-mood-hertz-980-x-650-px_standard.jpg?crop=57%2C0%2C867%2C650&width=1000',
    codigo_promocion: 'HERTZ65'
  },
  {
    oferta_id: 6,
    titulo: 'Escapada Romántica & Circuito Feel Harmony Spa',
    descuento_etiqueta: 'EXPERIENCIA PAREJAS',
    vigencia: 'Válido en estancias de mínimo 3 noches',
    descripcion: 'Incluye botella de champaña Moët & Chandon de bienvenida en la suite, cena de 4 tiempos en la playa y pase libre al circuito de hidroterapia.',
    imagen_url: 'https://image-tc.galaxy.tf/wijpeg-f4wozq3zmjrw9eececnvff107/2997_photo.jpg',
    codigo_promocion: 'ROMANCE'
  }
];

export default function Ofertas() {
  const navigate = useNavigate();
  const [ofertas, setOfertas] = useState(OFERTAS_FALLBACK);
  const [cargando, setCargando] = useState(true);
  const [dbOffline, setDbOffline] = useState(false);

  useEffect(() => {
    async function cargarOfertasDesdeBD() {
      try {
        setCargando(true);
        setDbOffline(false);

        const data = await fetchOfertas();

        if (Array.isArray(data) && data.length > 0) {
          setOfertas(data);
        } else {
          setOfertas(OFERTAS_FALLBACK);
        }
      } catch (err) {
        console.warn('SQL Server no disponible, desplegando catálogo oficial institucional:', err);
        setDbOffline(true);
        setOfertas(OFERTAS_FALLBACK);
      } finally {
        setCargando(false);
      }
    }

    cargarOfertasDesdeBD();
  }, []);

  const handleAprovecharOferta = (oferta) => {
    navigate('/disponibilidad', {
      state: {
        codigo_promocion: oferta.codigo_promocion || 'PROMO_DIRECTA',
        promocion_nombre: oferta.titulo || oferta.Titulo,
        fecha_llegada: '2026-12-01',
        fecha_salida: '2026-12-05',
        adultos: 2,
        ninos: 0
      }
    });
  };

  return (
    <div className="ofertas-page-root">
      <div className="ofertas-container">
        
        {/* Encabezado Editorial */}
        <header className="ofertas-hero-header">
          <span className="ofertas-eyebrow">PROMOCIONES EXCLUSIVAS & FIESTA REWARDS</span>
          <h1>Ofertas de Hospedaje & Paquetes</h1>
          <p>
            Accede a las tarifas más competitivas, beneficios de transportación privada y experiencias gastronómicas 
            diseñadas para transformar tu visita a la costa de Quintana Roo en una estancia inolvidable.
          </p>
        </header>

        {dbOffline && (
          <div className="ofertas-cache-indicator">
            <ShieldCheck size={14} />
            <span>Mostrando catálogo garantizado de Grupo Posadas (Modo Respaldo Activo)</span>
          </div>
        )}

        {cargando && (
          <div className="ofertas-loading-box">
            <Loader2 className="animate-spin ofertas-spinner" size={36} />
            <h3>Sincronizando promociones con SQL Server...</h3>
          </div>
        )}

        {!cargando && (
          <div className="ofertas-cards-grid">
            {ofertas.map((oferta) => {
              const id = oferta.oferta_id || oferta.id;
              const titulo = oferta.titulo || oferta.Titulo || 'Promoción Especial';
              const descuento = oferta.descuento_etiqueta || oferta.Descuento || 'Tarifa Exclusiva';
              const vigencia = oferta.vigencia || oferta.Vigencia || 'Vigencia de temporada';
              const descripcion = oferta.descripcion || oferta.Descripcion || 'Disfruta de beneficios excepcionales reservando directamente.';
              const imagen = oferta.imagen_url || oferta.ImagenUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';

              return (
                <article key={id} className="oferta-card-item">
                  
                  {/* Fotografía con máscara y Badge de Descuento */}
                  <div className="oferta-media-box">
                    <span className="oferta-discount-badge">
                      <Percent size={11} /> {descuento}
                    </span>
                    <img
                      src={imagen}
                      alt={titulo}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://image-tc.galaxy.tf/wijpeg-2aft7jlwfj7uxtiyk90dk5fuh/6-fat-playa-1980x1080_standard.jpg?crop=270%2C0%2C1440%2C1080&width=1000';
                      }}
                    />
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div className="oferta-body-content">
                    <div className="oferta-vigencia-row">
                      <Calendar size={13} />
                      <span>{vigencia}</span>
                    </div>

                    <h3>{titulo}</h3>
                    <p>{descripcion}</p>

                    <div className="oferta-actions-row">
                      <button 
                        type="button" 
                        className="btn-oferta-cta"
                        onClick={() => handleAprovecharOferta(oferta)}
                      >
                        Aprovechar Oferta <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        )}

        {/* Callout Institucional de Lealtad */}
        <section className="ofertas-loyalty-callout">
          <div className="loyalty-callout-inner">
            <div>
              <span className="ofertas-eyebrow">MIEMBROS FIESTA REWARDS</span>
              <h2>¿Ya eres socio del programa?</h2>
              <p>
                Inicia sesión para acumular hasta 10 puntos por cada dólar gastado, recibir upgrades de suite según 
                disponibilidad y acceder a tarifas confidenciales nunca publicadas en agencias externas.
              </p>
            </div>
            <button 
              type="button" 
              className="btn-loyalty-login"
              onClick={() => navigate('/perfil-socio')}
            >
              Consultar Mi Cuenta
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}