# ChainAI Backend - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Applications                      │
│                   (Web, Mobile, CLI, etc.)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                          │  │
│  │  • POST /models/upload-model                             │  │
│  │  • POST /models/rate-model                               │  │
│  │  • GET  /models/top                                      │  │
│  │  • POST /generate                                        │  │
│  │  • GET  /generate/job/{id}                               │  │
│  │  • GET  /health                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────┼───────────────────────────────┐  │
│  │         Services Layer   │                               │  │
│  │  ┌──────────────┐  ┌────┴──────┐  ┌─────────────────┐  │  │
│  │  │ Web3 Service │  │Job Queue  │  │Docker Worker    │  │  │
│  │  │              │  │           │  │Service          │  │  │
│  │  │ • register   │  │• Workers  │  │• pull_image()   │  │  │
│  │  │ • rate       │  │• Status   │  │• run_model()    │  │  │
│  │  │ • select     │  │• Cancel   │  │• cleanup()      │  │  │
│  │  │ • get_info   │  │           │  │                 │  │  │
│  │  └──────┬───────┘  └───────────┘  └────────┬────────┘  │  │
│  └─────────┼──────────────────────────────────┼───────────┘  │
└────────────┼──────────────────────────────────┼──────────────┘
             │                                   │
             │                                   │ Docker API
             │ Web3                              ▼
             │                      ┌────────────────────────┐
             │                      │   Docker Daemon        │
             │                      │                        │
             │                      │  ┌──────────────────┐  │
             │                      │  │ AI Model         │  │
             │                      │  │ Container 1      │  │
             │                      │  └──────────────────┘  │
             │                      │  ┌──────────────────┐  │
             │                      │  │ AI Model         │  │
             │                      │  │ Container 2      │  │
             │                      │  └──────────────────┘  │
             │                      └────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Avalanche Blockchain                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            ModelRegistry Smart Contract                 │    │
│  │                                                         │    │
│  │  • registerModel(dockerImageUrl)                       │    │
│  │  • rateModel(modelId, rating)                          │    │
│  │  • selectModel() → modelId                             │    │
│  │  • getModelInfo(modelId)                               │    │
│  │  • getTopModels(limit)                                 │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagrams

### Model Registration Flow

```
Client                 FastAPI              Web3 Service         Blockchain
  │                      │                       │                    │
  │  POST /upload-model  │                       │                    │
  ├─────────────────────>│                       │                    │
  │                      │                       │                    │
  │                      │  register_model()     │                    │
  │                      ├──────────────────────>│                    │
  │                      │                       │                    │
  │                      │                       │ registerModel()    │
  │                      │                       ├───────────────────>│
  │                      │                       │                    │
  │                      │                       │  Transaction Hash  │
  │                      │                       │<───────────────────┤
  │                      │                       │                    │
  │                      │  {model_id, tx_hash}  │                    │
  │                      │<──────────────────────┤                    │
  │                      │                       │                    │
  │  201 Created         │                       │                    │
  │  {model_id, tx}      │                       │                    │
  │<─────────────────────┤                       │                    │
  │                      │                       │                    │
```

### Generation Flow (The Main Pipeline)

