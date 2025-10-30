# Guía Completa: GPT Mini para ChainAI Platform

Este directorio contiene un modelo **GPT Mini** (Transformer Decoder-only) entrenado con titulares en español, listo para integrarse con la plataforma ChainAI.

## 📋 Tabla de Contenidos

- [Arquitectura del Modelo](#arquitectura-del-modelo)
- [Archivos del Proyecto](#archivos-del-proyecto)
- [Paso 1: Entrenar el Modelo](#paso-1-entrenar-el-modelo)
- [Paso 2: Construir la Imagen Docker](#paso-2-construir-la-imagen-docker)
- [Paso 3: Probar Localmente](#paso-3-probar-localmente)
- [Paso 4: Subir a Docker Hub](#paso-4-subir-a-docker-hub)
- [Paso 5: Registrar en ChainAI](#paso-5-registrar-en-chainai)
- [Troubleshooting](#troubleshooting)

---

## 🧠 Arquitectura del Modelo

El modelo implementa un **Transformer Decoder-only** similar a GPT:

- **Embedding Layer**: Token + Position embeddings
- **Transformer Block**: Multi-head self-attention con causal masking
- **Feed-Forward Network**: 2 capas densas con activación ReLU
- **Output Layer**: Proyección al vocabulario

### Especificaciones:

- **Vocabulario**: 20,000 palabras
- **Max Sequence Length**: 80 tokens
- **Embedding Dimension**: 256
- **Attention Heads**: 2
- **Feed-Forward Dim**: 256
- **Dropout**: 0.1

---

## 📁 Archivos del Proyecto

```
example-model-ai/
├── main.ipynb              # Notebook original de desarrollo
├── train_model.py          # Script para entrenar el modelo
├── inference.py            # Script de inferencia para Docker
├── Dockerfile              # Dockerfile para empaquetar el modelo
├── build.ps1               # Script de construcción (Windows)
├── build.sh                # Script de construcción (Linux/Mac)
├── requirements.txt        # Dependencias Python
├── clean_titulares.txt     # Dataset de entrenamiento
├── README.MD               # Este archivo
│
└── (Generados después del entrenamiento)
    ├── model/              # Modelo TensorFlow guardado
    ├── vocab.pkl           # Vocabulario serializado
    └── config.pkl          # Configuración del modelo
```

---

## 🚀 Paso 1: Entrenar el Modelo

### Prerequisitos

- Python 3.9+
- TensorFlow 2.10+
- Al menos 4GB de RAM

### Instrucciones

1. **Navega al directorio**:

   ```bash
   cd packages/example-model-ai
   ```

2. **Crea un entorno virtual** (recomendado):

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Instala dependencias**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Entrena el modelo**:

   ```bash
   python train_model.py
   ```

   El entrenamiento tomará varios minutos dependiendo de tu hardware. El script:

   - Carga `clean_titulares.txt`
   - Crea el vocabulario
   - Entrena el modelo por 10 épocas (puedes ajustar en el código)
   - Guarda `model/`, `vocab.pkl`, y `config.pkl`
   - Muestra ejemplos de generación durante el entrenamiento

### Salida Esperada

```
====================================
Entrenamiento de Modelo GPT Mini
====================================

📚 Cargando datos desde clean_titulares.txt...
🔤 Creando vectorization layer...
   Vocabulario: 20000 palabras
   Longitud máxima: 80 tokens
⚙️  Preparando dataset...
🏗️  Construyendo modelo...
...
💾 Guardando modelo y vocabulario...
   ✓ Modelo guardado en ./model/
   ✓ Vocabulario guardado en ./vocab.pkl
   ✓ Configuración guardada en ./config.pkl

✅ Entrenamiento completado exitosamente!
```

---

## 🐳 Paso 2: Construir la Imagen Docker

### Prerequisitos

- Docker Desktop instalado y corriendo
- Modelo entrenado (archivos `model/`, `vocab.pkl`, `config.pkl`)

### Opción A: Windows PowerShell

```powershell
# Construir y probar
.\build.ps1 -Test

# Solo construir
.\build.ps1

# Usar nombre personalizado
.\build.ps1 -ImageName "mi-modelo-gpt" -Tag "v1.0"
```

### Opción B: Linux/Mac

```bash
# Dar permisos de ejecución
chmod +x build.sh

# Construir y probar
./build.sh

# Usar nombre personalizado
./build.sh mi-modelo-gpt v1.0
```

### Opción C: Docker Manual

```bash
docker build -t gpt-mini-model:latest .
```

### Salida Esperada

```
🔍 Verificando Docker...
✓ Docker está corriendo

📋 Verificando archivos necesarios...
  ✓ model
  ✓ vocab.pkl
  ✓ config.pkl
  ✓ inference.py
  ✓ requirements.txt
  ✓ Dockerfile

🏗️  Construyendo imagen Docker...
...
✓ Imagen construida exitosamente

🧪 Probando imagen Docker...
   Prompt: 'la inteligencia artificial'
   ✓ Resultado:
     {"output": "la inteligencia artificial es ...", ...}
```

---

## 🧪 Paso 3: Probar Localmente

### Prueba Básica

```bash
docker run --rm gpt-mini-model:latest '{"prompt": "la inteligencia artificial"}'
```

### Prueba con Parámetros

```bash
docker run --rm gpt-mini-model:latest '{
  "prompt": "el futuro de la tecnología",
  "max_tokens": 50,
  "top_k": 10
}'
```

### Formato de Respuesta

```json
{
  "output": "el futuro de la tecnología será impresionante con avances en...",
  "prompt": "el futuro de la tecnología",
  "tokens_generated": 50,
  "model": "gpt-mini-transformer"
}
```

---

## ☁️ Paso 4: Subir a Docker Hub

### 1. Crear cuenta en Docker Hub

- Visita [hub.docker.com](https://hub.docker.com)
- Crea una cuenta gratuita

### 2. Login desde terminal

```bash
docker login
# Ingresa tu usuario y contraseña
```

### 3. Etiquetar imagen

```bash
# Reemplaza 'tuusuario' con tu username de Docker Hub
docker tag gpt-mini-model:latest tuusuario/gpt-mini-model:latest
```

### 4. Subir imagen

```bash
docker push tuusuario/gpt-mini-model:latest
```

### 5. Verificar

- Ve a [hub.docker.com/repositories](https://hub.docker.com/repositories)
- Deberías ver tu imagen publicada

---

## 🔗 Paso 5: Registrar en ChainAI

### Prerequisitos

- Backend de ChainAI corriendo
- Wallet con AVAX para gas fees
- Imagen Docker publicada en Docker Hub

### Opción A: Usando cURL

```bash
curl -X POST http://localhost:8000/api/v1/models/upload-model \
  -H "Content-Type: application/json" \
  -d '{
    "docker_image_url": "tuusuario/gpt-mini-model:latest"
  }'
```

### Opción B: Usando Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/models/upload-model",
    json={"docker_image_url": "tuusuario/gpt-mini-model:latest"}
)

print(response.json())
# {
#   "success": true,
#   "model_id": 1,
#   "transaction_hash": "0x...",
#   "docker_image_url": "tuusuario/gpt-mini-model:latest"
# }
```

### Opción C: Usando el Frontend

1. Abre la aplicación web de ChainAI
2. Navega a "Upload Model"
3. Ingresa la URL: `tuusuario/gpt-mini-model:latest`
4. Haz clic en "Register Model"
5. Confirma la transacción en tu wallet

---

## 🎯 Usar el Modelo en ChainAI

Una vez registrado, el modelo estará disponible automáticamente:

### Generar Texto

```bash
curl -X POST http://localhost:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "la inteligencia artificial en el futuro"
  }'
```

### Respuesta

```json
{
  "success": true,
  "job_id": "abc-123-def",
  "status": "pending"
}
```

### Obtener Resultado

```bash
curl http://localhost:8000/api/v1/generate/result/abc-123-def
```

```json
{
  "success": true,
  "status": "completed",
  "result": {
    "model_id": 1,
    "docker_image_url": "tuusuario/gpt-mini-model:latest",
    "prompt": "la inteligencia artificial en el futuro",
    "output": "la inteligencia artificial en el futuro será fundamental para...",
    "transaction_hash": "0x..."
  }
}
```

---

## 🔧 Troubleshooting

### Error: "No se encontró el archivo clean_titulares.txt"

**Solución**: Asegúrate de estar en el directorio correcto:

```bash
cd packages/example-model-ai
ls clean_titulares.txt
```

### Error: "Docker no está corriendo"

**Solución**: Inicia Docker Desktop y espera a que esté completamente activo.

### Error: "Out of memory" durante entrenamiento

**Solución**: Reduce el `batch_size` en `train_model.py`:

```python
batch_size = 64  # En lugar de 128
```

### Error: "Failed to pull image" en el backend

**Solución**:

1. Verifica que la imagen esté pública en Docker Hub
2. Prueba manualmente: `docker pull tuusuario/gpt-mini-model:latest`
3. Revisa que el nombre sea exactamente el mismo

### El modelo genera texto sin sentido

**Solución**:

- Entrena por más épocas (aumenta `epochs` en `train_model.py`)
- Ajusta `max_tokens` y `top_k` durante inferencia
- Asegúrate de que `clean_titulares.txt` tenga datos de calidad

### Imagen Docker muy grande

**Solución**: Usa `tensorflow-cpu` en lugar de `tensorflow`:

```dockerfile
# En requirements.txt
tensorflow-cpu>=2.10.0  # ~450MB en lugar de ~2GB
```

---

## 📊 Mejoras Futuras

- [ ] Implementar temperature sampling
- [ ] Agregar beam search
- [ ] Soporte para múltiples idiomas
- [ ] Fine-tuning con datos específicos
- [ ] Cuantización del modelo para reducir tamaño
- [ ] Caché de generaciones frecuentes
- [ ] Métricas de calidad (perplexity, BLEU)

---

## 📚 Referencias

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Language Models are Few-Shot Learners (GPT-3)](https://arxiv.org/abs/2005.14165)
- [TensorFlow Text Generation Tutorial](https://www.tensorflow.org/text/tutorials/text_generation)
- [ChainAI Backend Documentation](../backend/README.md)

---

## 📝 Licencia

Este modelo ejemplo está bajo la misma licencia que el proyecto ChainAI.

---

## 🤝 Contribuciones

Si mejoras el modelo o encuentras bugs, por favor:

1. Abre un issue en el repositorio
2. Envía un pull request con tus cambios
3. Documenta claramente los cambios realizados

---

**¡Tu modelo GPT Mini está listo para la plataforma ChainAI! 🎉**
