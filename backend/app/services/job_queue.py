"""
Job queue service for handling asynchronous tasks.
Uses asyncio for lightweight job management without external dependencies.
"""
import asyncio
import logging
import uuid
from typing import Dict, Any, Optional, Callable
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    """Job status enumeration."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Job:
    """Represents a job in the queue."""
    
    def __init__(
        self,
        job_id: str,
        job_type: str,
        func: Callable,
        args: tuple = (),
        kwargs: dict = None
    ):
        self.job_id = job_id
        self.job_type = job_type
        self.func = func
        self.args = args
        self.kwargs = kwargs or {}
        self.status = JobStatus.PENDING
        self.result = None
        self.error = None
        self.created_at = datetime.utcnow()
        self.started_at = None
        self.completed_at = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert job to dictionary."""
        return {
            "job_id": self.job_id,
            "job_type": self.job_type,
            "status": self.status.value,
            "result": self.result,
            "error": str(self.error) if self.error else None,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }


class JobQueue:
    """Async job queue using asyncio."""
    
    def __init__(self, max_workers: int = 5):
        """
        Initialize job queue.
        
        Args:
            max_workers: Maximum number of concurrent workers
        """
        self.max_workers = max_workers
        self.queue: asyncio.Queue = asyncio.Queue()
        self.jobs: Dict[str, Job] = {}
        self.workers: list = []
        self.running = False
        logger.info(f"JobQueue initialized with {max_workers} workers")
    
    async def start(self):
        """Start the job queue workers."""
        if self.running:
            logger.warning("JobQueue is already running")
            return
        
        self.running = True
        self.workers = [
            asyncio.create_task(self._worker(i))
            for i in range(self.max_workers)
        ]
        logger.info(f"Started {self.max_workers} workers")
    
    async def stop(self):
        """Stop the job queue workers."""
        if not self.running:
            return
        
        self.running = False
        
        # Wait for current jobs to complete
        await self.queue.join()
        
        # Cancel all workers
        for worker in self.workers:
            worker.cancel()
        
        await asyncio.gather(*self.workers, return_exceptions=True)
        logger.info("Stopped all workers")
    
    async def enqueue(
        self,
        job_type: str,
        func: Callable,
        *args,
        **kwargs
    ) -> str:
        """
        Add a job to the queue.
        
        Args:
            job_type: Type/category of the job
            func: Async function to execute
            *args: Positional arguments for the function
            **kwargs: Keyword arguments for the function
            
        Returns:
            Job ID
        """
        job_id = str(uuid.uuid4())
        job = Job(job_id, job_type, func, args, kwargs)
        self.jobs[job_id] = job
        
        await self.queue.put(job)
        logger.info(f"Enqueued job {job_id} of type {job_type}")
        
        return job_id
    
    async def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the status of a job.
        
        Args:
            job_id: ID of the job
            
        Returns:
            Job information dict or None if not found
        """
        job = self.jobs.get(job_id)
        if job:
            return job.to_dict()
        return None
    
    async def cancel_job(self, job_id: str) -> bool:
        """
        Cancel a pending job.
        
        Args:
            job_id: ID of the job to cancel
            
        Returns:
            Boolean indicating if job was cancelled
        """
        job = self.jobs.get(job_id)
        if not job:
            return False
        
        if job.status == JobStatus.PENDING:
            job.status = JobStatus.CANCELLED
            job.completed_at = datetime.utcnow()
            logger.info(f"Cancelled job {job_id}")
            return True
        
        return False
    
    async def _worker(self, worker_id: int):
        """
        Worker coroutine that processes jobs from the queue.
        
        Args:
            worker_id: ID of the worker
        """
        logger.info(f"Worker {worker_id} started")
        
        while self.running:
            try:
                # Get job from queue with timeout
                try:
                    job = await asyncio.wait_for(
                        self.queue.get(),
                        timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue
                
                # Check if job was cancelled
                if job.status == JobStatus.CANCELLED:
                    self.queue.task_done()
                    continue
                
                # Execute job
                logger.info(f"Worker {worker_id} processing job {job.job_id}")
                job.status = JobStatus.RUNNING
                job.started_at = datetime.utcnow()
                
                try:
                    # Execute the job function
                    result = await job.func(*job.args, **job.kwargs)
                    
                    job.status = JobStatus.COMPLETED
                    job.result = result
                    logger.info(f"Worker {worker_id} completed job {job.job_id}")
                    
                except Exception as e:
                    job.status = JobStatus.FAILED
                    job.error = e
                    logger.error(f"Worker {worker_id} failed job {job.job_id}: {e}")
                
                finally:
                    job.completed_at = datetime.utcnow()
                    self.queue.task_done()
                    
            except asyncio.CancelledError:
                logger.info(f"Worker {worker_id} cancelled")
                break
            except Exception as e:
                logger.error(f"Worker {worker_id} error: {e}")
        
        logger.info(f"Worker {worker_id} stopped")
    
    def get_queue_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the queue.
        
        Returns:
            Dict with queue statistics
        """
        pending = sum(1 for j in self.jobs.values() if j.status == JobStatus.PENDING)
        running = sum(1 for j in self.jobs.values() if j.status == JobStatus.RUNNING)
        completed = sum(1 for j in self.jobs.values() if j.status == JobStatus.COMPLETED)
        failed = sum(1 for j in self.jobs.values() if j.status == JobStatus.FAILED)
        
        return {
            "total_jobs": len(self.jobs),
            "pending": pending,
            "running": running,
            "completed": completed,
            "failed": failed,
            "queue_size": self.queue.qsize(),
            "max_workers": self.max_workers,
            "is_running": self.running
        }


# Create singleton instance
job_queue = JobQueue(max_workers=5)
