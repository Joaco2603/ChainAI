# Script de construcción y prueba para Windows PowerShell
# Este script construye la imagen Docker y la prueba localmente

param(
    [string]$ImageName = "gpt-mini-model",
    [string]$Tag = "latest",
    [switch]$NoBuild,
    [switch]$Test
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ChainAI - Build GPT Mini Model" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$FullImageName = "${ImageName}:${Tag}"

# Verificar que Docker esté corriendo
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker está corriendo" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: Docker no está corriendo o no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar que existan los archivos necesarios
Write-Host ""
Write-Host "📋 Verificando archivos necesarios..." -ForegroundColor Yellow

$RequiredFiles = @("model", "vocab.pkl", "config.pkl", "inference.py", "requirements.txt", "Dockerfile")
$AllFilesExist = $true

foreach ($file in $RequiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file NO ENCONTRADO" -ForegroundColor Red
        $AllFilesExist = $false
    }
}

if (-not $AllFilesExist) {
    Write-Host ""
    Write-Host "⚠️  Error: Faltan archivos necesarios" -ForegroundColor Red
    Write-Host "   Por favor, ejecuta primero:" -ForegroundColor Yellow
    Write-Host "   python train_model.py" -ForegroundColor Cyan
    exit 1
}

# Construir imagen
if (-not $NoBuild) {
    Write-Host ""
    Write-Host "🏗️  Construyendo imagen Docker..." -ForegroundColor Yellow
    Write-Host "   Imagen: $FullImageName" -ForegroundColor Cyan
    Write-Host ""
    
    docker build -t $FullImageName .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "✗ Error al construir la imagen" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✓ Imagen construida exitosamente" -ForegroundColor Green
}

# Probar imagen
if ($Test) {
    Write-Host ""
    Write-Host "🧪 Probando imagen Docker..." -ForegroundColor Yellow
    Write-Host ""
    
    $TestPrompts = @(
        "la inteligencia artificial",
        "el futuro de",
        "la tecnología"
    )
    
    foreach ($prompt in $TestPrompts) {
        Write-Host "   Prompt: '$prompt'" -ForegroundColor Cyan
        $inputJson = "{`"prompt`": `"$prompt`", `"max_tokens`": 20}"
        
        $result = docker run --rm $FullImageName $inputJson
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Resultado:" -ForegroundColor Green
            Write-Host "     $result" -ForegroundColor White
        } else {
            Write-Host "   ✗ Error en la ejecución" -ForegroundColor Red
        }
        Write-Host ""
    }
}

# Información final
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Imagen lista para usar!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Imagen: $FullImageName" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para probar localmente:" -ForegroundColor White
Write-Host "  docker run --rm $FullImageName '{`"prompt`": `"tu texto aqui`"}'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para subir a Docker Hub:" -ForegroundColor White
Write-Host "  1. docker login" -ForegroundColor Cyan
Write-Host "  2. docker tag $FullImageName tuusuario/$ImageName`:$Tag" -ForegroundColor Cyan
Write-Host "  3. docker push tuusuario/$ImageName`:$Tag" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para registrar en ChainAI:" -ForegroundColor White
Write-Host "  POST /api/v1/models/upload-model" -ForegroundColor Cyan
Write-Host "  {`"docker_image_url`": `"tuusuario/$ImageName`:$Tag`"}" -ForegroundColor Cyan
Write-Host ""
