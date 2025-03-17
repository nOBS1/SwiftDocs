import pytesseract
import numpy as np
import cv2
from PIL import Image
import io
import base64
from typing import Optional, Tuple, List
import logging
from concurrent.futures import ThreadPoolExecutor
from ..core.config import settings

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
        self.executor = ThreadPoolExecutor(max_workers=4)

    async def process_image(
        self,
        image_data: str,
        language: str = "eng",
        bbox: Optional[Tuple[int, int, int, int]] = None
    ) -> dict:
        """处理图像并执行OCR"""
        try:
            # 解码Base64图像
            image = self._decode_image(image_data)
            if image is None:
                raise ValueError("无法解码图像数据")

            # 预处理图像
            processed_image = await self._preprocess_image(image)

            # 如果提供了边界框，裁剪图像
            if bbox:
                processed_image = self._crop_image(processed_image, bbox)

            # 执行OCR
            result = await self._run_ocr(processed_image, language)
            return result

        except Exception as e:
            logger.error(f"OCR处理失败: {str(e)}")
            raise

    def _decode_image(self, image_data: str) -> Optional[np.ndarray]:
        """解码Base64图像数据"""
        try:
            # 移除Base64前缀（如果存在）
            if "base64," in image_data:
                image_data = image_data.split("base64,")[1]

            # 解码Base64数据
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        except Exception as e:
            logger.error(f"图像解码失败: {str(e)}")
            return None

    async def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """异步预处理图像"""
        return await self.executor.submit(self._preprocess_image_sync, image)

    def _preprocess_image_sync(self, image: np.ndarray) -> np.ndarray:
        """同步预处理图像"""
        try:
            # 转换为灰度图
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 自适应阈值处理
            binary = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # 降噪
            denoised = cv2.fastNlMeansDenoising(binary)
            
            # 锐化
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            sharpened = cv2.filter2D(denoised, -1, kernel)
            
            return sharpened
        except Exception as e:
            logger.error(f"图像预处理失败: {str(e)}")
            return image

    def _crop_image(
        self,
        image: np.ndarray,
        bbox: Tuple[int, int, int, int]
    ) -> np.ndarray:
        """根据边界框裁剪图像"""
        try:
            x, y, w, h = bbox
            height, width = image.shape[:2]
            
            # 确保坐标在有效范围内
            x = max(0, min(x, width))
            y = max(0, min(y, height))
            w = max(0, min(w, width - x))
            h = max(0, min(h, height - y))
            
            return image[y:y+h, x:x+w]
        except Exception as e:
            logger.error(f"图像裁剪失败: {str(e)}")
            return image

    async def _run_ocr(self, image: np.ndarray, language: str) -> dict:
        """异步执行OCR"""
        return await self.executor.submit(self._run_ocr_sync, image, language)

    def _run_ocr_sync(self, image: np.ndarray, language: str) -> dict:
        """同步执行OCR"""
        try:
            # 执行OCR
            data = pytesseract.image_to_data(
                image,
                lang=language,
                output_type=pytesseract.Output.DICT
            )
            
            # 提取文本和置信度
            text_blocks = []
            confidences = []
            
            for i, text in enumerate(data['text']):
                if text.strip():
                    text_blocks.append(text)
                    confidences.append(float(data['conf'][i]))
            
            # 计算平均置信度
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                'text': ' '.join(text_blocks),
                'confidence': avg_confidence,
                'language': language
            }
        except Exception as e:
            logger.error(f"OCR执行失败: {str(e)}")
            raise

# 创建全局OCR服务实例
ocr_service = OCRService()
