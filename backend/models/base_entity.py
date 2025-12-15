from pydantic import BaseModel
from typing import Optional

class BaseEntityMeta(BaseModel):
    isDeleted: bool = False
    createdAt: int
    updatedAt: int
    lut: int
    entityType: str
    isActive: bool = True