```
Client         FastAPI         Job Queue        Worker          Web3          Docker
  │              │                 │               │              │              │
  │ POST         │                 │               │              │              │
  │ /generate    │                 │               │              │              │
  ├─────────────>│                 │               │              │              │
  │              │                 │               │              │              │
  │              │ enqueue_job()   │               │              │              │
  │              ├────────────────>│               │              │              │
  │              │                 │               │              │              │
  │ 202          │                 │               │              │              │
  │ {job_id}     │                 │               │              │              │
  │<─────────────┤                 │               │              │              │
  │              │                 │               │              │              │
  │              │                 │  pick_job()   │              │              │
  │              │                 ├──────────────>│              │              │
  │              │                 │               │              │              │
  │              │                 │               │ selectModel()│              │
  │              │                 │               ├─────────────>│              │
  │              │                 │               │              │              │
  │              │                 │               │ {model_id,   │              │
  │              │                 │               │  docker_url} │              │
  │              │                 │               │<─────────────┤              │
  │              │                 │               │              │              │
  │              │                 │               │  run_model() │              │
  │              │                 │               ├─────────────────────────────>│
  │              │                 │               │              │              │
  │              │                 │               │              │ Pull Image   │
  │              │                 │               │              │ Run Container│
  │              │                 │               │              │              │
  │              │                 │               │    {output}  │              │
  │              │                 │               │<─────────────────────────────┤
  │              │                 │               │              │              │
  │              │                 │  store_result │              │              │
  │              │                 │<──────────────┤              │              │
  │              │                 │               │              │              │
  │ GET          │                 │               │              │              │
  │ /result/{id} │                 │               │              │              │
  ├─────────────>│                 │               │              │              │
  │              │                 │               │              │              │
  │              │ get_job_status()│               │              │              │
  │              ├────────────────>│               │              │              │
  │              │                 │               │              │              │
  │              │   {result}      │               │              │              │
  │              │<────────────────┤               │              │              │
  │              │                 │               │              │              │
  │ 200 OK       │                 │               │              │              │
  │ {output}     │                 │               │              │              │
  │<─────────────┤                 │               │              │              │
```

## Component Responsibilities

### FastAPI Layer

- HTTP request handling
- Input validation
- Response formatting
- CORS management
- Error handling
- API documentation

### Web3 Service

- Blockchain connection management
- Contract ABI loading
- Transaction building and signing
- Gas estimation and management
- Event parsing
- Nonce management

### Docker Worker Service

- Docker daemon communication
- Image pulling and caching
- Container lifecycle management
- Resource limiting
- Security isolation
- Output parsing

### Job Queue

- Async task management
- Worker pool management
- Job status tracking
- Cancellation support
- Error recovery
- Statistics reporting

## Data Flow

### Model Metadata (On-Chain)

```
ModelRegistry Contract
├── Model ID: 0
│   ├── owner: 0x...
│   ├── dockerImageUrl: "registry/model:v1"
│   ├── totalRating: 450
│   ├── ratingCount: 100
│   ├── timesSelected: 250
│   └── isActive: true
└── Model ID: 1
    └── ...
```

### Docker Images (Off-Chain)

```
Docker Registry
├── registry/model-1:v1.0
├── registry/model-2:v2.0
└── registry/model-3:latest
```

### Job State (In-Memory)

```
Job Queue
├── Job ID: abc-123
│   ├── status: "running"
│   ├── type: "generation"
│   ├── created_at: "2024-01-01T00:00:00"
│   └── result: null
└── Job ID: def-456
    ├── status: "completed"
    ├── type: "generation"
    ├── created_at: "2024-01-01T00:01:00"
    └── result: {model_id: 0, output: "..."}
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         Input Validation                │
│     (Pydantic Models)                   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Request Authentication             │
│     (Optional - Can be added)           │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Business Logic Validation            │
│  (Service Layer Checks)                 │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Container Isolation                   │
│  • No network access                    │
│  • Resource limits                      │
│  • Read-only filesystem                 │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Blockchain Security                   │
│  • Signed transactions                  │
│  • Smart contract validation            │
│  • On-chain access control              │
└─────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

```
                    Load Balancer
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    Backend 1       Backend 2       Backend 3
         │               │               │
         └───────────────┼───────────────┘
                         │
                  Shared Resources
                  ├── Blockchain RPC
                  ├── Docker Registry
                  └── (Optional) Redis Queue
```

### Vertical Scaling

- Increase worker count per instance
- Allocate more resources to Docker
- Use faster blockchain RPC endpoints
- Optimize container images

## Monitoring Points

```
┌─────────────────────────────────────────┐
│           Metrics to Track              │
├─────────────────────────────────────────┤
│ • Request rate (req/sec)                │
│ • Response time (ms)                    │
│ • Job queue depth                       │
│ • Active containers                     │
│ • Docker image cache size               │
│ • Blockchain transaction success rate   │
│ • Average gas cost                      │
│ • Error rates by type                   │
│ • Model selection distribution          │
│ • Container execution time              │
└─────────────────────────────────────────┘
```

---

This architecture provides:
✅ Scalability through async processing
✅ Reliability through error handling
✅ Security through isolation
✅ Performance through caching
✅ Transparency through blockchain
✅ Flexibility through modular design
