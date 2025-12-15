from pydantic import BaseModel, ConfigDict
from typing import Optional

class BaseEntityMeta(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    isDeleted: bool = False
    createdAt: int
    updatedAt: int
    lut: int
    entityType: str
    isActive: bool = True
