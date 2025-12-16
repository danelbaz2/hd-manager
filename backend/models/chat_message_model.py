from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from models.base_entity import BaseEntityMeta

class ChatMessageModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    senderUserId: str  # Sender user ID (string)
    message: str  # Text content
    base: Optional[BaseEntityMeta] = None
