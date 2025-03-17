from typing import Optional, Dict, Any
from ..core.celery_app import celery_app
from ..core.translation_processor import translation_processor

@celery_app.task(name="tasks.translate_text")
async def translate_text(
    task_id: str,
    text: str,
    provider: str,
    target_lang: str,
    api_keys: Dict[str, str]
) -> None:
    """翻译文本任务"""
    await translation_processor.process_task(
        task_id=task_id,
        text=text,
        provider=provider,
        target_lang=target_lang,
        api_keys=api_keys
    ) 