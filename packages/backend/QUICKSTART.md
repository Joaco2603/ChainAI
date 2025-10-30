# ChainAI Backend - Quick Start Guide

## Prerequisites Checklist

- [ ] Python 3.9 or higher installed
- [ ] Docker Desktop installed and running
- [ ] Avalanche RPC endpoint URL (Fuji testnet or mainnet)
- [ ] Private key with AVAX for gas fees
- [ ] Deployed ModelRegistry contract address

## 5-Minute Setup

### 1. Install Dependencies

```powershell
# Navigate to backend directory
cd packages\backend

# Run setup script (Windows)
.\setup.ps1

# Or manually:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```env
WEB3_PROVIDER_URI=https://api.avax-test.network/ext/bc/C/rpc
CONTRACT_ADDRESS=0xYourContractAddress
PRIVATE_KEY=your_private_key_here
CHAIN_ID=43113
```

### 3. Start the Server

```powershell
python -m app.main
```

The server will start at `http://localhost:8000`

### 4. Test the API

Open your browser:

- **API Documentation**: http://localhost:8000/api/v1/docs
- **Health Check**: http://localhost:8000/api/v1/health

Or run the test script:

```powershell
python test_api.py
```

## Common API Usage

### Register a Model

```bash
curl -X POST http://localhost:8000/api/v1/models/upload-model \
  -H "Content-Type: application/json" \
  -d '{"docker_image_url": "myregistry/my-model:v1.0"}'
```

### Generate AI Output

```bash
# Submit job
curl -X POST http://localhost:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, AI!", "timeout": 300}'

# Check status (use job_id from response)
curl http://localhost:8000/api/v1/generate/job/{job_id}

# Get result
curl http://localhost:8000/api/v1/generate/result/{job_id}
```

### Rate a Model

```bash
curl -X POST http://localhost:8000/api/v1/models/rate-model \
  -H "Content-Type: application/json" \
  -d '{"model_id": 0, "rating": 5}'
```

### Get Top Models

```bash
curl http://localhost:8000/api/v1/models/top?limit=10
```

## Docker Model Example

Create a simple AI model container for testing:

**Dockerfile**:

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY model.py .

CMD ["python", "model.py"]
```

**model.py**:

```python
import os
import json
import random

prompt = os.environ.get('INPUT_PROMPT', 'Hello')

# Simple mock AI response
responses = [
    f"AI Response to '{prompt}': This is a generated message.",
    f"Based on '{prompt}', here's my analysis...",
    f"Regarding '{prompt}', I think..."
]

output = random.choice(responses)

print(json.dumps({"output": output}))
```

Build and push:

```bash
docker build -t myregistry/my-model:v1.0 .
docker push myregistry/my-model:v1.0
```

## Troubleshooting

### "Could not connect to Docker daemon"

**Solution**: Start Docker Desktop and ensure it's running

### "Failed to connect to Web3 provider"

**Solution**: Check your `WEB3_PROVIDER_URI` in `.env`

### "Transaction failed"

**Solution**: Ensure your account has enough AVAX for gas fees

### "Module not found"

**Solution**: Activate virtual environment and reinstall:

```powershell
venv\Scripts\activate
pip install -r requirements.txt
```

## Production Deployment

### Using Docker Compose

```bash
# Edit .env with production values
# Then run:
docker-compose up -d
```

### Using Uvicorn with Multiple Workers

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Rate Limits

Consider implementing rate limiting for production:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

## Monitoring

Check service health:

```bash
curl http://localhost:8000/api/v1/health
```

View logs:

```bash
# If running with Docker Compose
docker-compose logs -f backend
```

## Next Steps

1. **Deploy Contract**: Ensure your ModelRegistry contract is deployed
2. **Register Models**: Upload AI models to the registry
3. **Test Generation**: Try generating outputs with different prompts
4. **Monitor Jobs**: Watch the job queue in the health endpoint
5. **Scale**: Add more workers or deploy multiple instances

## Support

- Read the full [README.md](README.md) for detailed documentation
- Check [API Documentation](http://localhost:8000/api/v1/docs) when server is running
- Review contract implementation in `../model-chain-contracts/`

Happy Building! 🚀
