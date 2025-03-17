import { useEffect, useRef, useState } from 'react';
import { useTranslationStore } from '@/store/translation-store';
import { BoundingBox, OCRResult, TranslationMode } from '@/types';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { SelectionToolbar } from './selection-toolbar';
import { Loader2 } from 'lucide-react';

// 配置PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  file: File | null;
  mode: TranslationMode;
  onSelectionChange?: (selection: OCRResult | null) => void;
}

export function PDFViewer({ file, mode, onSelectionChange }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState<BoundingBox | null>(null);
  
  const { setProgress } = useTranslationStore();
  
  // 加载PDF文件
  useEffect(() => {
    if (!file) return;
    
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setProgress({ status: 'loading', message: '正在加载PDF文件...', progress: 0 });
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        setPdf(pdf);
        setProgress({ status: 'ready', message: 'PDF文件加载完成', progress: 100 });
      } catch (error) {
        console.error('加载PDF失败:', error);
        toast('加载失败', {
          description: '无法加载PDF文件，请检查文件格式是否正确',
          style: { backgroundColor: 'red', color: 'white' },
        });
        setProgress({ status: 'error', message: '加载PDF文件失败', progress: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPDF();
  }, [file]);
  
  // 渲染PDF页面
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    
    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
      } catch (error) {
        console.error('渲染PDF页面失败:', error);
      }
    };
    
    renderPage();
  }, [pdf, currentPage, scale]);
  
  // 处理鼠标选择
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'selection' || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelection({
      x,
      y,
      width: 0,
      height: 0,
      page: currentPage
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selection || mode !== 'selection' || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelection(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        width: x - prev.x,
        height: y - prev.y
      };
    });
  };
  
  const handleMouseUp = async () => {
    if (!selection || mode !== 'selection') return;
    
    try {
      // 这里应该调用后端的OCR服务识别选中区域的文本
      // 目前仅模拟OCR结果
      const ocrResult: OCRResult = {
        text: '选中区域的文本',
        bbox: selection,
        confidence: 0.95
      };
      
      onSelectionChange?.(ocrResult);
    } catch (error) {
      console.error('OCR识别失败:', error);
      toast('识别失败', {
        description: '无法识别选中区域的文本',
        style: { backgroundColor: 'red', color: 'white' },
      });
    }
    
    setSelection(null);
  };
  
  // 缩放控制
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setScale(1.5);
  
  // 页面导航
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (!pdf) return;
    setCurrentPage(prev => Math.min(prev + 1, pdf.numPages));
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/10 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="relative" ref={containerRef}>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 hover:bg-muted/50 rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <span>
            第 {currentPage} 页 {pdf ? `/ ${pdf.numPages}` : ''}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!pdf || currentPage === pdf.numPages}
            className="p-2 hover:bg-muted/50 rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-muted/50 rounded-lg"
          >
            缩小
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-muted/50 rounded-lg"
          >
            重置
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-muted/50 rounded-lg"
          >
            放大
          </button>
        </div>
      </div>
      
      <div 
        className="relative overflow-auto bg-muted/10 rounded-lg mt-2"
        style={{ height: '600px' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="mx-auto"
        />
        
        {selection && (
          <div
            className="absolute border-2 border-primary bg-primary/20"
            style={{
              left: selection.x,
              top: selection.y,
              width: selection.width,
              height: selection.height,
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
      
      {mode === 'selection' && <SelectionToolbar />}
    </div>
  );
} 