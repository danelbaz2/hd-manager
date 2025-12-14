from pydantic import BaseModel, Field
from typing import Optional

class ChatMessageModel(BaseModel):
    id: Optional[str] = None
    senderUserId: int  # Sender ID
    message: str  # Text content
    createdAt: Optional[int] = None
    isDeleted: bool = False
