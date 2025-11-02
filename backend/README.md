# ChainAI Backend API

Backend service for ChainAI - A decentralized AI model registry and execution platform on Avalanche.

## Features

- **Model Registration**: Register AI models on the blockchain with Docker image references
- **Model Rating**: Rate models with a 1-5 star system
- **Model Selection**: Smart contract-based model selection with weighted randomization
- **Model Execution**: Dynamic Docker container execution for AI model inference
- **Job Queue**: Asynchronous job processing to handle requests without blocking
- **Web3 Integration**: Full integration with Avalanche blockchain via web3.py

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── routes/              # API endpoints
│   │   ├── models.py        # Model registration and rating
│   │   ├── generate.py      # Generation and job management
│   │   └── health.py        # Health checks
│   ├── services/            # Business logic
│   │   ├── web3_service.py        # Blockchain interaction
│   │   ├── docker_worker_service.py  # Docker container management
│   │   └── job_queue.py     # Async job queue
│   └── models/              # Pydantic schemas
│       └── schemas.py
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

## Prerequisites

- Python 3.9+
- Docker Desktop (for running model containers)
- Avalanche node access (Fuji testnet or mainnet)
- Private key with AVAX for gas fees

## Installation

1. **Clone the repository**:

   ```bash
   cd packages/backend
   ```

2. **Create a virtual environment**:

   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # or
   source venv/bin/activate  # On Linux/Mac
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   - `WEB3_PROVIDER_URI`: Avalanche RPC endpoint
   - `CONTRACT_ADDRESS`: Deployed ModelRegistry contract address
   - `PRIVATE_KEY`: Private key for signing transactions
   - `CHAIN_ID`: 43113 for Fuji testnet, 43114 for mainnet

5. **Ensure Docker is running**:
   ```bash
   docker --version
   docker ps
   ```

## Running the Server

### Development Mode

```bash
# From the backend directory
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:

- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## API Endpoints

### Model Management

#### POST `/api/v1/models/upload-model`

Register a new AI model on the blockchain.

**Request Body**:

```json
{
  "docker_image_url": "myregistry/my-ai-model:v1.0"
}
```

**Response**:

```json
{
  "success": true,
  "model_id": 0,
  "transaction_hash": "0x...",
  "block_number": 12345,
  "message": "Model registered successfully"
}
```

#### POST `/api/v1/models/rate-model`

Rate a model (1-5 stars).

**Request Body**:

```json
{
  "model_id": 0,
  "rating": 5
}
```

**Response**:

```json
{
  "success": true,
  "model_id": 0,
  "rating": 5,
  "transaction_hash": "0x...",
  "block_number": 12346,
  "message": "Model rated successfully"
}
```

#### GET `/api/v1/models/top?limit=10`

Get top-rated models.

**Response**:

```json
{
  "success": true,
  "models": [
    {
      "model_id": 0,
      "owner": "0x...",
      "docker_image_url": "myregistry/my-ai-model:v1.0",
      "average_rating": 4.5,
      "rating_count": 10,
      "times_selected": 50,
      "is_active": true
    }
  ],
  "count": 1
}
```

#### GET `/api/v1/models/{model_id}`

Get detailed information about a model.

### Generation

#### POST `/api/v1/generate`

Generate AI output using a selected model.

**Request Body**:

```json
{
  "prompt": "Write a short story about a robot",
  "timeout": 300
}
```

**Response**:

```json
{
  "success": true,
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Generation job enqueued successfully. Use the job_id to check status."
}
```

#### GET `/api/v1/generate/job/{job_id}`

Check the status of a generation job.

**Response**:

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_type": "generation",
  "status": "completed",
  "result": {
    "model_id": 0,
    "output": "Once upon a time...",
    "transaction_hash": "0x..."
  },
  "created_at": "2024-01-01T00:00:00",
  "completed_at": "2024-01-01T00:05:00"
}
```

#### GET `/api/v1/generate/result/{job_id}`

Get the full result of a completed generation job.

### Health Check

#### GET `/api/v1/health`

Check API health and service status.

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00",
  "services": {
    "api": { "status": "healthy" },
    "docker": { "healthy": true },
    "job_queue": { "pending": 0, "running": 1 },
    "blockchain": { "network": "Avalanche Fuji Testnet" }
  }
}
```

## Docker Image Requirements

AI models must be packaged as Docker images that:

1. Accept input via environment variable `INPUT_PROMPT`
2. Output results to stdout in JSON format: `{"output": "result text"}`
3. Are publicly accessible or in a configured registry
4. Have reasonable resource requirements (< 2GB RAM)

**Example Dockerfile**:

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY model.py requirements.txt ./
RUN pip install -r requirements.txt

CMD python model.py
```

**Example model.py**:

```python
import os
import json

prompt = os.environ.get('INPUT_PROMPT', '')
# Your model inference code here
output = f"Generated response to: {prompt}"

print(json.dumps({"output": output}))
```

## Job Queue

The backend uses an asynchronous job queue to handle long-running tasks:

- Non-blocking API responses
- Concurrent job processing (configurable workers)
- Job status tracking
- Automatic error handling and retry logic

## Security Considerations

1. **Private Key**: Never commit your private key. Use environment variables.
2. **Docker Isolation**: Containers run with network isolation and resource limits.
3. **Input Validation**: All inputs are validated via Pydantic models.
4. **CORS**: Configure allowed origins in production.
5. **Rate Limiting**: Consider adding rate limiting for production.

## Troubleshooting

### Docker Connection Error

```
Could not connect to Docker daemon
```

**Solution**: Ensure Docker Desktop is running.

### Web3 Connection Error

```
Failed to connect to Web3 provider
```

**Solution**: Check `WEB3_PROVIDER_URI` in `.env` and network connectivity.

### Contract Error

```
Contract error: ModelNotFound
```

**Solution**: Verify the contract is deployed and `CONTRACT_ADDRESS` is correct.

## Development

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black app/
isort app/
```

### Type Checking

```bash
mypy app/
```

## License

BSD-3-Clause License

## Support

For issues and questions, please open an issue on the repository.
