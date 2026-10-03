# Backend del Asistente de Reciclaje Inteligente (Fase 1: Voz)

Backend modular desarrollado en **FastAPI** para la clasificación inteligente de residuos sólidos. Diseñado bajo una arquitectura escalable que separa la lógica de negocio de las reglas de clasificación mediante un archivo externo (`reglas.json`), permitiendo gestionar prioridades y facilitando la futura integración con texto libre y visión por computadora (cámara).

---

## Tecnologías Utilizadas
* **Python 3.10+**
* **FastAPI** 
* **Uvicorn** (Servidor ASGI)
* **Pydantic** (Validación de datos)

---

## Sistema de Prioridades y Jerarquías
Para garantizar que el sistema tome decisiones precisas frente a frases mixtas o ambiguas, el backend evalúa las reglas de manera ordenada según el nivel de prioridad definido en el archivo reglas.json:

Prioridad 1 (Contaminados / No aprovechables): Evalúa primero si el residuo está sucio o corresponde a elementos sanitarios/ordinarios. Si coincide, anula cualquier otra categoría por motivos normativos de salubridad y reciclaje.

Prioridad 2 (Aprovechables Orgánicos): Evalúa elementos compostables y restos de alimentos.

Prioridad 3 (Reciclables): Evalúa plásticos, cartón, vidrio y metales limpios.

Caso por Defecto: Si ninguna regla coincide o hay ambigüedad, el sistema deriva el residuo a la categoría ordinaria por precaución.


TENER EN CUENTA

A largo plazo (El límite de la escalabilidad):
Si el día de mañana descubres 50 o 100 casos condicionales distintos, ese bloque se va a llenar de puros if / elif, y tu archivo volverá a ser gigantesco.
¿Cómo lo resuelven los profesionales cuando llegan a ese punto?
Sacan todas esas reglas condicionales a un archivo aparte (por ejemplo, creando un archivo app/routers/excepciones.py), y en el clasificador solo llaman a una función que dice evaluar_excepciones(texto). Así mantienen el archivo principal cortito y ordenado.