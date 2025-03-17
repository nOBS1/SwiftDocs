import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// 创建axios实例
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API端点
export const endpoints = {
  // 文档相关
  documents: {
    upload: '/documents/upload',
    list: '/documents',
    get: (id: string) => `/documents/${id}`,
    delete: (id: string) => `/documents/${id}`,
  },
  
  // OCR相关
  ocr: {
    process: '/ocr/process',
    status: (taskId: string) => `/ocr/status/${taskId}`,
  },
  
  // 翻译相关
  translate: {
    text: '/translate/text',
    document: '/translate/document',
    status: (taskId: string) => `/translate/status/${taskId}`,
  },
  
  // 系统相关
  system: {
    health: '/health',
  },
};

// API类型定义
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 导出API方法
export const apiClient = {
  // 文档上传
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<APIResponse>(endpoints.documents.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 获取文档列表
  async getDocuments() {
    return api.get<APIResponse>(endpoints.documents.list);
  },

  // 获取单个文档
  async getDocument(id: string) {
    return api.get<APIResponse>(endpoints.documents.get(id));
  },

  // 删除文档
  async deleteDocument(id: string) {
    return api.delete<APIResponse>(endpoints.documents.delete(id));
  },

  // OCR处理
  async processOCR(imageData: string) {
    return api.post<APIResponse>(endpoints.ocr.process, { image: imageData });
  },

  // 获取OCR状态
  async getOCRStatus(taskId: string) {
    return api.get<APIResponse>(endpoints.ocr.status(taskId));
  },

  // 文本翻译
  async translateText(text: string, sourceLang: string, targetLang: string) {
    return api.post<APIResponse>(endpoints.translate.text, {
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
    });
  },

  // 文档翻译
  async translateDocument(documentId: string, targetLang: string) {
    return api.post<APIResponse>(endpoints.translate.document, {
      document_id: documentId,
      target_lang: targetLang,
    });
  },

  // 获取翻译状态
  async getTranslationStatus(taskId: string) {
    return api.get<APIResponse>(endpoints.translate.status(taskId));
  },

  // 健康检查
  async checkHealth() {
    return api.get<APIResponse>(endpoints.system.health);
  },
}; 