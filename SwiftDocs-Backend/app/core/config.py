import os
import platform
from pydantic_settings import BaseSettings
from typing import List, Optional, Union

class Settings(BaseSettings):
    # API配置
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "SwiftDocs API"
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # API密钥配置
    OPENAI_API_KEY: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    BAIDU_APP_ID: Optional[str] = None
    BAIDU_APP_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    
    # OCR配置 - 根据操作系统自动选择路径
    TESSERACT_CMD: str = ""
    OCR_LANGUAGES: List[str] = ["eng", "chi_sim"]
    OCR_TIMEOUT: int = 30
    
    # PDF处理配置
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "png", "jpg", "jpeg"]
    
    # 文件存储配置
    UPLOAD_DIR: str = "uploads"
    
    # Redis配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # Celery配置
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._set_platform_specific_settings()
    
    def _set_platform_specific_settings(self):
        """根据操作系统设置特定配置"""
        system = platform.system()
        
        # 设置 Tesseract 路径
        if system == "Windows":
            self.TESSERACT_CMD = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        elif system == "Darwin":  # macOS
            self.TESSERACT_CMD = "/usr/local/bin/tesseract"
        else:  # Linux
            self.TESSERACT_CMD = "/usr/bin/tesseract"
        
        # 确保上传目录存在
        os.makedirs(os.path.join(os.getcwd(), self.UPLOAD_DIR), exist_ok=True)

settings = Settings()
