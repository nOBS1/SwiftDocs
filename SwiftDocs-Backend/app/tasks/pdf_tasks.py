from typing import Optional, Dict, Any, List
from ..core.celery_app import celery_app
from ..core.pdf_processor import PDFProcessor

@celery_app.task(name="tasks.process_pdf")
def process_pdf(
    task_id: str,
    file_path: str,
    mode: str,
    pages: Optional[List[int]] = None,
    bbox: Optional[Dict[str, float]] = None
) -> None:
    """PDF处理任务"""
    with PDFProcessor(file_path) as processor:
        processor.process_task(
            task_id=task_id,
            mode=mode,
            pages=pages,
            bbox=bbox
        ) 