"""
Simple Flask server for generating sentence embeddings using ONNX runtime.
Uses sentence-transformers/all-MiniLM-L6-v2 model for 384-dimensional embeddings.
"""

from flask import Flask, request, jsonify
from transformers import AutoTokenizer
import onnxruntime as ort
import numpy as np
import os
import threading
from prometheus_flask_exporter import PrometheusMetrics
from models import EmbedRequest, BatchEmbedRequest, EmbedResponse, BatchEmbedResponse

app = Flask(__name__)

# Setup Prometheus metrics
metrics = PrometheusMetrics(app, path=None)  # Disable default /metrics endpoint

# Start metrics server on separate port
def start_metrics_server():
    from flask import Flask
    from prometheus_client import make_wsgi_app
    from wsgiref.simple_server import make_server
    
    metrics_app = Flask('metrics')
    @metrics_app.route('/metrics')
    def metrics_endpoint():
        from prometheus_client import generate_latest
        return generate_latest()
    
    print("📊 Metrics server started on port 9105")
    server = make_server('0.0.0.0', 9105, metrics_app)
    server.serve_forever()

threading.Thread(target=start_metrics_server, daemon=True).start()

# Model configuration
MODEL_PATH = "models/all-MiniLM-L6-v2.onnx"
TOKENIZER_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Load tokenizer
print(f"Loading tokenizer: {TOKENIZER_NAME}")
tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_NAME)

# Load ONNX model
print(f"Loading ONNX model: {MODEL_PATH}")
session = ort.InferenceSession(MODEL_PATH)
print("✅ Model loaded successfully")


def mean_pooling(model_output, attention_mask):
    """Mean pooling to get sentence embeddings"""
    token_embeddings = model_output[0]
    input_mask_expanded = np.expand_dims(attention_mask, -1)
    input_mask_expanded = np.repeat(input_mask_expanded, token_embeddings.shape[-1], -1)
    
    sum_embeddings = np.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = np.clip(np.sum(input_mask_expanded, 1), a_min=1e-9, a_max=None)
    
    return sum_embeddings / sum_mask


def normalize_embeddings(embeddings):
    """L2 normalize embeddings"""
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    return embeddings / norms


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model": "all-MiniLM-L6-v2"}), 200


@app.route('/embed', methods=['POST'])
def embed():
    """Generate embeddings for input text"""
    try:
        data = request.get_json()
        try:
            req = EmbedRequest(**data)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        
        text = req.text
        
        # Tokenize
        encoded_input = tokenizer(
            text,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors='np'
        )
        
        # Run inference
        ort_inputs = {
            'input_ids': encoded_input['input_ids'].astype(np.int64),
            'attention_mask': encoded_input['attention_mask'].astype(np.int64),
            'token_type_ids': encoded_input['token_type_ids'].astype(np.int64)
        }
        
        ort_outputs = session.run(None, ort_inputs)
        
        # Mean pooling
        embeddings = mean_pooling(ort_outputs, encoded_input['attention_mask'])
        
        # Normalize
        embeddings = normalize_embeddings(embeddings)
        
        return jsonify({
            "embedding": embeddings[0].tolist(),
            "dimensions": len(embeddings[0])
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/embed/batch', methods=['POST'])
def embed_batch():
    """Generate embeddings for multiple texts"""
    try:
        data = request.get_json()
        try:
            req = BatchEmbedRequest(**data)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        
        texts = req.texts
        
        # Tokenize all texts
        encoded_input = tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors='np'
        )
        
        # Run inference
        ort_inputs = {
            'input_ids': encoded_input['input_ids'].astype(np.int64),
            'attention_mask': encoded_input['attention_mask'].astype(np.int64),
            'token_type_ids': encoded_input['token_type_ids'].astype(np.int64)
        }
        
        ort_outputs = session.run(None, ort_inputs)
        
        # Mean pooling
        embeddings = mean_pooling(ort_outputs, encoded_input['attention_mask'])
        
        # Normalize
        embeddings = normalize_embeddings(embeddings)
        
        return jsonify({
            "embeddings": embeddings.tolist(),
            "count": len(embeddings),
            "dimensions": len(embeddings[0])
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("\n🚀 Starting embedding server on http://localhost:8005")
    print("   Model: sentence-transformers/all-MiniLM-L6-v2")
    print("   Dimensions: 384")
    print("\n")
    app.run(host='0.0.0.0', port=8005, debug=False)
