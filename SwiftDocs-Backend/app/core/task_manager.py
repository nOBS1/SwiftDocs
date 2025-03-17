import redis
import json
from typing import Optional, Dict, Any
from datetime import datetime
from .config import settings

class TaskManager:
    """任务管理器类，用于管理任务状态和进度"""
    
    def __init__(self):
        """初始化Redis连接"""
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=0,
            decode_responses=True
        )
        
    def create_task(self, task_id: str, task_type: str, initial_status: str = "pending") -> None:
        """创建新任务"""
        task_data = {
            "id": task_id,
            "type": task_type,
            "status": initial_status,
            "progress": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "error": None,
            "result": None
        }
        self.redis_client.set(f"task:{task_id}", json.dumps(task_data))
        
    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """获取任务信息"""
        task_data = self.redis_client.get(f"task:{task_id}")
        return json.loads(task_data) if task_data else None
        
    def update_task(self, task_id: str, **kwargs) -> None:
        """更新任务信息"""
        task_data = self.get_task(task_id)
        if task_data:
            task_data.update(kwargs)
            task_data["updated_at"] = datetime.now().isoformat()
            self.redis_client.set(f"task:{task_id}", json.dumps(task_data))
            
    def delete_task(self, task_id: str) -> bool:
        """删除任务"""
        return bool(self.redis_client.delete(f"task:{task_id}"))
        
    def set_task_error(self, task_id: str, error: str) -> None:
        """设置任务错误信息"""
        self.update_task(task_id, status="error", error=error)
        
    def set_task_progress(self, task_id: str, progress: int) -> None:
        """更新任务进度"""
        self.update_task(task_id, progress=progress)
        if progress >= 100:
            self.update_task(task_id, status="completed")
            
    def set_task_result(self, task_id: str, result: Dict[str, Any]) -> None:
        """设置任务结果"""
        self.update_task(task_id, result=result, status="completed", progress=100)

# 创建全局任务管理器实例
task_manager = TaskManager() 