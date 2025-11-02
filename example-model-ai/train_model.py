"""
Script para entrenar el modelo GPT Mini (Decoder-only Transformer)
Este script carga datos, entrena el modelo y lo guarda para inferencia.
"""
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.layers import TextVectorization
import numpy as np
import os
import string
import pickle


# ============== ARQUITECTURA DEL MODELO ==============

def causal_attention_mask(batch_size, number_tokens_dest, number_tokens_src, dtype):
    """
    Mask the upper half of the dot product matrix in self attention.
    This prevents flow of information from future tokens to current token.
    """
    i = tf.range(number_tokens_dest)[:, None]
    j = tf.range(number_tokens_src)
    m = i >= j - number_tokens_src + number_tokens_dest
    mask = tf.cast(m, dtype)
    mask = tf.reshape(mask, [1, number_tokens_dest, number_tokens_src])
    mult = tf.concat(
        [tf.expand_dims(batch_size, -1), tf.constant([1, 1], dtype=tf.int32)], 0
    )
    return tf.tile(mask, mult)


class TransformerBlock(layers.Layer):
    def __init__(self, embed_dim, num_heads, ff_dim, rate=0.1):
        super().__init__()
        self.att = layers.MultiHeadAttention(num_heads, embed_dim)
        self.ffn = keras.Sequential(
            [layers.Dense(ff_dim, activation='relu'), layers.Dense(embed_dim)]
        )
        self.layernorm1 = layers.LayerNormalization(epsilon=1e-6)
        self.layernorm2 = layers.LayerNormalization(epsilon=1e-6)
        self.dropout1 = layers.Dropout(rate)
        self.dropout2 = layers.Dropout(rate)

    def call(self, inputs):
        input_shape = tf.shape(inputs)
        batch_size = input_shape[0]
        seq_len = input_shape[1]
        causal_mask = causal_attention_mask(batch_size, seq_len, seq_len, tf.bool)
        attention_output = self.att(inputs, inputs, attention_mask=causal_mask)
        attention_output = self.dropout1(attention_output)
        out1 = self.layernorm1(inputs + attention_output)
        ffn_output = self.ffn(out1)
        ffn_output = self.dropout2(ffn_output)
        return self.layernorm2(out1 + ffn_output)


class TokenAndPositionEmbedding(layers.Layer):
    def __init__(self, maxlen, vocab_size, embed_dim):
        super().__init__()
        self.token_emb = layers.Embedding(input_dim=vocab_size, output_dim=embed_dim)
        self.pos_emb = layers.Embedding(input_dim=maxlen, output_dim=embed_dim)
    
    def call(self, x):
        maxlen = tf.shape(x)[-1]
        positions = tf.range(start=0, limit=maxlen, delta=1)
        positions = self.pos_emb(positions)
        x = self.token_emb(x)
        return x + positions


# ============== PREPARACIÓN DE DATOS ==============

def custom_standarization(input_string):
    """Remove html line-break tags and handle punctuation"""
    lowercased = tf.strings.lower(input_string)
    stripped_html = tf.strings.regex_replace(lowercased, "<br />", " ")
    return tf.strings.regex_replace(stripped_html, f"([{string.punctuation}])", r"\1")


def prepare_lm_inputs_labels(text, vectorize_layer):
    """
    Shift word sequences by 1 position so that the target for position (i) is 
    word at position (i+1).
    """
    text = tf.expand_dims(text, -1)
    tokenized_sentences = vectorize_layer(text)
    x = tokenized_sentences[:, :-1]
    y = tokenized_sentences[:, 1:]
    return x, y


# ============== CONSTRUCCIÓN DEL MODELO ==============

def create_model(maxlen, vocab_size, embed_dim=256, num_heads=2, feed_forward_dim=256):
    """Crea el modelo Transformer Decoder-only"""
    inputs = layers.Input(shape=(maxlen,), dtype=tf.int32)
    embedding_layer = TokenAndPositionEmbedding(maxlen, vocab_size, embed_dim)
    x = embedding_layer(inputs)
    transformer_block = TransformerBlock(embed_dim, num_heads, feed_forward_dim)
    x = transformer_block(x)
    outputs = layers.Dense(vocab_size)(x)
    model = keras.Model(inputs=inputs, outputs=[outputs, x])
    loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
    model.compile("adam", loss=[loss_fn, None])
    return model


# ============== GENERACIÓN DE TEXTO ==============

