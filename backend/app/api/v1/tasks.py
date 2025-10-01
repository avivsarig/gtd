"""Tasks API endpoints."""
from typing import List
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.task import Task

router = APIRouter(prefix="/tasks", tags=["tasks"])


# Pydantic schemas
class TaskCreate(BaseModel):
    title: str
    description: str | None = None


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    """Get all tasks (not deleted)."""
    tasks = db.query(Task).filter(Task.deleted_at == None).order_by(Task.created_at.desc()).all()
    return tasks


@router.post("/", response_model=TaskResponse)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task."""
    task = Task(
        title=task_data.title,
        description=task_data.description,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
