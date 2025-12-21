from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict

class HistoryChange(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    action: str = Field(..., pattern="^(CREATE|UPDATE|DELETE)$")
    timestamp: int

    oldValue: Optional[Dict[str, Any]] = None
    newValue: Optional[Dict[str, Any]] = None
    changeValue: Optional[Dict[str, Any]] = None
    details: Optional[str] = None

class EntityHistoryModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    id: Optional[str] = None
    entityId: str
    entries: List[HistoryChange] = []
