import json
import httpx
import hashlib
import time
import random
from typing import Optional, Dict, Any
from .config import settings
from .task_manager import task_manager

class TranslationProcessor:
    """翻译处理器类，用于处理文本翻译"""
    
    def __init__(self):
        """初始化翻译处理器"""
        self.providers = {
            "openai": self._translate_with_openai,
            "deepseek": self._translate_with_deepseek,
            "baidu": self._translate_with_baidu,
            "google": self._translate_with_google
        }
        
    async def _translate_with_openai(self, text: str, target_lang: str, api_key: str) -> str:
        """使用OpenAI进行翻译"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": f"你是一个专业的翻译助手。请将以下文本翻译成{target_lang}，保持原文的格式和语气。只返回翻译结果，不要包含任何解释或其他内容。"},
                        {"role": "user", "content": text}
                    ],
                    "temperature": 0.3
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise ValueError(f"OpenAI API请求失败: {response.text}")
                
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
            
    async def _translate_with_deepseek(self, text: str, target_lang: str, api_key: str) -> str:
        """使用DeepSeek进行翻译"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": f"你是一个专业的翻译助手。请将以下文本翻译成{target_lang}，保持原文的格式和语气。只返回翻译结果，不要包含任何解释或其他内容。"},
                        {"role": "user", "content": text}
                    ],
                    "temperature": 0.3
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise ValueError(f"DeepSeek API请求失败: {response.text}")
                
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
            
    async def _translate_with_baidu(self, text: str, target_lang: str, app_id: str, app_key: str) -> str:
        """使用百度翻译API进行翻译"""
        # 准备请求参数
        salt = str(random.randint(32768, 65536))
        sign = hashlib.md5(f"{app_id}{text}{salt}{app_key}".encode()).hexdigest()
        
        params = {
            "q": text,
            "from": "auto",
            "to": target_lang,
            "appid": app_id,
            "salt": salt,
            "sign": sign
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.fanyi.baidu.com/api/trans/vip/translate",
                params=params,
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise ValueError(f"百度翻译API请求失败: {response.text}")
                
            result = response.json()
            if "error_code" in result:
                raise ValueError(f"百度翻译API错误: {result['error_msg']}")
                
            return "\n".join(item["dst"] for item in result["trans_result"])
            
    async def _translate_with_google(self, text: str, target_lang: str, api_key: str) -> str:
        """使用Google Cloud Translation API进行翻译"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://translation.googleapis.com/language/translate/v2?key={api_key}",
                json={
                    "q": text,
                    "target": target_lang,
                    "format": "text"
                },
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise ValueError(f"Google翻译API请求失败: {response.text}")
                
            result = response.json()
            return result["data"]["translations"][0]["translatedText"]
            
    def validate_api_keys(self, provider: str, api_keys: Dict[str, str]) -> bool:
        """验证API密钥配置"""
        if provider == "openai":
            return bool(api_keys.get("openai"))
        elif provider == "deepseek":
            return bool(api_keys.get("deepseek"))
        elif provider == "baidu":
            return bool(api_keys.get("baidu_app_id")) and bool(api_keys.get("baidu_app_key"))
        elif provider == "google":
            return bool(api_keys.get("google"))
        return False
        
    async def process_task(
        self,
        task_id: str,
        text: str,
        provider: str,
        target_lang: str,
        api_keys: Dict[str, str]
    ) -> None:
        """处理翻译任务"""
        try:
            # 验证API密钥
            if not self.validate_api_keys(provider, api_keys):
                raise ValueError(f"未配置{provider}的API密钥")
                
            # 验证翻译提供商
            if provider not in self.providers:
                raise ValueError(f"不支持的翻译提供商: {provider}")
                
            task_manager.set_task_progress(task_id, 10)
            
            # 执行翻译
            if provider == "baidu":
                translated_text = await self._translate_with_baidu(
                    text,
                    target_lang,
                    api_keys["baidu_app_id"],
                    api_keys["baidu_app_key"]
                )
            else:
                translated_text = await self.providers[provider](
                    text,
                    target_lang,
                    api_keys[provider]
                )
                
            task_manager.set_task_progress(task_id, 90)
            
            # 设置任务结果
            task_manager.set_task_result(task_id, {
                "translated_text": translated_text,
                "source_text": text,
                "target_language": target_lang,
                "provider": provider
            })
            
        except Exception as e:
            task_manager.set_task_error(task_id, str(e))

# 创建全局翻译处理器实例
translation_processor = TranslationProcessor() 