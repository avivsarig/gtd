"""GTD Task Management API - Main application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.tasks import router as tasks_router
from app.api.v1.projects import router as projects_router
from app.api.v1.notes import router as notes_router

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A keyboard-first GTD (Getting Things Done) task management system",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(tasks_router, prefix=settings.API_V1_PREFIX)
app.include_router(projects_router, prefix=settings.API_V1_PREFIX)
app.include_router(notes_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def read_root():
    """Root endpoint - API health check."""
    return {
        "message": "GTD Task Management API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
