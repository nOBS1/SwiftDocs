import { NextResponse } from 'next/server';
import { Provider, TargetLanguage, TranslationProvider } from '@/types';
import { translateText } from '@/lib/translators';

// 获取简化的语言代码
function getSimpleLanguageCode(targetLanguage: TargetLanguage): string {
  // 从完整的语言代码中提取简化版本
  // 例如：'zh-CN' -> 'zh', 'en-US' -> 'en'
  return targetLanguage.split('-')[0];
}

// 模拟翻译API调用
async function mockTranslate(
  text: string, 
  provider: Provider, 
  targetLanguage: TargetLanguage,
  apiKey?: string
): Promise<string> {
  // 在实际应用中，这里会调用真实的翻译API
  // 例如Google Translate API, DeepL API, OpenAI API等
  
  // 检查API密钥
  if (!apiKey && provider !== 'google') {
    return `[错误] 未配置${provider}的API密钥，请在设置页面配置API密钥`;
  }
  
  // 为了演示，我们使用简单的模拟翻译
  await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟API延迟
  
  // 获取简化的语言代码
  const simpleCode = getSimpleLanguageCode(targetLanguage);
  
  // 根据目标语言返回不同的模拟翻译结果
  const prefixMap: Record<string, string> = {
    zh: '这是中文翻译: ',
    en: 'This is English translation: ',
    ja: 'これは日本語の翻訳です: ',
    ko: '이것은 한국어 번역입니다: ',
    fr: 'Ceci est une traduction française: ',
    de: 'Dies ist eine deutsche Übersetzung: ',
    es: 'Esta es una traducción al español: ',
    ru: 'Это русский перевод: ',
    it: 'Questa è una traduzione italiana: ',
    pt: 'Esta é uma tradução em português: '
  };
  
  const prefix = prefixMap[simpleCode] || 'Translation: ';
  
  // 添加提供商信息
  const providerInfo = `[通过 ${provider} 翻译]`;
  
  // 截取原文的前100个字符作为模拟翻译的一部分
  const sampleText = text.length > 100 ? text.substring(0, 100) + '...' : text;
  
  return `${prefix}${sampleText}\n\n${providerInfo}`;
}

export async function POST(request: Request) {
  try {
    const { text, provider, targetLanguage, fileName } = await request.json();
    
    // 验证请求参数
    if (!text) {
      return NextResponse.json(
        { error: '翻译文本不能为空' },
        { status: 400 }
      );
    }
    
    if (!provider || !targetLanguage) {
      return NextResponse.json(
        { error: '缺少翻译服务或目标语言参数' },
        { status: 400 }
      );
    }
    
    // 检查API密钥
    let apiKeyMissing = false;
    let apiKeyName = '';
    
    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
      apiKeyMissing = true;
      apiKeyName = 'OpenAI API密钥';
    } else if (provider === 'deepseek' && !process.env.DEEPSEEK_API_KEY) {
      apiKeyMissing = true;
      apiKeyName = 'DeepSeek API密钥';
    } else if (provider === 'google' && !process.env.GOOGLE_API_KEY) {
      apiKeyMissing = true;
      apiKeyName = 'Google API密钥';
    } else if (provider === 'baidu' && (!process.env.BAIDU_APP_ID || !process.env.BAIDU_APP_KEY)) {
      apiKeyMissing = true;
      apiKeyName = '百度翻译API密钥';
    }
    
    if (apiKeyMissing) {
      return NextResponse.json({
        originalText: text,
        translatedText: `[错误] 未配置${apiKeyName}，请在设置页面配置API密钥`,
        provider,
        targetLanguage,
        fileName,
        timestamp: Date.now()
      });
    }
    
    // 调用翻译服务
    const translationResult = await translateText({
      text,
      provider: provider as TranslationProvider,
      targetLanguage
    });
    
    // 返回翻译结果
    return NextResponse.json({
      ...translationResult,
      fileName,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('翻译API错误:', error);
    
    // 返回错误信息
    return NextResponse.json(
      { 
        error: '处理翻译请求时出错',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 