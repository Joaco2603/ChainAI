"""
API routes for model management (upload, rating, info).
"""
import logging
from fastapi import APIRouter, HTTPException, status
from typing import List

from app.models.schemas import (
    ModelUploadRequest,
    ModelUploadResponse,
    RateModelRequest,
    RateModelResponse,
    ModelInfo,
    TopModelsResponse,
    ErrorResponse
)
from app.services import web3_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/models", tags=["models"])


@router.post(
    "/upload-model",
    response_model=ModelUploadResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def upload_model(request: ModelUploadRequest):
    """
    Register a new AI model on the blockchain.
    
    This endpoint receives model information (Docker image URL) and registers it
    on the blockchain by calling the registerModel() function via web3.py.
    
    - **docker_image_url**: URL to the Docker image containing the AI model
    
    Returns the transaction hash and assigned model ID.
    """
    try:
        logger.info(f"Registering model with Docker image: {request.docker_image_url}")
        
        # Register model on blockchain
        result = web3_service.register_model(request.docker_image_url)
        
        return ModelUploadResponse(
            success=True,
            model_id=result["model_id"],
            transaction_hash=result["transaction_hash"],
            block_number=result["block_number"]
        )
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error registering model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register model"
        )


@router.post(
    "/rate-model",
    response_model=RateModelResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def rate_model(request: RateModelRequest):
    """
    Rate an AI model on the blockchain.
    
    This endpoint allows users to rate a model with a value between 1-5.
    Each user can only rate a model once.
    
    - **model_id**: ID of the model to rate
    - **rating**: Rating value (1-5)
    
    Returns the transaction hash and confirmation.
    """
    try:
        logger.info(f"Rating model {request.model_id} with rating {request.rating}")
        
        # Rate model on blockchain
        result = web3_service.rate_model(request.model_id, request.rating)
        
        return RateModelResponse(
            success=True,
            model_id=result["model_id"],
            rating=result["rating"],
            transaction_hash=result["transaction_hash"],
            block_number=result["block_number"]
        )
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        error_msg = str(e).lower()
        
        if "not found" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        elif "already rated" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already rated this model"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    except Exception as e:
        logger.error(f"Error rating model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to rate model"
        )


@router.get(
    "/top",
    response_model=TopModelsResponse,
    responses={500: {"model": ErrorResponse}}
)
async def get_top_models(limit: int = 10):
    """
    Get the top-rated AI models.
    
    Returns a list of the highest-rated models sorted by their weighted rating.
    The weighted rating considers both average rating and number of ratings.
    
    - **limit**: Maximum number of models to return (default: 10)
    """
    try:
        if limit < 1 or limit > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Limit must be between 1 and 100"
            )
        
        logger.info(f"Fetching top {limit} models")
        
        # Get top models from blockchain
        models = web3_service.get_top_models(limit)
        
        model_list = [
            ModelInfo(
                model_id=m["model_id"],
                owner=m["owner"],
                docker_image_url=m["docker_image_url"],
                average_rating=m["average_rating"],
                rating_count=m["rating_count"],
                times_selected=m["times_selected"],
                is_active=m["is_active"]
            )
            for m in models
        ]
        
        return TopModelsResponse(
            success=True,
            models=model_list,
            count=len(model_list)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching top models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch top models"
        )


@router.get(
    "/{model_id}",
    response_model=ModelInfo,
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def get_model_info(model_id: int):
    """
    Get detailed information about a specific model.
    
    - **model_id**: ID of the model
    
    Returns detailed model information including owner, Docker image URL,
    rating statistics, and usage statistics.
    """
    try:
        logger.info(f"Fetching info for model {model_id}")
        
        # Get model info from blockchain
        model = web3_service.get_model_info(model_id)
        
        return ModelInfo(
            model_id=model_id,
            owner=model["owner"],
            docker_image_url=model["docker_image_url"],
            average_rating=model["average_rating"],
            rating_count=model["rating_count"],
            times_selected=model["times_selected"],
            is_active=model["is_active"]
        )
        
    except ValueError as e:
        logger.error(f"Model not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    except Exception as e:
        logger.error(f"Error fetching model info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch model information"
        )


@router.get(
    "/owner/{owner_address}",
    response_model=List[int],
    responses={500: {"model": ErrorResponse}}
)
async def get_models_by_owner(owner_address: str):
    """
    Get all models owned by a specific address.
    
    - **owner_address**: Ethereum address of the owner
    
    Returns a list of model IDs owned by the specified address.
    """
    try:
        logger.info(f"Fetching models for owner {owner_address}")
        
        # Get models by owner from blockchain
        model_ids = web3_service.get_models_by_owner(owner_address)
        
        return model_ids
        
    except ValueError as e:
        logger.error(f"Invalid address: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Ethereum address"
        )
    except Exception as e:
        logger.error(f"Error fetching models by owner: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch models by owner"
        )
