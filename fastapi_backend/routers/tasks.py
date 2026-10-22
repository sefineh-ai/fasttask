"""
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
)

router = APIRouter()

# In-memory storage for tasks
TASKS_DB: dict[str, dict] = {
    "TSK-101": {
        "id": "TSK-101",
        "title": "Migrate REST endpoints to FastAPI async routers",
        "description": "Transition synchronous request handlers in the task service to async def route functions with SQLAlchemy 2.0 async sessions.",
        "status": "in_progress",
        "priority": "urgent",
        "dueDate": "2026-10-24",
        "tags": ["Backend", "FastAPI", "Performance"],
        "subtasks": [
            {"id": "sub-1", "title": "Audit current blocking I/O calls", "completed": True},
            {"id": "sub-2", "title": "Implement async session dependency injection", "completed": True},
            {"id": "sub-3", "title": "Write pytest-asyncio integration tests", "completed": False},
        ],
        "assignee": {
            "name": "Alex Chen",
            "email": "alex.chen@fasttask.dev",
            "role": "Backend Architect",
        },
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
}

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
