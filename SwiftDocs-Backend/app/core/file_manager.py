import os
import shutil
from typing import Optional, List, Tuple
from datetime import datetime
from pathlib import Path
from fastapi import UploadFile, HTTPException
from .config import settings

class FileManager:
    """文件管理器类，用于处理文件上传和管理"""
    
    def __init__(self):
        """初始化上传目录"""
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
    def get_unique_filename(self, original_filename: str) -> str:
        """生成唯一的文件名"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = Path(original_filename)
        return f"{filename.stem}_{timestamp}{filename.suffix}"
        
    async def save_upload_file(self, file: UploadFile) -> Tuple[str, str]:
        """保存上传的文件"""
        if not file:
            raise HTTPException(status_code=400, detail="没有文件上传")
            
        filename = self.get_unique_filename(file.filename)
        file_path = self.upload_dir / filename
        
        try:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")
        finally:
            file.file.close()
            
        return str(file_path), filename
        
    def delete_file(self, file_path: str) -> bool:
        """删除文件"""
        try:
            Path(file_path).unlink(missing_ok=True)
            return True
        except Exception:
            return False
            
    def get_file_size(self, file_path: str) -> int:
        """获取文件大小（字节）"""
        return Path(file_path).stat().st_size
        
    def validate_file_type(self, filename: str, allowed_extensions: List[str]) -> bool:
        """验证文件类型"""
        return Path(filename).suffix.lower() in allowed_extensions
        
    def validate_file_size(self, file_size: int, max_size: int = settings.MAX_UPLOAD_SIZE) -> bool:
        """验证文件大小"""
        return file_size <= max_size
        
    def get_temp_dir(self) -> str:
        """获取临时目录路径"""
        temp_dir = self.upload_dir / "temp"
        temp_dir.mkdir(parents=True, exist_ok=True)
        return str(temp_dir)
        
    def cleanup_temp_files(self, max_age_hours: int = 24) -> None:
        """清理临时文件"""
        temp_dir = Path(self.get_temp_dir())
        current_time = datetime.now().timestamp()
        
        for file_path in temp_dir.glob("*"):
            if file_path.is_file():
                file_age = current_time - file_path.stat().st_mtime
                if file_age > max_age_hours * 3600:
                    self.delete_file(str(file_path))

# 创建全局文件管理器实例
file_manager = FileManager() 