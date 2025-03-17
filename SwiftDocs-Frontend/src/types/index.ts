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

// API密钥接口
export interface ApiKeys {
  openai?: string;
  deepseek?: string;
  baidu_app_id?: string;
  baidu_app_key?: string;
  google?: string;
  azure?: string;
}

// 翻译模式
export type TranslationMode = 'selection' | 'full';

// OCR结果
export interface OCRResult {
  text: string;
  bbox: BoundingBox;
  confidence: number;
}

// 边界框
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

// PDF布局分析结果
export interface LayoutAnalysis {
  sections: Section[];
  metadata: DocumentMetadata;
}

// 文档区块
export interface Section {
  type: 'text' | 'math' | 'table' | 'image' | 'code';
  content: string;
  bbox: BoundingBox;
  properties?: Record<string, any>;
}

// 文档元数据
export interface DocumentMetadata {
  title?: string;
  author?: string;
  keywords?: string[];
  language?: string;
  pageCount: number;
}

// 翻译任务状态
export interface TranslationTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mode: TranslationMode;
  progress: number;
  result?: TranslationResult;
  error?: string;
  created_at: string;
  updated_at: string;
}

// 更新翻译请求参数
export interface TranslationRequest {
  text: string;
  provider: TranslationProvider;
  targetLanguage: TargetLanguage;
  mode: TranslationMode;
  apiKeys?: ApiKeys;
  taskId?: string;
  bbox?: BoundingBox;
}

// 更新翻译响应
export interface TranslationResponse {
  taskId: string;
  status: TranslationTask['status'];
  progress: number;
  result?: {
    originalText: string;
    translatedText: string;
    provider: TranslationProvider;
    targetLanguage: TargetLanguage;
    timestamp: number;
    bbox?: BoundingBox;
  };
  error?: string;
}

// WebSocket消息
export interface WebSocketMessage {
  type: 'task_update' | 'error';
  data: TranslationTask | Error;
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