from pydantic import BaseModel, Field
from typing import Optional
from models.base_entity import BaseEntityMeta

class UserModel(BaseModel):
    entityId: Optional[str] = None
    fullName: str = Field(..., min_length=2)
    username: str = Field(..., min_length=2)
    passwordHash: str
    role: str = Field(..., pattern="^(regular|admin)$")
    base: Optional[BaseEntityMeta] = None

# Update Model - all fields optional but validated when provided
class UserUpdateModel(BaseModel):
    fullName: Optional[str] = Field(None, min_length=2)
    username: Optional[str] = Field(None, min_length=2)
    passwordHash: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(regular|admin)$")
