from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from ..schemas.translation import (
    TranslationRequest,
    TranslationResponse,
    TranslationTask
)
from ..core.config import settings, TRANSLATION_PROVIDERS, TARGET_LANGUAGES
from ..tasks.translation import translate_text
from ..core.websocket import ConnectionManager
from typing import Optional
import uuid
from datetime import datetime

router = APIRouter()
manager = ConnectionManager()

@router.post("/translate", response_model=TranslationResponse)
async def create_translation(
    request: TranslationRequest,
    background_tasks: BackgroundTasks,
):
    """
    创建新的翻译任务
    
    - **text**: 要翻译的文本
    - **provider**: 翻译服务提供商
    - **targetLanguage**: 目标语言
    - **mode**: 翻译模式 (selection/full)
    - **apiKeys**: 可选的API密钥
    """
    # 验证翻译服务提供商
    if request.provider not in TRANSLATION_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的翻译服务提供商: {request.provider}"
        )
    
    # 验证目标语言
    if request.targetLanguage not in TARGET_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的目标语言: {request.targetLanguage}"
        )
    
    # 创建任务ID
    task_id = str(uuid.uuid4())
    
    # 创建翻译任务
    task = TranslationTask(
        id=task_id,
        status="pending",
        mode=request.mode,
        progress=0,
        created_at=str(datetime.now()),
        updated_at=str(datetime.now())
    )
    
    # 启动异步翻译任务
    background_tasks.add_task(
        translate_text,
        task_id=task_id,
        text=request.text,
        provider=request.provider,
        target_language=request.targetLanguage,
        api_keys=request.apiKeys,
        mode=request.mode,
        bbox=request.bbox
    )
    
    return TranslationResponse(
        taskId=task_id,
        status="pending",
        progress=0
    )

@router.get("/task/{task_id}", response_model=TranslationResponse)
async def get_translation_task(task_id: str):
    """
    获取翻译任务状态
    """
    # 从Redis或数据库中获取任务状态
    task = await get_task_status(task_id)
    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"未找到任务: {task_id}"
        )
    
    return TranslationResponse(
        taskId=task_id,
        status=task.status,
        progress=task.progress,
        result=task.result,
        error=task.error
    )

@router.delete("/task/{task_id}")
async def cancel_translation_task(task_id: str):
    """
    取消翻译任务
    """
    # 从Redis或数据库中获取任务状态
    task = await get_task_status(task_id)
    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"未找到任务: {task_id}"
        )
    
    # 取消任务
    await cancel_task(task_id)
    
    return {"message": f"任务 {task_id} 已取消"} 