from typing import Optional, Dict, Any
from ..core.celery_app import celery_app
from ..core.ocr_processor import ocr_processor

@celery_app.task(name="tasks.process_ocr")
def process_ocr(
    task_id: str,
    image_data: Optional[str] = None,
    bbox: Optional[Dict[str, float]] = None
) -> None:
    """OCR处理任务"""
    ocr_processor.process_task(
        task_id=task_id,
        image_data=image_data,
        bbox=bbox
    ) 