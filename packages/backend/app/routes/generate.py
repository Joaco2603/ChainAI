"""
API routes for generation and job management.
"""
import logging
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    GenerateRequest,
    GenerateResponse,
    GenerationResult,
    JobStatusResponse,
    ErrorResponse
)
from app.services import web3_service, docker_worker_service, job_queue

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/generate", tags=["generation"])


async def _execute_generation(prompt: str, timeout: int = None) -> dict:
    """
    Internal function to execute model generation.
    
    Args:
        prompt: Input prompt for the model
        timeout: Maximum execution time in seconds
        
    Returns:
        Dict with generation result
    """
    try:
        # Step 1: Select model from blockchain
        logger.info("Selecting model from blockchain...")
        selection_result = web3_service.select_model()
        
        model_id = selection_result["model_id"]
        model_info = selection_result["model_info"]
        docker_image_url = model_info["docker_image_url"]
        
        logger.info(f"Selected model {model_id}: {docker_image_url}")
        
        # Step 2: Execute model in Docker container
        logger.info(f"Running model {model_id} with prompt...")
        execution_result = await docker_worker_service.run_model(
            model_id=model_id,
            docker_image_url=docker_image_url,
            prompt=prompt,
            timeout=timeout
        )
        
        logger.info(f"Model {model_id} execution completed")
        
        # Return combined result
        return {
            "model_id": model_id,
            "docker_image_url": docker_image_url,
            "prompt": prompt,
            "output": execution_result["output"],
            "transaction_hash": selection_result["transaction_hash"],
            "execution_logs": execution_result.get("logs", ""),
            "exit_code": execution_result.get("exit_code", 0)
        }
        
    except Exception as e:
        logger.error(f"Generation execution error: {e}")
        raise


@router.post(
    "",
    response_model=GenerateResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def generate(request: GenerateRequest):
    """
    Generate AI output using a selected model.
    
    This endpoint performs the following steps:
    1. Calls selectModel() on the smart contract to choose a model
    2. Downloads and executes the corresponding Docker container
    3. Returns the model output
    
    The request is processed asynchronously using a job queue to avoid blocking.
    
    - **prompt**: Input prompt for the AI model
    - **timeout**: Optional maximum execution time in seconds (10-600)
    
    Returns a job ID that can be used to check the status and retrieve results.
    """
    try:
        logger.info(f"Received generation request with prompt length: {len(request.prompt)}")
        
        # Enqueue the generation job
        job_id = await job_queue.enqueue(
            job_type="generation",
            func=_execute_generation,
            prompt=request.prompt,
            timeout=request.timeout
        )
        
        logger.info(f"Generation job enqueued with ID: {job_id}")
        
        return GenerateResponse(
            success=True,
            job_id=job_id,
            message="Generation job enqueued successfully. Use the job_id to check status."
        )
        
    except Exception as e:
        logger.error(f"Error enqueueing generation job: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enqueue generation job"
        )


@router.get(
    "/job/{job_id}",
    response_model=JobStatusResponse,
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def get_job_status(job_id: str):
    """
    Get the status of a generation job.
    
    - **job_id**: ID of the job to check
    
    Returns the current status and results (if completed) of the generation job.
    
    Possible statuses:
    - **pending**: Job is waiting in queue
    - **running**: Job is currently executing
    - **completed**: Job finished successfully
    - **failed**: Job encountered an error
    - **cancelled**: Job was cancelled
    """
    try:
        logger.info(f"Checking status for job: {job_id}")
        
        # Get job status from queue
        job_status = await job_queue.get_job_status(job_id)
        
        if not job_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        return JobStatusResponse(**job_status)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching job status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch job status"
        )


@router.get(
    "/result/{job_id}",
    response_model=GenerationResult,
    responses={
        404: {"model": ErrorResponse},
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def get_generation_result(job_id: str):
    """
    Get the result of a completed generation job.
    
    - **job_id**: ID of the job
    
    Returns the full generation result including model output.
    Only works for completed jobs.
    """
    try:
        logger.info(f"Fetching result for job: {job_id}")
        
        # Get job status from queue
        job_status = await job_queue.get_job_status(job_id)
        
        if not job_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if job is completed
        if job_status["status"] not in ["completed", "failed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Job is not completed yet. Current status: {job_status['status']}"
            )
        
        # Build result
        result = GenerationResult(
            job_id=job_id,
            status=job_status["status"],
            created_at=job_status["created_at"],
            started_at=job_status.get("started_at"),
            completed_at=job_status.get("completed_at")
        )
        
        if job_status["status"] == "completed" and job_status.get("result"):
            result.model_id = job_status["result"].get("model_id")
            result.prompt = job_status["result"].get("prompt")
            result.output = job_status["result"].get("output")
            result.transaction_hash = job_status["result"].get("transaction_hash")
        
        if job_status["status"] == "failed":
            result.error = job_status.get("error")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching generation result: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch generation result"
        )


@router.delete(
    "/job/{job_id}",
    responses={
        404: {"model": ErrorResponse},
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def cancel_job(job_id: str):
    """
    Cancel a pending generation job.
    
    - **job_id**: ID of the job to cancel
    
    Only pending jobs can be cancelled. Running or completed jobs cannot be cancelled.
    """
    try:
        logger.info(f"Attempting to cancel job: {job_id}")
        
        # Try to cancel the job
        cancelled = await job_queue.cancel_job(job_id)
        
        if not cancelled:
            job_status = await job_queue.get_job_status(job_id)
            
            if not job_status:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Job not found"
                )
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Job cannot be cancelled. Current status: {job_status['status']}"
            )
        
        return {
            "success": True,
            "message": "Job cancelled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling job: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel job"
        )
