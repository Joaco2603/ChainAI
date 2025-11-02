"""
Example script for testing the ChainAI backend API.
"""
import asyncio
import httpx
import json

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"


async def test_health_check():
    """Test the health check endpoint."""
    print("\n=== Testing Health Check ===")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")


async def test_upload_model():
    """Test model upload/registration."""
    print("\n=== Testing Model Upload ===")
    
    payload = {
        "docker_image_url": "myregistry/test-model:v1.0"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API_BASE_URL}/models/upload-model",
            json=payload
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            return response.json()["model_id"]
    
    return None


async def test_rate_model(model_id: int):
    """Test model rating."""
    print(f"\n=== Testing Model Rating (Model ID: {model_id}) ===")
    
    payload = {
        "model_id": model_id,
        "rating": 5
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API_BASE_URL}/models/rate-model",
            json=payload
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")


async def test_get_top_models():
    """Test getting top models."""
    print("\n=== Testing Get Top Models ===")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/models/top?limit=5")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")


async def test_get_model_info(model_id: int):
    """Test getting model information."""
    print(f"\n=== Testing Get Model Info (Model ID: {model_id}) ===")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/models/{model_id}")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")


async def test_generate():
    """Test generation endpoint."""
    print("\n=== Testing Generation ===")
    
    payload = {
        "prompt": "Write a short poem about blockchain technology",
        "timeout": 300
    }
    
    async with httpx.AsyncClient() as client:
        # Submit generation job
        response = await client.post(
            f"{API_BASE_URL}/generate",
            json=payload
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 202:
            job_id = response.json()["job_id"]
            
            # Poll job status
            print(f"\nPolling job status (Job ID: {job_id})...")
            for i in range(10):
                await asyncio.sleep(2)
                
                status_response = await client.get(
                    f"{API_BASE_URL}/generate/job/{job_id}"
                )
                status_data = status_response.json()
                print(f"Attempt {i+1}: Status = {status_data['status']}")
                
                if status_data["status"] in ["completed", "failed"]:
                    # Get full result
                    result_response = await client.get(
                        f"{API_BASE_URL}/generate/result/{job_id}"
                    )
                    print(f"\nFinal Result:")
                    print(json.dumps(result_response.json(), indent=2))
                    break


async def main():
    """Run all tests."""
    print("=" * 60)
    print("ChainAI Backend API Test Suite")
    print("=" * 60)
    
    try:
        # Health check
        await test_health_check()
        
        # Model management tests
        model_id = await test_upload_model()
        
        if model_id is not None:
            await test_get_model_info(model_id)
            await test_rate_model(model_id)
        
        await test_get_top_models()
        
        # Generation test
        await test_generate()
        
        print("\n" + "=" * 60)
        print("Tests completed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError during tests: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
