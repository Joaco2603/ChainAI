# ⚡ QUICKSTART - Gemma 2B API

Guía rápida para poner en marcha Gemma 2B en minutos.

## 🎯 Opción 1: Setup Automático (Más Rápido)

### Windows (PowerShell)

```powershell
cd llmv2
.\setup.ps1
```

Sigue las instrucciones en pantalla. El script configurará todo automáticamente.

---

## 🎯 Opción 2: Setup Manual

### Paso 1: Obtener Token de HuggingFace (2 minutos)

1. **Crear cuenta** en https://huggingface.co (si no tienes)
2. **Ir a** https://huggingface.co/settings/tokens
3. **Crear nuevo token** → Tipo: "Read"
4. **Copiar** el token (se ve algo como: `hf_xxxxxxxxxxxxx`)
5. **Aceptar términos** en https://huggingface.co/google/gemma-2b

### Paso 2: Configurar Entorno (5 minutos)

```powershell
# Crear entorno conda
conda create -n gemma2b python=3.11 -y
conda activate gemma2b

# Instalar dependencias
pip install -r requirements.txt

# Configurar token
copy .env.example .env
notepad .env  # Editar y pegar tu token
```

En `.env`, cambia:
```
HUGGINGFACE_TOKEN=your_huggingface_token_here
```
Por:
```
HUGGINGFACE_TOKEN=hf_TuTokenAqui
```

### Paso 3: Descargar Modelo (10-15 minutos)

```powershell
python download_model.py
```

**⏳ Paciencia:** Descarga ~5GB. Tiempo depende de tu conexión.

### Paso 4: Probar (1 minuto)

```powershell
python test_local.py
```

Si todo está OK, verás: ✅ Todos los tests pasaron

### Paso 5: Ejecutar API (Instantáneo)

```powershell
python inference.py
```

**🎉 Listo!** Abre: http://localhost:8000/docs

---

## 🐳 Con Docker (Alternativa)

### Opción A: Modelo Pre-descargado

```powershell
# 1. Descargar modelo primero (si no lo has hecho)
conda activate gemma2b
python download_model.py

# 2. Docker Compose
docker-compose up --build
```

### Opción B: Descargar en Build

```powershell
# Build incluyendo el modelo en la imagen (~7GB)
docker build --build-arg HUGGINGFACE_TOKEN=tu_token -t gemma2b-api .

# Run
docker run -p 8000:8000 gemma2b-api
```

---

## 🧪 Probar la API

### Navegador
Abre: http://localhost:8000/docs

### cURL
```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "La inteligencia artificial", "max_length": 50}'
```

### PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/generate" -Method Post -ContentType "application/json" -Body '{"prompt":"La IA es","max_length":50}'
```

### Python
```python
import requests
r = requests.post("http://localhost:8000/generate", 
    json={"prompt": "La IA es", "max_length": 50})
print(r.json()["generated_text"])
```

---

## ☁️ Deploy en Cloud (5-10 minutos)

### Railway (Más Fácil)

```bash
# 1. Instalar CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway init
railway variables set HUGGINGFACE_TOKEN=tu_token
railway up
```

**Listo!** Railway te dará una URL pública.

### Render (Sin CLI)

1. Ve a https://render.com
2. **New → Web Service**
3. Conecta tu repo Git
4. Configura:
   - **Build:** `pip install -r requirements.txt && python download_model.py`
   - **Start:** `python inference.py`
   - **Env Vars:** `HUGGINGFACE_TOKEN` = tu token
5. **Deploy!**

### Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/TU_PROJECT/gemma2b
gcloud run deploy gemma2b \
  --image gcr.io/TU_PROJECT/gemma2b \
  --memory 8Gi \
  --set-env-vars HUGGINGFACE_TOKEN=tu_token
```

---

## ❓ Problemas Comunes

### ❌ "pip not recognized"
```powershell
python -m pip install -r requirements.txt
```

### ❌ "Token inválido"
- Verifica que copiaste el token completo
- Asegúrate de aceptar términos de Gemma en HuggingFace

### ❌ "Modelo no encontrado"
```powershell
python download_model.py
```

### ❌ "Out of memory"
- Cierra otros programas
- Reduce `max_length` en las requests
- Usa un servidor con más RAM (cloud)

### ❌ Inferencia muy lenta
- Esto es normal en CPU (~10-30 segundos por generación)
- Para producción, usa GPU en cloud (GCP, AWS con instancias GPU)

---

## 📊 Tiempos Estimados

| Tarea | Tiempo (aprox) |
|-------|----------------|
| Obtener token HF | 2 min |
| Instalar dependencias | 5 min |
| Descargar modelo | 10-15 min |
| Primera ejecución | 2-3 min (carga) |
| Generación (CPU) | 10-30 seg |
| Generación (GPU) | 1-3 seg |

---

## 🎓 Próximos Pasos

1. **Experimenta** con diferentes prompts en `/docs`
2. **Ajusta** parámetros: `temperature`, `top_p`, `max_length`
3. **Integra** la API en tu app (ver ejemplos en README.md)
4. **Deploy** en cloud para acceso público
5. **Escala** con múltiples réplicas si necesitas

---

## 📚 Más Información

- **README completo:** [README.md](README.md)
- **Documentación API:** http://localhost:8000/docs (cuando esté corriendo)
- **Modelo Gemma 2B:** https://huggingface.co/google/gemma-2b
- **Issues:** Reporta problemas en GitHub

---

**¿Todo funcionó?** 🎉 ¡Excelente! Ahora tienes un LLM productivo corriendo localmente.

**¿Problemas?** 🤔 Revisa la sección de troubleshooting o abre un issue.
