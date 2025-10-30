"""
Script de inferencia para el modelo GPT Mini
Este script se ejecuta dentro del contenedor Docker y:
1. Recibe un prompt como argumento de línea de comandos en formato JSON
2. Carga el modelo entrenado
3. Genera texto
4. Devuelve el resultado en formato JSON
"""
import sys
import json
import pickle
import numpy as np
import tensorflow as tf
from tensorflow import keras


class TextPredictor:
    """Clase para generar texto usando el modelo entrenado"""
    
    def __init__(self, model_path="model", vocab_path="vocab.pkl", config_path="config.pkl"):
        """
        Inicializa el predictor cargando modelo, vocabulario y configuración
        
        Args:
            model_path: Ruta al modelo guardado
            vocab_path: Ruta al archivo de vocabulario
            config_path: Ruta al archivo de configuración
        """
        print("📦 Cargando modelo...", file=sys.stderr)
        
        # Cargar configuración
        with open(config_path, "rb") as f:
            self.config = pickle.load(f)
        
        self.maxlen = self.config["maxlen"]
        
        # Cargar vocabulario
        with open(vocab_path, "rb") as f:
            self.vocab = pickle.load(f)
        
        # Crear mapeo palabra-índice
        self.word_to_index = {word: idx for idx, word in enumerate(self.vocab)}
        self.index_to_word = self.vocab
        
        # Cargar modelo
        self.model = keras.models.load_model(model_path)
        
        print(f"✓ Modelo cargado exitosamente", file=sys.stderr)
        print(f"  Vocabulario: {len(self.vocab)} palabras", file=sys.stderr)
        print(f"  Max length: {self.maxlen} tokens", file=sys.stderr)
    
    def tokenize_prompt(self, prompt):
        """
        Convierte un prompt de texto en tokens
        
        Args:
            prompt: String con el texto inicial
            
        Returns:
            Lista de índices de tokens
        """
        words = prompt.lower().split()
        tokens = [self.word_to_index.get(word, 1) for word in words]  # 1 es UNK
        return tokens
    
    def sample_from(self, logits, top_k=10):
        """
        Muestrea el siguiente token desde las probabilidades
        
        Args:
            logits: Logits del modelo
            top_k: Número de tokens top a considerar
            
        Returns:
            Índice del token seleccionado
        """
        logits, indices = tf.math.top_k(logits, k=top_k, sorted=True)
        indices = np.asarray(indices).astype("int32")
        preds = keras.activations.softmax(tf.expand_dims(logits, 0))[0]
        preds = np.asarray(preds).astype("float32")
        return np.random.choice(indices, p=preds)
    
    def generate(self, prompt, max_tokens=50, top_k=10, temperature=1.0):
        """
        Genera texto a partir de un prompt
        
        Args:
            prompt: Texto inicial
            max_tokens: Número máximo de tokens a generar
            top_k: Número de tokens top a considerar en sampling
            temperature: Temperatura para el sampling (no implementado aún)
            
        Returns:
            Texto generado
        """
        print(f"🤖 Generando texto desde: '{prompt}'", file=sys.stderr)
        
        # Tokenizar prompt inicial
        start_tokens = self.tokenize_prompt(prompt)
        
        if not start_tokens:
            start_tokens = [1]  # Si el prompt está vacío, usar token UNK
        
        tokens_generated = []
        num_tokens_generated = 0
        
        # Generar tokens
        while num_tokens_generated < max_tokens:
            # Preparar input
            pad_len = self.maxlen - len(start_tokens)
            sample_index = len(start_tokens) - 1
            
            if pad_len < 0:
                # Si es muy largo, tomar solo los últimos maxlen tokens
                x = start_tokens[-self.maxlen:]
                sample_index = self.maxlen - 1
            elif pad_len > 0:
                # Si es muy corto, rellenar con ceros
                x = start_tokens + [0] * pad_len
            else:
                x = start_tokens
            
            # Convertir a array numpy
            x = np.array([x])
            
            # Predecir siguiente token
            y, _ = self.model.predict(x, verbose=0)
            
            # Muestrear token
            sample_token = self.sample_from(y[0][sample_index], top_k=top_k)
            
            # Agregar a la secuencia
            tokens_generated.append(sample_token)
            start_tokens.append(sample_token)
            num_tokens_generated += 1
            
            # Detener si generamos un token de fin (opcional)
            # if sample_token == 0:  # 0 es padding, podríamos usarlo como EOS
            #     break
        
        # Detokenizar
        all_tokens = self.tokenize_prompt(prompt) + tokens_generated
        generated_text = " ".join([self.index_to_word[idx] for idx in all_tokens])
        
        print(f"✓ Generación completada: {num_tokens_generated} tokens", file=sys.stderr)
        
        return generated_text


def main():
    """
    Función principal que:
    1. Lee el input JSON del argumento de línea de comandos
    2. Genera texto
    3. Devuelve resultado en formato JSON
    """
    try:
        # Leer input desde argumentos de línea de comandos
        if len(sys.argv) < 2:
            raise ValueError("No se proporcionó input. Uso: python inference.py '{\"prompt\": \"texto\"}'")
        
        # Parsear JSON input
        input_data = json.loads(sys.argv[1])
        prompt = input_data.get("prompt", "")
        
        if not prompt:
            raise ValueError("El campo 'prompt' es requerido")
        
        # Parámetros opcionales
        max_tokens = input_data.get("max_tokens", 50)
        top_k = input_data.get("top_k", 10)
        
        print(f"📥 Input recibido: '{prompt}'", file=sys.stderr)
        print(f"   max_tokens: {max_tokens}, top_k: {top_k}", file=sys.stderr)
        
        # Crear predictor y generar
        predictor = TextPredictor()
        generated_text = predictor.generate(
            prompt=prompt,
            max_tokens=max_tokens,
            top_k=top_k
        )
        
        # Crear respuesta en formato JSON
        response = {
            "output": generated_text,
            "prompt": prompt,
            "tokens_generated": max_tokens,
            "model": "gpt-mini-transformer"
        }
        
        # IMPORTANTE: Imprimir SOLO el JSON en stdout
        # Todos los logs van a stderr
        print(json.dumps(response))
        
    except Exception as e:
        # En caso de error, devolver JSON con error
        error_response = {
            "output": "",
            "error": str(e),
            "success": False
        }
        print(json.dumps(error_response))
        sys.exit(1)


if __name__ == "__main__":
    main()
