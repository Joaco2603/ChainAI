#!/bin/bash
# Script de construcción y prueba para Linux/Mac
# Este script construye la imagen Docker y la prueba localmente

IMAGE_NAME="${1:-gpt-mini-model}"
TAG="${2:-latest}"
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo "====================================="
echo "  ChainAI - Build GPT Mini Model"
echo "====================================="
echo ""

# Verificar que Docker esté corriendo
echo "🔍 Verificando Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "✗ Error: Docker no está corriendo o no está instalado"
    exit 1
fi
echo "✓ Docker está corriendo"

# Verificar que existan los archivos necesarios
echo ""
echo "📋 Verificando archivos necesarios..."

REQUIRED_FILES=("model" "vocab.pkl" "config.pkl" "inference.py" "requirements.txt" "Dockerfile")
ALL_FILES_EXIST=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file NO ENCONTRADO"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo ""
    echo "⚠️  Error: Faltan archivos necesarios"
    echo "   Por favor, ejecuta primero:"
    echo "   python train_model.py"
    exit 1
fi

# Construir imagen
echo ""
echo "🏗️  Construyendo imagen Docker..."
echo "   Imagen: $FULL_IMAGE_NAME"
echo ""

docker build -t "$FULL_IMAGE_NAME" .

if [ $? -ne 0 ]; then
    echo ""
    echo "✗ Error al construir la imagen"
    exit 1
fi

echo ""
echo "✓ Imagen construida exitosamente"

# Probar imagen
echo ""
echo "🧪 Probando imagen Docker..."
echo ""

TEST_PROMPTS=(
    "la inteligencia artificial"
    "el futuro de"
    "la tecnología"
)

for prompt in "${TEST_PROMPTS[@]}"; do
    echo "   Prompt: '$prompt'"
    INPUT_JSON="{\"prompt\": \"$prompt\", \"max_tokens\": 20}"
    
    RESULT=$(docker run --rm "$FULL_IMAGE_NAME" "$INPUT_JSON")
    
    if [ $? -eq 0 ]; then
        echo "   ✓ Resultado:"
        echo "     $RESULT"
    else
        echo "   ✗ Error en la ejecución"
    fi
    echo ""
done

# Información final
echo ""
echo "====================================="
echo "  Imagen lista para usar!"
echo "====================================="
echo ""
echo "📦 Imagen: $FULL_IMAGE_NAME"
echo ""
echo "Para probar localmente:"
echo "  docker run --rm $FULL_IMAGE_NAME '{\"prompt\": \"tu texto aqui\"}'"
echo ""
echo "Para subir a Docker Hub:"
echo "  1. docker login"
echo "  2. docker tag $FULL_IMAGE_NAME tuusuario/$IMAGE_NAME:$TAG"
echo "  3. docker push tuusuario/$IMAGE_NAME:$TAG"
echo ""
echo "Para registrar en ChainAI:"
echo "  POST /api/v1/models/upload-model"
echo "  {\"docker_image_url\": \"tuusuario/$IMAGE_NAME:$TAG\"}"
echo ""
