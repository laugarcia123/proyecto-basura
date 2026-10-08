// ============================================================================
// SECCIÓN: Hook Personalizado - useSpeechRecognition
// ============================================================================

/**
 * Hook para manejar la API de reconocimiento de voz del navegador.
 * Extrae la lógica del componente visual para mantener el código limpio y modular.
 *
 * @param {string} idioma - El código del idioma a reconocer (por defecto "es-CO").
 * @returns {Object} Objeto que contiene el texto escuchado, el estado de escucha y la función de inicio.
 */
import { useState } from 'react';

export const useSpeechRecognition = (idioma = "es-CO") => {
  const [textoEscuchado, setTextoEscuchado] = useState("");
  const [isListening, setIsListening] = useState(false);

  const iniciarEscucha = (onResultCallback) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = idioma;
    
    // Nota: Iniciamos el servicio de escucha
    recognition.start();

    recognition.onstart = () => {
      setIsListening(true);
      setTextoEscuchado("");
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTextoEscuchado(speechToText);
      setIsListening(false);
      
      // Nota: Ejecutamos el callback pasando el texto si fue proporcionado
      if (onResultCallback) {
        onResultCallback(speechToText);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onspeechend = () => setIsListening(false);
  };

  return { textoEscuchado, isListening, iniciarEscucha };
};