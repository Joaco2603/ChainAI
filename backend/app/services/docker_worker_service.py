"""
Docker worker service for downloading and executing AI model containers.
"""
import asyncio
import logging
import json
from typing import Dict, Any, Optional
import docker
from docker.errors import ImageNotFound, ContainerError, APIError
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class DockerWorkerService:
    """Service for managing Docker containers for AI model execution."""
    
    def __init__(self):
        """Initialize Docker client."""
        try:
            self.client = docker.from_env()
            self.client.ping()
            logger.info("Docker client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Docker client: {e}")
            raise ConnectionError(f"Could not connect to Docker daemon: {e}")
    
    async def pull_image(self, image_url: str) -> bool:
        """
        Pull a Docker image from the registry.
        
        Args:
            image_url: URL/name of the Docker image
            
        Returns:
            Boolean indicating success
        """
        try:
            logger.info(f"Pulling Docker image: {image_url}")
            
            # Run pull in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.client.images.pull(image_url)
            )
            
            logger.info(f"Successfully pulled image: {image_url}")
            return True
            
        except APIError as e:
            logger.error(f"Docker API error pulling image {image_url}: {e}")
            raise ValueError(f"Failed to pull image: {str(e)}")
        except Exception as e:
            logger.error(f"Error pulling image {image_url}: {e}")
            raise
    
    async def run_model(
        self, 
        model_id: int, 
        docker_image_url: str, 
        prompt: str,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Run an AI model in a Docker container with a given prompt.
        
        Args:
            model_id: ID of the model
            docker_image_url: URL/name of the Docker image
            prompt: Input prompt for the model
            timeout: Maximum execution time in seconds (default: from settings)
            
        Returns:
            Dict containing the model output and execution metadata
        """
        container = None
        timeout = timeout or settings.DOCKER_TIMEOUT
        
        try:
            # Check if image exists locally, if not pull it
            try:
                self.client.images.get(docker_image_url)
                logger.info(f"Image {docker_image_url} found locally")
            except ImageNotFound:
                logger.info(f"Image {docker_image_url} not found locally, pulling...")
                await self.pull_image(docker_image_url)
            
            # Prepare input data
            input_data = json.dumps({"prompt": prompt})
            
            # Run container in executor to avoid blocking
            loop = asyncio.get_event_loop()
            
            logger.info(f"Running model {model_id} with image {docker_image_url}")
            
            # Create and start container
            container = await loop.run_in_executor(
                None,
                lambda: self.client.containers.run(
                    docker_image_url,
                    command=input_data,
                    detach=True,
                    remove=False,  # Don't auto-remove so we can get logs
                    mem_limit="2g",  # Memory limit
                    cpu_quota=100000,  # CPU limit
                    network_mode="none",  # Isolate network for security
                    environment={
                        "MODEL_ID": str(model_id),
                        "INPUT_PROMPT": prompt
                    }
                )
            )
            
            # Wait for container to finish with timeout
            try:
                result = await asyncio.wait_for(
                    loop.run_in_executor(
                        None,
                        lambda: container.wait(timeout=timeout)
                    ),
                    timeout=timeout
                )
                
                # Get container logs
                logs = await loop.run_in_executor(
                    None,
                    lambda: container.logs().decode('utf-8')
                )
                
                # Parse output
                output = self._parse_output(logs)
                
                logger.info(f"Model {model_id} execution completed successfully")
                
                return {
                    "success": True,
                    "model_id": model_id,
                    "output": output,
                    "logs": logs,
                    "exit_code": result["StatusCode"]
                }
                
            except asyncio.TimeoutError:
                logger.warning(f"Model {model_id} execution timed out after {timeout}s")
                if container:
                    await loop.run_in_executor(None, container.kill)
                raise TimeoutError(f"Model execution exceeded timeout of {timeout} seconds")
            
        except ContainerError as e:
            logger.error(f"Container error running model {model_id}: {e}")
            raise ValueError(f"Container execution failed: {str(e)}")
        except APIError as e:
            logger.error(f"Docker API error running model {model_id}: {e}")
            raise ValueError(f"Docker API error: {str(e)}")
        except Exception as e:
            logger.error(f"Error running model {model_id}: {e}")
            raise
        finally:
            # Clean up container
            if container:
                try:
                    loop = asyncio.get_event_loop()
                    await loop.run_in_executor(None, container.remove)
                except Exception as e:
                    logger.warning(f"Failed to remove container: {e}")
    
    def _parse_output(self, logs: str) -> str:
        """
        Parse model output from container logs.
        
        Args:
            logs: Container logs
            
        Returns:
            Parsed output string
        """
        try:
            # Try to parse as JSON
            lines = logs.strip().split('\n')
            for line in reversed(lines):  # Start from last line
                if line.strip():
                    try:
                        output_json = json.loads(line)
                        if "output" in output_json:
                            return output_json["output"]
                        return line
                    except json.JSONDecodeError:
                        # If not JSON, return the line as-is
                        return line
            
            # If no valid output found, return full logs
            return logs
            
        except Exception as e:
            logger.warning(f"Error parsing output: {e}")
            return logs
    
    async def list_local_images(self) -> list:
        """
        List all locally available Docker images.
        
        Returns:
            List of image information dicts
        """
        try:
            loop = asyncio.get_event_loop()
            images = await loop.run_in_executor(
                None,
                self.client.images.list
            )
            
            return [
                {
                    "id": img.id,
                    "tags": img.tags,
                    "size": img.attrs.get("Size", 0)
                }
                for img in images
            ]
            
        except Exception as e:
            logger.error(f"Error listing images: {e}")
            raise
    
    async def remove_image(self, image_url: str) -> bool:
        """
        Remove a Docker image from local storage.
        
        Args:
            image_url: URL/name of the Docker image
            
        Returns:
            Boolean indicating success
        """
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.client.images.remove(image_url, force=True)
            )
            
            logger.info(f"Removed image: {image_url}")
            return True
            
        except ImageNotFound:
            logger.warning(f"Image not found: {image_url}")
            return False
        except Exception as e:
            logger.error(f"Error removing image {image_url}: {e}")
            raise
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check Docker daemon health status.
        
        Returns:
            Dict with health information
        """
        try:
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(None, self.client.info)
            
            return {
                "healthy": True,
                "containers_running": info.get("ContainersRunning", 0),
                "containers_total": info.get("Containers", 0),
                "images": info.get("Images", 0),
                "memory_limit": info.get("MemTotal", 0),
                "server_version": info.get("ServerVersion", "unknown")
            }
            
        except Exception as e:
            logger.error(f"Docker health check failed: {e}")
            return {
                "healthy": False,
                "error": str(e)
            }


# Create singleton instance
docker_worker_service = DockerWorkerService()
