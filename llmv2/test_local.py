"""
Script de test local para Gemma 2B
Valida que el modelo se cargue correctamente y genere texto
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def test_environment():
    """Verifica que el entorno esté configurado correctamente"""
    print("=" * 70)
    print("🧪 Test 1: Verificando Entorno")
    print("=" * 70)
    
    # Verificar Python version
    print(f"\n🐍 Python: {sys.version}")
    
    # Verificar token
    token = os.getenv("HUGGINGFACE_TOKEN")
    if token:
        print(f"✓ HUGGINGFACE_TOKEN configurado ({len(token)} caracteres)")
    else:
        print("✗ HUGGINGFACE_TOKEN no encontrado en .env")
        return False
    
    # Verificar modelo
    model_path = Path(os.getenv("MODEL_PATH", "./model_weights"))
    if model_path.exists():
        print(f"✓ Modelo encontrado en {model_path}")
        
        # Listar archivos del modelo
        model_files = list(model_path.glob("*"))
        if model_files:
            print(f"  Archivos: {len(model_files)}")
        else:
            print("⚠️  Directorio vacío - ejecuta: python download_model.py")
            return False
    else:
        print(f"✗ Modelo no encontrado en {model_path}")
        print("  Ejecuta: python download_model.py")
        return False
    
    return True


def test_imports():
    """Verifica que las dependencias estén instaladas"""
    print("\n" + "=" * 70)
    print("🧪 Test 2: Verificando Dependencias")
    print("=" * 70 + "\n")
    
    dependencies = {
        "torch": "PyTorch",
        "transformers": "Transformers (HuggingFace)",
        "fastapi": "FastAPI",
        "uvicorn": "Uvicorn",
        "pydantic": "Pydantic"
    }
    
    all_ok = True
    for module, name in dependencies.items():
        try:
            __import__(module)
            print(f"✓ {name}")
        except ImportError:
            print(f"✗ {name} - No instalado")
            all_ok = False
    
    return all_ok


def test_model_loading():
    """Intenta cargar el modelo"""
    print("\n" + "=" * 70)
    print("🧪 Test 3: Cargando Modelo")
    print("=" * 70 + "\n")
    
    try:
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        model_path = os.getenv("MODEL_PATH", "./model_weights")
        
        # Detectar dispositivo
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🖥️  Dispositivo: {device.upper()}")
        
        if device == "cpu":
            print("⚠️  Usando CPU - La carga será lenta (~2-3 minutos)")
        
        # Cargar tokenizer
        print("\n📝 Cargando tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        print("✓ Tokenizer cargado")
        
        # Cargar modelo
        print("\n🧠 Cargando modelo (~5GB)...")
        print("   Esto puede tardar unos minutos en CPU...")
        
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto" if device == "cuda" else None,
            low_cpu_mem_usage=True
        )
        
        if device == "cpu":
            model = model.to(device)
        
        model.eval()
        print("✓ Modelo cargado exitosamente")
        
        return True, model, tokenizer, device
        
    except Exception as e:
        print(f"\n✗ Error cargando modelo: {e}")
        return False, None, None, None


def test_generation(model, tokenizer, device):
    """Prueba generar texto"""
    print("\n" + "=" * 70)
    print("🧪 Test 4: Generación de Texto")
    print("=" * 70 + "\n")
    
    try:
        import torch
        
        # Prompt de prueba
        prompt = "La inteligencia artificial es"
        print(f"📝 Prompt: \"{prompt}\"")
        print("⏳ Generando...")
        
        # Tokenizar
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        
        # Generar
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=50,
                temperature=0.7,
                top_p=0.9,
                top_k=50,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )
        
        # Decodificar
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        print("\n" + "=" * 70)
        print("✨ Texto Generado:")
        print("=" * 70)
        print(generated_text)
        print("=" * 70)
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error generando texto: {e}")
        return False


def main():
    """Ejecuta todos los tests"""
    print("\n")
    print("╔═══════════════════════════════════════════════════════════════════╗")
    print("║           🧪 Test Suite - Gemma 2B Local Setup                  ║")
    print("╚═══════════════════════════════════════════════════════════════════╝")
    print("\n")
    
    # Test 1: Entorno
    if not test_environment():
        print("\n❌ Test de entorno falló")
        print("\nPara configurar:")
        print("1. Copia .env.example a .env")
        print("2. Agrega tu HUGGINGFACE_TOKEN")
        print("3. Ejecuta: python download_model.py")
        return False
    
    # Test 2: Dependencias
    if not test_imports():
        print("\n❌ Faltan dependencias")
        print("\nPara instalar: pip install -r requirements.txt")
        return False
    
    # Test 3: Cargar modelo
    success, model, tokenizer, device = test_model_loading()
    if not success:
        print("\n❌ No se pudo cargar el modelo")
        return False
    
    # Test 4: Generación
    if not test_generation(model, tokenizer, device):
        print("\n❌ No se pudo generar texto")
        return False
    
    # Éxito
    print("\n")
    print("╔═══════════════════════════════════════════════════════════════════╗")
    print("║                    ✅ Todos los tests pasaron                    ║")
    print("╚═══════════════════════════════════════════════════════════════════╝")
    print("\n")
    print("🎉 El modelo está listo para usar!")
    print("\nPróximos pasos:")
    print("  • Ejecuta la API: python inference.py")
    print("  • Prueba en: http://localhost:8000/docs")
    print("  • O usa Docker: docker-compose up --build")
    print("\n")
    
    return True


if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrumpido por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
