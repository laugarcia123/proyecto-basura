import os
import json
import io
import requests

import tensorflow as tf
import numpy as np
from PIL import Image

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from dotenv import load_dotenv

# Carga las variables del archivo .env
load_dotenv()

router = APIRouter()

# ==========================================
# FASE 1: CEREBRO DE LENGUAJE (VOZ/TEXTO)
# ==========================================

class ResiduoRequest(BaseModel):
    texto: str


@router.post("/clasificar")
async def clasificar_residuo(data: ResiduoRequest):
    texto = data.texto
    api_key = os.getenv("GEMINI_API_KEY")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}" 
    
    prompt = f"""
    Eres un experto en normativas de reciclaje en Colombia.
    Analiza este residuo o frase dicha por el usuario: "{texto}"
    
    Detecta si hay contaminación cruzada (ej. cartón untado de comida pierde su valor).
    
    Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto extra.
    Estructura estricta:
    {{
        "categoria": "Nombre de la caneca (ej. Caneca Negra - No aprovechables)",
        "color": "El código HEX (Verde #22c55e, Negro #64748b, Azul #3b82f6, Blanco #ffffff)",
        "mensaje": "Explicación de máximo una línea del porqué. NUNCA menciones el color ni el nombre de la caneca en este mensaje. Ej: 'Al tener restos de comida, el cartón sufre contaminación cruzada'."
    }}
    """
    
    cuerpo_peticion = {
        "contents": [{"parts":[{"text": prompt}]}],
        # ¡Aquí estaba el detalle! Usamos responseMimeType (con M mayúscula)
        "generationConfig": {"responseMimeType": "application/json"} 
    }

    try:
        respuesta = requests.post(url, json=cuerpo_peticion)
        datos_gemini = respuesta.json()
        
        # Si Google nos devuelve un error por alguna razón, lo atrapamos aquí
        if "error" in datos_gemini:
            print(f"ERROR DE GOOGLE: {datos_gemini['error']}")
            return {
                "residuo": texto,
                "categoria": "Error en Google",
                "color": "#ef4444",
                "mensaje": datos_gemini['error'].get('message', 'Error desconocido en la API.')
            }
        
        # Extraemos el texto de la respuesta
        texto_ia = datos_gemini['candidates'][0]['content']['parts'][0]['text']
        
        # Convertimos la respuesta a JSON
        resultado_json = json.loads(texto_ia)
        resultado_json["residuo"] = texto
        
        print(" RESPUESTA DE LA IA:", resultado_json)
        return resultado_json

    except Exception as e:
        print(f"Error procesando la respuesta: {e}")
        return {
            "residuo": texto,
            "categoria": "Error de servidor",
            "color": "#ef4444",
            "mensaje": "Hubo un error procesando los datos del cerebro de lenguaje."
        }


# ==========================================
# FASE 2: CEREBRO VISUAL (TENSORFLOW LOCAL)
# ==========================================

# Cargar tu Cerebro Visual a la memoria del servidor
ruta_modelo = "entrenamiento_ia/modelo_basura_v3.h5"
try:
    modelo_vision = tf.keras.models.load_model(ruta_modelo)
    print("¡Modelo visual cargado con éxito!")
except Exception as e:
    print(f"Error cargando el modelo: {e}")

# Estas son las 8 clases que aprendió tu IA en el orden exacto
CLASES_IA = ['battery', 'biological', 'cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

def mapear_a_caneca(clase_detectada):
    if clase_detectada == 'biological':
        return {"categoria": "Caneca Verde - Orgánicos", "color": "#22c55e", "mensaje": "Residuo orgánico ideal para compostaje."}
    elif clase_detectada in ['cardboard', 'glass', 'metal', 'paper', 'plastic']:
        return {"categoria": "Caneca Blanca - Aprovechables", "color": "#ffffff", "mensaje": "Asegúrate de que esté limpio y seco antes de botarlo."}
    elif clase_detectada == 'battery':
        return {"categoria": "Punto Rojo - Peligrosos", "color": "#ef4444", "mensaje": "¡CUIDADO! Las pilas contaminan el agua. Llévalas a un punto de recolección especial."}
    else: # trash
        return {"categoria": "Caneca Negra - No aprovechables", "color": "#64748b", "mensaje": "Este material no se puede reciclar, va a relleno sanitario."}

@router.post("/clasificar-imagen")
async def clasificar_imagen(file: UploadFile = File(...)):
    # 1. Leer los bytes de la imagen
    imagen_bytes = await file.read()
    
    # 2. Convertir y ajustar a 256x256
    imagen = Image.open(io.BytesIO(imagen_bytes)).convert("RGB")
    imagen = imagen.resize((256, 256))
    
    # 3. Traducir a matriz
    imagen_array = np.array(imagen)
    imagen_array = np.expand_dims(imagen_array, axis=0)
    
    # 4. Predicción
    predicciones = modelo_vision.predict(imagen_array)
    indice_ganador = np.argmax(predicciones[0])
    clase_ganadora = CLASES_IA[indice_ganador]
    
    # 5. Formatear
    respuesta = mapear_a_caneca(clase_ganadora)
    respuesta["residuo"] = clase_ganadora
    
    return respuesta