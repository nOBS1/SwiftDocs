import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Provider, 
  TargetLanguage, 
  TranslationResult 
} from '@/types';

interface TranslationProgress {
  status: 'idle' | 'uploading' | 'extracting' | 'translating' | 'completed' | 'error';
  message: string;
  progress: number;
}

interface TranslationState {
  // 文件状态
  file: File | null;
  fileName: string;
  fileContent: string;
  
  // 翻译设置
  provider: Provider;
  targetLanguage: TargetLanguage;
  
  // 翻译进度和结果
  progress: TranslationProgress;
  result: TranslationResult | null;
  
  // PDF页面信息
  pages: number;
  currentPage: number;
  
  // 历史记录
  history: TranslationResult[];
  
  // 操作方法
  setFile: (file: File | null) => void;
  setFileContent: (content: string) => void;
  setProvider: (provider: Provider) => void;
  setTargetLanguage: (language: TargetLanguage) => void;
  setProgress: (progress: Partial<TranslationProgress>) => void;
  setResult: (translatedText: string) => void;
  setPages: (pages: number) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
  saveToHistory: () => void;
}

// 初始状态
const initialState = {
  file: null,
  fileName: '',
  fileContent: '',
  provider: 'google' as Provider,
  targetLanguage: 'zh-CN' as TargetLanguage,
  progress: {
    status: 'idle',
    message: '',
    progress: 0
  } as TranslationProgress,
  result: null,
  pages: 0,
  currentPage: 1,
  history: []
};

// 创建存储
export const useTranslationStore = create<TranslationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 设置文件
      setFile: (file) => set({ 
        file,
        fileName: file ? file.name : '',
        // 重置相关状态
        fileContent: '',
        result: null,
        progress: {
          status: file ? 'uploading' : 'idle',
          message: file ? '正在处理文件...' : '',
          progress: 0
        }
      }),
      
      // 设置文件内容
      setFileContent: (content) => set({ 
        fileContent: content,
        progress: {
          status: 'extracting',
          message: '文本提取完成',
          progress: 30
        }
      }),
      
      // 设置翻译提供商
      setProvider: (provider) => set({ provider }),
      
      // 设置目标语言
      setTargetLanguage: (targetLanguage) => set({ targetLanguage }),
      
      // 更新进度
      setProgress: (progress) => set((state) => ({ 
        progress: { ...state.progress, ...progress } 
      })),
      
      // 设置翻译结果
      setResult: (translatedText) => {
        const state = get();
        const result = {
          id: uuidv4(),
          fileName: state.fileName,
          originalText: state.fileContent,
          translatedText,
          provider: state.provider as any, // 类型转换以避免错误
          targetLanguage: state.targetLanguage,
          timestamp: Date.now(),
          pages: state.pages,
          currentPage: state.currentPage
        };
        
        set({ 
          result,
          progress: {
            status: 'completed',
            message: '翻译完成',
            progress: 100
          }
        });
        
        // 自动保存到历史记录
        get().saveToHistory();
      },
      
      // 设置页面总数
      setPages: (pages) => set({ pages }),
      
      // 设置当前页面
      setCurrentPage: (currentPage) => set({ currentPage }),
      
      // 重置状态
      reset: () => set({
        ...initialState,
        provider: get().provider,
        targetLanguage: get().targetLanguage,
        history: get().history
      }),
      
      // 保存到历史记录
      saveToHistory: () => {
        const { result, history } = get();
        if (result) {
          // 避免重复添加
          const exists = history.some(item => item.id === result.id);
          if (!exists) {
            const updatedHistory = [result, ...history];
            set({ history: updatedHistory });
            
            // 保存到localStorage (备份)
            try {
              localStorage.setItem('translationResults', JSON.stringify(updatedHistory));
            } catch (error) {
              console.error('保存历史记录失败:', error);
            }
          }
        }
      }
    }),
    {
      name: 'translation-storage',
      partialize: (state) => ({
        provider: state.provider,
        targetLanguage: state.targetLanguage,
        history: state.history
      })
    }
  )
); 