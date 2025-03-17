from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from .base import TaskBase, ResponseBase, BoundingBox

class PDFRequest(BaseModel):
    """PDF处理请求模型"""
    file_path: str = Field(..., description="PDF文件路径")
    pages: Optional[List[int]] = Field(None, description="要处理的页码列表")
    bbox: Optional[BoundingBox] = Field(None, description="边界框坐标")
    mode: str = Field(..., description="处理模式 (layout/text/ocr)")

class PDFTask(TaskBase):
    """PDF处理任务模型"""
    mode: str = Field(..., description="处理模式")
    result: Optional[Dict[str, Any]] = Field(None, description="处理结果")
    pages: Optional[List[int]] = Field(None, description="处理的页码列表")

class PDFResponse(ResponseBase):
    """PDF处理响应模型"""
    result: Optional[Dict[str, Any]] = Field(None, description="处理结果")
    pages: Optional[List[int]] = Field(None, description="处理的页码列表") 