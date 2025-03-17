from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    PDF = "pdf"
    IMAGE = "image"
    TEXT = "text"

class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class DocumentBase(BaseModel):
    title: str
    type: DocumentType
    language: Optional[str] = "en"

class DocumentCreate(DocumentBase):
    content: Optional[str] = None
    file_path: Optional[str] = None

class Document(DocumentBase):
    id: str = Field(..., description="文档唯一标识符")
    status: DocumentStatus = DocumentStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    content: Optional[str] = None
    file_path: Optional[str] = None
    
    class Config:
        from_attributes = True

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[DocumentStatus] = None 