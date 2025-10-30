"""
Script de prueba local para el modelo antes de dockerizar
Este script prueba la inferencia sin Docker
"""
import sys
import json
from inference import TextPredictor


def test_local():
    """Prueba el modelo localmente sin Docker"""
    print("=" * 60)
    print("Prueba Local del Modelo GPT Mini")
    print("=" * 60)
    print()
    
    # Verificar que existan los archivos necesarios
    try:
        print("📦 Cargando modelo...")
        predictor = TextPredictor()
        print("✓ Modelo cargado exitosamente")
        print()
    except Exception as e:
        print(f"✗ Error cargando modelo: {e}")
        print()
        print("Asegúrate de haber entrenado el modelo primero:")
        print("  python train_model.py")
        return
    
    # Prompts de prueba
    test_prompts = [
        ("la inteligencia artificial", 30),
        ("el futuro de", 20),
        ("la tecnología blockchain", 25),
        ("la ciberseguridad en", 30),
    ]
    
    print("🧪 Ejecutando pruebas...")
    print("-" * 60)
    
    for i, (prompt, max_tokens) in enumerate(test_prompts, 1):
        print(f"\nPrueba {i}:")
        print(f"  Prompt: '{prompt}'")
        print(f"  Max tokens: {max_tokens}")
        
        try:
            result = predictor.generate(
                prompt=prompt,
                max_tokens=max_tokens,
                top_k=10
            )
            
            print(f"  ✓ Resultado:")
            print(f"    {result}")
            
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    print()
    print("-" * 60)
    print("✅ Pruebas completadas")
    print()
    
    # Prueba interactiva
    print("🎮 Modo interactivo (escribe 'quit' para salir)")
    print()
    
    while True:
        try:
            prompt = input("Tu prompt: ").strip()
            
            if prompt.lower() in ['quit', 'exit', 'q']:
                break
            
            if not prompt:
                continue
            
            max_tokens = input("Max tokens (Enter para 30): ").strip()
            max_tokens = int(max_tokens) if max_tokens else 30
            
            print("\n🤖 Generando...")
            result = predictor.generate(
                prompt=prompt,
                max_tokens=max_tokens,
                top_k=10
            )
            
            print(f"\n📝 Resultado:\n{result}\n")
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"\n✗ Error: {e}\n")
    
    print("\n👋 ¡Hasta luego!")


if __name__ == "__main__":
    test_local()
