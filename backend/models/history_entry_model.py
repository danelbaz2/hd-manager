from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class HistoryChange(BaseModel):
    actionType: str = Field(..., pattern="^(CREATE|UPDATE|DELETE)$")
    timestamp: str
    performedByUserId: Optional[int] = None # Or str if using auth
    oldValue: Optional[Dict[str, Any]] = None
    newValue: Optional[Dict[str, Any]] = None
    changeValue: Optional[Dict[str, Any]] = None
    details: Optional[str] = None

class EntityHistoryModel(BaseModel):
    id: Optional[str] = None
    entityType: str
    entityId: str
    entries: List[HistoryChange] = []
