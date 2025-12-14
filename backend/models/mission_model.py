from pydantic import BaseModel, Field
from typing import List, Optional, Union

# Base Model (Shared properties)
class MissionModel(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., min_length=3)
    description: Optional[str] = ""
    status: str = Field(..., pattern="^(open|in_progress|closed)$")
    responsibleUsersId: List[Union[int, str]] = []
    participantsIds: List[Union[int, str]] = []
    tagId: Optional[str] = None
    date: str
    deadline: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    priority: str = Field(..., pattern="^(low|medium|high)$")
    isDeleted: bool = False

