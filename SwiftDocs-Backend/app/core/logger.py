import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from .config import settings

# 创建日志目录
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# 创建格式化器
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# 创建文件处理器
file_handler = RotatingFileHandler(
    log_dir / "app.log",
    maxBytes=10 * 1024 * 1024,  # 10MB
    backupCount=5,
    encoding="utf-8"
)
file_handler.setFormatter(formatter)

# 创建控制台处理器
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)

# 配置根日志记录器
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
root_logger.addHandler(file_handler)
root_logger.addHandler(console_handler)

# 创建应用日志记录器
logger = logging.getLogger("pdf_translator")
logger.setLevel(logging.INFO)

# 创建各模块的日志记录器
translation_logger = logging.getLogger("pdf_translator.translation")
ocr_logger = logging.getLogger("pdf_translator.ocr")
pdf_logger = logging.getLogger("pdf_translator.pdf")
task_logger = logging.getLogger("pdf_translator.task")
file_logger = logging.getLogger("pdf_translator.file") 