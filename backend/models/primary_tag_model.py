from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Union, List
from models.base_entity import BaseEntityMeta


class PrimaryTagModel(BaseModel):
    """Primary Tag Model - Represents a category/domain tag (e.g., DB, APP, NETWORK)"""
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    color: str = Field(..., pattern="^#[0-9a-fA-F]{6}$")  # Darker color for primary
    relatedContactsIds: Optional[List[Union[int, str]]] = None
    base: Optional[BaseEntityMeta] = None


class PrimaryTagUpdateModel(BaseModel):
    """Update Model - all fields optional but validated when provided"""
    model_config = ConfigDict(extra='forbid')
    
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9a-fA-F]{6}$")
    relatedContactsIds: Optional[List[Union[int, str]]] = None
