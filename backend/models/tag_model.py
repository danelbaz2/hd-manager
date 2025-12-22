from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Union, List
from models.base_entity import BaseEntityMeta


class TagModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    relatedContactIds: Optional[List[Union[int, str]]] = None
    color: str = Field(..., pattern="^#[0-9a-fA-F]{6}$")
    base: Optional[BaseEntityMeta] = None

# Update Model - all fields optional but validated when provided
# extra='forbid' rejects any fields not defined in the model
class TagUpdateModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    relatedContactIds: Optional[List[Union[int, str]]] = None
    color: Optional[str] = Field(None, pattern="^#[0-9a-fA-F]{6}$")
