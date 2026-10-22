export interface PythonFileTemplate {
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const PYTHON_FASTAPI_FILES: PythonFileTemplate[] = [
  {
    filename: "main.py",
    language: "python",
    description: "FastAPI Application Entry Point, CORS middleware, Lifespan handler, and Route registration",
    code: `"""
FastTask FastAPI Application
Modern, async task manager backend with Pydantic V2 and OpenAPI documentation.
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
`
  },
  {
    filename: "schemas.py",
    language: "python",
    description: "Pydantic V2 Validation Models, Request DTOs, and Response Schemas",
    code: `"""
Pydantic V2 Schemas for FastTask
Strict typing, Field validations, and OpenAPI documentation examples.
"""
from datetime import datetime, date
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class TaskPriority(str, Enum):
    URGENT = "urgent"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TaskStatus(str, Enum):
    BACKLOG = "backlog"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    COMPLETED = "completed"

class SubtaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Short title of the subtask")
    completed: bool = Field(default=False, description="Whether subtask is checked off")

class SubtaskCreate(SubtaskBase):
    pass

class Subtask(SubtaskBase):
    id: str = Field(..., description="Unique subtask identifier")
    model_config = ConfigDict(from_attributes=True)

class Assignee(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., description="Valid email address")
    avatarUrl: Optional[str] = Field(default="", description="Image URL of team member avatar")
    role: Optional[str] = Field(default="Contributor")
    model_config = ConfigDict(from_attributes=True)

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Task headline")
    description: Optional[str] = Field(default="", description="Detailed markdown notes")
    status: TaskStatus = Field(default=TaskStatus.BACKLOG, description="Workflow stage")
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, description="Task priority")
    dueDate: Optional[str] = Field(default=None, description="Due date in YYYY-MM-DD")
    tags: List[str] = Field(default_factory=list, description="Categorization labels")

class TaskCreate(TaskBase):
    subtasks: Optional[List[SubtaskCreate]] = Field(default_factory=list)
    assignee: Optional[Assignee] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    dueDate: Optional[str] = None
    tags: Optional[List[str]] = None
    subtasks: Optional[List[Subtask]] = None
    assignee: Optional[Assignee] = None

class TaskResponse(TaskBase):
    id: str = Field(..., description="Primary Task Identifier (e.g. TSK-101)")
    subtasks: List[Subtask] = Field(default_factory=list)
    assignee: Optional[Assignee] = None
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)

class StatsResponse(BaseModel):
    total: int
    completed: int
    inProgress: int
    inReview: int
    backlog: int
    urgent: int
    high: int
    medium: int
    low: int
    completionRate: float
    overdueCount: int
`
  },
  {
    filename: "routers/tasks.py",
    language: "python",
    description: "FastAPI APIRouter for Task CRUD, Status Filtering, and Subtask Toggles",
    code: `"""
FastAPI Task Management Router
Demonstrates async handlers, path operations, query parameters, and status responses.
"""
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, HTTPException, Query, status
from schemas import (
    TaskResponse,
    TaskCreate,
    TaskUpdate,
    TaskStatus,
    TaskPriority,
    StatsResponse,
    SubtaskCreate,
    Subtask,
)

router = APIRouter()

# In-memory storage or SQL database session
TASKS_DB: dict[str, dict] = {}

@router.get("/tasks", response_model=List[TaskResponse], summary="List all tasks")
async def list_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search in title or description"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    sort_by: str = Query("created_at", enum=["due_date", "priority", "created_at", "updated_at"])
):
    """Retrieve tasks with multi-field filtering and sorting."""
    results = list(TASKS_DB.values())
    
    if status:
        results = [t for t in results if t["status"] == status.value]
    if priority:
        results = [t for t in results if t["priority"] == priority.value]
    if tag:
        results = [t for t in results if tag.lower() in [x.lower() for x in t.get("tags", [])]]
    if search:
        q = search.lower()
        results = [
            t for t in results
            if q in t["title"].lower() or q in t.get("description", "").lower()
        ]
    
    return results

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task_in: TaskCreate):
    """Create a new task with subtasks and timestamps."""
    task_id = f"TSK-{len(TASKS_DB) + 101}"
    now = datetime.now(timezone.utc)
    
    subtasks = [
        {"id": f"sub-{uuid.uuid4().hex[:6]}", "title": s.title, "completed": s.completed}
        for s in (task_in.subtasks or [])
    ]
    
    task_data = {
        "id": task_id,
        "title": task_in.title,
        "description": task_in.description or "",
        "status": task_in.status.value,
        "priority": task_in.priority.value,
        "dueDate": task_in.dueDate,
        "tags": task_in.tags,
        "subtasks": subtasks,
        "assignee": task_in.assignee.model_dump() if task_in.assignee else None,
        "createdAt": now,
        "updatedAt": now,
    }
    
    TASKS_DB[task_id] = task_data
    return task_data

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    """Fetch single task by identifier."""
    if task_id not in TASKS_DB:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return TASKS_DB[task_id]

@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def patch_task(task_id: str, updates: TaskUpdate):
    """Partially modify task attributes."""
    if task_id not in TASKS_DB:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    
    task = TASKS_DB[task_id]
    update_data = updates.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if key in ("status", "priority") and hasattr(value, "value"):
            task[key] = value.value
        else:
            task[key] = value
            
    task["updatedAt"] = datetime.now(timezone.utc)
    return task

@router.delete("/tasks/{task_id}", status_code=status.HTTP_200_OK)
async def delete_task(task_id: str):
    """Remove a task from database."""
    if task_id not in TASKS_DB:
        raise HTTPException(status_code=404, detail="Task not found")
    del TASKS_DB[task_id]
    return {"success": True, "message": f"Task {task_id} deleted"}

@router.get("/stats", response_model=StatsResponse)
async def get_task_stats():
    """Compute aggregate counts and completion rates."""
    tasks = list(TASKS_DB.values())
    total = len(tasks)
    completed = sum(1 for t in tasks if t["status"] == "completed")
    in_progress = sum(1 for t in tasks if t["status"] == "in_progress")
    in_review = sum(1 for t in tasks if t["status"] == "in_review")
    backlog = sum(1 for t in tasks if t["status"] == "backlog")
    
    urgent = sum(1 for t in tasks if t["priority"] == "urgent")
    high = sum(1 for t in tasks if t["priority"] == "high")
    medium = sum(1 for t in tasks if t["priority"] == "medium")
    low = sum(1 for t in tasks if t["priority"] == "low")
    
    rate = (completed / total * 100) if total > 0 else 0.0
    
    return {
        "total": total,
        "completed": completed,
        "inProgress": in_progress,
        "inReview": in_review,
        "backlog": backlog,
        "urgent": urgent,
        "high": high,
        "medium": medium,
        "low": low,
        "completionRate": round(rate, 1),
        "overdueCount": 0,
    }
`
  },
  {
    filename: "database.py",
    language: "python",
    description: "Async SQLAlchemy Engine, SessionLocal, and Table Initialization",
    code: `"""
Database configuration using SQLAlchemy 2.0 async engine.
Supports SQLite (development) and PostgreSQL (production).
"""
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./fasttask.db")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
`
  },
  {
    filename: "requirements.txt",
    language: "text",
    description: "Python Dependencies for production FastAPI deployment",
    code: `fastapi>=0.115.0
uvicorn[standard]>=0.30.0
pydantic>=2.8.0
sqlalchemy>=2.0.30
aiosqlite>=0.20.0
asyncpg>=0.29.0
python-multipart>=0.0.9
email-validator>=2.2.0
`
  },
  {
    filename: "README.md",
    language: "markdown",
    description: "FastAPI Backend Quickstart Guide & Integration Instructions",
    code: `# FastTask Backend (FastAPI + Python 3.10+)

High-performance asynchronous task management backend powered by FastAPI, Pydantic V2, and SQLAlchemy.

## 🚀 Quickstart

1. Create and activate a Python virtual environment:
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
\`\`\`

2. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

3. Run development server with auto-reload:
\`\`\`bash
uvicorn main:app --reload --port 8000
\`\`\`

4. Open interactive documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

## 🔗 Connecting to React Frontend
In the React app's \`.env\`:
\`\`\`env
VITE_API_URL=http://localhost:8000/api
\`\`\`
`
  }
];
