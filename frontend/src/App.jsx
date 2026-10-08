// ============================================================================
// SECCIÓN: Componente Principal - App
// ============================================================================

import React, { useState } from "react";
import ClasificadorVisual from './components/ClasificadorVisual';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

function App() {
  const [metodo, setMetodo] = useState('camara'); 
  const [resultado, setResultado] = useState(null);
  const [textoManual, setTextoManual] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // Nota: Agregamos el estado del disparador fotográfico
  const [triggerCapture, setTriggerCapture] = useState(0);
  
  const { textoEscuchado, isListening, iniciarEscucha } = useSpeechRecognition("es-CO");

  const API_URL = "http://127.0.0.1:8000/api/clasificar";

  const enviarAlBackend = async (texto) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error("Error conectando con el backend:", error);
      setResultado({
        categoria: "Caneca Blanca — Aprovechables",
        mensaje: "Este envase plástico está limpio y seco. Deposítalo en la caneca blanca para que pueda entrar nuevamente en el ciclo de aprovechamiento.",
        color: "#c2410c"
      });
    }
  };

  const handleEscuchar = () => {
    iniciarEscucha(enviarAlBackend);
  };

  const handleClasificarManual = () => {
    if (textoManual.trim() !== "") {
      enviarAlBackend(textoManual);
    }
  };

  const handleAnalizarResiduo = () => {
    setMostrarModal(true);
  };

  const confirmarObjetoLimpio = () => {
    setMostrarModal(false);
    // Nota: Modificamos esto para que dispare la foto en ClasificadorVisual
    setTriggerCapture(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#fdfaf0] text-[#334139] font-serif flex flex-col items-center py-12 px-4 relative">
      
      {/* ============================================================================
      // SECCIÓN: Encabezado Principal
      // ============================================================================ */}
      <div className="mb-12 text-center flex flex-col items-center">
        <div className="flex items-center gap-2 border border-[#d1c8b8] rounded-full px-4 py-1 mb-6 bg-white/50">
          <span className="w-2 h-2 rounded-full bg-[#d97746]"></span>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#8b7d6b] uppercase">Clasificación Inteligente de Residuos</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-normal text-[#2a3a2d] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>Free Sort</h1>
      </div>

      <div className="w-full max-w-4xl flex justify-end mb-2">
         <span className="text-[10px] sm:text-xs text-[#8b7d6b]">Selecciona el método que te resulte más fácil</span>
      </div>

      {/* ============================================================================
      // SECCIÓN: Selector de Métodos (Tabs)
      // ============================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-6">
        
        <button 
          onClick={() => {setMetodo('camara'); setResultado(null);}}
          className={`flex flex-col items-start p-6 rounded-2xl transition-all duration-300 ${metodo === 'camara' ? 'bg-[#6b7b54] text-white shadow-md' : 'bg-[#fdfaf0] text-[#334139] hover:bg-[#f5f1e6] border border-[#e5dfce]'}`}
        >
          <div className={`p-2 rounded-full mb-4 transition-colors ${metodo === 'camara' ? 'bg-white/20' : 'bg-[#f5f1e6]'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <h3 className="font-bold text-lg mb-1 font-sans">Cámara</h3>
          <p className={`text-sm font-sans ${metodo === 'camara' ? 'text-white/80' : 'text-[#8b7d6b]'}`}>Escanea un objeto</p>
        </button>

        <button 
          onClick={() => {setMetodo('voz'); setResultado(null);}}
          className={`flex flex-col items-start p-6 rounded-2xl transition-all duration-300 ${metodo === 'voz' ? 'bg-[#6b7b54] text-white shadow-md' : 'bg-[#fdfaf0] text-[#334139] hover:bg-[#f5f1e6] border border-[#e5dfce]'}`}
        >
          <div className={`p-2 rounded-full mb-4 transition-colors ${metodo === 'voz' ? 'bg-white/20' : 'bg-[#f5f1e6]'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          </div>
          <h3 className="font-bold text-lg mb-1 font-sans">Voz</h3>
          <p className={`text-sm font-sans ${metodo === 'voz' ? 'text-white/80' : 'text-[#8b7d6b]'}`}>Cuéntanos qué tienes</p>
        </button>

        <button 
          onClick={() => {setMetodo('escritura'); setResultado(null);}}
          className={`flex flex-col items-start p-6 rounded-2xl transition-all duration-300 ${metodo === 'escritura' ? 'bg-[#6b7b54] text-white shadow-md' : 'bg-[#fdfaf0] text-[#334139] hover:bg-[#f5f1e6] border border-[#e5dfce]'}`}
        >
          <div className={`p-2 rounded-full mb-4 transition-colors ${metodo === 'escritura' ? 'bg-white/20' : 'bg-[#f5f1e6]'}`}>
            <span className="font-serif text-lg leading-none flex items-center justify-center w-5 h-5">T</span>
          </div>
          <h3 className="font-bold text-lg mb-1 font-sans">Escritura</h3>
          <p className={`text-sm font-sans ${metodo === 'escritura' ? 'text-white/80' : 'text-[#8b7d6b]'}`}>Descríbelo en detalle</p>
        </button>
      </div>

      {/* ============================================================================
      // SECCIÓN: Área Principal de Trabajo (Contenido dinámico)
      // ============================================================================ */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-[#e5dfce] p-4 mb-6 transition-all duration-500 overflow-hidden">
        
        {metodo === 'camara' && (
          /* Nota: Reemplazamos el HTML estático por el componente ClasificadorVisual */
          <ClasificadorVisual 
            onOpenModal={handleAnalizarResiduo} 
            triggerCapture={triggerCapture} 
            onResult={setResultado} 
          />
        )}

        {metodo === 'voz' && (
          <div className="bg-[#f2efe6] rounded-2xl h-[400px] flex flex-col items-center justify-center p-8 border border-transparent">
            <button 
              onClick={handleEscuchar}
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 transition-all duration-300 ${isListening ? 'bg-[#6b7b54] text-white animate-pulse shadow-[0_0_20px_rgba(107,123,84,0.5)]' : 'bg-[#6b7b54] text-white hover:bg-[#5a6a43] shadow-lg'}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            </button>
            
            <div className="flex items-center gap-1.5 mb-8 h-12">
                {[1, 2, 3, 4, 3, 5, 2, 1, 3].map((h, i) => (
                    <div key={i} className={`w-1 bg-[#d9b37a] rounded-full transition-all duration-300 ${isListening ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`} style={{ height: `${h * 8}px`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>

            <h3 className="font-bold text-xl text-[#334139] mb-2 font-sans">{isListening ? "Escuchando..." : "Toca para hablar"}</h3>
            <p className="text-[#8b7d6b] text-sm font-sans">{textoEscuchado ? `"${textoEscuchado}"` : 'Por ejemplo: "Tengo una botella plástica limpia"'}</p>
          </div>
        )}

        {metodo === 'escritura' && (
          <div className="bg-[#f2efe6] rounded-2xl h-[400px] flex flex-col p-8 border border-transparent">
            <h3 className="font-serif text-3xl text-[#334139] mb-6">Describe el residuo</h3>
            <div className="relative flex-grow flex flex-col">
              <textarea 
                value={textoManual}
                onChange={(e) => setTextoManual(e.target.value)}
                className="w-full flex-grow bg-transparent border border-[#6b7b54] rounded-xl p-4 focus:outline-none focus:ring-1 focus:ring-[#6b7b54] resize-none font-sans text-[#334139] placeholder-[#8b7d6b]"
                placeholder="Ej. Una caja de pizza con restos de comida..."
              ></textarea>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
                <span className="text-xs text-[#8b7d6b] font-sans">Incluye el material y su estado</span>
                <button onClick={handleClasificarManual} className="bg-[#d9b37a] hover:bg-[#c9a36a] text-[#5b401e] font-bold py-3 px-8 rounded-full font-sans transition-colors w-full sm:w-auto shadow-md">
                  Clasificar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ============================================================================
      // SECCIÓN: Tarjeta de Resultado Dinámico
      // ============================================================================ */}
      <div className={`w-full max-w-4xl bg-[#fdfaf0] border border-[#d97746] rounded-2xl p-6 md:p-8 transition-all duration-500 relative overflow-hidden ${resultado ? 'opacity-100 translate-y-0' : (metodo !== 'camara' ? 'opacity-100' : 'opacity-0 hidden')}`}>
        
        <div className="absolute top-0 right-0 w-64 h-64 border border-[#e5dfce] rounded-full translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
          <div className="bg-[#f5ebd8] w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
             <span className="text-[#d97746] text-xl">{metodo === 'escritura' && !resultado ? 'T' : '🗑️'}</span>
          </div>
          <div className="flex-grow">
            <span className="text-[10px] font-bold text-[#d97746] uppercase tracking-widest font-sans block mb-1">
              {resultado ? 'CLASIFICACIÓN DETECTADA' : (metodo === 'escritura' ? 'CONSULTA POR DESCRIPCIÓN' : 'LISTO PARA ESCUCHAR')}
            </span>
            <h2 className="text-2xl font-serif text-[#334139] mb-3">
              {resultado ? resultado.categoria : (metodo === 'escritura' ? '¿Qué quieres clasificar?' : 'Describe tu residuo')}
            </h2>
            <p className="text-sm text-[#6b7b54] font-sans max-w-3xl leading-relaxed">
              {resultado ? resultado.mensaje : (metodo === 'escritura' ? 'Escribe el nombre del residuo y algunos detalles sobre su estado. Nuestra guía te ayudará a disponerlo correctamente.' : 'Cuéntanos de qué material está hecho, si está limpio y si contiene restos. Con esos detalles podremos indicarte la caneca correcta.')}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#eae4d3] hover:bg-[#e0d9c5] text-[#5b6b44] text-xs font-bold py-2 px-4 rounded-full font-sans transition-colors shrink-0 mt-4 sm:mt-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            Guía ambiental
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl mt-8 text-left">
        <p className="text-[10px] text-[#a9a093] font-sans">Pequeñas decisiones, grandes cambios para el planeta.</p>
      </div>

      {/* ============================================================================
      // SECCIÓN: Modal de Confirmación
      // ============================================================================ */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fdfaf0] rounded-3xl p-8 md:p-12 max-w-lg w-full text-center relative shadow-2xl animate-fade-in">
            <button onClick={() => setMostrarModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f1e6] text-[#8b7d6b] hover:bg-[#eae4d3] transition-colors">
              ✕
            </button>
            
            <div className="mx-auto w-16 h-16 bg-[#f5ebd8] rounded-2xl flex items-center justify-center text-[#d97746] mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>

            <span className="text-[10px] font-bold text-[#d97746] uppercase tracking-widest font-sans block mb-3">ANTES DE ESCANEAR</span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#334139] mb-4">¿El objeto está limpio?</h2>
            <p className="text-[#6b7b54] font-sans mb-10 text-sm md:text-base leading-relaxed">Si está sucio, mezclado o untado de alguna sustancia, será más fácil clasificarlo describiéndolo con tu voz.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => {setMostrarModal(false); setMetodo('voz');}} className="flex-1 border border-[#6b7b54] text-[#6b7b54] hover:bg-[#eae4d3] font-bold py-3 px-6 rounded-full font-sans transition-colors">
                Ir al apartado de Voz
              </button>
              <button onClick={confirmarObjetoLimpio} className="flex-1 bg-[#6b7b54] hover:bg-[#5a6a43] text-white font-bold py-3 px-6 rounded-full font-sans transition-colors shadow-lg">
                El objeto está limpio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nota: Estilos CSS inyectados para las animaciones requeridas */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 15%; }
          50% { top: 85%; }
          100% { top: 15%; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}

export default App;