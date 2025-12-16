from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from models.base_entity import BaseEntityMeta

class UserModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    fullName: str = Field(..., min_length=2)
    username: str = Field(..., min_length=2)
    passwordHash: str
    role: str = Field(..., pattern="^(regular|admin)$")
    color: str = Field(..., pattern="^#[0-9a-fA-F]{6}$")
    profileImage: Optional[str] = None
    base: Optional[BaseEntityMeta] = None

# Update Model - all fields optional but validated when provided
# extra='forbid' rejects any fields not defined in the model
class UserUpdateModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    fullName: Optional[str] = Field(None, min_length=2)
    username: Optional[str] = Field(None, min_length=2)
    passwordHash: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(regular|admin)$")
    color: Optional[str] = Field(None, pattern="^#[0-9a-fA-F]{6}$")
    profileImage: Optional[str] = None
