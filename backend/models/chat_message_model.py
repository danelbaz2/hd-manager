from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from models.base_entity import BaseEntityMeta

class ChatMessageModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    senderUserId: int  # Sender ID
    message: str  # Text content
    base: Optional[BaseEntityMeta] = None
