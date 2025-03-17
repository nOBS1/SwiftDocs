import fitz
import io
import base64
from typing import Optional, List, Dict, Any, Tuple
from pathlib import Path
from PIL import Image
from .task_manager import task_manager

class PDFProcessor:
    """PDF处理器类，用于处理PDF文件的各种操作"""
    
    def __init__(self, file_path: str):
        """初始化PDF文档"""
        self.file_path = file_path
        self.doc = fitz.open(file_path)
        
    def __enter__(self):
        """上下文管理器入口"""
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        """上下文管理器出口，确保文档关闭"""
        self.doc.close()
        
    def get_page_count(self) -> int:
        """获取PDF页数"""
        return len(self.doc)
        
    def extract_text(self, page_numbers: Optional[List[int]] = None) -> Dict[int, str]:
        """提取文本内容"""
        result = {}
        pages = page_numbers if page_numbers else range(self.get_page_count())
        
        for page_num in pages:
            if 0 <= page_num < self.get_page_count():
                page = self.doc[page_num]
                result[page_num] = page.get_text()
                
        return result
        
    def extract_text_from_bbox(self, page_num: int, bbox: Tuple[float, float, float, float]) -> str:
        """从指定区域提取文本"""
        if 0 <= page_num < self.get_page_count():
            page = self.doc[page_num]
            return page.get_text("text", clip=bbox)
        return ""
        
    def get_page_image(self, page_num: int, zoom: float = 2.0) -> Optional[str]:
        """获取页面图像"""
        if 0 <= page_num < self.get_page_count():
            page = self.doc[page_num]
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
            
            img_data = pix.tobytes("png")
            return base64.b64encode(img_data).decode()
        return None
        
    def get_image_from_bbox(self, page_num: int, bbox: Tuple[float, float, float, float], zoom: float = 2.0) -> Optional[str]:
        """获取指定区域的图像"""
        if 0 <= page_num < self.get_page_count():
            page = self.doc[page_num]
            clip = fitz.Rect(bbox)
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip)
            
            img_data = pix.tobytes("png")
            return base64.b64encode(img_data).decode()
        return None
        
    def analyze_layout(self, page_numbers: Optional[List[int]] = None) -> Dict[int, List[Dict[str, Any]]]:
        """分析页面布局"""
        result = {}
        pages = page_numbers if page_numbers else range(self.get_page_count())
        
        for page_num in pages:
            if 0 <= page_num < self.get_page_count():
                page = self.doc[page_num]
                blocks = page.get_text("dict")["blocks"]
                
                layout_info = []
                for block in blocks:
                    if block.get("type") == 0:  # 文本块
                        layout_info.append({
                            "type": "text",
                            "bbox": block["bbox"],
                            "text": block.get("text", ""),
                            "font": block.get("font", ""),
                            "size": block.get("size", 0)
                        })
                    elif block.get("type") == 1:  # 图像块
                        layout_info.append({
                            "type": "image",
                            "bbox": block["bbox"]
                        })
                        
                result[page_num] = layout_info
                
        return result
        
    def process_task(self, task_id: str, mode: str, pages: Optional[List[int]] = None, bbox: Optional[Dict[str, float]] = None) -> None:
        """处理PDF任务"""
        try:
            task_manager.set_task_progress(task_id, 10)
            
            if mode == "text":
                if bbox:
                    result = self.extract_text_from_bbox(
                        bbox["page"],
                        (bbox["x"], bbox["y"], bbox["x"] + bbox["width"], bbox["y"] + bbox["height"])
                    )
                else:
                    result = self.extract_text(pages)
                    
            elif mode == "layout":
                result = self.analyze_layout(pages)
                
            elif mode == "image":
                if bbox:
                    result = self.get_image_from_bbox(
                        bbox["page"],
                        (bbox["x"], bbox["y"], bbox["x"] + bbox["width"], bbox["y"] + bbox["height"])
                    )
                else:
                    result = {
                        page_num: self.get_page_image(page_num)
                        for page_num in (pages or range(self.get_page_count()))
                    }
                    
            else:
                raise ValueError(f"不支持的处理模式: {mode}")
                
            task_manager.set_task_progress(task_id, 90)
            task_manager.set_task_result(task_id, {"result": result})
            
        except Exception as e:
            task_manager.set_task_error(task_id, str(e)) 