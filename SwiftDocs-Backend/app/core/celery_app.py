from celery import Celery
from .config import settings

celery_app = Celery(
    "pdf_translator",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.translation",
        "app.tasks.ocr",
        "app.tasks.pdf"
    ]
)

# Celery配置
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1小时
    worker_max_tasks_per_child=100,
    broker_connection_retry_on_startup=True
)

# 任务路由
celery_app.conf.task_routes = {
    "app.tasks.translation.*": {"queue": "translation"},
    "app.tasks.ocr.*": {"queue": "ocr"},
    "app.tasks.pdf.*": {"queue": "pdf"}
} 