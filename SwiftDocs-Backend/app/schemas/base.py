from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class TaskBase(BaseModel):
    """任务基础模型"""
    id: str = Field(..., description="任务ID")
    status: str = Field(..., description="任务状态")
    progress: int = Field(0, description="任务进度", ge=0, le=100)
    created_at: str = Field(..., description="创建时间")
    updated_at: str = Field(..., description="更新时间")
    error: Optional[str] = Field(None, description="错误信息")

class ResponseBase(BaseModel):
    """响应基础模型"""
    taskId: str = Field(..., description="任务ID")
    status: str = Field(..., description="任务状态")
    progress: int = Field(0, description="任务进度", ge=0, le=100)
    error: Optional[str] = Field(None, description="错误信息")

class BoundingBox(BaseModel):
    """边界框坐标"""
    x: float = Field(..., description="左上角X坐标")
    y: float = Field(..., description="左上角Y坐标")
    width: float = Field(..., description="宽度")
    height: float = Field(..., description="高度")
    page: int = Field(..., description="页码", ge=1)

class ApiKeys(BaseModel):
    """API密钥配置"""
    openai: Optional[str] = Field(None, description="OpenAI API密钥")
    deepseek: Optional[str] = Field(None, description="DeepSeek API密钥")
    baidu_app_id: Optional[str] = Field(None, description="百度翻译APP ID")
    baidu_app_key: Optional[str] = Field(None, description="百度翻译APP Key")
    google: Optional[str] = Field(None, description="Google API密钥") 