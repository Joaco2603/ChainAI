# ============================================
# Script de Setup para Gemma 2B en Windows
# ============================================
# Este script automatiza la configuración del entorno

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Setup Gemma 2B - ChainAI LLMv2" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Conda
Write-Host "[1/5] Verificando Conda..." -ForegroundColor Yellow
$condaPath = "C:\Users\$env:USERNAME\miniconda3\Scripts\conda.exe"

if (Test-Path $condaPath) {
    Write-Host "   ✓ Conda encontrado" -ForegroundColor Green
} else {
    Write-Host "   ✗ Conda no encontrado" -ForegroundColor Red
    Write-Host "   Por favor instala Miniconda desde: https://docs.conda.io/en/latest/miniconda.html" -ForegroundColor Yellow
    exit 1
}

# 2. Crear entorno Conda
Write-Host ""
Write-Host "[2/5] Creando entorno Conda 'gemma2b'..." -ForegroundColor Yellow

& $condaPath env list | Select-String "gemma2b" > $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ℹ Entorno 'gemma2b' ya existe" -ForegroundColor Blue
    $response = Read-Host "   ¿Deseas recrearlo? (s/N)"
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Host "   Eliminando entorno existente..." -ForegroundColor Yellow
        & $condaPath env remove -n gemma2b -y
        & $condaPath create -n gemma2b python=3.11 -y
    }
} else {
    & $condaPath create -n gemma2b python=3.11 -y
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Entorno creado exitosamente" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error creando entorno" -ForegroundColor Red
    exit 1
}

# 3. Activar entorno e instalar dependencias
Write-Host ""
Write-Host "[3/5] Instalando dependencias..." -ForegroundColor Yellow
Write-Host "   Esto puede tardar varios minutos..." -ForegroundColor Gray

# Activar entorno y ejecutar pip install
$activateScript = "C:\Users\$env:USERNAME\miniconda3\Scripts\activate.bat"
cmd /c "$activateScript gemma2b && pip install -r requirements.txt"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

# 4. Configurar archivo .env
Write-Host ""
Write-Host "[4/5] Configurando archivo .env..." -ForegroundColor Yellow

if (-Not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   ✓ Archivo .env creado desde .env.example" -ForegroundColor Green
        Write-Host ""
        Write-Host "   ⚠️  IMPORTANTE: Edita el archivo .env y agrega tu HUGGINGFACE_TOKEN" -ForegroundColor Yellow
        Write-Host "   1. Ve a: https://huggingface.co/settings/tokens" -ForegroundColor Gray
        Write-Host "   2. Crea un token de acceso (Read)" -ForegroundColor Gray
        Write-Host "   3. Acepta términos en: https://huggingface.co/google/gemma-2b" -ForegroundColor Gray
        Write-Host "   4. Pega el token en .env" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  .env.example no encontrado" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ℹ Archivo .env ya existe" -ForegroundColor Blue
}

# 5. Ofrecer descargar modelo
Write-Host ""
Write-Host "[5/5] Descargar modelo Gemma 2B" -ForegroundColor Yellow
Write-Host "   El modelo pesa aproximadamente 5GB" -ForegroundColor Gray

if (Test-Path "model_weights") {
    Write-Host "   ℹ Directorio model_weights/ ya existe" -ForegroundColor Blue
    $response = Read-Host "   ¿Deseas descargar el modelo nuevamente? (s/N)"
} else {
    $response = Read-Host "   ¿Deseas descargar el modelo ahora? (S/n)"
    if ($response -eq '' -or $response -eq 'S' -or $response -eq 's') {
        $response = 's'
    }
}

if ($response -eq 's' -or $response -eq 'S') {
    Write-Host ""
    Write-Host "   Descargando modelo..." -ForegroundColor Yellow
    Write-Host "   Asegúrate de haber configurado HUGGINGFACE_TOKEN en .env" -ForegroundColor Gray
    
    cmd /c "$activateScript gemma2b && python download_model.py"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Modelo descargado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Error descargando modelo" -ForegroundColor Red
        Write-Host "   Puedes descargarlo manualmente después con: python download_model.py" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⊘ Descarga omitida" -ForegroundColor Gray
    Write-Host "   Para descargar después: conda activate gemma2b && python download_model.py" -ForegroundColor Gray
}

# Finalización
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   ✅ Setup completado" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Activa el entorno: conda activate gemma2b" -ForegroundColor White
Write-Host "2. Edita .env con tu HUGGINGFACE_TOKEN (si no lo hiciste)" -ForegroundColor White
Write-Host "3. Descarga el modelo: python download_model.py (si no lo hiciste)" -ForegroundColor White
Write-Host "4. Prueba local: python test_local.py" -ForegroundColor White
Write-Host "5. Ejecuta API: python inference.py" -ForegroundColor White
Write-Host "6. O usa Docker: docker-compose up --build" -ForegroundColor White
Write-Host ""
