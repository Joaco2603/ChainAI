"""
Pydantic models for request/response schemas.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


# ============ Model Registration ============

class ModelUploadRequest(BaseModel):
    """Request model for uploading/registering a new AI model."""
    docker_image_url: str = Field(
        ...,
        description="URL to the Docker image containing the AI model",
        example="myregistry/my-ai-model:v1.0"
    )
    
    @validator('docker_image_url')
    def validate_docker_url(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Docker image URL cannot be empty')
        return v.strip()


class ModelUploadResponse(BaseModel):
    """Response model for model registration."""
    success: bool
    model_id: int
    transaction_hash: str
    block_number: int
    message: str = "Model registered successfully"


# ============ Model Rating ============

class RateModelRequest(BaseModel):
    """Request model for rating a model."""
    model_id: int = Field(..., ge=0, description="ID of the model to rate")
    rating: int = Field(..., ge=1, le=5, description="Rating value (1-5)")
    
    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v


class RateModelResponse(BaseModel):
    """Response model for rating a model."""
    success: bool
    model_id: int
    rating: int
    transaction_hash: str
    block_number: int
    message: str = "Model rated successfully"


# ============ Model Generation ============

class GenerateRequest(BaseModel):
    """Request model for generating output from an AI model."""
    prompt: str = Field(
        ...,
        description="Input prompt for the AI model",
        min_length=1,
        max_length=10000,
        example="Write a short story about a robot"
    )
    timeout: Optional[int] = Field(
        None,
        ge=10,
        le=600,
        description="Maximum execution time in seconds (10-600)"
    )


class GenerateResponse(BaseModel):
    """Response model for generation request."""
    success: bool
    job_id: str
    message: str = "Generation job enqueued successfully"


class GenerationResult(BaseModel):
    """Model for generation job result."""
    job_id: str
    status: str
    model_id: Optional[int] = None
    prompt: Optional[str] = None
    output: Optional[str] = None
    transaction_hash: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


# ============ Model Information ============

class ModelInfo(BaseModel):
    """Model information schema."""
    model_id: int
    owner: str
    docker_image_url: str
    average_rating: float
    rating_count: int
    times_selected: int
    is_active: bool


class TopModelsResponse(BaseModel):
    """Response model for top models."""
    success: bool
    models: List[ModelInfo]
    count: int


# ============ Job Status ============

class JobStatusResponse(BaseModel):
    """Response model for job status."""
    job_id: str
    job_type: str
    status: str
    result: Optional[dict] = None
    error: Optional[str] = None
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


# ============ Health Check ============

class HealthCheckResponse(BaseModel):
    """Response model for health check."""
    status: str
    timestamp: str
    services: dict


# ============ Error Response ============

class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: str
    detail: Optional[str] = None
