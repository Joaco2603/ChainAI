# ChainAI Backend Setup Script for Windows
# Run this script in PowerShell

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "ChainAI Backend Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check Python installation
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.9 or higher." -ForegroundColor Red
    exit 1
}

# Check Docker installation
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "✓ Found: $dockerVersion" -ForegroundColor Green
    
    # Check if Docker is running
    $dockerPs = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker daemon is running" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker daemon is not running. Please start Docker Desktop." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv
Write-Host "✓ Virtual environment created" -ForegroundColor Green

Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt
Write-Host "✓ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Setting up environment configuration..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "! .env file already exists. Skipping..." -ForegroundColor Yellow
} else {
    Copy-Item .env.example .env
    Write-Host "✓ Created .env file from .env.example" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Edit .env file with your configuration:" -ForegroundColor Red
    Write-Host "  - WEB3_PROVIDER_URI: Your Avalanche RPC endpoint" -ForegroundColor White
    Write-Host "  - CONTRACT_ADDRESS: Your deployed ModelRegistry contract address" -ForegroundColor White
    Write-Host "  - PRIVATE_KEY: Your private key for signing transactions" -ForegroundColor White
    Write-Host "  - CHAIN_ID: 43113 for Fuji testnet, 43114 for mainnet" -ForegroundColor White
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "2. Run the server:" -ForegroundColor White
Write-Host "   python -m app.main" -ForegroundColor Cyan
Write-Host "   or" -ForegroundColor White
Write-Host "   uvicorn app.main:app --reload" -ForegroundColor Cyan
Write-Host "3. Open API docs at http://localhost:8000/api/v1/docs" -ForegroundColor White
Write-Host ""
Write-Host "For testing, run:" -ForegroundColor Yellow
# Write-Host "   python test_api.py" -ForegroundColor Cyan
Write-Host "   pytest tests/" -ForegroundColor Cyan
Write-Host ""
