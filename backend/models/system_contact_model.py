from pydantic import BaseModel, Field
from typing import Optional, Union

class SystemContactModel(BaseModel):
    id: Optional[str] = None
    fullName: str = Field(..., min_length=2)
    position: Optional[str] = None
    department: Optional[str] = None
    phoneNumber: Optional[str] = None
    tagsIds: Optional[list[Union[int, str]]] = None
    isActive: bool
    createdAt: Optional[str] = None
    isDeleted: bool = False

