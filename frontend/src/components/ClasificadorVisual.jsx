// ============================================================================
// SECCIÓN: Componente - ClasificadorVisual
// ============================================================================

/**
 * Componente que maneja el hardware de la cámara, la captura de la imagen y 
 * la comunicación con el endpoint de visión artificial.
 *
 * @param {Function} onOpenModal - Callback para abrir el modal de limpieza en App.jsx.
 * @param {number} triggerCapture - Estado numérico que al cambiar dispara la captura de la foto.
 * @param {Function} onResult - Callback para enviar el resultado del backend a App.jsx.
 * @returns {JSX.Element} Interfaz de la cámara con el diseño de escáner.
 */
import React, { useRef, useEffect } from 'react';

export default function ClasificadorVisual({ onOpenModal, triggerCapture, onResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Nota: Inicializamos y limpiamos la cámara al montar/desmontar el componente
  useEffect(() => {
    let currentStream = null;
    
    const iniciarCamara = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (error) {
        console.error("Error accediendo a la cámara:", error);
      }
    };
    
    iniciarCamara();
    
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Nota: Escuchamos cambios en triggerCapture para tomar la foto cuando App.jsx lo ordene
  useEffect(() => {
    if (triggerCapture > 0) {
      capturarYEnviar();
    }
  }, [triggerCapture]);

  const capturarYEnviar = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const contexto = canvas.getContext('2d');
      contexto.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("file", blob, "captura_basura.jpg");
        
        try {
          const respuesta = await fetch("http://127.0.0.1:8000/api/clasificar-imagen", {
            method: "POST",
            body: formData,
          });
          const datos = await respuesta.json();
          onResult(datos);
        } catch (error) {
          console.error("Error al conectar con el servidor de visión:", error);
          // Fallback visual para pruebas sin backend
          onResult({
              categoria: "Caneca Blanca — Aprovechables",
              mensaje: "Este envase plástico está limpio y seco. Deposítalo en la caneca blanca para que pueda entrar nuevamente en el ciclo de aprovechamiento.",
              color: "#c2410c"
          });
        }
      }, 'image/jpeg');
    }
  };

  return (
    <div className="relative bg-[#20301a] rounded-2xl overflow-hidden h-[400px] flex flex-col justify-end p-6 border border-[#2a3a2d] shadow-inner">
      
      {/* Video en vivo */}
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-50" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#3a4a34 1px, transparent 1px), linear-gradient(90deg, #3a4a34 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      {/* Frame corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[#d97746] opacity-70 pointer-events-none"></div>
      <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[#d97746] opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-24 left-8 w-12 h-12 border-b border-l border-[#d97746] opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-24 right-8 w-12 h-12 border-b border-r border-[#d97746] opacity-70 pointer-events-none"></div>

      {/* Escaner line animation */}
      <div className="absolute left-8 right-8 h-[1px] bg-[#d97746] shadow-[0_0_15px_2px_#d97746] animate-[scan_3s_ease-in-out_infinite] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end w-full gap-4">
        <div className="text-white">
          <h3 className="font-bold text-lg font-sans">Centra el objeto</h3>
          <p className="text-white/60 text-sm font-sans">Asegúrate de tener buena iluminación</p>
        </div>
        <button onClick={onOpenModal} className="bg-[#d9b37a] hover:bg-[#c9a36a] text-[#5b401e] font-bold py-3 px-6 rounded-full font-sans transition-colors w-full sm:w-auto shadow-md">
          Analizar residuo
        </button>
      </div>
    </div>
  );
}