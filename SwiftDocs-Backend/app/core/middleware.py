from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from .exceptions import BaseError, http_error_handler
from .logger import logger
import time
from typing import Callable
import traceback

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """错误处理中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            response = await call_next(request)
            return response
        except BaseError as e:
            logger.error(f"应用错误: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=e.status_code,
                content={"message": e.message, "details": e.details}
            )
        except Exception as e:
            logger.error(f"未处理的错误: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={"message": "服务器内部错误", "details": str(e)}
            )

class LoggingMiddleware(BaseHTTPMiddleware):
    """日志记录中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # 记录请求信息
        logger.info(
            f"开始处理请求: {request.method} {request.url.path}",
            extra={
                "request_id": request.headers.get("X-Request-ID"),
                "client_ip": request.client.host,
                "user_agent": request.headers.get("User-Agent")
            }
        )
        
        try:
            response = await call_next(request)
            
            # 记录响应信息
            process_time = (time.time() - start_time) * 1000
            logger.info(
                f"请求处理完成: {request.method} {request.url.path}",
                extra={
                    "status_code": response.status_code,
                    "process_time_ms": round(process_time, 2)
                }
            )
            
            return response
        except Exception as e:
            # 记录错误信息
            logger.error(
                f"请求处理失败: {request.method} {request.url.path}",
                extra={
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }
            )
            raise 