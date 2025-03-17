'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslationStore } from '@/store/translation-store';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

// 动态导入pdfjs，避免服务器端渲染问题
let pdfjs: any = null;

export function FileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingPDFMathTranslate, setIsUsingPDFMathTranslate] = useState(false);
  const [isUsingBabelDoc, setIsUsingBabelDoc] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<'standard' | 'pdfmath' | 'babeldoc'>('standard');
  const [apiKey, setApiKey] = useState('');
  const [preserveFormat, setPreserveFormat] = useState(true);
  
  // 从状态存储中获取状态和方法
  const { 
    file, 
    progress, 
    setFile, 
    setFileContent, 
    setPages, 
    setCurrentPage,
    setProgress 
  } = useTranslationStore();
  
  // 初始化PDF.js
  const initPdfJs = async () => {
    if (!pdfjs) {
      try {
        // 动态导入PDF.js
        const pdfModule = await import('pdfjs-dist');
        pdfjs = pdfModule;
        
        // 设置worker路径 - 使用本地worker文件
        if (typeof window !== 'undefined') {
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        }
        
        return true;
      } catch (error) {
        console.error('PDF.js初始化失败:', error);
        toast({
          variant: 'destructive',
          title: 'PDF处理组件加载失败',
          description: '请尝试使用其他处理方式或刷新页面重试',
        });
        return false;
      }
    }
    return true;
  };
  
  // 使用BabelDOC处理PDF
  const processPDFWithBabelDoc = async (selectedFile: File) => {
    try {
      setIsUsingBabelDoc(true);
      setProgress({
        status: 'uploading',
        message: '正在使用BabelDOC处理文件...',
        progress: 10
      });
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('targetLang', 'zh-CN');
      formData.append('service', 'openai');
      formData.append('preserveFormat', preserveFormat.toString());
      
      // 检查API密钥
      if (!apiKey && processingMethod === 'babeldoc') {
        toast({
          variant: 'destructive',
          title: '缺少OpenAI API密钥',
          description: '使用BabelDOC需要提供OpenAI API密钥',
        });
        return false;
      }
      
      if (apiKey) {
        formData.append('apiKey', apiKey);
      }
      
      // 更新进度
      setProgress({
        status: 'uploading',
        message: '正在上传文件到BabelDOC服务...',
        progress: 20
      });
      
      // 调用BabelDOC API
      const response = await fetch('/api/babeldoc-translate', {
        method: 'POST',
        body: formData,
      });
      
      // 更新进度
      setProgress({
        status: 'translating',
        message: '正在处理文件...',
        progress: 40
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'BabelDOC处理失败';
        const errorDetails = errorData.details || '';
        
        // 显示更详细的错误信息
        toast({
          variant: 'destructive',
          title: errorMessage,
          description: errorDetails,
        });
        
        throw new Error(errorMessage);
      }
      
      // 更新进度
      setProgress({
        status: 'extracting',
        message: '正在提取翻译结果...',
        progress: 60
      });
      
      // 获取处理结果
      const data = await response.json();
      
      // 更新进度
      setProgress({
        status: 'extracting',
        message: 'BabelDOC处理完成',
        progress: 80
      });
      
      // 设置提取的文本内容
      if (data.originalText) {
        setFileContent(data.originalText);
      } else {
        // 如果没有返回文本内容，使用默认文本
        setFileContent(`[BabelDOC已处理文件，但未返回文本内容]\n\n文件名: ${selectedFile.name}\n处理时间: ${new Date().toLocaleString()}`);
      }
      
      // 设置页面信息
      setPages(1);
      setCurrentPage(1);
      
      // 如果有翻译结果，保存到本地存储
      if (data.translatedText) {
        localStorage.setItem('babelDocTranslation', data.translatedText);
        localStorage.setItem('babelDocSessionId', data.sessionId);
        localStorage.setItem('babelDocFiles', JSON.stringify(data.files || {}));
        
        // 显示翻译完成的通知，包含可下载的文件信息
        const hasMonoPdf = data.files && data.files.monoPdf;
        const hasDualPdf = data.files && data.files.dualPdf;
        
        let fileInfo = '';
        if (hasMonoPdf && hasDualPdf) {
          fileInfo = '已生成单语言和双语言PDF文件，可在结果页面下载';
        } else if (hasMonoPdf) {
          fileInfo = '已生成单语言PDF文件，可在结果页面下载';
        } else if (hasDualPdf) {
          fileInfo = '已生成双语言PDF文件，可在结果页面下载';
        }
        
        toast({
          title: '文件处理完成',
          description: `成功使用BabelDOC处理文件。${fileInfo}`,
        });
      } else {
        toast({
          title: '文件处理完成',
          description: '成功使用BabelDOC处理文件，但未生成翻译结果',
        });
      }
      
      return true;
    } catch (error) {
      console.error('BabelDOC处理错误:', error);
      
      // 如果没有显示过错误信息，则显示一个通用错误
      if (!(error instanceof Error && error.message.includes('BabelDOC'))) {
        toast({
          variant: 'destructive',
          title: 'BabelDOC处理失败',
          description: '请确保已安装Python和babeldoc包，或使用其他PDF处理方式。BabelDOC需要Python 3.8+和OpenAI API密钥。',
        });
      }
      
      return false;
    } finally {
      setIsUsingBabelDoc(false);
    }
  };
  
  // 使用PDFMathTranslate处理PDF
  const processPDFWithMathTranslate = async (selectedFile: File) => {
    try {
      setIsUsingPDFMathTranslate(true);
      setProgress({
        status: 'uploading',
        message: '正在使用PDFMathTranslate处理文件...',
        progress: 10
      });
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // 调用PDFMathTranslate API
      const response = await fetch('/api/pdf-math-translate', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'PDFMathTranslate处理失败';
        const errorDetails = errorData.details || '';
        
        // 显示更详细的错误信息
        toast({
          variant: 'destructive',
          title: errorMessage,
          description: errorDetails,
        });
        
        throw new Error(errorMessage);
      }
      
      // 获取处理结果
      const data = await response.json();
      
      // 更新进度
      setProgress({
        status: 'extracting',
        message: 'PDFMathTranslate处理完成',
        progress: 80
      });
      
      // 设置提取的文本内容
      if (data.text) {
        setFileContent(data.text);
      } else {
        // 如果没有返回文本内容，使用默认文本
        setFileContent(`[PDFMathTranslate已处理文件，但未返回文本内容]\n\n文件名: ${selectedFile.name}\n处理时间: ${new Date().toLocaleString()}`);
      }
      
      // 设置页面信息
      setPages(data.pages || 1);
      setCurrentPage(1);
      
      toast({
        title: '文件处理完成',
        description: `成功使用PDFMathTranslate处理文件`,
      });
      
      return true;
    } catch (error) {
      console.error('PDFMathTranslate处理错误:', error);
      
      // 如果没有显示过错误信息，则显示一个通用错误
      if (!(error instanceof Error && error.message.includes('PDFMathTranslate'))) {
        toast({
          variant: 'destructive',
          title: 'PDFMathTranslate处理失败',
          description: '请确保已安装Python和pdf2zh包，或使用其他PDF处理方式',
        });
      }
      
      return false;
    } finally {
      setIsUsingPDFMathTranslate(false);
    }
  };
  
  // 处理文件选择
  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    // 检查文件类型
    if (selectedFile.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: '不支持的文件类型',
        description: '请上传PDF文件',
      });
      return;
    }
    
    // 更新状态
    setFile(selectedFile);
    setIsLoading(true);
    
    try {
      // 根据选择的处理方法处理PDF
      if (processingMethod === 'babeldoc') {
        const success = await processPDFWithBabelDoc(selectedFile);
        if (success) {
          setIsLoading(false);
          return;
        }
        // 如果BabelDOC处理失败，回退到使用PDF.js
        toast({
          title: '回退到标准处理',
          description: '将使用标准PDF处理方式',
        });
      } else if (processingMethod === 'pdfmath') {
        const success = await processPDFWithMathTranslate(selectedFile);
        if (success) {
          setIsLoading(false);
          return;
        }
        // 如果PDFMathTranslate处理失败，回退到使用PDF.js
        toast({
          title: '回退到标准处理',
          description: '将使用标准PDF处理方式',
        });
      }
      
      // 初始化PDF.js
      const initialized = await initPdfJs();
      if (!initialized || !pdfjs) {
        throw new Error('PDF.js初始化失败');
      }
      
      // 读取文件内容
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      
      // 更新进度
      setProgress({
        status: 'uploading',
        message: '正在加载PDF...',
        progress: 10
      });
      
      try {
        // 加载PDF文档
        const loadingTask = pdfjs.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        
        // 设置页面信息
        const numPages = pdf.numPages;
        setPages(numPages);
        setCurrentPage(1);
        
        // 更新进度
        setProgress({
          status: 'extracting',
          message: '正在提取文本...',
          progress: 20
        });
        
        // 提取文本内容
        let fullText = '';
        
        for (let i = 1; i <= numPages; i++) {
          // 更新进度
          setProgress({
            progress: 20 + Math.floor((i / numPages) * 60)
          });
          
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n\n';
        }
        
        // 设置提取的文本内容
        setFileContent(fullText.trim());
        
        // 更新进度
        setProgress({
          status: 'extracting',
          message: '文本提取完成',
          progress: 80
        });
        
        toast({
          title: '文件处理完成',
          description: `成功提取 ${numPages} 页文本内容`,
        });
      } catch (pdfError) {
        console.error('PDF.js处理错误:', pdfError);
        
        // 如果PDF.js处理失败，尝试使用其他方法作为备选方案
        if (processingMethod === 'standard') {
          toast({
            title: 'PDF.js处理失败',
            description: '正在尝试使用BabelDOC处理...',
          });
          
          const success = await processPDFWithBabelDoc(selectedFile);
          if (!success) {
            const mathSuccess = await processPDFWithMathTranslate(selectedFile);
            if (!mathSuccess) {
              throw new Error('所有PDF处理方法都失败了');
            }
          }
        } else {
          throw pdfError;
        }
      }
    } catch (error) {
      console.error('PDF处理错误:', error);
      
      toast({
        variant: 'destructive',
        title: '文件处理失败',
        description: '无法读取PDF文件内容',
      });
      
      // 重置状态
      setFile(null);
      setProgress({
        status: 'error',
        message: '文件处理失败',
        progress: 0
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理拖放事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  // 处理文件选择按钮点击
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // 处理文件输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };
  
  // 处理文件移除
  const handleRemoveFile = () => {
    setFile(null);
  };
  
  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">拖放PDF文件到此处</h3>
              <p className="text-sm text-muted-foreground">
                或者点击下方按钮选择文件
              </p>
              <p className="text-xs text-muted-foreground">
                支持科学论文翻译，可保留公式、图表和表格格式
              </p>
            </div>
            
            <div className="w-full max-w-xs space-y-4">
              <div className="space-y-2">
                <Label htmlFor="processing-method">PDF处理方式</Label>
                <Select
                  value={processingMethod}
                  onValueChange={(value) => setProcessingMethod(value as 'standard' | 'pdfmath' | 'babeldoc')}
                >
                  <SelectTrigger id="processing-method">
                    <SelectValue placeholder="选择处理方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">标准处理 (PDF.js)</SelectItem>
                    <SelectItem value="pdfmath">PDFMathTranslate (保留公式)</SelectItem>
                    <SelectItem value="babeldoc">BabelDOC (高质量排版)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {processingMethod === 'standard' && '使用标准处理方式，适用于大多数PDF文件'}
                  {processingMethod === 'pdfmath' && '使用PDFMathTranslate处理，能够保留数学公式和图表'}
                  {processingMethod === 'babeldoc' && '使用BabelDOC处理，提供高质量的排版和翻译，需要OpenAI API密钥'}
                </p>
              </div>
              
              {processingMethod === 'babeldoc' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">OpenAI API密钥 (必填)</Label>
                    <input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full p-2 border rounded-md"
                    />
                    <p className="text-sm text-muted-foreground">
                      BabelDOC需要使用OpenAI API进行翻译，请提供有效的API密钥
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="preserve-format"
                      checked={preserveFormat}
                      onChange={(e) => setPreserveFormat(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="preserve-format" className="text-sm font-medium">
                      优先保留原始格式 (推荐)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    启用此选项将尽可能保留原始PDF的格式，包括布局、字体和排版。可能会影响翻译质量。
                  </p>
                </>
              )}
            </div>
            
            <Button onClick={handleButtonClick} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                '选择PDF文件'
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-md bg-primary/10">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              disabled={progress.status === 'translating' || isLoading || isUsingPDFMathTranslate || isUsingBabelDoc}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progress.message}</span>
              <span>{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} />
          </div>
        </div>
      )}
    </div>
  );
} 