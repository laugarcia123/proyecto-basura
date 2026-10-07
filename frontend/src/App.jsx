import React, { useState } from "react";
import ClasificadorVisual from './components/ClasificadorVisual';

function App() {
  const [textoEscuchado, setTextoEscuchado] = useState("");
  const [resultado, setResultado] = useState(null);
  const [colorBasura, setColorBasura] = useState("#cbd5e1"); // Color gris inicial por defecto
  const [isListening, setIsListening] = useState(false);

  // Función para iniciar el reconocimiento de voz del navegador
  const iniciarEscucha = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-CO"; // Configurado a español
    recognition.start();

    recognition.onstart = () => {
      setIsListening(true);
      setResultado(null);
    };

    recognition.onresult = async (event) => {
      const speechToText = event.results[0][0].transcript;
      setTextoEscuchado(speechToText);
      setIsListening(false);
      
      // Enviar al backend de FastAPI
      await enviarAlBackend(speechToText);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onspeechend = () => {
      setIsListening(false);
    };
  };

  const enviarAlBackend = async (texto) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/clasificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const data = await response.json();
      setResultado(data);
      setColorBasura(data.color); // Cambia el color de la papelera según la respuesta
    } catch (error) {
      console.error("Error conectando con el backend:", error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 text-white font-sans p-8">
      
      {/* Encabezado Principal */}
      <h1 className="text-4xl font-bold mb-3 text-emerald-400">DALAT ♻️</h1>
      <p className="text-slate-400 mb-10 text-lg">Asistente Universitario de Clasificación Inteligente</p>

      {/* Contenedor de 2 Columnas (Voz a la Izquierda, Visión a la Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
        
        {/* ================= COLUMNA 1: VOZ ================= */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-8 text-slate-200">Fase 1: Control por Voz</h2>
          
          {/* Ilustración interactiva de la Basura */}
          <div className="relative mb-8 flex flex-col items-center">
            <div 
              className="w-32 h-40 rounded-t-2xl rounded-b-lg transition-all duration-500 shadow-2xl flex items-center justify-center border-4 border-slate-700"
              style={{ backgroundColor: colorBasura }}
            >
              <span className="text-4xl">🗑️</span>
            </div>
            <div className="w-40 h-4 bg-slate-700 rounded-full mt-2"></div>
          </div>

          {/* Botón de voz */}
          <button
            onClick={iniciarEscucha}
            className={`px-6 py-3 rounded-full font-semibold text-lg transition-all shadow-lg flex items-center gap-2 ${
              isListening 
                ? "bg-red-500 animate-pulse text-white" 
                : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
            }`}
          >
            {isListening ? "Escuchando..." : "🎙️ Decir qué voy a botar"}
          </button>

          {/* Resultados de Voz */}
          {textoEscuchado && (
            <div className="mt-6 text-center w-full max-w-md bg-slate-900 p-4 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">Dijiste: <span className="text-white italic">"{textoEscuchado}"</span></p>
              {resultado && (
                <div className="mt-3">
                  <p className="text-xl font-bold" style={{ color: resultado.color }}>
                    {resultado.mensaje}
                  </p>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300 mt-2 inline-block">
                    Categoría: {resultado.categoria}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= COLUMNA 2: VISIÓN ================= */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-8 text-slate-200">Fase 2: Visión IA Local</h2>
          
          {/* Aquí se inyecta tu componente de React */}
          <div className="w-full">
            <ClasificadorVisual />
          </div>
          
        </div>

      </div>
    </div>
  );
}

export default App;