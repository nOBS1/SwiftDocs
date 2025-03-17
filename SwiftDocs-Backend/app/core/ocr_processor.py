import pytesseract
import cv2
import numpy as np
import base64
from typing import Optional, Dict, Any, Tuple
from PIL import Image
from io import BytesIO
from .config import settings
from .task_manager import task_manager

class OCRProcessor:
    """OCR处理器类，用于处理图像文字识别"""
    
    def __init__(self):
        """初始化OCR处理器"""
        # 设置Tesseract命令路径
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
        
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """图像预处理"""
        # 转换为灰度图
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 二值化
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # 降噪
        denoised = cv2.fastNlMeansDenoising(binary)
        
        return denoised
        
    def decode_base64_image(self, base64_string: str) -> Optional[np.ndarray]:
        """解码Base64图像数据"""
        try:
            # 解码Base64数据
            image_data = base64.b64decode(base64_string)
            
            # 转换为numpy数组
            nparr = np.frombuffer(image_data, np.uint8)
            
            # 解码图像
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            return image
        except Exception:
            return None
            
    def recognize_text(self, image: np.ndarray, lang: str = "chi_sim+eng") -> Dict[str, Any]:
        """识别文字"""
        # 预处理图像
        processed_image = self.preprocess_image(image)
        
        # 使用Tesseract进行OCR识别
        result = pytesseract.image_to_data(processed_image, lang=lang, output_type=pytesseract.Output.DICT)
        
        # 提取有效的文本结果
        text_results = []
        for i in range(len(result["text"])):
            if int(result["conf"][i]) > 0:  # 只保留置信度大于0的结果
                text_results.append({
                    "text": result["text"][i],
                    "confidence": float(result["conf"][i]) / 100,
                    "bbox": {
                        "x": result["left"][i],
                        "y": result["top"][i],
                        "width": result["width"][i],
                        "height": result["height"][i]
                    },
                    "line_num": result["line_num"][i],
                    "block_num": result["block_num"][i]
                })
                
        # 计算整体置信度
        valid_confidences = [float(conf) for conf in result["conf"] if conf > 0]
        avg_confidence = sum(valid_confidences) / len(valid_confidences) if valid_confidences else 0
        
        return {
            "text_results": text_results,
            "confidence": avg_confidence / 100
        }
        
    def process_task(self, task_id: str, image_data: Optional[str] = None, bbox: Optional[Dict[str, float]] = None) -> None:
        """处理OCR任务"""
        try:
            task_manager.set_task_progress(task_id, 10)
            
            if not image_data:
                raise ValueError("未提供图像数据")
                
            # 解码图像数据
            image = self.decode_base64_image(image_data)
            if image is None:
                raise ValueError("图像数据解码失败")
                
            # 如果指定了边界框，裁剪图像
            if bbox:
                x, y = int(bbox["x"]), int(bbox["y"])
                w, h = int(bbox["width"]), int(bbox["height"])
                image = image[y:y+h, x:x+w]
                
            task_manager.set_task_progress(task_id, 30)
            
            # 执行OCR识别
            result = self.recognize_text(image)
            
            task_manager.set_task_progress(task_id, 90)
            task_manager.set_task_result(task_id, result)
            
        except Exception as e:
            task_manager.set_task_error(task_id, str(e))

# 创建全局OCR处理器实例
ocr_processor = OCRProcessor() 