"""Tasks API endpoints."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.task import TaskCreate, TaskResponse
from app.controllers import task_controller

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=List[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    """
    Get all active tasks.

    Returns list of all non-deleted tasks ordered by created_at descending.
    """
    return task_controller.list_tasks(db)


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new task.

    Business rules applied:
    - Tasks with blocked_by_task_id are automatically set to 'waiting' status
    """
    return task_controller.create_task(db, task_data)
