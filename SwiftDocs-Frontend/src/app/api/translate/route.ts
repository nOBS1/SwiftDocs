import { NextResponse } from 'next/server';
import { Provider, TargetLanguage, TranslationProvider } from '@/types';
import { translateText } from '@/lib/translators';
import { cookies } from 'next/headers';

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

const FREE_DAILY_LIMIT = 5;

export async function POST(req: NextRequest) {
  try {
    const { text, service, targetLang, apiKeys } = await req.json();
    
    // 获取 Cookie
    const cookieStore = cookies();
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `pdf_translator_usage_${today}`;
    
    // 获取当前使用次数
    let currentUsage = parseInt(cookieStore.get(usageKey)?.value || '0', 10);
    
    // 获取分享奖励
    const shareBonus = parseInt(cookieStore.get('pdf_translator_share_bonus')?.value || '0', 10);
    
    // 计算总可用次数
    const totalLimit = FREE_DAILY_LIMIT + shareBonus;
    
    // 检查是否超出限制
    if (currentUsage >= totalLimit) {
      return NextResponse.json({
        error: '您今日的免费使用次数已用完',
        limitReached: true,
        remaining: 0,
        shareLink: `${process.env.NEXT_PUBLIC_APP_URL}/share?ref=${cookieStore.get('pdf_translator_user_id')?.value || ''}`
      }, { status: 403 });
    }
    
    // 增加使用次数
    currentUsage += 1;
    const response = NextResponse.next();
    response.cookies.set(usageKey, currentUsage.toString(), { 
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/'
    });
    
    // 检查环境变量中的API密钥
    let apiKeyMissing = false;
    let apiKeyName = '';
    
    // 如果用户提供了API密钥，则使用用户提供的密钥
    // 否则检查环境变量中是否有密钥
    const userApiKeys = apiKeys || {};
    
    if (service === 'openai' && !process.env.OPENAI_API_KEY && !userApiKeys.openai) {
      apiKeyMissing = true;
      apiKeyName = 'OpenAI API密钥';
    } else if (service === 'deepseek' && !process.env.DEEPSEEK_API_KEY && !userApiKeys.deepseek) {
      // 对于 DeepSeek，我们有默认密钥，所以不需要检查
      apiKeyMissing = false;
    } else if (service === 'google' && !process.env.GOOGLE_API_KEY && !userApiKeys.google) {
      apiKeyMissing = true;
      apiKeyName = 'Google API密钥';
    } else if (service === 'baidu' && (!process.env.BAIDU_APP_ID || !process.env.BAIDU_APP_KEY) && 
               (!userApiKeys.baidu_app_id || !userApiKeys.baidu_app_key)) {
      apiKeyMissing = true;
      apiKeyName = '百度翻译API密钥';
    }
    
    if (apiKeyMissing) {
      return NextResponse.json({
        originalText: text,
        translatedText: `[错误] 未配置${apiKeyName}，请在设置页面配置API密钥`,
        provider: service,
        targetLanguage: targetLang,
        usageInfo: {
          used: currentUsage,
          limit: totalLimit,
          remaining: totalLimit - currentUsage
        },
        timestamp: Date.now()
      });
    }
    
    // 调用翻译服务
    const translationResult = await translateText({
      text,
      provider: service as TranslationProvider,
      targetLanguage: targetLang,
      apiKeys: userApiKeys // 传递用户配置的API密钥
    });
    
    // 返回翻译结果
    return NextResponse.json({
      ...translationResult,
      usageInfo: {
        used: currentUsage,
        limit: totalLimit,
        remaining: totalLimit - currentUsage
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('翻译错误:', error);
    return NextResponse.json(
      { error: '翻译过程中发生错误' },
      { status: 500 }
    );
  }
} 