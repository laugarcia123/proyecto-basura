import os
import json
from dotenv import load_dotenv
from fastapi import APIRouter
from pydantic import BaseModel
from google import genai

# Carga las variables del archivo .env
load_dotenv()

# 1. llave de forma segura sin exponerla
API_KEY = os.getenv("GEMINI_API_KEY")
cliente_ai = genai.Client(api_key=API_KEY)

router = APIRouter()

# 2. MODELO DE DATOS
class ResiduoRequest(BaseModel):
    texto: str

# 3. RUTA DEL CLASIFICADOR
@router.post("/clasificar")
def clasificar_residuo(data: ResiduoRequest):
    prompt = f"""
    Eres un experto en normativas de reciclaje en Colombia.
    Analiza este residuo o frase dicha por el usuario: "{data.texto}"
    
    Detecta si hay contaminación cruzada (ej. cartón untado de comida pierde su valor y va a ordinarios).
    
    Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto extra.
    Estructura estricta:
    {{
        "categoria": "Nombre de la caneca",
        "color": "El código HEX (Verde #22c55e, Negro #64748b, Azul #3b82f6, Rojo #ef4444)",
        "mensaje": "Mensaje corto y amigable."
    }}
    """

    try:
        # Usamos la nueva API de Interacciones y el modelo 3.8 que exige Google
        interaccion = cliente_ai.interactions.create(
            model="gemini-3.8-flash",
            input=prompt
        )
        
        # Leemos la respuesta con la nueva sintaxis
        texto_ia = interaccion.output_text.strip()

        # Limpiamos el formato markdown si la IA lo envía
        if texto_ia.startswith("```json"):
            texto_ia = texto_ia[7:-3]
        elif texto_ia.startswith("```"):
            texto_ia = texto_ia[3:-3]

        # Convertimos la respuesta a JSON (solo una vez)
        resultado_json = json.loads(texto_ia)
        resultado_json["residuo"] = data.texto
        
        # Imprime la respuesta en la consola
        print(" RESPUESTA DE LA IA:", resultado_json)
        
        return resultado_json

    except Exception as e:
        print(f"Error en la IA: {e}")
        return {
            "residuo": data.texto,
            "categoria": "Error de conexión",
            "color": "#64748b",
            "mensaje": f"Hubo un error comunicándose con la IA: {e}"
        }