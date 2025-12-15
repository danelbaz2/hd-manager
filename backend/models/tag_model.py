from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Union
from models.base_entity import BaseEntityMeta


class TagModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    entityId: Optional[str] = None
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    relatedContactsIds: Optional[list[Union[int, str]]] = None
    color: str = Field(..., pattern="^#[0-9a-f]{6}$")
    base: Optional[BaseEntityMeta] = None

# Update Model - all fields optional but validated when provided
# extra='forbid' rejects any fields not defined in the model
class TagUpdateModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    relatedContactsIds: Optional[list[Union[int, str]]] = None
    color: Optional[str] = Field(None, pattern="^#[0-9a-f]{6}$")
