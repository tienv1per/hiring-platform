# Embedding Service

Microservice responsible for generating vector embeddings for semantic search.

## Tech Stack
- **Language**: Python 3.12
- **Framework**: Flask
- **ML Runtime**: ONNX Runtime
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`

## API Endpoints

### `GET /health`
Returns service health status.

### `POST /embed`
Generates embedding for a single text.
```json
{
  "text": "Software Engineer"
}
```

### `POST /embed/batch`
Generates embeddings for multiple texts.
```json
{
  "texts": ["Software Engineer", "Product Manager"]
}
```

## Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   python main.py
   ```

The server runs on port **8005**.
