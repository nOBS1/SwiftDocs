import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
from ..app.main import app
from ..app.core.translation_processor import translation_processor
from ..app.core.exceptions import ValidationError, APIError
import json

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
def api_keys():
    return {
        "openai": "test_openai_key",
        "deepseek": "test_deepseek_key",
        "baidu_app_id": "test_baidu_id",
        "baidu_app_key": "test_baidu_key",
        "google": "test_google_key"
    }

def test_validate_api_keys():
    """测试API密钥验证"""
    # 测试OpenAI
    assert translation_processor.validate_api_keys("openai", {"openai": "test_key"})
    assert not translation_processor.validate_api_keys("openai", {})
    
    # 测试百度翻译
    assert translation_processor.validate_api_keys(
        "baidu",
        {"baidu_app_id": "test_id", "baidu_app_key": "test_key"}
    )
    assert not translation_processor.validate_api_keys(
        "baidu",
        {"baidu_app_id": "test_id"}
    )

@pytest.mark.asyncio
async def test_create_translation_task(test_client, api_keys):
    """测试创建翻译任务"""
    response = test_client.post(
        "/api/v1/translation/translate",
        json={
            "text": "Hello, world!",
            "provider": "openai",
            "targetLanguage": "zh-CN",
            "mode": "full",
            "apiKeys": api_keys
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "taskId" in data
    assert data["status"] == "pending"
    assert data["progress"] == 0

@pytest.mark.asyncio
async def test_get_translation_task(test_client):
    """测试获取翻译任务状态"""
    # 先创建一个任务
    response = test_client.post(
        "/api/v1/translation/translate",
        json={
            "text": "Hello, world!",
            "provider": "openai",
            "targetLanguage": "zh-CN",
            "mode": "full",
            "apiKeys": {"openai": "test_key"}
        }
    )
    
    task_id = response.json()["taskId"]
    
    # 获取任务状态
    response = test_client.get(f"/api/v1/translation/task/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["taskId"] == task_id

@pytest.mark.asyncio
async def test_cancel_translation_task(test_client):
    """测试取消翻译任务"""
    # 先创建一个任务
    response = test_client.post(
        "/api/v1/translation/translate",
        json={
            "text": "Hello, world!",
            "provider": "openai",
            "targetLanguage": "zh-CN",
            "mode": "full",
            "apiKeys": {"openai": "test_key"}
        }
    )
    
    task_id = response.json()["taskId"]
    
    # 取消任务
    response = test_client.delete(f"/api/v1/translation/task/{task_id}")
    assert response.status_code == 200
    
    # 确认任务已取消
    response = test_client.get(f"/api/v1/translation/task/{task_id}")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_invalid_provider(test_client):
    """测试无效的翻译提供商"""
    response = test_client.post(
        "/api/v1/translation/translate",
        json={
            "text": "Hello, world!",
            "provider": "invalid_provider",
            "targetLanguage": "zh-CN",
            "mode": "full",
            "apiKeys": {}
        }
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "不支持的翻译服务提供商" in data["message"]

@pytest.mark.asyncio
async def test_missing_api_keys(test_client):
    """测试缺少API密钥"""
    response = test_client.post(
        "/api/v1/translation/translate",
        json={
            "text": "Hello, world!",
            "provider": "openai",
            "targetLanguage": "zh-CN",
            "mode": "full",
            "apiKeys": {}
        }
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "未配置" in data["message"] 