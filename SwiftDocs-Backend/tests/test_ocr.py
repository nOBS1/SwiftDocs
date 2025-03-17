import pytest
from fastapi.testclient import TestClient
from ..app.main import app
from ..app.core.ocr_processor import ocr_processor
import base64
import os

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
def test_image():
    # 创建一个简单的测试图像
    image_path = "tests/data/test_image.png"
    if not os.path.exists(os.path.dirname(image_path)):
        os.makedirs(os.path.dirname(image_path))
    
    # 将图像转换为Base64
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode()

@pytest.mark.asyncio
async def test_create_ocr_task(test_client, test_image):
    """测试创建OCR任务"""
    response = test_client.post(
        "/api/v1/ocr/process",
        json={
            "image_data": test_image,
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
async def test_upload_image(test_client):
    """测试上传图像文件"""
    # 创建测试图像文件
    image_path = "tests/data/test_upload.png"
    if not os.path.exists(os.path.dirname(image_path)):
        os.makedirs(os.path.dirname(image_path))
    
    with open(image_path, "rb") as f:
        response = test_client.post(
            "/api/v1/ocr/upload",
            files={"file": ("test.png", f, "image/png")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "taskId" in data

@pytest.mark.asyncio
async def test_get_ocr_task(test_client, test_image):
    """测试获取OCR任务状态"""
    # 先创建一个任务
    response = test_client.post(
        "/api/v1/ocr/process",
        json={
            "image_data": test_image
        }
    )
    
    task_id = response.json()["taskId"]
    
    # 获取任务状态
    response = test_client.get(f"/api/v1/ocr/task/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["taskId"] == task_id

@pytest.mark.asyncio
async def test_cancel_ocr_task(test_client, test_image):
    """测试取消OCR任务"""
    # 先创建一个任务
    response = test_client.post(
        "/api/v1/ocr/process",
        json={
            "image_data": test_image
        }
    )
    
    task_id = response.json()["taskId"]
    
    # 取消任务
    response = test_client.delete(f"/api/v1/ocr/task/{task_id}")
    assert response.status_code == 200
    
    # 确认任务已取消
    response = test_client.get(f"/api/v1/ocr/task/{task_id}")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_invalid_image_data(test_client):
    """测试无效的图像数据"""
    response = test_client.post(
        "/api/v1/ocr/process",
        json={
            "image_data": "invalid_base64"
        }
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "图像数据解码失败" in data["message"]

@pytest.mark.asyncio
async def test_invalid_file_type(test_client):
    """测试无效的文件类型"""
    with open("tests/data/test.txt", "wb") as f:
        f.write(b"test")
    
    with open("tests/data/test.txt", "rb") as f:
        response = test_client.post(
            "/api/v1/ocr/upload",
            files={"file": ("test.txt", f, "text/plain")}
        )
    
    assert response.status_code == 400
    data = response.json()
    assert "只支持图像文件" in data["message"] 