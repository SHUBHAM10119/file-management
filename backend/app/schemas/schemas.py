from pydantic import BaseModel, EmailStr, validator, Field
from typing import List, Optional
from datetime import datetime
import re
from ..models.models import FileType

class AddressBase(BaseModel):
    street: str
    city: str
    state: str
    postal_code: str = Field(..., min_length=5, max_length=5)
    country: str
    is_default: bool = False
    
    @validator('postal_code')
    def validate_postal_code(cls, v):
        # Check that postal_code contains only digits
        if not re.match(r'^\d{5}$', v):
            raise ValueError('Postal code must be exactly 5 digits')
        return v

class AddressCreate(AddressBase):
    pass

class Address(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    username: str
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    addresses: List[Address] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class FileBase(BaseModel):
    filename: str
    file_type: FileType

class FileCreate(FileBase):
    pass

class File(FileBase):
    id: int
    file_path: str
    upload_date: datetime
    user_id: int
    
    # Add properties for frontend compatibility
    @property
    def uploaded_at(self) -> datetime:
        return self.upload_date
        
    @property
    def created_at(self) -> datetime:
        return self.upload_date

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()  # Ensure datetime is properly serialized
        }

class DashboardStats(BaseModel):
    total_files: int
    file_type_breakdown: dict
    files_per_user: dict 