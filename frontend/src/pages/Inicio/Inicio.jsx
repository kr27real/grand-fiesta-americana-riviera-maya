import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, Users, Key, ShieldCheck, Sparkles, 
  ArrowRight, Award, Compass, UtensilsCrossed, Waves,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CheckCircle2,
  Phone, Mail, Wifi, Car, Plane, Coffee, HeartHandshake, HelpCircle
} from 'lucide-react';
import './Inicio.css';

export default function Inicio() {
  const navigate = useNavigate();

  // Fechas y huéspedes del Booking Mask
  const hoyStr = new Date().toISOString().substring(0, 10);
  const salidaDefecto = new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10);

  const [fechaLlegada, setFechaLlegada] = useState(hoyStr);
  const [fechaSalida, setFechaSalida] = useState(salidaDefecto);
  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);

  // Estados interactivos para Slider y FAQ
  const [heroSlide, setHeroSlide] = useState(0);
  const [faqAbierta, setFaqAbierta] = useState(null);

  const heroImages = [
    'https://image-tc.galaxy.tf/wijpeg-asw61us5xgymd93dt3nu9y1nz/_photo.jpg',
    'https://image-tc.galaxy.tf/wijpeg-8f436tlgefhnfu48zvpns3run/_photo.jpg',
    'https://image-tc.galaxy.tf/wijpeg-f4wozq3zmjrw9eececnvff107/_photo.jpg',
    'https://image-tc.galaxy.tf/wijpeg-keenuzs88sxwkosbzny52srv/_photo.jpg'
  ];

  // Cambio automático continuo cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length, heroSlide]);

  const toggleFaq = (idx) => {
    setFaqAbierta(faqAbierta === idx ? null : idx);
  };

  const handleBuscarDisponibilidad = (e) => {
    e.preventDefault();
    navigate('/habitaciones', {
      state: {
        fechaLlegada,
        fechaSalida,
        adultos: Number(adultos),
        ninos: Number(ninos)
      }
    });
  };

  return (
    <div className="inicio-root" style={{ backgroundColor: '#060508', color: '#ffffff', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      
      {/* 1. SLIDER HERO MAESTRO: CAPAS ANIMADAS KEN BURNS + AUTOPLAY */}
      <section className="hero-slider-container">
        
        {/* Capas fotográficas superpuestas con transición suave */}
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className={`hero-slide-layer ${heroSlide === idx ? 'active' : ''}`}
            style={{ backgroundImage: `url("${img}")` }}
          />
        ))}

        {/* Degradado frontal de ultra lujo */}
        <div className="hero-overlay-gradient" />

        {/* Flecha Izquierda */}
        <button 
          type="button"
          onClick={() => setHeroSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1))}
          className="hero-nav-arrow"
          style={{ left: '25px' }}
          title="Imagen anterior"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Flecha Derecha */}
        <button 
          type="button"
          onClick={() => setHeroSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1))}
          className="hero-nav-arrow"
          style={{ right: '25px' }}
          title="Siguiente imagen"
        >
          <ChevronRight size={24} />
        </button>

        {/* Contenido Editorial Central */}
        <div className="hero-content-front">
          <span style={{ fontSize: '0.78rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 800, marginBottom: '0.9rem', display: 'block', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            Grand Fiesta Americana • Luxury Resorts México
          </span>

          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.8rem, 6vw, 5.2rem)', color: '#ffffff', margin: '0 0 1.2rem 0', letterSpacing: '3px', textTransform: 'uppercase', textShadow: '0 4px 25px rgba(0,0,0,0.9)', fontWeight: 600 }}>
            Donde el Caribe cobra vida
          </h1>

          <p style={{ color: '#e2e8f0', fontSize: '1.08rem', maxWidth: '760px', margin: '0 auto', lineHeight: 1.6, textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontWeight: 400 }}>
            Una experiencia definida por la amplitud, la calidez y el ritmo pausado de la costa mexicana.
          </p>
        </div>

        {/* Puntos Indicadores Interactivos */}
        <div style={{ position: 'absolute', bottom: '24px', display: 'flex', gap: '9px', zIndex: 10 }}>
          {heroImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setHeroSlide(i)}
              style={{
                width: heroSlide === i ? '32px' : '9px',
                height: '9px',
                borderRadius: '5px',
                background: heroSlide === i ? '#d4af37' : 'rgba(255,255,255,0.45)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                boxShadow: heroSlide === i ? '0 0 10px rgba(212,175,55,0.8)' : 'none'
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. BOOKING MASK OFICIAL: EXCELENTE LAYOUT HORIZONTAL E INDEPENDIENTE */}
      <section style={{ backgroundColor: '#0a0810', borderTop: '2px solid rgba(212,175,55,0.5)', borderBottom: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 15px 40px rgba(0,0,0,0.9)', position: 'relative', zIndex: 20 }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '1.4rem 2rem' }}>
          
          <form 
            onSubmit={handleBuscarDisponibilidad} 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'minmax(180px, 1.2fr) minmax(180px, 1.2fr) minmax(140px, 1fr) minmax(140px, 1fr) auto', 
              gap: '1.2rem', 
              alignItems: 'flex-end' 
            }}
          >
            {/* Columna 1: Llegada */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700 }}>
                <Calendar size={13} /> Check-in (Llegada)
              </label>
              <input 
                type="date"
                required
                value={fechaLlegada}
                onChange={(e) => setFechaLlegada(e.target.value)}
                style={{ 
                  background: '#14121d', 
                  border: '1px solid rgba(196, 181, 253, 0.28)', 
                  borderRadius: '4px', 
                  color: '#ffffff', 
                  padding: '0.75rem 0.9rem', 
                  fontSize: '0.88rem', 
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>

            {/* Columna 2: Salida */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700 }}>
                <Calendar size={13} /> Check-out (Salida)
              </label>
              <input 
                type="date"
                required
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                style={{ 
                  background: '#14121d', 
                  border: '1px solid rgba(196, 181, 253, 0.28)', 
                  borderRadius: '4px', 
                  color: '#ffffff', 
                  padding: '0.75rem 0.9rem', 
                  fontSize: '0.88rem', 
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>

            {/* Columna 3: Adultos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700 }}>
                <Users size={13} /> Adultos (+12)
              </label>
              <select 
                value={adultos}
                onChange={(e) => setAdultos(e.target.value)}
                style={{ 
                  background: '#14121d', 
                  border: '1px solid rgba(196, 181, 253, 0.28)', 
                  borderRadius: '4px', 
                  color: '#ffffff', 
                  padding: '0.75rem 0.9rem', 
                  fontSize: '0.88rem', 
                  outline: 'none',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="1">01 Adulto</option>
                <option value="2">02 Adultos</option>
                <option value="3">03 Adultos</option>
                <option value="4">04 Adultos</option>
              </select>
            </div>

            {/* Columna 4: Niños */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700 }}>
                <Users size={13} /> Niños (0 - 11)
              </label>
              <select 
                value={ninos}
                onChange={(e) => setNinos(e.target.value)}
                style={{ 
                  background: '#14121d', 
                  border: '1px solid rgba(196, 181, 253, 0.28)', 
                  borderRadius: '4px', 
                  color: '#ffffff', 
                  padding: '0.75rem 0.9rem', 
                  fontSize: '0.88rem', 
                  outline: 'none',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="0">00 Niños</option>
                <option value="1">01 Niño</option>
                <option value="2">02 Niños</option>
              </select>
            </div>

            {/* Columna 5: Botón de Acción */}
            <div>
              <button 
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #aa8212 100%)',
                  color: '#060508',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.82rem 2.2rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  letterSpacing: '1.6px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 18px rgba(212, 175, 55, 0.45)',
                  height: '45px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s ease'
                }}
              >
                Buscar Habitaciones <ArrowRight size={16} />
              </button>
            </div>

          </form>

          {/* Enlace Paquetes Hotel + Avión */}
          <div style={{ marginTop: '0.9rem', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plane size={14} color="#d4af37" />
            <span>¿Planeas tu vuelo junto con el hospedaje? <Link to="/ofertas" style={{ color: '#f3e5ab', textDecoration: 'underline', fontWeight: 600 }}>Clic aquí para Paquetes Hotel + Avión (Hasta 50% OFF)</Link></span>
          </div>

        </div>
      </section>

      {/* 3. BARRA DE BENEFICIOS POSADAS */}
      <section style={{ background: '#110f17', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', padding: '1.4rem 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
            <ShieldCheck size={24} color="#d4af37" />
            <div style={{ textAlign: 'left', fontSize: '0.78rem' }}>
              <strong>Cancelación Flexible</strong>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Sin penalizaciones</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
            <Sparkles size={24} color="#c4b5fd" />
            <div style={{ textAlign: 'left', fontSize: '0.78rem' }}>
              <strong>Check-in Digital</strong>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Llegada sin filas</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
            <Award size={24} color="#d4af37" />
            <div style={{ textAlign: 'left', fontSize: '0.78rem' }}>
              <strong>Disfruta MSI</strong>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Meses sin intereses</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
            <HeartHandshake size={24} color="#c4b5fd" />
            <div style={{ textAlign: 'left', fontSize: '0.78rem' }}>
              <strong>Concierge Digital</strong>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Atención personalizada</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
            <CheckCircle2 size={24} color="#22c55e" />
            <div style={{ textAlign: 'left', fontSize: '0.78rem' }}>
              <strong>Canales Verificados</strong>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Garantía Grupo Posadas</div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. INTRODUCCIÓN EDITORIAL & AVISO OFICIAL DE APERTURA */}
      <section style={{ maxWidth: '1000px', margin: '4.5rem auto 3rem', padding: '0 2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', color: '#f3e5ab', margin: '0 0 0.8rem 0' }}>
          Grand Fiesta Americana Riviera Cancún
        </h2>
        <h3 style={{ fontSize: '0.95rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#aa8212', fontWeight: 700, marginBottom: '1.4rem' }}>
          Donde el Caribe cobra vida
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.8, marginBottom: '2rem' }}>
          Donde el Caribe se encuentra con el diseño contemporáneo, Grand Fiesta Americana Riviera Cancún ofrece una nueva forma de vivir una escapada frente al mar: una experiencia definida por la amplitud, la calidez y el ritmo pausado de la costa mexicana. Amplias playas, arquitectura abierta y espacios cuidadosamente diseñados para convivir crean el escenario perfecto.
        </p>

        {/* ALERTA DE APERTURA */}
        <div style={{ background: '#110f17', border: '1px solid #d4af37', padding: '1.2rem 2.2rem', borderRadius: '6px', display: 'inline-block', boxShadow: '0 8px 25px rgba(0,0,0,0.7)' }}>
          <strong style={{ color: '#f3e5ab', fontSize: '1.05rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>¡La gran apertura se acerca!</strong>
          <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            A partir del <strong>1 de noviembre 2026</strong>. ¡Prepárate para descubrir una experiencia única!
          </div>
        </div>
      </section>

      {/* 5. OFERTAS ESPECIALES DESTACADAS */}
      <section style={{ maxWidth: '1280px', margin: '5rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#d4af37', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800 }}>Promociones por Tiempo Limitado</span>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', margin: '0.2rem 0 0 0' }}>Ofertas Especiales</h3>
          </div>
          <Link to="/ofertas" style={{ color: '#d4af37', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Ver todas las ofertas <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.8rem' }}>
          
          <div style={{ background: '#110f17', border: '1px solid rgba(196,181,253,0.18)', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="https://image-tc.galaxy.tf/wijpeg-4igidvyvqodm5sxe421766hni/1-980x650_standard.jpg?crop=57%2C0%2C867%2C650&width=600" alt="Oferta Apertura" style={{ width: '100%', height: '190px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>Oferta de Apertura | Riviera Cancún</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>Sé de los primeros en vivir la experiencia con una tarifa especial por tiempo limitado.</p>
              <Link to="/checkout" className="btn-reservar-gold" style={{ display: 'inline-block', width: '100%', textAlign: 'center', padding: '0.6rem', marginTop: '0.5rem' }}>Reservar Oferta</Link>
            </div>
          </div>

          <div style={{ background: '#110f17', border: '1px solid rgba(196,181,253,0.18)', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="https://image-tc.galaxy.tf/wijpeg-1yh6now1u4zd96vlwee14353/980x650_standard.jpg?crop=57%2C0%2C867%2C650&width=600" alt="30% OFF" style={{ width: '100%', height: '190px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>Hasta 30% OFF + Transporte Incluido</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>Regálate unos días frente al mar en los destinos más espectaculares de México.</p>
              <Link to="/checkout" className="btn-reservar-gold" style={{ display: 'inline-block', width: '100%', textAlign: 'center', padding: '0.6rem', marginTop: '0.5rem' }}>Reservar con 30% OFF</Link>
            </div>
          </div>

          <div style={{ background: '#110f17', border: '1px solid rgba(196,181,253,0.18)', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="https://image-tc.galaxy.tf/wijpeg-7wiz39kp6pp2a2co4vf9m1vss/bn-h-a-980x650-px_standard.jpg?crop=57%2C0%2C867%2C650&width=600" alt="Hotel + Avión" style={{ width: '100%', height: '190px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>Hotel + Avión (Hasta 50% Desc.)</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>Reserva tu paquete integral y ahorra hasta un 50% en vuelo y hospedaje.</p>
              <Link to="/ofertas" className="btn-reservar-gold" style={{ display: 'inline-block', width: '100%', textAlign: 'center', padding: '0.6rem', marginTop: '0.5rem' }}>Explorar Paquetes</Link>
            </div>
          </div>

          <div style={{ background: '#110f17', border: '1px solid rgba(196,181,253,0.18)', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="https://image-tc.galaxy.tf/wijpeg-b2351bdw0a1a4bx0uxvue35nb/1-bns-fat-mood-hertz-980-x-650-px_standard.jpg?crop=57%2C0%2C867%2C650&width=600" alt="Hertz" style={{ width: '100%', height: '190px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>Hertz Rent a Car (65% OFF)</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>Beneficios especiales al rentar un vehículo convertible o SUV con Hertz México.</p>
              <a href="https://autos.fiestamericanatravelty.com/" target="_blank" rel="noreferrer" className="btn-reservar-gold" style={{ display: 'inline-block', width: '100%', textAlign: 'center', padding: '0.6rem', marginTop: '0.5rem' }}>Ver Autos Hertz</a>
            </div>
          </div>

        </div>
      </section>

      {/* 6. SERVICIOS & AMENIDADES */}
      <section style={{ maxWidth: '1280px', margin: '5rem auto', padding: '0 2rem' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', marginBottom: '2rem' }}>Servicios y Amenidades</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          <div style={{ background: '#110f17', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)' }}>
            <img src="https://image-tc.galaxy.tf/wijpeg-beble8cdq3iko33yh2hyu6msp/free-transfer_standard.jpg?crop=40%2C0%2C1800%2C1350&width=600" alt="Traslado" style={{ width: '100%', height: '210px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <h4 style={{ color: '#ffffff', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>Traslado gratuito al aeropuerto</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6 }}>Reserva a través de nuestro sitio web oficial y obtén transportación privada gratuita desde la terminal aérea de Cancún.</p>
            </div>
          </div>

          <div style={{ background: '#110f17', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)' }}>
            <img src="https://image-tc.galaxy.tf/wijpeg-7n7rhefshu7m0zbbf9dfteuiq/render-js-tipo-3-3_standard.jpg?crop=160%2C0%2C960%2C720&width=600" alt="WiFi" style={{ width: '100%', height: '210px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <h4 style={{ color: '#ffffff', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>Wi-Fi de Alta Velocidad</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6 }}>Conexión satelital ultra rápida y disponible sin costo en todas las suites, albercas y áreas públicas del resort.</p>
            </div>
          </div>

          <div style={{ background: '#110f17', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)' }}>
            <img src="https://image-tc.galaxy.tf/wijpeg-4igidvyvqodm5sxe421766hni/1-980x650_standard.jpg?crop=57%2C0%2C867%2C650&width=600" alt="Piscinas" style={{ width: '100%', height: '210px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <h4 style={{ color: '#ffffff', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>Piscinas Relajantes & Solarium</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6 }}>Finaliza tu día encontrando reposo en nuestras albercas infinitas templadas con servicio de mayordomo de cócteles.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. HABITACIONES Y SUITES (618 LLAVES FÍSICAS) */}
      <section style={{ maxWidth: '1280px', margin: '5rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#d4af37', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800 }}>618 Llaves Exclusivas</span>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', margin: '0.2rem 0 0 0' }}>Habitaciones y Suites</h3>
          </div>
          <Link to="/habitaciones" style={{ color: '#d4af37', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Ver todas las habitaciones <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          
          <div style={{ background: '#110f17', border: '1px solid rgba(196,181,253,0.18)', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" alt="Deluxe Tropical" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
            <div style={{ padding: '1.6rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 800 }}>Junior Suites • 140 Llaves</span>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#ffffff', margin: '0.3rem 0 0.6rem 0' }}>Deluxe Junior Suite Tropical View</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.5 }}>Espacio de 52 m² con terraza privada hacia los manglares protegidos y amenidades L’Occitane.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem' }}>
                <strong style={{ color: '#f3e5ab', fontSize: '1.3rem' }}>$6,200 <small style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>MXN / Noche</small></strong>
                <Link to="/checkout" className="btn-reservar-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}>Reservar</Link>
              </div>
            </div>
          </div>

          <div style={{ background: '#110f17', border: '1px solid rgba(196,181,253,0.18)', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80" alt="Deluxe Ocean" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
            <div style={{ padding: '1.6rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 800 }}>Ocean View • 160 Llaves</span>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#ffffff', margin: '0.3rem 0 0.6rem 0' }}>Deluxe Ocean View Suite</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.5 }}>Vistas frontales al mar Caribe desde el balcón amueblado, cama king y regadera de lluvia en mármol.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem' }}>
                <strong style={{ color: '#f3e5ab', fontSize: '1.3rem' }}>$7,450 <small style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>MXN / Noche</small></strong>
                <Link to="/checkout" className="btn-reservar-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}>Reservar</Link>
              </div>
            </div>
          </div>

          <div style={{ background: '#110f17', border: '1px solid rgba(196,181,253,0.18)', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80" alt="Swim Up" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
            <div style={{ padding: '1.6rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 800 }}>Swim Up • 80 Llaves</span>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#ffffff', margin: '0.3rem 0 0.6rem 0' }}>Ocean Front Swim Up Suite</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.5 }}>Acceso directo desde tu terraza privada a la piscina templada con camastros sumergidos exclusivos.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem' }}>
                <strong style={{ color: '#f3e5ab', fontSize: '1.3rem' }}>$9,300 <small style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>MXN / Noche</small></strong>
                <Link to="/checkout" className="btn-reservar-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}>Reservar</Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 8. RESTAURANTES DE AUTOR */}
      <section style={{ maxWidth: '1280px', margin: '5rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#d4af37', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800 }}>Gastronomía Internacional</span>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#f3e5ab', margin: '0.2rem 0 0 0' }}>Restaurantes y Bares</h3>
          </div>
          <Link to="/restaurantes" style={{ color: '#d4af37', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Ver todos los restaurantes <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          <div style={{ background: '#110f17', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(196,181,253,0.18)' }}>
            <img src="https://image-tc.galaxy.tf/wijpeg-1u6qtwbl793pz2r84bef32xsb/image-112_standard.jpg?crop=160%2C0%2C960%2C720&width=600" alt="Rosato" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 800 }}>Cocina Italiana de Autor</span>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#ffffff', margin: '0.3rem 0 0.5rem 0' }}>Rosato</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.5 }}>Vibrante, cálida y auténticamente italiana. Un lugar donde la buena mesa y la mejor compañía siempre se encuentran.</p>
            </div>
          </div>

          <div style={{ background: '#110f17', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(196,181,253,0.18)' }}>
            <img src="https://image-tc.galaxy.tf/wijpeg-aiwi12y61alhuzqbpmywy5gs9/camera-04-0000-png_standard.jpg?crop=0%2C18%2C1584%2C1188&width=600" alt="Península" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 800 }}>Cocina Costera & Mariscos</span>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#ffffff', margin: '0.3rem 0 0.5rem 0' }}>Península</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.5 }}>Donde las mañanas comienzan con el sonido del mar y las noches invitan a quedarse un poco más frente a la costa.</p>
            </div>
          </div>

          <div style={{ background: '#110f17', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(196,181,253,0.18)' }}>
            <img src="https://image-tc.galaxy.tf/wijpeg-1dw3841ug4yola1lq9uzgmvd/camera-07-0000-png_standard.jpg?crop=0%2C18%2C1584%2C1188&width=600" alt="Viña del Mar" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 800 }}>Buffet Gourmet Internacional</span>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#ffffff', margin: '0.3rem 0 0.5rem 0' }}>Viña del Mar</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.5 }}>El corazón del resort: un espacio para reunirse a cualquier hora, donde cada comida se disfruta sin prisa.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 9. PREGUNTAS FRECUENTES (FAQ ACORDEÓN) */}
      <section style={{ maxWidth: '960px', margin: '5rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#d4af37', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 800 }}>Asistencia al Huésped</span>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: '#f3e5ab', margin: '0.3rem 0 0 0' }}>Preguntas Frecuentes</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {[
            {
              q: '¿Dónde se encuentra Grand Fiesta Americana Riviera Cancún?',
              a: 'El resort se encuentra frente a las costas de Riviera Cancún, entre la Zona Hotelera de Cancún y el corredor de la Riviera Maya, aproximadamente a 25 minutos del Aeropuerto Internacional de Cancún.'
            },
            {
              q: '¿El resort es ideal para familias?',
              a: 'Sí. Grand Fiesta Americana Riviera Cancún fue diseñado pensando en familias y viajeros de varias generaciones, con espacios dedicados de Kids & Teens Club, áreas de piscina para familias y opciones gastronómicas para huéspedes de todas las edades.'
            },
            {
              q: '¿Qué opciones gastronómicas ofrece el resort?',
              a: 'El resort cuenta con seis restaurantes de servicio completo que abarcan propuestas de cocina mexicana, italiana, japonesa, cocina costera durante todo el día y steakhouse, complementadas por bares y lounge.'
            },
            {
              q: '¿El resort cuenta con spa?',
              a: 'Sí. El Feel Harmony Spa del resort ofrece una completa selección de tratamientos holísticos, rituales corporales y experiencias de bienestar inspiradas en el paisaje natural y las tradiciones ancestrales de México.'
            },
            {
              q: '¿Cuenta con espacios para eventos y bodas?',
              a: 'Grand Fiesta Americana Riviera Cancún cuenta con un centro de convenciones con capacidad para hasta 2,100 huéspedes, además de salones y terrazas exteriores diseñados para bodas y eventos MICE.'
            },
            {
              q: '¿Qué es Grand Club?',
              a: 'Grand Club es la experiencia de acceso premium del resort, que ofrece un lounge privado, una selección gastronómica curada durante todo el día, acceso VIP a piscina y playa y servicio personalizado de concierge.'
            },
            {
              q: '¿Cómo puedo acumular y utilizar puntos Fiesta Rewards?',
              a: 'Fiesta Rewards es el programa de lealtad de Grupo Posadas. Los socios acumulan puntos en estancias participantes que pueden utilizar para futuras reservaciones, upgrades y beneficios exclusivos.'
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              style={{
                background: '#110f17',
                border: '1px solid rgba(196,181,253,0.18)',
                borderRadius: '6px',
                overflow: 'hidden'
              }}
            >
              <button 
                type="button"
                onClick={() => toggleFaq(idx)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '1.2rem 1.6rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: faqAbierta === idx ? '#f3e5ab' : '#ffffff',
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span>{item.q}</span>
                {faqAbierta === idx ? <ChevronUp size={18} color="#d4af37" /> : <ChevronDown size={18} color="#64748b" />}
              </button>

              {faqAbierta === idx && (
                <div style={{ padding: '0 1.6rem 1.4rem', color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. RECONOCIMIENTOS (FORBES, FIESTA REWARDS, HERTZ) */}
      <section style={{ maxWidth: '1280px', margin: '4rem auto 6rem', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          <div style={{ background: '#110f17', border: '1px solid rgba(212,175,55,0.25)', padding: '2.2rem', borderRadius: '8px', textAlign: 'center' }}>
            <Award size={36} color="#d4af37" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#f3e5ab', margin: '0 0 0.6rem 0' }}>FORBES TRAVEL GUIDE</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Los distinguidos reconocimientos de Forbes Travel Guide se otorgan a los establecimientos con los más altos niveles de servicio e instalaciones de lujo.
            </p>
            <Link to="/contacto" style={{ color: '#d4af37', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none' }}>Conocer Reconocimientos →</Link>
          </div>

          <div style={{ background: '#110f17', border: '1px solid rgba(196,181,253,0.25)', padding: '2.2rem', borderRadius: '8px', textAlign: 'center' }}>
            <Sparkles size={36} color="#c4b5fd" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#f3e5ab', margin: '0 0 0.6rem 0' }}>FIESTA REWARDS</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Sea parte de Fiesta Rewards y viva experiencias selectas en cada viaje. Conozca el lujo, lo mejor de nuestra hospitalidad y tarifas de socio.
            </p>
            <Link to="/perfil-socio" style={{ color: '#c4b5fd', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none' }}>Unirse / Mi Cuenta →</Link>
          </div>

          <div style={{ background: '#110f17', border: '1px solid rgba(212,175,55,0.25)', padding: '2.2rem', borderRadius: '8px', textAlign: 'center' }}>
            <Key size={36} color="#d4af37" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#f3e5ab', margin: '0 0 0.6rem 0' }}>HERTZ AVASA</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Renta tu auto con nosotros y obtén hasta un 65% de descuento con Hertz Avasa en el aeropuerto o recepción del resort.
            </p>
            <a href="https://autos.fiestamericanatravelty.com/" target="_blank" rel="noreferrer" style={{ color: '#d4af37', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none' }}>Rentar Vehículo →</a>
          </div>

        </div>
      </section>

    </div>
  );
}