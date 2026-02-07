#!/bin/bash
# Setup script for downloading the ONNX embedding model
# Model: sentence-transformers/all-MiniLM-L6-v2 (384 dimensions, ~80MB)

set -e  # Exit on error

MODEL_DIR="backend/job-service/models"
MODEL_FILE="$MODEL_DIR/all-MiniLM-L6-v2.onnx"
TOKENIZER_FILE="$MODEL_DIR/tokenizer.json"
VOCAB_FILE="$MODEL_DIR/vocab.txt"

echo "🔧 Setting up ONNX embedding model..."

# Create models directory
mkdir -p "$MODEL_DIR"

# Download model if not exists
if [ ! -f "$MODEL_FILE" ]; then
    echo "📥 Downloading ONNX model (~80MB)..."
    curl -L "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx" \
        -o "$MODEL_FILE" \
        --progress-bar
    echo "✅ Model downloaded: $MODEL_FILE"
else
    echo "✅ Model already exists: $MODEL_FILE"
fi

# Download tokenizer if not exists
if [ ! -f "$TOKENIZER_FILE" ]; then
    echo "📥 Downloading tokenizer..."
    curl -L "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json" \
        -o "$TOKENIZER_FILE" \
        --progress-bar
    echo "✅ Tokenizer downloaded: $TOKENIZER_FILE"
else
    echo "✅ Tokenizer already exists: $TOKENIZER_FILE"
fi

# Download vocab if not exists
if [ ! -f "$VOCAB_FILE" ]; then
    echo "📥 Downloading vocabulary..."
    curl -L "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/vocab.txt" \
        -o "$VOCAB_FILE" \
        --progress-bar
    echo "✅ Vocabulary downloaded: $VOCAB_FILE"
else
    echo "✅ Vocabulary already exists: $VOCAB_FILE"
fi

# Verify files
echo ""
echo "📊 Model files:"
ls -lh "$MODEL_DIR"

echo ""
echo "✅ Setup complete! Model ready for use."
echo "   Model path: $MODEL_FILE"
echo "   Dimensions: 384"
echo "   Model size: $(du -h "$MODEL_FILE" | cut -f1)"
