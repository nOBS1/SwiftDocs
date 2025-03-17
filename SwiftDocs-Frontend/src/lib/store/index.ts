import { create } from 'zustand';
import { TranslationProvider, TargetLanguage, TranslationResult, PDFPage } from '@/types';

interface TranslationState {
  // PDF文件状态
  file: File | null;
  fileName: string;
  fileSize: number;
  pages: PDFPage[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  
  // 翻译设置
  provider: TranslationProvider;
  targetLanguage: TargetLanguage;
  
  // 翻译结果
  translationResults: TranslationResult[];
  translationStatus: 'idle' | 'loading' | 'success' | 'error';
  translationError: string | null;
  
  // 操作方法
  setFile: (file: File | null) => void;
  setPages: (pages: PDFPage[]) => void;
  setCurrentPage: (page: number) => void;
  setProvider: (provider: TranslationProvider) => void;
  setTargetLanguage: (language: TargetLanguage) => void;
  setTranslationResults: (results: TranslationResult[]) => void;
  setTranslationStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void;
  setTranslationError: (error: string | null) => void;
  resetState: () => void;
}

const initialState = {
  file: null,
  fileName: '',
  fileSize: 0,
  pages: [],
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  provider: 'openai' as TranslationProvider,
  targetLanguage: 'zh-CN' as TargetLanguage,
  translationResults: [],
  translationStatus: 'idle' as 'idle' | 'loading' | 'success' | 'error',
  translationError: null,
};

export const useTranslationStore = create<TranslationState>((set) => ({
  ...initialState,
  
  setFile: (file: File | null) => set((state) => ({
    file,
    fileName: file ? file.name : '',
    fileSize: file ? file.size : 0,
    isLoading: !!file,
  })),
  
  setPages: (pages: PDFPage[]) => set((state) => ({
    pages,
    totalPages: pages.length,
    isLoading: false,
  })),
  
  setCurrentPage: (page: number) => set((state) => ({
    currentPage: page,
  })),
  
  setProvider: (provider: TranslationProvider) => set((state) => ({
    provider,
  })),
  
  setTargetLanguage: (language: TargetLanguage) => set((state) => ({
    targetLanguage: language,
  })),
  
  setTranslationResults: (results: TranslationResult[]) => set((state) => ({
    translationResults: results,
  })),
  
  setTranslationStatus: (status: 'idle' | 'loading' | 'success' | 'error') => set((state) => ({
    translationStatus: status,
  })),
  
  setTranslationError: (error: string | null) => set((state) => ({
    translationError: error,
  })),
  
  resetState: () => set(initialState),
})); 