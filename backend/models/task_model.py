from pydantic import BaseModel, Field
from typing import List, Optional, Union

from models.base_entity import BaseEntityMeta

# Base Model (Shared properties)
class TaskModel(BaseModel):
    entityId: Optional[str] = None
    title: str = Field(..., min_length=3)
    description: Optional[str] = ""
    status: str = Field(..., pattern="^(open|in_progress|closed)$")
    responsibleUsersId: List[Union[int, str]] = []
    participantsIds: List[Union[int, str]] = []
    tagId: Optional[str] = None
    date: int
    deadline: Optional[int] = None
    priority: str = Field(..., pattern="^(low|medium|high)$")
    base: Optional[BaseEntityMeta] = None

# Update Model - all fields optional but validated when provided
class TaskUpdateModel(BaseModel):
    title: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(open|in_progress|closed)$")
    responsibleUsersId: Optional[List[Union[int, str]]] = None
    participantsIds: Optional[List[Union[int, str]]] = None
    tagId: Optional[str] = None
    date: Optional[int] = None
    deadline: Optional[int] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
