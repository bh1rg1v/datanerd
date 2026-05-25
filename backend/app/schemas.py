from pydantic import BaseModel, EmailStr

class WaitlistRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str