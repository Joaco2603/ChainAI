"""
Script para descargar los pesos del modelo Gemma 2B desde HuggingFace Hub
Requiere autenticación con token de HuggingFace
"""
import os
from pathlib import Path
from huggingface_hub import snapshot_download, login
from dotenv import load_dotenv
import sys

# Cargar variables de entorno
load_dotenv()

def download_gemma_2b(
    model_name: str = "google/gemma-2b",
    local_dir: str = "./model_weights",
    token: str = None
):
    """
    Descarga el modelo Gemma 2B desde HuggingFace Hub
    
    Args:
        model_name: Nombre del modelo en HuggingFace Hub
        local_dir: Directorio local donde guardar los pesos
        token: Token de HuggingFace para autenticación
    """
    
    print("=" * 70)
    print("🚀 Descargando Gemma 2B desde HuggingFace Hub")
    print("=" * 70)
    
    # Obtener token de HuggingFace
    if token is None:
        token = os.getenv("HUGGINGFACE_TOKEN")
    
    if not token:
        print("\n❌ ERROR: No se encontró el token de HuggingFace")
        print("\nPara obtener tu token:")
        print("1. Ve a https://huggingface.co/settings/tokens")
        print("2. Crea un token de acceso (Read)")
        print("3. Acepta los términos de Gemma en https://huggingface.co/google/gemma-2b")
        print("4. Configura el token en el archivo .env:")
        print("   HUGGINGFACE_TOKEN=tu_token_aqui")
        print("\nO pásalo como argumento: python download_model.py --token TU_TOKEN")
        sys.exit(1)
    
    # Login en HuggingFace
    print(f"\n🔐 Autenticando en HuggingFace Hub...")
    try:
        login(token=token)
        print("   ✓ Autenticación exitosa")
    except Exception as e:
        print(f"   ❌ Error en autenticación: {e}")
        sys.exit(1)
    
    # Crear directorio si no existe
    Path(local_dir).mkdir(parents=True, exist_ok=True)
    
    # Descargar modelo
    print(f"\n📥 Descargando {model_name}...")
    print(f"   Destino: {Path(local_dir).absolute()}")
    print("   ⚠️  Esto puede tardar varios minutos (~5GB)...")
    
    try:
        snapshot_download(
            repo_id=model_name,
            local_dir=local_dir,
            token=token,
            ignore_patterns=["*.msgpack", "*.h5", "*.ot"],  # Ignorar formatos no necesarios
        )
        print("\n✅ Descarga completada exitosamente!")
        print(f"   📁 Modelo guardado en: {Path(local_dir).absolute()}")
        
        # Verificar archivos descargados
        print("\n📋 Archivos descargados:")
        model_path = Path(local_dir)
        for file in sorted(model_path.rglob("*")):
            if file.is_file():
                size_mb = file.stat().st_size / (1024 * 1024)
                print(f"   • {file.name:<40} ({size_mb:.2f} MB)")
        
    except Exception as e:
        print(f"\n❌ Error durante la descarga: {e}")
        print("\nVerifica que:")
        print("1. Tu token sea válido")
        print("2. Hayas aceptado los términos de Gemma en HuggingFace")
        print("3. Tengas suficiente espacio en disco (~5GB)")
        sys.exit(1)
    
    print("\n" + "=" * 70)
    print("✨ Listo para usar el modelo con inference.py")
    print("=" * 70)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Descargar Gemma 2B desde HuggingFace")
    parser.add_argument(
        "--model",
        type=str,
        default="google/gemma-2b",
        help="Nombre del modelo en HuggingFace (default: google/gemma-2b)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="./model_weights",
        help="Directorio de salida (default: ./model_weights)"
    )
    parser.add_argument(
        "--token",
        type=str,
        default=None,
        help="Token de HuggingFace (opcional, se puede usar .env)"
    )
    
    args = parser.parse_args()
    
    download_gemma_2b(
        model_name=args.model,
        local_dir=args.output,
        token=args.token
    )
