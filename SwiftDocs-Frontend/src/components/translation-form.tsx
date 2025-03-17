'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProviderSelector } from '@/components/provider-selector';
import { LanguageSelector } from '@/components/language-selector';
import { useTranslationStore } from '@/store/translation-store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Provider, TargetLanguage, TARGET_LANGUAGE_NAMES, PROVIDER_NAMES, ApiKeys } from '@/types';

export function TranslationForm() {
  const [isTranslating, setIsTranslating] = useState(false);
  
  // 从状态存储中获取状态和方法
  const { 
    fileContent, 
    fileName,
    provider, 
    targetLanguage, 
    progress,
    setProvider, 
    setTargetLanguage, 
    setProgress,
    setResult
  } = useTranslationStore();
  
  // 处理翻译
  const handleTranslate = async () => {
    // 检查是否有文件内容
    if (!fileContent) {
      toast('无法翻译', {
        description: '请先上传PDF文件',
        style: { backgroundColor: 'red', color: 'white' },
      });
      return;
    }
    
    // 获取API密钥
    let apiKeys: ApiKeys = {};
    
    try {
      const savedKeys = localStorage.getItem('api_keys');
      if (savedKeys) {
        apiKeys = JSON.parse(savedKeys);
      }
    } catch (error) {
      console.error('获取API密钥失败:', error);
    }
    
    // 对于DeepSeek，我们有默认密钥，所以不需要检查
    if (provider !== 'google' && provider !== 'deepseek') {
      let keyName = '';
      
      if (provider === 'openai' && !apiKeys.openai) {
        keyName = 'OpenAI';
      } else if (provider === 'baidu' && (!apiKeys.baidu_app_id || !apiKeys.baidu_app_key)) {
        keyName = '百度翻译';
      } else if (provider === 'azure' && !apiKeys.azure) {
        keyName = 'Azure AI翻译';
      }
      
      if (keyName) {
        toast('API密钥未配置', {
          description: `请在设置页面配置${keyName}的API密钥`,
          style: { backgroundColor: 'red', color: 'white' },
        });
        return;
      }
    }
    
    // 开始翻译
    setIsTranslating(true);
    setProgress({
      status: 'translating',
      message: '正在翻译...',
      progress: 80
    });
    
    try {
      // 调用翻译API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: fileContent,
          provider,
          targetLang: targetLanguage,
          fileName,
          apiKeys // 传递用户配置的API密钥
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '翻译请求失败');
      }
      
      const data = await response.json();
      
      // 设置翻译结果
      setResult(data.translatedText);
      
      toast('翻译完成', {
        description: `已使用${getProviderName(provider)}完成翻译`,
      });
    } catch (error) {
      console.error('翻译错误:', error);
      
      setProgress({
        status: 'error',
        message: '翻译失败',
        progress: 0
      });
      
      toast('翻译失败', {
        description: error instanceof Error ? error.message : '处理翻译请求时出错',
        style: { backgroundColor: 'red', color: 'white' },
      });
    } finally {
      setIsTranslating(false);
    }
  };
  
  // 获取提供商名称
  const getProviderName = (provider: Provider): string => {
    return PROVIDER_NAMES[provider] || provider;
  };
  
  // 获取语言名称
  const getLanguageName = (language: TargetLanguage): string => {
    return TARGET_LANGUAGE_NAMES[language] || language;
  };
  
  // 检查是否可以翻译
  const canTranslate = fileContent && progress.status !== 'translating' && progress.status !== 'error';
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>翻译设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">翻译服务</label>
          <ProviderSelector 
            value={provider} 
            onValueChange={setProvider} 
            disabled={isTranslating}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">目标语言</label>
          <LanguageSelector 
            value={targetLanguage} 
            onValueChange={setTargetLanguage} 
            disabled={isTranslating}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleTranslate}
          disabled={!canTranslate || isTranslating}
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              正在翻译...
            </>
          ) : (
            <>翻译为 {getLanguageName(targetLanguage)}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 