import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2

# Tu carpeta de siempre
ruta_dataset = "dataset" 
TAMAÑO = (256, 256)
LOTE = 32

print("Cargando datos de imágenes para el Cerebro 3.0...")
datos_entrenamiento = tf.keras.utils.image_dataset_from_directory(
    ruta_dataset, validation_split=0.2, subset="training", seed=123,
    image_size=TAMAÑO, batch_size=LOTE
)
datos_validacion = tf.keras.utils.image_dataset_from_directory(
    ruta_dataset, validation_split=0.2, subset="validation", seed=123,
    image_size=TAMAÑO, batch_size=LOTE
)
nombres_clases = datos_entrenamiento.class_names
print(f"Clases detectadas: {nombres_clases}")

# =========================================================
# EL CEREBRO 3.0: TRANSFERENCIA DE APRENDIZAJE
# =========================================================
print("\nContratando al 'experto' (MobileNetV2)...")

# 1. Traemos el modelo experto pero le quitamos su capa final (include_top=False)
# porque él sabe clasificar 1000 cosas y nosotros solo necesitamos 8.
modelo_base = MobileNetV2(input_shape=(256, 256, 3), include_top=False, weights='imagenet')

# 2. CONGELAMOS su conocimiento para no dañarlo durante el entrenamiento
modelo_base.trainable = False 

# 3. Construimos el nuevo modelo uniendo las piezas
modelo = models.Sequential([
    # Aumento de datos para que siga siendo robusto ante fotos movidas
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
    
    # Preprocesamiento matemático exacto que exige MobileNetV2
    layers.Rescaling(1./127.5, offset=-1),
    
    # Añadimos el cerebro del experto
    modelo_base,
    
    # 4. Agregamos TU capa personalizada para DALAT
    layers.GlobalAveragePooling2D(), # Resume todo lo que vio el experto
    layers.Dropout(0.2),             # Evita que se confíe demasiado
    layers.Dense(len(nombres_clases), activation='softmax') # Tus 8 canecas
])

# Compilamos el modelo
modelo.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
              loss=tf.keras.losses.SparseCategoricalCrossentropy(),
              metrics=['accuracy'])

print("\n¡Iniciando Transfer Learning (10 Épocas)!")
print("Tu Acer Predator va a procesar esto súper rápido porque el 90% del cerebro ya está entrenado...")

historial = modelo.fit(
    datos_entrenamiento,
    validation_data=datos_validacion,
    epochs=10
)

# Guardamos este nuevo modelo con otro nombre para no pisar el anterior
modelo.save("modelo_basura_v3.h5")
print("\n¡ÉXITO! Tu Cerebro 3.0 se ha guardado como 'modelo_basura_v3.h5'")