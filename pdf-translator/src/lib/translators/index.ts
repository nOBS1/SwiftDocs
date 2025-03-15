import { TranslationProvider, TranslationRequest, TranslationResponse, TargetLanguage } from '@/types';

/**
 * 翻译文本
 * @param request 翻译请求
 * @returns 翻译响应
 */
export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  const { text, provider, targetLanguage } = request;
  
  try {
    let translatedText = '';
    
    // 根据选择的翻译服务进行翻译
    switch (provider) {
      case 'openai':
        translatedText = await translateWithOpenAI(text, targetLanguage);
        break;
      case 'deepseek':
        translatedText = await translateWithDeepSeek(text, targetLanguage);
        break;
      case 'baidu':
        translatedText = await translateWithBaidu(text, targetLanguage);
        break;
      case 'google':
        translatedText = await translateWithGoogle(text, targetLanguage);
        break;
      default:
        throw new Error(`不支持的翻译服务: ${provider}`);
    }
    
    return {
      originalText: text,
      translatedText,
      provider,
      targetLanguage,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`翻译失败 (${provider}):`, error);
    throw error;
  }
}

/**
 * 使用OpenAI API进行翻译
 * @param text 要翻译的文本
 * @param targetLanguage 目标语言
 * @returns 翻译后的文本
 */
export async function translateWithOpenAI(text: string, targetLanguage: TargetLanguage): Promise<string> {
  try {
    // 获取API密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('未配置OpenAI API密钥');
    }
    
    // 构建API请求
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的翻译助手。请将以下文本翻译成${getLanguageName(targetLanguage)}，保持原文的格式和语气，确保翻译准确、自然、流畅。只返回翻译结果，不要添加任何解释或额外内容。`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    throw new Error(`OpenAI翻译失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 使用DeepSeek API进行翻译
 * @param text 要翻译的文本
 * @param targetLanguage 目标语言
 * @returns 翻译后的文本
 */
export async function translateWithDeepSeek(text: string, targetLanguage: TargetLanguage): Promise<string> {
  try {
    // 获取API密钥
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('未配置DeepSeek API密钥');
    }
    
    // 构建API请求
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的翻译助手。请将以下文本翻译成${getLanguageName(targetLanguage)}，保持原文的格式和语气，确保翻译准确、自然、流畅。只返回翻译结果，不要添加任何解释或额外内容。`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API 错误: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error(`DeepSeek API 返回格式错误: ${JSON.stringify(data)}`);
    }
    
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('DeepSeek 翻译错误:', error);
    throw new Error(`DeepSeek翻译失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 使用百度翻译API进行翻译
 * @param text 要翻译的文本
 * @param targetLanguage 目标语言
 * @returns 翻译后的文本
 */
export async function translateWithBaidu(text: string, targetLanguage: TargetLanguage): Promise<string> {
  try {
    // 获取API密钥
    const appId = process.env.BAIDU_APP_ID;
    const appKey = process.env.BAIDU_APP_KEY;
    if (!appId || !appKey) {
      throw new Error('未配置百度翻译API密钥');
    }
    
    // 构建API请求
    const salt = Date.now().toString();
    const sign = await generateMD5(`${appId}${text}${salt}${appKey}`);
    
    const params = new URLSearchParams({
      q: text,
      from: 'auto',
      to: getBaiduLanguageCode(targetLanguage),
      appid: appId,
      salt: salt,
      sign: sign
    });
    
    const response = await fetch(`https://api.fanyi.baidu.com/api/trans/vip/translate?${params.toString()}`);
    const data = await response.json();
    
    if (data.error_code) {
      throw new Error(`百度翻译API错误: ${data.error_code} - ${data.error_msg}`);
    }
    
    return data.trans_result.map((item: any) => item.dst).join('\n');
  } catch (error) {
    throw new Error(`百度翻译失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 使用谷歌翻译API进行翻译
 * @param text 要翻译的文本
 * @param targetLanguage 目标语言
 * @returns 翻译后的文本
 */
export async function translateWithGoogle(text: string, targetLanguage: TargetLanguage): Promise<string> {
  try {
    // 获取API密钥
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('未配置谷歌翻译API密钥');
    }
    
    // 构建API请求
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        target: getGoogleLanguageCode(targetLanguage),
        format: 'text'
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`谷歌翻译API错误: ${data.error.message}`);
    }
    
    return data.data.translations[0].translatedText;
  } catch (error) {
    throw new Error(`谷歌翻译失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 生成MD5哈希（用于百度翻译API）
 * @param text 要哈希的文本
 * @returns MD5哈希值
 */
async function generateMD5(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 获取语言名称
 * @param targetLanguage 目标语言代码
 * @returns 语言名称
 */
function getLanguageName(targetLanguage: TargetLanguage): string {
  const languageMap: Record<TargetLanguage, string> = {
    'zh-CN': '简体中文',
    'zh-TW': '繁体中文',
    'en-US': '美式英语',
    'en-GB': '英式英语',
    'ja-JP': '日语',
    'ko-KR': '韩语',
    'fr-FR': '法语',
    'de-DE': '德语',
    'es-ES': '西班牙语',
    'ru-RU': '俄语',
    'it-IT': '意大利语',
    'pt-PT': '葡萄牙语'
  };
  
  return languageMap[targetLanguage] || targetLanguage;
}

/**
 * 获取百度翻译API的语言代码
 * @param targetLanguage 目标语言代码
 * @returns 百度翻译API的语言代码
 */
function getBaiduLanguageCode(targetLanguage: TargetLanguage): string {
  const languageMap: Record<TargetLanguage, string> = {
    'zh-CN': 'zh',
    'zh-TW': 'cht',
    'en-US': 'en',
    'en-GB': 'en',
    'ja-JP': 'jp',
    'ko-KR': 'kor',
    'fr-FR': 'fra',
    'de-DE': 'de',
    'es-ES': 'spa',
    'ru-RU': 'ru',
    'it-IT': 'it',
    'pt-PT': 'pt'
  };
  
  return languageMap[targetLanguage] || 'en';
}

/**
 * 获取谷歌翻译API的语言代码
 * @param targetLanguage 目标语言代码
 * @returns 谷歌翻译API的语言代码
 */
function getGoogleLanguageCode(targetLanguage: TargetLanguage): string {
  const languageMap: Record<TargetLanguage, string> = {
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'en-US': 'en',
    'en-GB': 'en-GB',
    'ja-JP': 'ja',
    'ko-KR': 'ko',
    'fr-FR': 'fr',
    'de-DE': 'de',
    'es-ES': 'es',
    'ru-RU': 'ru',
    'it-IT': 'it',
    'pt-PT': 'pt'
  };
  
  return languageMap[targetLanguage] || 'en';
} 