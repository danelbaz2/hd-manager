from pydantic import BaseModel, Field
from typing import Optional, Union
from models.base_entity import BaseEntityMeta

class SystemContactModel(BaseModel):
    entityId: Optional[str] = None
    fullName: str = Field(..., min_length=2)
    position: Optional[str] = None
    department: Optional[str] = None
    phoneNumber: Optional[str] = None
    tagsIds: Optional[list[Union[int, str]]] = None
    base: Optional[BaseEntityMeta] = None

# Update Model - all fields optional but validated when provided
class SystemContactUpdateModel(BaseModel):
    fullName: Optional[str] = Field(None, min_length=2)
    position: Optional[str] = None
    department: Optional[str] = None
    phoneNumber: Optional[str] = None
    tagsIds: Optional[list[Union[int, str]]] = None
