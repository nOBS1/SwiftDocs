import pytest
import os
from pathlib import Path
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.pdfmath_service import PDFMathService
from app.core.exceptions import PDFMathError

@pytest.fixture
def pdfmath_service():
    return PDFMathService()

@pytest.fixture
def sample_pdf_path(tmp_path):
    pdf_path = tmp_path / "test.pdf"
    pdf_path.write_bytes(b"%PDF-1.4")  # 创建一个最小的PDF文件
    return str(pdf_path)

@pytest.mark.asyncio
async def test_translate_pdf_success(pdfmath_service, sample_pdf_path):
    """测试PDF翻译成功的情况"""
    with patch("asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_exec:
        # 模拟进程执行
        mock_process = AsyncMock()
        mock_process.communicate.return_value = (b"", b"")
        mock_process.returncode = 0
        mock_exec.return_value = mock_process
        
        # 模拟输出文件
        output_dir = os.path.join(os.path.dirname(sample_pdf_path), "output")
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, "translated.pdf")
        Path(output_file).touch()
        
        result = await pdfmath_service.translate_pdf(
            sample_pdf_path,
            "zh",
            "openai",
            {"openai": "test-key"}
        )
        
        assert result["status"] == "success"
        assert "output_file" in result
        assert result["message"] == "翻译完成"

@pytest.mark.asyncio
async def test_translate_pdf_file_not_found(pdfmath_service):
    """测试PDF文件不存在的情况"""
    with pytest.raises(PDFMathError) as exc_info:
        await pdfmath_service.translate_pdf(
            "nonexistent.pdf",
            "zh",
            "openai",
            {"openai": "test-key"}
        )
    assert "PDF文件不存在" in str(exc_info.value)

@pytest.mark.asyncio
async def test_translate_pdf_process_error(pdfmath_service, sample_pdf_path):
    """测试翻译进程执行失败的情况"""
    with patch("asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_exec:
        mock_process = AsyncMock()
        mock_process.communicate.return_value = (b"", b"Error message")
        mock_process.returncode = 1
        mock_exec.return_value = mock_process
        
        with pytest.raises(PDFMathError) as exc_info:
            await pdfmath_service.translate_pdf(
                sample_pdf_path,
                "zh",
                "openai",
                {"openai": "test-key"}
            )
        assert "翻译失败" in str(exc_info.value)

@pytest.mark.asyncio
async def test_extract_math_success(pdfmath_service, sample_pdf_path):
    """测试数学公式提取成功的情况"""
    with patch("asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_exec:
        # 模拟进程执行
        mock_process = AsyncMock()
        mock_process.communicate.return_value = (b"", b"")
        mock_process.returncode = 0
        mock_exec.return_value = mock_process
        
        # 模拟输出文件
        math_dir = os.path.join(os.path.dirname(sample_pdf_path), "math")
        os.makedirs(math_dir, exist_ok=True)
        math_file = os.path.join(math_dir, "math.json")
        with open(math_file, "w") as f:
            f.write('{"formulas": []}')
        
        result = await pdfmath_service.extract_math(sample_pdf_path)
        
        assert result["status"] == "success"
        assert "math_expressions" in result
        assert result["message"] == "公式提取完成"

@pytest.mark.asyncio
async def test_extract_math_process_error(pdfmath_service, sample_pdf_path):
    """测试数学公式提取失败的情况"""
    with patch("asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_exec:
        mock_process = AsyncMock()
        mock_process.communicate.return_value = (b"", b"Error message")
        mock_process.returncode = 1
        mock_exec.return_value = mock_process
        
        with pytest.raises(PDFMathError) as exc_info:
            await pdfmath_service.extract_math(sample_pdf_path)
        assert "公式提取失败" in str(exc_info.value)

@pytest.mark.asyncio
async def test_validate_installation_success(pdfmath_service):
    """测试安装验证成功的情况"""
    with patch("asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_exec:
        mock_process = AsyncMock()
        mock_process.communicate.return_value = (b"pdf2zh version 1.0.0", b"")
        mock_process.returncode = 0
        mock_exec.return_value = mock_process
        
        result = await pdfmath_service.validate_installation()
        assert result is True

@pytest.mark.asyncio
async def test_validate_installation_failure(pdfmath_service):
    """测试安装验证失败的情况"""
    with patch("asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_exec:
        mock_process = AsyncMock()
        mock_process.communicate.return_value = (b"", b"Command not found")
        mock_process.returncode = 1
        mock_exec.return_value = mock_process
        
        result = await pdfmath_service.validate_installation()
        assert result is False 