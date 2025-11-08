"""
Script de inferencia para Gemma 2B con API REST
Sirve el modelo a través de FastAPI para generación de texto
"""
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import uvicorn

# Cargar variables de entorno
load_dotenv()

# Configuración
MODEL_PATH = os.getenv("MODEL_PATH", "./model_weights")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

# Inicializar FastAPI
app = FastAPI(
    title="Gemma 2B Inference API",
    description="API REST para generar texto con Gemma 2B de Google",
    version="1.0.0"
)

# Variables globales para el modelo
model = None
tokenizer = None
device = None


class GenerateRequest(BaseModel):
    """Esquema de solicitud para generar texto"""
    prompt: str = Field(..., description="Texto inicial para generar continuación")
    max_length: int = Field(100, description="Longitud máxima de tokens a generar", ge=1, le=512)
    temperature: float = Field(0.7, description="Temperatura para sampling (mayor = más creativo)", ge=0.1, le=2.0)
    top_p: float = Field(0.9, description="Nucleus sampling threshold", ge=0.0, le=1.0)
    top_k: int = Field(50, description="Top-K sampling", ge=0, le=100)
    do_sample: bool = Field(True, description="Usar sampling o greedy decoding")


class GenerateResponse(BaseModel):
    """Esquema de respuesta para texto generado"""
    prompt: str
    generated_text: str
    full_text: str
    tokens_generated: int
    model: str = "google/gemma-2b"


def load_model():
    """Carga el modelo Gemma 2B en memoria"""
    global model, tokenizer, device
    
    print("=" * 70)
    print("🚀 Cargando Gemma 2B...")
    print("=" * 70)
    
    # Verificar que exista el modelo
    model_path = Path(MODEL_PATH)
    if not model_path.exists():
        print(f"\n❌ ERROR: No se encontró el modelo en {model_path}")
        print("\n Para descargar el modelo ejecuta:")
        print("   python download_model.py")
        raise FileNotFoundError(f"Modelo no encontrado en {MODEL_PATH}")
    
    # Detectar dispositivo (GPU o CPU)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"\n🖥️  Dispositivo: {device.upper()}")
    if device == "cpu":
        print("   ⚠️  Usando CPU - La inferencia será más lenta")
        print("   💡 Para mejor rendimiento, usa GPU con CUDA")
    
    # Cargar tokenizer
    print(f"\n📝 Cargando tokenizer desde {MODEL_PATH}...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        print("   ✓ Tokenizer cargado")
    except Exception as e:
        print(f"   ❌ Error cargando tokenizer: {e}")
        raise
    
    # Cargar modelo
    print(f"\n🧠 Cargando modelo (~5GB)...")
    try:
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_PATH,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto" if device == "cuda" else None,
            low_cpu_mem_usage=True
        )
        
        if device == "cpu":
            model = model.to(device)
        
        model.eval()  # Modo evaluación
        print("   ✓ Modelo cargado exitosamente")
        
    except Exception as e:
        print(f"   ❌ Error cargando modelo: {e}")
        raise
    
    print("\n" + "=" * 70)
    print("✅ Gemma 2B listo para inferencia")
    print("=" * 70)
    print(f"\n🌐 Servidor API iniciando en http://{HOST}:{PORT}")
    print(f"📖 Documentación: http://{HOST}:{PORT}/docs\n")


@app.on_event("startup")
async def startup_event():
    """Se ejecuta al iniciar el servidor"""
    load_model()


@app.get("/")
async def root():
    """Endpoint raíz con información del servicio"""
    return {
        "service": "Gemma 2B Inference API",
        "status": "running",
        "model": "google/gemma-2b",
        "device": str(device),
        "endpoints": {
            "generate": "/generate",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Endpoint de health check"""
    model_loaded = model is not None and tokenizer is not None
    return {
        "status": "healthy" if model_loaded else "unhealthy",
        "model_loaded": model_loaded,
        "device": str(device) if device else "unknown"
    }


@app.post("/generate", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest):
    """
    Genera texto a partir de un prompt usando Gemma 2B
    
    Args:
        request: Parámetros de generación (prompt, temperatura, etc.)
        
    Returns:
        Texto generado con metadatos
    """
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Modelo no cargado")
    
    try:
        # Tokenizar input
        inputs = tokenizer(request.prompt, return_tensors="pt").to(device)
        input_length = inputs.input_ids.shape[1]
        
        # Generar
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=input_length + request.max_length,
                temperature=request.temperature,
                top_p=request.top_p,
                top_k=request.top_k,
                do_sample=request.do_sample,
                pad_token_id=tokenizer.eos_token_id,
            )
        
        # Decodificar
        full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        generated_text = full_text[len(request.prompt):].strip()
        tokens_generated = outputs.shape[1] - input_length
        
        return GenerateResponse(
            prompt=request.prompt,
            generated_text=generated_text,
            full_text=full_text,
            tokens_generated=tokens_generated
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en generación: {str(e)}")


@app.post("/generate/simple")
async def generate_simple(prompt: str, max_length: int = 100):
    """
    Versión simplificada del endpoint de generación
    
    Args:
        prompt: Texto inicial
        max_length: Longitud máxima de tokens
        
    Returns:
        Solo el texto generado como string
    """
    request = GenerateRequest(prompt=prompt, max_length=max_length)
    response = await generate_text(request)
    return {"text": response.full_text}


if __name__ == "__main__":
    # Ejecutar servidor
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="info"
    )
