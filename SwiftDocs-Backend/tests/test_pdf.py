import pytest
from fastapi.testclient import TestClient
from ..app.main import app
from ..app.core.pdf_processor import PDFProcessor
import os

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
def test_pdf():
    # 创建一个简单的测试PDF文件
    pdf_path = "tests/data/test.pdf"
    if not os.path.exists(os.path.dirname(pdf_path)):
        os.makedirs(os.path.dirname(pdf_path))
    
    return pdf_path

@pytest.mark.asyncio
async def test_create_pdf_task(test_client, test_pdf):
    """测试创建PDF处理任务"""
    response = test_client.post(
        "/api/v1/pdf/process",
        json={
            "file_path": test_pdf,
            "mode": "text",
            "pages": [1],
            "bbox": {
                "x": 0,
                "y": 0,
                "width": 100,
                "height": 100,
                "page": 1
            }
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "taskId" in data
    assert data["status"] == "pending"
    assert data["progress"] == 0

@pytest.mark.asyncio
async def test_upload_pdf(test_client, test_pdf):
    """测试上传PDF文件"""
    with open(test_pdf, "rb") as f:
        response = test_client.post(
            "/api/v1/pdf/upload",
            files={"file": ("test.pdf", f, "application/pdf")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "taskId" in data

@pytest.mark.asyncio
async def test_get_pdf_task(test_client, test_pdf):
    """测试获取PDF任务状态"""
    # 先创建一个任务
    response = test_client.post(
        "/api/v1/pdf/process",
        json={
            "file_path": test_pdf,
            "mode": "text"
        }
    )
    
    task_id = response.json()["taskId"]
    
    # 获取任务状态
    response = test_client.get(f"/api/v1/pdf/task/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["taskId"] == task_id

@pytest.mark.asyncio
async def test_cancel_pdf_task(test_client, test_pdf):
    """测试取消PDF任务"""
    # 先创建一个任务
    response = test_client.post(
        "/api/v1/pdf/process",
        json={
            "file_path": test_pdf,
            "mode": "text"
        }
    )
    
    task_id = response.json()["taskId"]
    
    # 取消任务
    response = test_client.delete(f"/api/v1/pdf/task/{task_id}")
    assert response.status_code == 200
    
    # 确认任务已取消
    response = test_client.get(f"/api/v1/pdf/task/{task_id}")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_invalid_mode(test_client, test_pdf):
    """测试无效的处理模式"""
    response = test_client.post(
        "/api/v1/pdf/process",
        json={
            "file_path": test_pdf,
            "mode": "invalid_mode"
        }
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "不支持的处理模式" in data["message"]

@pytest.mark.asyncio
async def test_invalid_file_type(test_client):
    """测试无效的文件类型"""
    with open("tests/data/test.txt", "wb") as f:
        f.write(b"test")
    
    with open("tests/data/test.txt", "rb") as f:
        response = test_client.post(
            "/api/v1/pdf/upload",
            files={"file": ("test.txt", f, "text/plain")}
        )
    
    assert response.status_code == 400
    data = response.json()
    assert "只支持PDF文件" in data["message"]

@pytest.mark.asyncio
async def test_file_size_limit(test_client):
    """测试文件大小限制"""
    # 创建一个超过大小限制的文件
    large_file = "tests/data/large.pdf"
    if not os.path.exists(os.path.dirname(large_file)):
        os.makedirs(os.path.dirname(large_file))
    
    with open(large_file, "wb") as f:
        f.write(b"0" * (50 * 1024 * 1024 + 1))  # 50MB + 1 byte
    
    with open(large_file, "rb") as f:
        response = test_client.post(
            "/api/v1/pdf/upload",
            files={"file": ("large.pdf", f, "application/pdf")}
        )
    
    assert response.status_code == 400
    data = response.json()
    assert "文件大小超过限制" in data["message"] 