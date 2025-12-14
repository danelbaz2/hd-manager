from pydantic import BaseModel, Field
from typing import Union, Optional

class UserModel(BaseModel):
    id: Optional[str] = None
    fullName: str = Field(..., min_length=2)
    username: str = Field(..., min_length=2)
    passwordHash: str
    role: str = "regular|admin"
    createdAt: Optional[str] = None
    isActive: bool
    isDeleted: bool = False
