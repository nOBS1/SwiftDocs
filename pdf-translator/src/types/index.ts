// 翻译服务提供商
export type TranslationProvider = 'openai' | 'deepseek' | 'baidu' | 'google';
// 兼容性类型别名
export type Provider = TranslationProvider | 'deepl' | 'azure';

// 支持的语言
export type Language = 
  | 'zh' // 中文
  | 'en' // 英文
  | 'ja' // 日语
  | 'ko' // 韩语
  | 'fr' // 法语
  | 'de' // 德语
  | 'es' // 西班牙语
  | 'ru' // 俄语
  | 'it' // 意大利语
  | 'pt'; // 葡萄牙语

// 目标语言代码
export type TargetLanguage = 
  | 'zh-CN' // 简体中文
  | 'zh-TW' // 繁体中文
  | 'en-US' // 美式英语
  | 'en-GB' // 英式英语
  | 'ja-JP' // 日语
  | 'ko-KR' // 韩语
  | 'fr-FR' // 法语
  | 'de-DE' // 德语
  | 'es-ES' // 西班牙语
  | 'ru-RU' // 俄语
  | 'it-IT' // 意大利语
  | 'pt-PT'; // 葡萄牙语

// 语言名称映射
export const LANGUAGE_NAMES: Record<Language, string> = {
  zh: '中文',
  en: '英文',
  ja: '日语',
  ko: '韩语',
  fr: '法语',
  de: '德语',
  es: '西班牙语',
  ru: '俄语',
  it: '意大利语',
  pt: '葡萄牙语'
};

// 目标语言名称映射
export const TARGET_LANGUAGE_NAMES: Record<TargetLanguage, string> = {
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

// 翻译服务提供商名称映射
export const PROVIDER_NAMES: Record<Provider, string> = {
  openai: 'OpenAI (大模型AI)',
  deepseek: 'DeepSeek (大模型AI)',
  baidu: '百度翻译',
  google: '谷歌翻译',
  deepl: 'DeepL',
  azure: 'Azure AI翻译'
};

// 翻译请求参数
export interface TranslationRequest {
  text: string;
  provider: TranslationProvider;
  targetLanguage: TargetLanguage;
}

// 翻译响应
export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  provider: TranslationProvider;
  targetLanguage: TargetLanguage;
  timestamp: number;
}

// 翻译结果
export interface TranslationResult {
  id: string;
  originalText: string;
  translatedText: string;
  provider: TranslationProvider;
  targetLanguage: TargetLanguage;
  fileName: string;
  timestamp: number;
}

// PDF页面
export interface PDFPage {
  pageNumber: number;
  text: string;
  textItems: PDFTextItem[];
}

// PDF文本项
export interface PDFTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
  fontSize?: number;
}

// PDF文件信息
export interface PDFFile {
  id: string;
  name: string;
  size: number;
  text: string;
  timestamp: number;
} 