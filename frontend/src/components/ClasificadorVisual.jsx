// ============================================================================
// SECCIÓN: Componente - ClasificadorVisual
// ============================================================================

import React, { useRef, useEffect } from 'react';

export default function ClasificadorVisual({ onOpenModal, triggerCapture, onResult, isAnalyzing, setIsAnalyzing }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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

  useEffect(() => {
    if (triggerCapture > 0) {
      capturarYEnviar();
    }
  }, [triggerCapture]);

  const capturarYEnviar = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("El video aún no tiene dimensiones.");
      return; 
    }

    onResult(null); 
    setIsAnalyzing(true); // Activa el modal "Escaneando..." en App.jsx

    // Retraso de UX de 1.5s para que la instrucción "mantén el objeto" sea real
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const contexto = canvas.getContext('2d');
      contexto.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      if (!blob) throw new Error("No se pudo extraer la imagen del canvas.");

      const formData = new FormData();
      formData.append("file", blob, "captura_basura.jpg");
      
      const respuesta = await fetch("http://localhost:8000/api/clasificar-imagen", {
        method: "POST",
        body: formData,
      });
      
      if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
      
      const datos = await respuesta.json();
      onResult(datos); 
    } catch (error) {
      console.error("Error al conectar con el servidor de visión:", error);
      onResult({
          categoria: "Error de conexión",
          mensaje: `Error al procesar la imagen: ${error.message}. Verifica que el backend responda en localhost:8000.`,
          color: "#ef4444"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative bg-[#20301a] rounded-2xl overflow-hidden h-[400px] flex flex-col justify-end p-6 border border-[#2a3a2d] shadow-inner">
      
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-50" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#3a4a34 1px, transparent 1px), linear-gradient(90deg, #3a4a34 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="absolute inset-x-8 top-12 bottom-28 pointer-events-none">
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#d97746] opacity-80"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#d97746] opacity-80"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#d97746] opacity-80"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#d97746] opacity-80"></div>

        <div className="absolute inset-x-4 inset-y-4 overflow-hidden">
          <div className={`absolute left-0 right-0 h-[2px] bg-[#d97746] shadow-[0_0_15px_3px_#d97746] ${isAnalyzing ? 'animate-[scan-fast_1s_ease-in-out_infinite]' : 'animate-[scan_3s_ease-in-out_infinite]'}`}></div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end w-full gap-4">
        <div className="text-white">
          <h3 className="font-bold text-lg font-sans">Centra el objeto</h3>
          <p className="text-white/60 text-sm font-sans">Asegúrate de tener buena iluminación</p>
        </div>
        <button 
          onClick={onOpenModal} 
          disabled={isAnalyzing}
          className={`font-bold py-3 px-6 rounded-full font-sans transition-colors w-full sm:w-auto shadow-md ${
            isAnalyzing ? 'bg-[#c9a36a] text-[#5b401e]/70 cursor-wait' : 'bg-[#d9b37a] hover:bg-[#c9a36a] text-[#5b401e]'
          }`}>
          {isAnalyzing ? 'Escaneando...' : 'Analizar residuo'}
        </button>
      </div>
    </div>
  );
}