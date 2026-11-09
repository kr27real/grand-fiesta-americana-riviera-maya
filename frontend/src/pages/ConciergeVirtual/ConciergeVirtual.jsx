import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, MessageSquare } from 'lucide-react';

export default function ConciergeVirtual() {
  const [mensajes, setMensajes] = useState([
    { remitente: 'bot', texto: '¡Bienvenido a Grand Fiesta Americana Riviera Cancún! Soy tu Concierge Virtual 24/7. ¿En qué puedo asistirte durante tu estancia?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const mensajeUsuario = input;
    setMensajes((prev) => [...prev, { remitente: 'user', texto: mensajeUsuario }]);
    setInput('');
    setLoading(true);

    // Simulación de respuesta inteligente del Concierge del Resort
    setTimeout(() => {
      let respuestaBot = 'Entendido. Con gusto canalizo tu solicitud con nuestro equipo de Concierge en recepción para atenderte de inmediato.';
      
      const lower = mensajeUsuario.toLowerCase();
      if (lower.includes('spa') || lower.includes('masaje')) {
        respuestaBot = 'Nuestro Feel Harmony Spa está abierto de 09:00 a 21:00 hrs. ¿Te gustaría que agendemos una cita o hidromasaje?';
      } else if (lower.includes('restaurante') || lower.includes('comer') || lower.includes('cenar')) {
        respuestaBot = 'Contamos con especialidades internacionales en Rosato (Italiana), Península (Mariscos) y Viña del Mar. ¿Deseas reservar una mesa?';
      } else if (lower.includes('transport') || lower.includes('aeropuerto')) {
        respuestaBot = 'Recuerda que tu reservación incluye transportación gratuita aeropuerto-hotel. Nuestro equipo de logística confirmará tu horario.';
      }

      setMensajes((prev) => [...prev, { remitente: 'bot', texto: respuestaBot }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '3rem 2rem', color: '#fff', backgroundColor: '#121212', minHeight: '80vh', maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="text-amber-400" size={28} />
        <h1 className="text-3xl font-serif text-amber-300">Concierge Virtual 24/7</h1>
      </div>
      <p className="text-zinc-400 text-sm mb-6">Asistencia personalizada en tiempo real para tu estancia en el resort.</p>

      <div className="bg-zinc-900 border border-amber-500/20 rounded-xl shadow-2xl flex flex-col h-[550px] overflow-hidden">
        {/* Contenedor de Mensajes */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {mensajes.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.remitente === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.remitente === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Bot size={18} />
                </div>
              )}
              <div className={`max-w-[75%] p-4 rounded-xl text-sm ${msg.remitente === 'user' ? 'bg-amber-600 text-zinc-950 font-medium rounded-tr-none' : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                {msg.texto}
              </div>
              {msg.remitente === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 flex-shrink-0">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 items-center text-zinc-500 text-xs italic">
              <Bot size={16} className="animate-pulse text-amber-400" /> El Concierge está escribiendo...
            </div>
          )}
        </div>

        {/* Input de Mensaje */}
        <form onSubmit={handleEnviar} className="bg-zinc-950 p-4 border-t border-zinc-800 flex gap-3">
          <input 
            type="text" 
            placeholder="Pregunta sobre restaurantes, spa, servicios..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:border-amber-500 outline-none text-sm"
          />
          <button 
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 text-zinc-950 px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Send size={16} /> Enviar
          </button>
        </form>
      </div>
    </div>
  );
}