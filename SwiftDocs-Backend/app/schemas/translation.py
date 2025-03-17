from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from .base import TaskBase, ResponseBase, BoundingBox, ApiKeys

class TranslationRequest(BaseModel):
    """翻译请求模型"""
    text: str = Field(..., description="要翻译的文本")
    provider: str = Field(..., description="翻译服务提供商")
    targetLanguage: str = Field(..., description="目标语言")
    mode: str = Field(..., description="翻译模式 (selection/full)")
    apiKeys: Optional[ApiKeys] = Field(None, description="API密钥配置")
    bbox: Optional[BoundingBox] = Field(None, description="选择区域的边界框坐标")

class TranslationTask(TaskBase):
    """翻译任务模型"""
    mode: str = Field(..., description="翻译模式")
    result: Optional[Dict[str, Any]] = Field(None, description="翻译结果")

class TranslationResponse(ResponseBase):
    """翻译响应模型"""
    result: Optional[Dict[str, Any]] = Field(None, description="翻译结果") 