# Gemma 2B Inference API

API REST para generación de texto usando el modelo **Gemma 2B** de Google, lista para deployment en Docker y servicios cloud.

## 📋 Características

- ✅ Modelo Gemma 2B de Google (2 billones de parámetros)
- ✅ API REST con FastAPI
- ✅ Soporte para CPU y GPU (CUDA)
- ✅ Docker & Docker Compose
- ✅ Scripts automatizados de setup
- ✅ Listo para cloud deployment (Railway, Render, GCP, AWS)
- ✅ Documentación interactiva con Swagger

## 🚀 Quick Start

### Opción 1: Setup Automático (Windows)

```powershell
# Ejecutar script de setup
.\setup.ps1
```

Este script automáticamente:
1. Crea entorno Conda
2. Instala dependencias
3. Configura archivo `.env`
4. Ofrece descargar el modelo

### Opción 2: Setup Manual

```powershell
# 1. Crear entorno Conda
conda create -n gemma2b python=3.11 -y
conda activate gemma2b

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
copy .env.example .env
# Editar .env y agregar tu HUGGINGFACE_TOKEN

# 4. Descargar modelo (~5GB)
python download_model.py
```

## 🔑 Obtener Token de HuggingFace

1. Ve a https://huggingface.co/settings/tokens
2. Crea un token de acceso (tipo "Read")
3. Acepta los términos de uso de Gemma en: https://huggingface.co/google/gemma-2b
4. Copia el token a tu archivo `.env`:
   ```
   HUGGINGFACE_TOKEN=tu_token_aqui
   ```

## 💻 Uso Local

### Ejecutar API

```powershell
conda activate gemma2b
python inference.py
```

La API estará disponible en:
- **API:** http://localhost:8000
- **Documentación:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

### Probar Localmente

```powershell
python test_local.py
```

### Ejemplos de Uso

**cURL:**
```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "La inteligencia artificial es",
    "max_length": 50,
    "temperature": 0.7
  }'
```

**Python:**
```python
import requests

response = requests.post(
    "http://localhost:8000/generate",
    json={
        "prompt": "La inteligencia artificial es",
        "max_length": 50,
        "temperature": 0.7
    }
)
print(response.json()["generated_text"])
```

**JavaScript:**
```javascript
fetch('http://localhost:8000/generate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    prompt: 'La inteligencia artificial es',
    max_length: 50,
    temperature: 0.7
  })
})
.then(r => r.json())
.then(data => console.log(data.generated_text));
```

## 🐳 Docker

### Build y Run

```powershell
# Opción 1: Con docker-compose (recomendado)
docker-compose up --build

# Opción 2: Docker manual
docker build -t gemma2b-api .
docker run -p 8000:8000 --env-file .env -v ${PWD}/model_weights:/app/model_weights gemma2b-api
```

### Build con modelo incluido

Para incluir el modelo en la imagen Docker (útil para cloud deployment):

```powershell
docker build --build-arg HUGGINGFACE_TOKEN=tu_token -t gemma2b-api .
```

**⚠️ Nota:** La imagen será ~7GB con el modelo incluido.

## ☁️ Deployment en Cloud

### Railway

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
railway init

# 4. Configurar variables
railway variables set HUGGINGFACE_TOKEN=tu_token

# 5. Deploy
railway up
```

### Render

1. Conecta tu repositorio en https://render.com
2. Crea un nuevo **Web Service**
3. Configura:
   - **Build Command:** `pip install -r requirements.txt && python download_model.py`
   - **Start Command:** `python inference.py`
   - **Environment Variables:** Agrega `HUGGINGFACE_TOKEN`

### Google Cloud Run

```bash
# 1. Autenticar
gcloud auth login

# 2. Build con Cloud Build
gcloud builds submit --tag gcr.io/TU_PROJECT/gemma2b-api

# 3. Deploy
gcloud run deploy gemma2b-api \
  --image gcr.io/TU_PROJECT/gemma2b-api \
  --platform managed \
  --region us-central1 \
  --memory 8Gi \
  --set-env-vars HUGGINGFACE_TOKEN=tu_token
