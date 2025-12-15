from pydantic import BaseModel, Field
from typing import Optional, Union
from models.base_entity import BaseEntityMeta

class TagModel(BaseModel):
    entityId: Optional[str] = None
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    relatedContactsIds: Optional[list[Union[int, str]]] = None
    base: Optional[BaseEntityMeta] = None

# Update Model - all fields optional but validated when provided
class TagUpdateModel(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    relatedContactsIds: Optional[list[Union[int, str]]] = None
