import subprocess
import os
import json
from typing import Optional, Dict, Any, List
from ..core.config import settings
from ..core.logger import logger
from ..core.exceptions import PDFMathError
import asyncio
from pathlib import Path

class PDFMathService:
    """PDFMathTranslate服务类"""
    
    def __init__(self):
        """初始化PDFMathTranslate服务"""
        self.python_path = settings.PDFMATH_PYTHON_PATH
        self.timeout = settings.PDFMATH_TIMEOUT
        
    async def translate_pdf(
        self,
        file_path: str,
        target_language: str,
        provider: str,
        api_keys: Dict[str, str]
    ) -> Dict[str, Any]:
        """翻译PDF文件"""
        try:
            # 验证文件是否存在
            if not os.path.exists(file_path):
                raise PDFMathError("PDF文件不存在")
            
            # 准备输出目录
            output_dir = os.path.join(os.path.dirname(file_path), "output")
            os.makedirs(output_dir, exist_ok=True)
            
            # 准备命令行参数
            args = [
                self.python_path,
                "-m",
                "pdf2zh",
                "translate",
                "--input", file_path,
                "--output", output_dir,
                "--target-language", target_language,
                "--provider", provider
            ]
            
            # 添加API密钥
            if provider == "openai":
                args.extend(["--openai-api-key", api_keys.get("openai", "")])
            elif provider == "deepseek":
                args.extend(["--deepseek-api-key", api_keys.get("deepseek", "")])
            elif provider == "google":
                args.extend(["--google-api-key", api_keys.get("google", "")])
            elif provider == "baidu":
                args.extend([
                    "--baidu-app-id", api_keys.get("baidu_app_id", ""),
                    "--baidu-app-key", api_keys.get("baidu_app_key", "")
                ])
            
            # 执行翻译
            process = await asyncio.create_subprocess_exec(
                *args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=self.timeout
                )
            except asyncio.TimeoutError:
                process.kill()
                raise PDFMathError("翻译超时")
            
            if process.returncode != 0:
                error_msg = stderr.decode().strip()
                raise PDFMathError(f"翻译失败: {error_msg}")
            
            # 获取输出文件路径
            output_file = self._get_output_file(output_dir)
            if not output_file:
                raise PDFMathError("未找到输出文件")
            
            return {
                "status": "success",
                "output_file": str(output_file),
                "message": "翻译完成"
            }
            
        except Exception as e:
            logger.error(f"PDF翻译失败: {str(e)}", exc_info=True)
            raise PDFMathError(f"PDF翻译失败: {str(e)}")
            
    def _get_output_file(self, output_dir: str) -> Optional[Path]:
        """获取输出文件路径"""
        try:
            output_dir = Path(output_dir)
            pdf_files = list(output_dir.glob("*.pdf"))
            return pdf_files[0] if pdf_files else None
        except Exception:
            return None
            
    async def extract_math(self, file_path: str) -> Dict[str, Any]:
        """提取数学公式"""
        try:
            # 验证文件是否存在
            if not os.path.exists(file_path):
                raise PDFMathError("PDF文件不存在")
            
            # 准备输出目录
            output_dir = os.path.join(os.path.dirname(file_path), "math")
            os.makedirs(output_dir, exist_ok=True)
            
            # 执行公式提取
            process = await asyncio.create_subprocess_exec(
                self.python_path,
                "-m",
                "pdf2zh",
                "extract-math",
                "--input", file_path,
                "--output", output_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=self.timeout
                )
            except asyncio.TimeoutError:
                process.kill()
                raise PDFMathError("公式提取超时")
            
            if process.returncode != 0:
                error_msg = stderr.decode().strip()
                raise PDFMathError(f"公式提取失败: {error_msg}")
            
            # 读取提取结果
            result_file = os.path.join(output_dir, "math.json")
            if not os.path.exists(result_file):
                raise PDFMathError("未找到公式提取结果")
            
            with open(result_file, "r", encoding="utf-8") as f:
                math_data = json.load(f)
            
            return {
                "status": "success",
                "math_expressions": math_data,
                "message": "公式提取完成"
            }
            
        except Exception as e:
            logger.error(f"公式提取失败: {str(e)}", exc_info=True)
            raise PDFMathError(f"公式提取失败: {str(e)}")
            
    async def validate_installation(self) -> bool:
        """验证PDFMathTranslate是否正确安装"""
        try:
            process = await asyncio.create_subprocess_exec(
                self.python_path,
                "-m",
                "pdf2zh",
                "--version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, _ = await process.communicate()
            return process.returncode == 0
            
        except Exception:
            return False

# 创建全局PDFMath服务实例
pdfmath_service = PDFMathService() 