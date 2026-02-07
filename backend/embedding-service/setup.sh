#!/bin/bash
# Script to verify and download the embedding model

MODEL_DIR="models"
MODEL_FILE="$MODEL_DIR/all-MiniLM-L6-v2.onnx"

echo "🔧 Verifying ONNX embedding model..."

# Create models directory if not exists
mkdir -p "$MODEL_DIR"

# Download model if not exists
if [ ! -f "$MODEL_FILE" ]; then
    echo "📥 Downloading ONNX model (~80MB)..."
    curl -L "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx" \
        -o "$MODEL_FILE" \
        --progress-bar
    echo "✅ Model downloaded"
else
    echo "✅ Model found"
fi

# Download tokenizer files
if [ ! -f "$MODEL_DIR/tokenizer.json" ]; then
    curl -L "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json" \
        -o "$MODEL_DIR/tokenizer.json" --silent
fi
if [ ! -f "$MODEL_DIR/vocab.txt" ]; then
    curl -L "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/vocab.txt" \
        -o "$MODEL_DIR/vocab.txt" --silent
fi

echo "✅ Embedding Service setup complete"