```

### AWS ECS / Fargate

```bash
# 1. Autenticar con ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin TU_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# 2. Build y push
docker build -t gemma2b-api .
docker tag gemma2b-api:latest TU_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/gemma2b-api:latest
docker push TU_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/gemma2b-api:latest

# 3. Crear tarea ECS con la imagen
```

## 📁 Estructura del Proyecto

```
llmv2/
├── inference.py           # API REST con FastAPI
├── download_model.py      # Script para descargar modelo
├── test_local.py          # Tests locales
├── requirements.txt       # Dependencias Python
├── Dockerfile             # Multi-stage Dockerfile
├── docker-compose.yml     # Configuración Docker Compose
├── setup.ps1              # Script de setup automático (Windows)
├── .env.example           # Plantilla de variables de entorno
├── .dockerignore          # Archivos ignorados por Docker
├── README.md              # Este archivo
├── QUICKSTART.md          # Guía rápida
└── model_weights/         # Pesos del modelo (después de descarga)
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Default | Requerido |
|----------|-------------|---------|-----------|
| `HUGGINGFACE_TOKEN` | Token de HuggingFace | - | ✅ |
| `MODEL_PATH` | Ruta de pesos del modelo | `./model_weights` | ❌ |
| `PORT` | Puerto de la API | `8000` | ❌ |
| `HOST` | Host del servidor | `0.0.0.0` | ❌ |

### Parámetros de Generación

| Parámetro | Descripción | Rango | Default |
|-----------|-------------|-------|---------|
| `max_length` | Tokens máximos a generar | 1-512 | 100 |
| `temperature` | Creatividad (mayor = más random) | 0.1-2.0 | 0.7 |
| `top_p` | Nucleus sampling | 0.0-1.0 | 0.9 |
| `top_k` | Top-K sampling | 0-100 | 50 |
| `do_sample` | Usar sampling vs greedy | bool | true |

## 📊 Requisitos del Sistema

### Para CPU
- **RAM:** Mínimo 8GB, recomendado 16GB
- **Disco:** ~7GB (modelo + dependencias)
- **Python:** 3.10, 3.11 o 3.12

### Para GPU
- **GPU:** NVIDIA con CUDA 11.8+
- **VRAM:** Mínimo 6GB
- **RAM:** Mínimo 8GB
- **Disco:** ~7GB

## 🐛 Troubleshooting

### Error: "No matching distribution found for tensorflow"
- Verifica que estés usando Python 3.10, 3.11 o 3.12 (no 3.14+)

### Error: "Modelo no encontrado"
```powershell
python download_model.py
```

### Error: "Token inválido"
1. Verifica que el token esté correcto en `.env`
2. Verifica que hayas aceptado los términos de Gemma en HuggingFace

### Inferencia muy lenta
- Si usas CPU, considera usar un servidor con GPU
- Reduce `max_length` en las requests
- Usa servicios cloud con GPU (GCP, AWS, Azure)

## 📝 API Endpoints

### `POST /generate`
Genera texto a partir de un prompt.

**Request Body:**
```json
{
  "prompt": "string",
  "max_length": 100,
  "temperature": 0.7,
  "top_p": 0.9,
  "top_k": 50,
  "do_sample": true
}
```

**Response:**
```json
{
  "prompt": "string",
  "generated_text": "string",
  "full_text": "string",
  "tokens_generated": 42,
  "model": "google/gemma-2b"
}
```

### `GET /health`
Health check del servicio.

### `GET /docs`
Documentación interactiva (Swagger UI).

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Gemma 2B está bajo la licencia de Google.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir cambios mayores.

## 📞 Soporte

Para issues y preguntas, abre un issue en GitHub.

---

**Desarrollado por:** ChainAI Team  
**Modelo:** [Gemma 2B by Google](https://huggingface.co/google/gemma-2b)
