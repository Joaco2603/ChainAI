"""
API routes for health checks and system status.
"""
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import HealthCheckResponse, ErrorResponse
from app.services import docker_worker_service, job_queue
from app.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])
settings = get_settings()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    responses={500: {"model": ErrorResponse}}
)
async def health_check():
    """
    Check the health status of the API and its dependencies.
    
    Returns:
    - API status
    - Docker daemon status
    - Job queue statistics
    - Blockchain connection status
    """
    try:
        # Check Docker health
        docker_health = await docker_worker_service.health_check()
        
        # Get job queue stats
        queue_stats = job_queue.get_queue_stats()
        
        # Overall status
        is_healthy = docker_health.get("healthy", False)
        
        services = {
            "api": {
                "status": "healthy",
                "version": "1.0.0",
                "environment": settings.ENVIRONMENT
            },
            "docker": docker_health,
            "job_queue": queue_stats,
            "blockchain": {
                "network": "Avalanche Fuji Testnet",
                "chain_id": settings.CHAIN_ID,
                "contract_address": settings.CONTRACT_ADDRESS
            }
        }
        
        return HealthCheckResponse(
            status="healthy" if is_healthy else "degraded",
            timestamp=datetime.utcnow().isoformat(),
            services=services
        )
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Health check failed"
        )


@router.get("/")
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "name": settings.API_TITLE,
        "version": settings.API_VERSION,
        "description": settings.API_DESCRIPTION,
        "docs_url": f"{settings.API_PREFIX}/docs",
        "health_url": f"{settings.API_PREFIX}/health"
    }
