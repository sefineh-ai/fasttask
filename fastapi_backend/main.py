"""
FastTask - FastAPI & React Task Suite
Backend Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import tasks
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite / PostgreSQL tables on startup
    await init_db()
    print("🚀 FastTask FastAPI server initialized with database tables.")
    yield
    print("🛑 FastTask FastAPI server shutting down.")

app = FastAPI(
    title="FastTask API",
    description="High-performance asynchronous API for task management, kanban workflows, and team metrics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Enable CORS for React frontend client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Task Router with '/api' prefix
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])

@app.get("/health", tags=["Metrics"])
async def health_check():
    """Health check endpoint for liveness and monitoring probes."""
    return {
        "status": "healthy",
        "service": "FastTask Engine",
        "version": "1.0.0",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
