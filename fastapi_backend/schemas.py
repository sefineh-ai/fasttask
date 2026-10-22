"""
Pydantic V2 Schemas for FastTask
Strict typing, Field validations, and OpenAPI documentation examples.
"""
from datetime import datetime
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
