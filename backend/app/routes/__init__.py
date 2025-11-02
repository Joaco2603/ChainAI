"""
Routes package for ChainAI backend.
"""
from app.routes.models import router as models_router
from app.routes.generate import router as generate_router
from app.routes.health import router as health_router

__all__ = [
    "models_router",
    "generate_router",
    "health_router"
]
