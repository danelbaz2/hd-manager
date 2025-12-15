from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class HistoryChange(BaseModel):
    actionType: str = Field(..., pattern="^(CREATE|UPDATE|DELETE)$")
    timestamp: int
    updatedBy: str  # Required - user ID who performed the action
    oldValue: Optional[Dict[str, Any]] = None
    newValue: Optional[Dict[str, Any]] = None
    changeValue: Optional[Dict[str, Any]] = None
    details: Optional[str] = None

class EntityHistoryModel(BaseModel):
    id: Optional[str] = None
    entityId: str
    entries: List[HistoryChange] = []
