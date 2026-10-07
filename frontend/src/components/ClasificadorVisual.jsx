import React, { useState, useRef, useEffect } from 'react';

export default function ClasificadorVisual() {
  // Referencias para manipular los elementos de video y canvas directamente
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Estados de la interfaz
  const [stream, setStream] = useState(null);
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [blobImagen, setBlobImagen] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorCamara, setErrorCamara] = useState("");

  // 1. Encender la cámara
  const iniciarCamara = async () => {
    setErrorCamara("");
    setResultado(null);
    setFotoCapturada(null);
    
    try {
      // Pedimos permiso para usar la cámara (intenta usar la trasera en celulares)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      
      // Conectamos el flujo de la cámara a la etiqueta <video>
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accediendo a la cámara:", error);
      setErrorCamara("No se pudo acceder a la cámara. Por favor permite los permisos en el navegador.");
    }
  };

  // 2. Apagar la cámara (para no gastar batería)
  const detenerCamara = (mediaStream) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
  };

  // 3. Tomar la foto
  const capturarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ajustamos el tamaño del canvas al del video real
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dibujamos el fotograma actual del video en el canvas
      const contexto = canvas.getContext('2d');
      contexto.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertimos ese dibujo a un archivo real (Blob) tipo JPEG
      canvas.toBlob((blob) => {
        setBlobImagen(blob);
        setFotoCapturada(URL.createObjectURL(blob)); // Para la vista previa
        
        // Apagamos la cámara apenas tomamos la foto
        detenerCamara(stream);
        setStream(null);
      }, 'image/jpeg');
    }
  };

  // 4. Enviar la foto al backend
  const enviarImagen = async () => {
    if (!blobImagen) return;
    setCargando(true);

    const formData = new FormData();
    // Le pasamos el Blob creado simulando que es un archivo subido
    formData.append("file", blobImagen, "captura_basura.jpg");

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/api/clasificar-imagen", {
        method: "POST",
        body: formData,
      });
      
      const datos = await respuesta.json();
      setResultado(datos);
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    } finally {
      setCargando(false);
    }
  };

  // Limpieza de seguridad: si el usuario cambia de página, apagamos la cámara
  useEffect(() => {
    return () => {
      if (stream) detenerCamara(stream);
    };
  }, [stream]);

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      
      {/* Zona de visualización (Cámara o Foto tomada) */}
      <div className="relative w-full max-w-sm bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 shadow-inner flex items-center justify-center min-h-[300px]">
        
        {/* Si hay error de permisos */}
        {errorCamara && (
          <p className="text-red-400 p-4 text-center">{errorCamara}</p>
        )}

        {/* Si no hay cámara activa ni foto tomada */}
        {!stream && !fotoCapturada && !errorCamara && (
          <div className="text-slate-500 text-center p-6">
            <span className="text-6xl block mb-2">📷</span>
            <p>La cámara está apagada</p>
          </div>
        )}

        {/* El video en vivo */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover ${!stream ? 'hidden' : 'block'}`}
        />

        {/* La foto capturada (vista previa) */}
        {fotoCapturada && (
          <img 
            src={fotoCapturada} 
            alt="Captura" 
            className="w-full h-full object-cover"
          />
        )}

        {/* Canvas invisible usado para "congelar" la foto */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controles y Botones */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        
        {!stream && !fotoCapturada ? (
          // Botón para Encender Cámara
          <button 
            onClick={iniciarCamara}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            <span>📹</span> Encender Cámara
          </button>
        ) : stream ? (
          // Botón para Tomar la Foto
          <button 
            onClick={capturarFoto}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <span>📸</span> Capturar Residuo
          </button>
        ) : (
          // Botones post-captura
          <div className="flex gap-2">
            <button 
              onClick={iniciarCamara}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-2 rounded-lg transition-colors text-sm"
            >
              🔄 Repetir foto
            </button>
            <button 
              onClick={enviarImagen}
              disabled={cargando}
              className={`flex-[2] font-bold py-3 px-4 rounded-lg text-slate-900 transition-colors shadow-lg ${
                cargando ? "bg-emerald-700 text-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20"
              }`}
            >
              {cargando ? "Analizando..." : "🔍 Clasificar"}
            </button>
          </div>
        )}
      </div>

      {/* Tarjeta de Resultado */}
      {resultado && (
        <div 
          className="mt-4 w-full max-w-sm p-5 rounded-xl border-2 text-center shadow-lg transform transition-all animate-fade-in-up bg-slate-900"
          style={{ borderColor: resultado.color }}
        >
          <h3 className="text-xl font-bold mb-1" style={{ color: resultado.color }}>
            {resultado.categoria}
          </h3>
          <p className="text-slate-300 text-sm">{resultado.mensaje}</p>
          <div className="mt-3 inline-block bg-slate-800 border border-slate-700 rounded-full px-3 py-1">
            <p className="text-xs text-slate-400">
              IA detectó: <span className="font-bold text-white uppercase">{resultado.residuo}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}