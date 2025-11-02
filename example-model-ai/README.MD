# GPT Mini Model - ChainAI Example

Este es un modelo de ejemplo **GPT Mini** (Transformer Decoder-only) entrenado con titulares en español, diseñado para integrarse con la plataforma ChainAI.

## 🚀 Quick Start

### 1. Entrenar el Modelo

```bash
# Instalar dependencias
pip install -r requirements.txt

# Entrenar
python train_model.py
```

### 2. Construir Imagen Docker

```powershell
# Windows
.\build.ps1 -Test

# Linux/Mac
chmod +x build.sh && ./build.sh
```

### 3. Registrar en ChainAI

```bash
# Subir a Docker Hub
docker tag gpt-mini-model:latest tuusuario/gpt-mini-model:latest
docker push tuusuario/gpt-mini-model:latest

# Registrar en la plataforma
curl -X POST http://localhost:8000/api/v1/models/upload-model \
  -H "Content-Type: application/json" \
  -d '{"docker_image_url": "tuusuario/gpt-mini-model:latest"}'
```

## 📚 Documentación Completa

Ver **[GUIDE.md](./GUIDE.md)** para instrucciones detalladas paso a paso.

## 🧠 Arquitectura

- **Tipo**: Transformer Decoder-only (GPT-style)
- **Vocabulario**: 20,000 palabras
- **Embedding Dim**: 256
- **Attention Heads**: 2
- **Max Sequence Length**: 80 tokens

## 📁 Archivos

- `main.ipynb` - Notebook de desarrollo original
- `train_model.py` - Script de entrenamiento
- `inference.py` - Script de inferencia para Docker
- `Dockerfile` - Configuración Docker
- `build.ps1` / `build.sh` - Scripts de construcción
- `clean_titulares.txt` - Dataset de entrenamiento
- `GUIDE.md` - Guía completa de uso

## 🔗 Integración con ChainAI

Este modelo está diseñado para funcionar automáticamente con el backend de ChainAI:

1. **Input**: JSON `{"prompt": "texto inicial"}`
2. **Output**: JSON `{"output": "texto generado", ...}`
3. **Formato**: Compatible con `docker_worker_service.py`

## ⚙️ Requisitos

- Python 3.9+
- TensorFlow 2.10+
- Docker Desktop
- 4GB RAM mínimo

---

**Para información completa, consulta [GUIDE.md](./GUIDE.md)**
