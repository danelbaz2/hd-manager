from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from models.base_entity import BaseEntityMeta


class SecondaryTagModel(BaseModel):
    """Secondary Tag Model - Represents an action/subject tag (e.g., Update, Test, Check)
    
    Secondary tags are linked to a Primary tag and inherit their color display
    from the parent Primary tag.
    """
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    name: str = Field(..., min_length=1)
    primaryTagId: str = Field(...)  # Required - reference to parent Primary Tag
    description: Optional[str] = None
    base: Optional[BaseEntityMeta] = None


class SecondaryTagUpdateModel(BaseModel):
    """Update Model - all fields optional but validated when provided"""
    model_config = ConfigDict(extra='forbid')
    
    name: Optional[str] = Field(None, min_length=1)
    primaryTagId: Optional[str] = None  # Can change parent Primary Tag
    description: Optional[str] = None
