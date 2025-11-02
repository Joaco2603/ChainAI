# ✅ Checklist de Integración - GPT Mini Model

Usa este checklist para verificar que todo esté configurado correctamente.

## 📦 Prerequisitos

- [ ] Python 3.9+ instalado
- [ ] Docker Desktop instalado y corriendo
- [ ] Git instalado (para clonar el repo)
- [ ] Cuenta en Docker Hub (para publicar la imagen)

## 🔧 Configuración Inicial

- [ ] Navegar a `packages/example-model-ai`
- [ ] Verificar que `clean_titulares.txt` existe
- [ ] Crear entorno virtual (recomendado):
  ```bash
  python -m venv venv
  # Windows: venv\Scripts\activate
  # Linux/Mac: source venv/bin/activate
  ```
- [ ] Instalar dependencias:
  ```bash
  pip install -r requirements.txt
  ```

## 🚀 Paso 1: Entrenar el Modelo

- [ ] Ejecutar entrenamiento:
  ```bash
  python train_model.py
  ```
- [ ] Verificar archivos generados:
  - [ ] `model/` (directorio)
  - [ ] `vocab.pkl`
  - [ ] `config.pkl`
- [ ] El modelo se entrenó sin errores
- [ ] Se generaron ejemplos de texto durante el entrenamiento

## 🧪 Paso 2: Probar Localmente (Opcional pero recomendado)

- [ ] Ejecutar prueba local:
  ```bash
  python test_local.py
  ```
- [ ] Todas las pruebas pasaron exitosamente
- [ ] Probar modo interactivo con tus propios prompts
- [ ] La calidad del texto generado es aceptable

## 🐳 Paso 3: Dockerizar

### Windows

- [ ] Ejecutar script de construcción:
  ```powershell
  .\build.ps1 -Test
  ```

### Linux/Mac

- [ ] Dar permisos de ejecución:
  ```bash
  chmod +x build.sh
  ```
- [ ] Ejecutar script de construcción:
  ```bash
  ./build.sh
  ```

### Verificaciones

- [ ] La imagen se construyó sin errores
- [ ] Las pruebas automáticas pasaron
- [ ] Verificar que la imagen existe:
  ```bash
  docker images | grep gpt-mini-model
  ```

## ☁️ Paso 4: Publicar en Docker Hub

- [ ] Crear cuenta en https://hub.docker.com
- [ ] Login desde terminal:
  ```bash
  docker login
  ```
- [ ] Etiquetar imagen (reemplaza USUARIO con tu username):
  ```bash
  docker tag gpt-mini-model:latest USUARIO/gpt-mini-model:latest
  ```
- [ ] Subir imagen:
  ```bash
  docker push USUARIO/gpt-mini-model:latest
  ```
- [ ] Verificar en Docker Hub que la imagen esté pública
- [ ] Probar descarga:
  ```bash
  docker pull USUARIO/gpt-mini-model:latest
  ```

## 🔗 Paso 5: Configurar Backend ChainAI

- [ ] Backend está corriendo en http://localhost:8000
- [ ] Verificar salud del backend:
  ```bash
  curl http://localhost:8000/api/v1/health
  ```
- [ ] Docker está accesible por el backend
- [ ] Wallet configurada con AVAX para gas fees

## 📝 Paso 6: Registrar el Modelo

- [ ] Registrar modelo en ChainAI:
  ```bash
  curl -X POST http://localhost:8000/api/v1/models/upload-model \
    -H "Content-Type: application/json" \
    -d '{"docker_image_url": "USUARIO/gpt-mini-model:latest"}'
  ```
- [ ] Recibir respuesta con `model_id` y `transaction_hash`
- [ ] Verificar transacción en Avalanche Explorer
- [ ] Modelo aparece en lista de modelos:
  ```bash
  curl http://localhost:8000/api/v1/models/top
  ```

## 🎯 Paso 7: Probar Generación

- [ ] Crear solicitud de generación:
  ```bash
  curl -X POST http://localhost:8000/api/v1/generate \
    -H "Content-Type: application/json" \
    -d '{"prompt": "la inteligencia artificial"}'
  ```
- [ ] Recibir `job_id`
- [ ] Verificar estado del job:
  ```bash
  curl http://localhost:8000/api/v1/generate/job/{job_id}
  ```
- [ ] Obtener resultado cuando esté completo:
  ```bash
  curl http://localhost:8000/api/v1/generate/result/{job_id}
  ```
- [ ] El resultado contiene texto generado por tu modelo

## 🌐 Paso 8: Probar Frontend (Opcional)

Si tienes el frontend configurado:

- [ ] Frontend está corriendo en http://localhost:3000
- [ ] Conectar wallet
- [ ] Ver modelo en la lista
- [ ] Crear generación desde UI
- [ ] Ver resultado en la interfaz

## ✨ Verificación Final

- [ ] El modelo responde correctamente a diferentes prompts
- [ ] El tiempo de respuesta es aceptable
- [ ] No hay errores en los logs del backend
- [ ] El contenedor se limpia después de cada ejecución
- [ ] Puedes rate el modelo desde el frontend/API

## 📊 Métricas a Monitorear

- [ ] Tiempo promedio de inferencia: **\_** segundos
- [ ] Uso de memoria del contenedor: **\_** MB
- [ ] Tamaño de la imagen Docker: **\_** MB
- [ ] Calidad del texto (subjetiva): ⭐⭐⭐⭐⭐

## 🔧 Troubleshooting

Si algo no funciona, consulta:

1. **GUIDE.md** - Sección Troubleshooting
2. **Backend logs**: Revisa la consola del backend
3. **Docker logs**:
   ```bash
   docker logs [container_id]
   ```
4. **Issues del repositorio**: Revisa problemas conocidos

## 🎓 Mejoras Futuras

Ideas para mejorar tu modelo:

- [ ] Entrenar con más épocas para mejor calidad
- [ ] Experimentar con diferentes hiperparámetros
- [ ] Agregar más datos de entrenamiento
- [ ] Implementar temperature sampling
- [ ] Optimizar tamaño de la imagen Docker
- [ ] Agregar métricas de evaluación
- [ ] Implementar caché para prompts frecuentes
- [ ] Crear versiones especializadas del modelo

## 📸 Capturas de Evidencia (Opcional)

Para documentar tu progreso, toma capturas de:

- [ ] Terminal mostrando entrenamiento exitoso
- [ ] Docker Hub con tu imagen publicada
- [ ] Respuesta del backend al registrar modelo
- [ ] Resultado de generación de texto
- [ ] Frontend mostrando tu modelo

---

## ✅ ¡Completado!

Fecha de integración: **\*\*\*\***\_**\*\*\*\***

Notas adicionales:

---

---

---

---

**Siguiente paso**: Comparte tu modelo con la comunidad o crea versiones mejoradas! 🚀
