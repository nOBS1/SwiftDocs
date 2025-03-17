import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Provider, 
  TargetLanguage, 
  TranslationResult,
  TranslationMode,
  TranslationProvider,
  TranslationTask,
  OCRResult
} from '@/types';

interface TranslationProgress {
  status: 'idle' | 'uploading' | 'extracting' | 'translating' | 'completed' | 'error';
  message: string;
  progress: number;
}

interface TranslationState {
  // 文件状态
  file: File | null;
  fileContent: string | null;
  fileName: string | null;
  
  // 翻译设置
  mode: TranslationMode;
  provider: TranslationProvider;
  targetLanguage: TargetLanguage;
  
  // OCR结果
  ocrResult: OCRResult | null;
  
  // 任务状态
  currentTask: TranslationTask | null;
  tasks: TranslationTask[];
  
  // WebSocket连接
  socket: WebSocket | null;
  
  // 进度状态
  progress: {
    status: 'idle' | 'loading' | 'translating' | 'ready' | 'error';
    message: string;
    progress: number;
  };
  
  // 结果
  result: string | null;
  
  // 动作
  setFile: (file: File | null) => void;
  setFileContent: (content: string | null) => void;
  setFileName: (name: string | null) => void;
  setMode: (mode: TranslationMode) => void;
  setProvider: (provider: TranslationProvider) => void;
  setTargetLanguage: (language: TargetLanguage) => void;
  setOCRResult: (result: OCRResult | null) => void;
  setCurrentTask: (task: TranslationTask | null) => void;
  addTask: (task: TranslationTask) => void;
  updateTask: (taskId: string, updates: Partial<TranslationTask>) => void;
  removeTask: (taskId: string) => void;
  setProgress: (progress: TranslationState['progress']) => void;
  setResult: (result: string | null) => void;
  
  // WebSocket操作
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  
  // 重置状态
  reset: () => void;
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

// 初始状态
const initialState = {
  file: null,
  fileContent: null,
  fileName: null,
  mode: 'full',
  provider: 'deepseek' as TranslationProvider,
  targetLanguage: 'zh-CN' as TargetLanguage,
  ocrResult: null,
  currentTask: null,
  tasks: [],
  socket: null,
  progress: {
    status: 'idle',
    message: '',
    progress: 0
  } as {
    status: 'idle' | 'loading' | 'translating' | 'ready' | 'error';
    message: string;
    progress: number;
  },
  result: null,
};

// 创建存储
export const useTranslationStore = create<TranslationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 设置文件
      setFile: (file) => set({ file }),
      
      // 设置文件内容
      setFileContent: (content) => set({ fileContent: content }),
      
      // 设置文件名
      setFileName: (name) => set({ fileName: name }),
      
      // 设置翻译模式
      setMode: (mode) => set({ mode }),
      
      // 设置翻译提供商
      setProvider: (provider) => set({ provider }),
      
      // 设置目标语言
      setTargetLanguage: (language) => set({ targetLanguage: language }),
      
      // 设置OCR结果
      setOCRResult: (result) => set({ ocrResult: result }),
      
      // 设置当前任务
      setCurrentTask: (task) => set({ currentTask: task }),
      
      // 设置进度
      setProgress: (progress) => set({ progress }),
      
      // 设置翻译结果
      setResult: (result) => set({ result }),
      
      // 任务管理
      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, task] 
      })),
      
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      })),
      
      removeTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== taskId)
      })),
      
      // WebSocket连接管理
      connectWebSocket: () => {
        const { socket } = get();
        if (socket?.readyState === WebSocket.OPEN) return;
        
        const newSocket = new WebSocket(WEBSOCKET_URL);
        
        newSocket.onopen = () => {
          console.log('WebSocket连接已建立');
        };
        
        newSocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const { updateTask } = get();
            
            if (message.type === 'task_update') {
              updateTask(message.data.id, message.data);
            }
          } catch (error) {
            console.error('处理WebSocket消息失败:', error);
          }
        };
        
        newSocket.onclose = () => {
          console.log('WebSocket连接已关闭');
          set({ socket: null });
        };
        
        newSocket.onerror = (error) => {
          console.error('WebSocket错误:', error);
          set({ socket: null });
        };
        
        set({ socket: newSocket });
      },
      
      disconnectWebSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.close();
          set({ socket: null });
        }
      },
      
      // 重置状态
      reset: () => set({
        ...initialState,
        provider: get().provider,
        targetLanguage: get().targetLanguage,
        mode: get().mode,
        progress: {
          status: 'idle',
          message: '',
          progress: 0
        },
        result: null
      }),
    }),
    {
      name: 'translation-storage',
      partialize: (state) => ({
        provider: state.provider,
        targetLanguage: state.targetLanguage,
        mode: state.mode,
        progress: state.progress,
        result: state.result,
        tasks: state.tasks
      })
    }
  )
); 