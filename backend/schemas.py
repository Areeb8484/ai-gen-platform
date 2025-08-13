from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: str
    credits: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class AIRequestCreate(BaseModel):
    request_type: str  # Text, Image, Code
    model: str
    prompt: str
    delivery_email: EmailStr

class AIRequestResponse(BaseModel):
    id: int
    request_type: str
    model: str
    prompt: str
    delivery_email: str
    filename: Optional[str]
    status: str
    created_at: datetime
    admin_response: Optional[str] = None
    admin_file: Optional[str] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CreditPackage(BaseModel):
    credits: int
    price: float
    price_id: str

class StripeSessionCreate(BaseModel):
    credits: int

class RequestStatusUpdate(BaseModel):
    status: str

class SupportMessage(BaseModel):
    email: EmailStr
    message: str
    page: str = "/"
    timestamp: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyResetTokenRequest(BaseModel):
    token: str
