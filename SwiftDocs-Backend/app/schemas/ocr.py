from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from .base import TaskBase, ResponseBase, BoundingBox

class OCRRequest(BaseModel):
    """OCR请求模型"""
    image_data: Optional[str] = Field(None, description="Base64编码的图像数据")
    bbox: Optional[BoundingBox] = Field(None, description="边界框坐标")
    page: Optional[int] = Field(None, description="页码", ge=1)

class OCRTask(TaskBase):
    """OCR任务模型"""
    result: Optional[Dict[str, Any]] = Field(None, description="OCR结果")
    confidence: Optional[float] = Field(None, description="识别置信度", ge=0, le=1)

class OCRResponse(ResponseBase):
    """OCR响应模型"""
    result: Optional[Dict[str, Any]] = Field(None, description="OCR结果")
    confidence: Optional[float] = Field(None, description="识别置信度", ge=0, le=1) 