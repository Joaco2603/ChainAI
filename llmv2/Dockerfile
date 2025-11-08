# Multi-stage Dockerfile para Gemma 2B
# Optimizado para deployment en cloud con soporte de GPU opcional

# ============== STAGE 1: Download Model ==============
FROM python:3.11-slim as model-downloader

# Instalar dependencias mínimas para descarga
RUN pip install --no-cache-dir huggingface-hub python-dotenv

# Crear directorio de trabajo
WORKDIR /app

# Copiar script de descarga
COPY download_model.py .

# Argumento de build para el token de HuggingFace
ARG HUGGINGFACE_TOKEN
ENV HUGGINGFACE_TOKEN=${HUGGINGFACE_TOKEN}

# Descargar modelo (solo si se provee token en build time)
RUN if [ -n "$HUGGINGFACE_TOKEN" ]; then \
        python download_model.py --output /model_weights; \
    else \
        echo "⚠️  No HUGGINGFACE_TOKEN provided - modelo debe ser montado como volumen"; \
    fi


# ============== STAGE 2: Runtime ==============
FROM python:3.11-slim

# Metadata
LABEL maintainer="ChainAI Team"
LABEL description="Gemma 2B Inference API with FastAPI"
LABEL version="1.0.0"

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    MODEL_PATH=/app/model_weights \
    PORT=8000 \
    HOST=0.0.0.0

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar modelo desde stage anterior (si existe)
COPY --from=model-downloader /model_weights ./model_weights

# Copiar código de aplicación
COPY inference.py .
COPY download_model.py .
COPY .env* ./

# Crear usuario no-root por seguridad
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Exponer puerto
EXPOSE ${PORT}

# Comando por defecto
CMD ["python", "inference.py"]
