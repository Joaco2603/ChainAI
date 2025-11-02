# Dockerfile para el modelo GPT Mini - ChainAI Platform
# Este contenedor ejecuta el modelo Transformer entrenado

FROM python:3.9-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar archivos del modelo entrenado
COPY model/ ./model/
COPY vocab.pkl .
COPY config.pkl .

# Copiar script de inferencia
COPY inference.py .

# El contenedor espera recibir el input como argumento
# Ejemplo: docker run gpt-mini '{"prompt": "la inteligencia artificial"}'
ENTRYPOINT ["python", "inference.py"]
