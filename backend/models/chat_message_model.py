from pydantic import BaseModel, Field
from typing import Optional
from models.base_entity import BaseEntityMeta

class ChatMessageModel(BaseModel):
    entityId: Optional[str] = None
    senderUserId: int  # Sender ID
    message: str  # Text content
    base: Optional[BaseEntityMeta] = None
