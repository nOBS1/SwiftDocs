from fastapi import APIRouter, HTTPException, BackgroundTasks, File, UploadFile
from ..schemas.ocr import OCRRequest, OCRResponse, OCRTask
from ..tasks.ocr import process_ocr
from ..core.websocket import ConnectionManager
from typing import Optional
import uuid
from datetime import datetime
import aiofiles
import os
from ..core.config import settings

router = APIRouter()
manager = ConnectionManager()

@router.post("/process", response_model=OCRResponse)
async def create_ocr_task(
    request: OCRRequest,
    background_tasks: BackgroundTasks,
):
    """
    创建新的OCR识别任务
    
    - **image_data**: Base64编码的图像数据
    - **bbox**: 边界框坐标
    - **page**: 页码
    """
    # 创建任务ID
    task_id = str(uuid.uuid4())
    
    # 创建OCR任务
    task = OCRTask(
        id=task_id,
        status="pending",
        progress=0,
        created_at=str(datetime.now()),
        updated_at=str(datetime.now())
    )
    
    # 启动异步OCR任务
    background_tasks.add_task(
        process_ocr,
        task_id=task_id,
        image_data=request.image_data,
        bbox=request.bbox,
        page=request.page
    )
    
    return OCRResponse(
        taskId=task_id,
        status="pending",
        progress=0
    )

@router.post("/upload", response_model=OCRResponse)
async def upload_image(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks
):
    """
    上传图像文件进行OCR识别
    """
    # 验证文件类型
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="只支持图像文件"
        )
    
    # 创建上传目录
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # 生成文件路径
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{file_extension}")
    
    # 保存文件
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # 创建任务ID
    task_id = str(uuid.uuid4())
    
    # 创建OCR任务
    task = OCRTask(
        id=task_id,
        status="pending",
        progress=0,
        created_at=str(datetime.now()),
        updated_at=str(datetime.now())
    )
    
    # 启动异步OCR任务
    background_tasks.add_task(
        process_ocr,
        task_id=task_id,
        image_path=file_path
    )
    
    return OCRResponse(
        taskId=task_id,
        status="pending",
        progress=0
    )

@router.get("/task/{task_id}", response_model=OCRResponse)
async def get_ocr_task(task_id: str):
    """
    获取OCR任务状态
    """
    # 从Redis或数据库中获取任务状态
    task = await get_task_status(task_id)
    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"未找到任务: {task_id}"
        )
    
    return OCRResponse(
        taskId=task_id,
        status=task.status,
        progress=task.progress,
        result=task.result,
        error=task.error
    )

@router.delete("/task/{task_id}")
async def cancel_ocr_task(task_id: str):
    """
    取消OCR任务
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