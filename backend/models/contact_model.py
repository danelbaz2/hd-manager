from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Union, List
from models.base_entity import BaseEntityMeta

class ContactModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    fullName: str = Field(..., min_length=2)
    position: Optional[str] = None
    department: Optional[str] = None
    phoneNumber: str = Field(..., min_length=1)  # Required
    tagsIds: Optional[List[Union[int, str]]] = None
    base: Optional[BaseEntityMeta] = None

# Update Model - all fields optional but validated when provided
# extra='forbid' rejects any fields not defined in the model
class ContactUpdateModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    fullName: Optional[str] = Field(None, min_length=2)
    position: Optional[str] = None
    department: Optional[str] = None
    phoneNumber: Optional[str] = Field(None, min_length=1)
    tagsIds: Optional[List[Union[int, str]]] = None
