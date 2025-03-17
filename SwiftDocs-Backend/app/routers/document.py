from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List
import aiofiles
import os
from datetime import datetime
import uuid
from ..schemas.document import DocumentCreate, Document, DocumentUpdate
from ..services.ocr_service import ocr_service
from ..core.config import settings

router = APIRouter()

@router.post("/upload/", response_model=Document)
async def upload_document(
    file: UploadFile = File(...),
    language: str = "eng"
) -> Document:
    """
    上传文档并进行处理
    """
    try:
        # 验证文件类型
        file_ext = file.filename.split(".")[-1].lower()
        if file_ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件类型。支持的类型: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        # 验证文件大小
        file_size = 0
        content = await file.read()
        file_size = len(content)
        if file_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"文件太大。最大允许大小: {settings.MAX_UPLOAD_SIZE/1024/1024}MB"
            )

        # 创建文档ID和保存路径
        doc_id = str(uuid.uuid4())
        save_dir = os.path.join("uploads", datetime.now().strftime("%Y%m"))
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, f"{doc_id}.{file_ext}")

        # 保存文件
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        # 如果是图像文件，执行OCR
        if file_ext in ["png", "jpg", "jpeg"]:
            ocr_result = await ocr_service.process_image(
                content,
                language=language
            )
            text_content = ocr_result["text"]
        else:
            text_content = None

        # 创建文档记录
        document = Document(
            id=doc_id,
            title=file.filename,
            type="image" if file_ext in ["png", "jpg", "jpeg"] else "pdf",
            language=language,
            content=text_content,
            file_path=file_path
        )

        return document

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}", response_model=Document)
async def get_document(document_id: str) -> Document:
    """
    获取文档信息
    """
    # TODO: 从数据库获取文档信息
    raise HTTPException(status_code=404, detail="文档不存在")

@router.put("/{document_id}", response_model=Document)
async def update_document(
    document_id: str,
    document_update: DocumentUpdate
) -> Document:
    """
    更新文档信息
    """
    # TODO: 更新数据库中的文档信息
    raise HTTPException(status_code=404, detail="文档不存在")

@router.delete("/{document_id}")
async def delete_document(document_id: str) -> JSONResponse:
    """
    删除文档
    """
    # TODO: 从数据库和文件系统中删除文档
    return JSONResponse(content={"message": "文档已删除"}) 