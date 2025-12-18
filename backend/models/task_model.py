from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Union

from models.base_entity import BaseEntityMeta

# Status values: pending (פתוח), in_progress (בטיפול), completed (סגור), cancelled (מבוטל)
VALID_STATUSES = "^(pending|in_progress|completed|cancelled)$"
# Priority values: low, medium, high
VALID_PRIORITIES = "^(low|medium|high)$"

# Base Model (Shared properties)
class TaskModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    title: str = Field(..., min_length=3)
    description: Optional[str] = ""
    status: str = Field(default="pending", pattern=VALID_STATUSES)  # Default: open (pending)
    priority: str = Field(default="medium", pattern=VALID_PRIORITIES)
    responsibleUsersId: List[Union[int, str]] = []  # User IDs responsible for the task
    participantsIds: Optional[List[Union[int, str]]] = []  # Optional: Contact IDs participating
    tagsId: List[Union[int, str]] = []
    date: int
    deadline: Optional[int] = None
    base: Optional[BaseEntityMeta] = None

# Update Model - all fields optional but validated when provided
# extra='forbid' rejects any fields not defined in the model
class TaskUpdateModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    title: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern=VALID_STATUSES)
    priority: Optional[str] = Field(None, pattern=VALID_PRIORITIES)
    responsibleUsersId: Optional[List[Union[int, str]]] = None
    participantsIds: Optional[List[Union[int, str]]] = None  # Optional: Contact IDs
    tagsId: Optional[List[Union[int, str]]] = None
    date: Optional[int] = None
    deadline: Optional[int] = None
