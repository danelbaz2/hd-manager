from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Union

from models.base_entity import BaseEntityMeta

# Status values: pending (פתוח), in_progress (בטיפול), completed (סגור)
VALID_STATUSES = "^(pending|in_progress|pending_approval|completed)$"
# Priority values: low, medium, high
VALID_PRIORITIES = "^(low|medium|high)$"

# Optional fields object nested in the task
class TaskOptionals(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    pikud: Optional[str] = None
    ugda: Optional[str] = None
    hativa: Optional[str] = None
    gdud: Optional[str] = None
    externalSystem: Optional[str] = None
    externalId: Optional[str] = None

# Base Model (Shared properties)
class TaskModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    title: str = Field(..., min_length=3)
    description: Optional[str] = ""
    status: str = Field(default="pending", pattern=VALID_STATUSES)  # Default: open (pending)
    priority: str = Field(default="medium", pattern=VALID_PRIORITIES)
    responsibleUserIds: List[Union[int, str]] = []  # User IDs responsible for the task
    participantIds: Optional[List[Union[int, str]]] = []  # Optional: Contact IDs participating
    primaryTagIds: List[Union[int, str]] = []  # Primary Tag IDs (categories)
    secondaryTagIds: List[Union[int, str]] = []  # Secondary Tag IDs (new two-tier tag system)
    optionals: TaskOptionals = Field(default_factory=TaskOptionals)  # Nested optional fields
    date: int
    deadline: int
    base: Optional[BaseEntityMeta] = None

# Update Model - all fields optional but validated when provided
# extra='forbid' rejects any fields not defined in the model
class TaskUpdateModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    title: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern=VALID_STATUSES)
    priority: Optional[str] = Field(None, pattern=VALID_PRIORITIES)
    responsibleUserIds: Optional[List[Union[int, str]]] = None
    participantIds: Optional[List[Union[int, str]]] = None  # Optional: Contact IDs
    primaryTagIds: Optional[List[Union[int, str]]] = None  # Primary Tag IDs (categories)
    secondaryTagIds: Optional[List[Union[int, str]]] = None  # Secondary Tag IDs
    optionals: Optional[TaskOptionals] = None  # Optional nested object update
    date: Optional[int] = None
    deadline: Optional[int] = None
