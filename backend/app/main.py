from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import clasificador

app = FastAPI(
    title="Asistente de Reciclaje API",
    description=(
        "Backend modular para la clasificación inteligente de residuos"
    ),
    version="1.0.0",
)

# Configurar CORS para permitir la conexión con tu frontend en React (Vite corre por defecto en el puerto 5173 o 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción puedes restringirlo a tu dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas (routers)
app.include_router(clasificador.router, prefix="/api", tags=["Clasificador"])

