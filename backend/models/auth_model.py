from pydantic import BaseModel, Field, ConfigDict

class LoginModel(BaseModel):
    """Model for login request validation"""
    model_config = ConfigDict(extra='forbid')
    
    username: str = Field(..., min_length=2)
    password: str = Field(..., min_length=1)
