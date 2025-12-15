from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Union

from models.base_entity import BaseEntityMeta

# Base Model (Shared properties)
class TaskModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    entityId: Optional[str] = None
    title: str = Field(..., min_length=3)
    description: Optional[str] = ""
    status: str = Field(..., pattern="^(open|in_progress|closed)$")
    responsibleUsersId: List[Union[int, str]] = []
    participantsIds: List[Union[int, str]] = []
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
    status: Optional[str] = Field(None, pattern="^(open|in_progress|closed)$")
    responsibleUsersId: Optional[List[Union[int, str]]] = None
    participantsIds: Optional[List[Union[int, str]]] = None
    tagsId: Optional[List[Union[int, str]]] = None
    date: Optional[int] = None
    deadline: Optional[int] = None
