from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import Dict, Any, Optional
import os
from ...services.pdfmath_service import pdfmath_service
from ...core.exceptions import PDFMathError
from ...core.config import settings
from ...core.logger import logger
from pathlib import Path
import shutil
import json

router = APIRouter()

@router.post("/translate")
async def translate_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_language: str = Form(...),
    provider: str = Form(...),
    api_keys: str = Form(...)
) -> Dict[str, Any]:
    """
    翻译PDF文件
    
    参数:
    - file: PDF文件
    - target_language: 目标语言
    - provider: 翻译提供商 (openai, deepseek, google, baidu)
    - api_keys: JSON格式的API密钥
    """
    try:
        # 创建临时目录
        temp_dir = Path(settings.TEMP_DIR) / "pdfmath"
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # 保存上传的文件
        file_path = temp_dir / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 解析API密钥
        try:
            api_keys_dict = json.loads(api_keys)
        except json.JSONDecodeError:
            raise PDFMathError("无效的API密钥格式")
        
        # 执行翻译
        result = await pdfmath_service.translate_pdf(
            str(file_path),
            target_language,
            provider,
            api_keys_dict
        )
        
        # 清理临时文件
        background_tasks.add_task(lambda: os.unlink(file_path))
        
        return result
        
    except PDFMathError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"PDF翻译失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="服务器内部错误")

@router.post("/extract-math")
async def extract_math(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
) -> Dict[str, Any]:
    """
    从PDF文件中提取数学公式
    
    参数:
    - file: PDF文件
    """
    try:
        # 创建临时目录
        temp_dir = Path(settings.TEMP_DIR) / "pdfmath"
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # 保存上传的文件
        file_path = temp_dir / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 提取公式
        result = await pdfmath_service.extract_math(str(file_path))
        
        # 清理临时文件
        background_tasks.add_task(lambda: os.unlink(file_path))
        
        return result
        
    except PDFMathError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"公式提取失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="服务器内部错误")

@router.get("/validate")
async def validate_installation() -> Dict[str, bool]:
    """验证PDFMathTranslate是否正确安装"""
    try:
        is_valid = await pdfmath_service.validate_installation()
        return {"is_valid": is_valid}
    except Exception as e:
        logger.error(f"安装验证失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="服务器内部错误") 