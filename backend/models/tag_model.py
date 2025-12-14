from pydantic import BaseModel, Field
from typing import Optional, Union

class TagModel(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    relatedContactsIds: Optional[list[Union[int, str]]] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    isActive: bool
    isDeleted: bool = False

