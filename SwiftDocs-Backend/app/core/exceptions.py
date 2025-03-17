from fastapi import HTTPException, status
from typing import Optional, Dict, Any

class BaseError(Exception):
    """基础错误类"""
    error_code = "BASE_ERROR"
    
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

class ValidationError(BaseError):
    """验证错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status.HTTP_400_BAD_REQUEST
        self.details = details or {}

class AuthenticationError(BaseError):
    """认证错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status.HTTP_401_UNAUTHORIZED
        self.details = details or {}

class PermissionError(BaseError):
    """权限错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status.HTTP_403_FORBIDDEN
        self.details = details or {}

class NotFoundError(BaseError):
    """资源不存在错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status.HTTP_404_NOT_FOUND
        self.details = details or {}

class APIError(BaseError):
    """API调用错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status.HTTP_502_BAD_GATEWAY
        self.details = details or {}

class TaskError(BaseError):
    """任务处理错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        self.details = details or {}

class FileError(BaseError):
    """文件处理错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status.HTTP_400_BAD_REQUEST
        self.details = details or {}

class PDFMathError(BaseError):
    """PDFMath处理相关错误"""
    error_code = "PDFMATH_ERROR"
    
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

def http_error_handler(error: BaseError) -> HTTPException:
    """将自定义错误转换为FastAPI的HTTPException"""
    return HTTPException(
        status_code=error.status_code,
        detail={
            "message": error.message,
            "details": error.details
        }
    ) 