"""Pydantic schemas for authentication and user management."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    full_name: str
    password: str
    role: UserRole = UserRole.CITIZEN
    district_id: Optional[int] = None
    phone_number: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    district_id: Optional[int] = None
    phone_number: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
