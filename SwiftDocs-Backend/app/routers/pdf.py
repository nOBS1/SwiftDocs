from fastapi import APIRouter, HTTPException, BackgroundTasks, File, UploadFile
from ..schemas.pdf import PDFRequest, PDFResponse, PDFTask
from ..tasks.pdf import process_pdf
from ..core.websocket import ConnectionManager
from typing import Optional
import uuid
from datetime import datetime
import aiofiles
import os
from ..core.config import settings

router = APIRouter()
manager = ConnectionManager()

@router.post("/process", response_model=PDFResponse)
async def create_pdf_task(
    request: PDFRequest,
    background_tasks: BackgroundTasks,
):
    """
    创建新的PDF处理任务
    
    - **mode**: 处理模式 (full/selection)
    - **bbox**: 选择区域的边界框坐标（仅在selection模式下使用）
    - **page**: 页码
    """
    # 创建任务ID
    task_id = str(uuid.uuid4())
    
    # 创建PDF处理任务
    task = PDFTask(
        id=task_id,
        status="pending",
        mode=request.mode,
        progress=0,
        created_at=str(datetime.now()),
        updated_at=str(datetime.now())
    )
    
    # 启动异步PDF处理任务
    background_tasks.add_task(
        process_pdf,
        task_id=task_id,
        mode=request.mode,
        bbox=request.bbox,
        page=request.page
    )
    
    return PDFResponse(
        taskId=task_id,
        status="pending",
        progress=0
    )

@router.post("/upload", response_model=PDFResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks
):
    """
    上传PDF文件进行处理
    """
    # 验证文件类型
    if not file.content_type == 'application/pdf':
        raise HTTPException(
            status_code=400,
            detail="只支持PDF文件"
        )
    
    # 验证文件大小
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小超过限制 ({settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB)"
        )
    
    # 创建上传目录
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # 生成文件路径
    file_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}.pdf")
    
    # 保存文件
    async with aiofiles.open(file_path, 'wb') as out_file:
        await out_file.write(content)
    
    # 创建任务ID
    task_id = str(uuid.uuid4())
    
    # 创建PDF处理任务
    task = PDFTask(
        id=task_id,
        status="pending",
        mode="full",  # 默认为全文处理模式
        progress=0,
        created_at=str(datetime.now()),
        updated_at=str(datetime.now())
    )
    
    # 启动异步PDF处理任务
    background_tasks.add_task(
        process_pdf,
        task_id=task_id,
        file_path=file_path
    )
    
    return PDFResponse(
        taskId=task_id,
        status="pending",
        progress=0
    )

@router.get("/task/{task_id}", response_model=PDFResponse)
async def get_pdf_task(task_id: str):
    """
    获取PDF处理任务状态
    """
    # 从Redis或数据库中获取任务状态
    task = await get_task_status(task_id)
    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"未找到任务: {task_id}"
        )
    
    return PDFResponse(
        taskId=task_id,
        status=task.status,
        progress=task.progress,
        result=task.result,
        error=task.error
    )

@router.delete("/task/{task_id}")
async def cancel_pdf_task(task_id: str):
    """
    取消PDF处理任务
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
    
    # 清理临时文件
    if task.file_path and os.path.exists(task.file_path):
        os.remove(task.file_path)
    
    return {"message": f"任务 {task_id} 已取消"} 