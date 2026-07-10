from pydantic import BaseModel, EmailStr
from datetime import datetime

class WaitlistRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

class DatasetCreate(BaseModel):
    name: str
    description: str
    price: int

class DatasetResponse(BaseModel):
    id: int
    name: str
    description: str
    price: int

    class Config:
        from_attributes = True

class ArticleCreate(BaseModel):
    id: str
    title: str
    content: str

class ArticleResponse(BaseModel):
    id: str
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True