class TextGenerator(keras.callbacks.Callback):
    """Callback to generate text from trained model during training"""
    def __init__(self, max_tokens, start_tokens, index_to_word, maxlen, top_k=10, print_every=1):
        self.max_tokens = max_tokens
        self.start_tokens = start_tokens
        self.index_to_word = index_to_word
        self.print_every = print_every
        self.k = top_k
        self.maxlen = maxlen

    def sample_from(self, logits):
        logits, indices = tf.math.top_k(logits, k=self.k, sorted=True)
        indices = np.asarray(indices).astype("int32")
        preds = keras.activations.softmax(tf.expand_dims(logits, 0))[0]
        preds = np.asarray(preds).astype("float32")
        return np.random.choice(indices, p=preds)
    
    def detokenize(self, number):
        return self.index_to_word[number]
    
    def on_epoch_end(self, epoch, logs=None):
        start_tokens = [_ for _ in self.start_tokens]
        if (epoch + 1) % self.print_every != 0:
            return
        num_tokens_generated = 0
        tokens_generated = []
        while num_tokens_generated <= self.max_tokens:
            pad_len = self.maxlen - len(start_tokens)
            sample_index = len(start_tokens) - 1
            if pad_len < 0:
                x = start_tokens[:self.maxlen]
                sample_index = self.maxlen - 1
            elif pad_len > 0:
                x = start_tokens + [0] * pad_len
            else:
                x = start_tokens
            x = np.array([x])
            y, _ = self.model.predict(x, verbose=0)
            sample_token = self.sample_from(y[0][sample_index])
            tokens_generated.append(sample_token)
            start_tokens.append(sample_token)
            num_tokens_generated = len(tokens_generated)
        txt = " ".join(
            [self.detokenize(_) for _ in self.start_tokens + tokens_generated]
        )
        print(f"generated text:\n{txt}\n")


# ============== ENTRENAMIENTO ==============

def main():
    print("=" * 60)
    print("Entrenamiento de Modelo GPT Mini (Decoder-only Transformer)")
    print("=" * 60)
    
    # Configuración
    batch_size = 128
    vocab_size = 20000
    maxlen = 80
    embed_dim = 256
    num_heads = 2
    feed_forward_dim = 256
    epochs = 10  # Puedes aumentar para mejor calidad
    
    # Cargar datos
    source = "clean_titulares.txt"
    if not os.path.exists(source):
        raise FileNotFoundError(f"No se encontró el archivo {source}")
    
    print(f"\n📚 Cargando datos desde {source}...")
    text_ds = tf.data.TextLineDataset(source)
    text_ds = text_ds.shuffle(buffer_size=256)
    text_ds = text_ds.batch(batch_size)
    
    # Crear y adaptar vectorization layer
    print("🔤 Creando vectorization layer...")
    vectorize_layer = TextVectorization(
        standardize=custom_standarization,
        max_tokens=vocab_size - 1,
        output_mode="int",
        output_sequence_length=maxlen + 1,
    )
    vectorize_layer.adapt(text_ds)
    vocab = vectorize_layer.get_vocabulary()
    
    print(f"   Vocabulario: {len(vocab)} palabras")
    print(f"   Longitud máxima: {maxlen} tokens")
    
    # Preparar dataset
    print("⚙️  Preparando dataset...")
    text_ds = text_ds.map(lambda text: prepare_lm_inputs_labels(text, vectorize_layer))
    text_ds = text_ds.prefetch(tf.data.AUTOTUNE)
    
    # Crear modelo
    print("\n🏗️  Construyendo modelo...")
    model = create_model(maxlen, vocab_size, embed_dim, num_heads, feed_forward_dim)
    model.summary()
    
    # Crear callback de generación
    word_to_index = {word: index for index, word in enumerate(vocab)}
    start_prompt = "la ciberseguridad"
    start_tokens = [word_to_index.get(_, 1) for _ in start_prompt.split()]
    num_tokens_generated = 40
    text_gen_callback = TextGenerator(
        num_tokens_generated, start_tokens, vocab, maxlen
    )
    
    # Entrenar
    print(f"\n🚀 Entrenando modelo por {epochs} épocas...")
    print("-" * 60)
    model.fit(
        text_ds,
        verbose=2,
        epochs=epochs,
        callbacks=[text_gen_callback]
    )
    
    # Guardar modelo y vocabulario
    print("\n💾 Guardando modelo y vocabulario...")
    
    # Guardar modelo completo
    model.save("model", save_format="tf")
    print("   ✓ Modelo guardado en ./model/")
    
    # Guardar vocabulario
    with open("vocab.pkl", "wb") as f:
        pickle.dump(vocab, f)
    print("   ✓ Vocabulario guardado en ./vocab.pkl")
    
    # Guardar configuración
    config = {
        "vocab_size": vocab_size,
        "maxlen": maxlen,
        "embed_dim": embed_dim,
        "num_heads": num_heads,
        "feed_forward_dim": feed_forward_dim
    }
    with open("config.pkl", "wb") as f:
        pickle.dump(config, f)
    print("   ✓ Configuración guardada en ./config.pkl")
    
    print("\n✅ Entrenamiento completado exitosamente!")
    print("=" * 60)


if __name__ == "__main__":
    main()
