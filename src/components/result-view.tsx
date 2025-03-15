'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslationStore } from '@/store/translation-store';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Download, FileText, FileType, ChevronDown, FileOutput } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

export function ResultView() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const originalTextRef = useRef<HTMLDivElement>(null)
  const translatedTextRef = useRef<HTMLDivElement>(null)
  const pdfContentRef = useRef<HTMLDivElement>(null)
  const { result, history } = useTranslationStore()
  const [babelDocFiles, setBabelDocFiles] = useState<Record<string, string> | null>(null)

  // 使用当前结果或历史记录中的第一个结果
  const currentResult = result || history[0]

  // 检查本地存储中是否有 BabelDOC 生成的文件
  useEffect(() => {
    try {
      const filesJson = localStorage.getItem('babelDocFiles');
      if (filesJson) {
        const files = JSON.parse(filesJson);
        setBabelDocFiles(files);
      }
    } catch (error) {
      console.error('读取 BabelDOC 文件信息失败:', error);
    }
  }, []);

  // 如果没有结果，不渲染组件
  if (!currentResult) return null;
  
  // 处理复制到剪贴板
  const handleCopy = async () => {
    if (!currentResult) return

    try {
      await navigator.clipboard.writeText(currentResult.translatedText)
      setCopied(true)
      toast({
        title: "已复制",
        description: "翻译结果已复制到剪贴板",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("复制失败:", error)
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }
  
  // 处理下载 BabelDOC 生成的 PDF 文件
  const handleBabelDocDownload = (fileUrl: string, fileType: string) => {
    if (!fileUrl) return;
    
    // 创建一个链接元素并模拟点击
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `翻译结果_${fileType}_${new Date().getTime()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "下载成功",
      description: `BabelDOC ${fileType} PDF 已下载`,
    });
  };
  
  // 处理下载结果
  const handleDownload = async (format: 'txt' | 'pdf' = 'txt') => {
    if (!currentResult) return

    setIsDownloading(true)
    try {
      if (format === 'pdf') {
        // 使用 HTML 转 PDF 的方法
        if (!pdfContentRef.current) {
          throw new Error("PDF 内容元素不存在");
        }
        
        // 创建一个临时的 div 元素，用于渲染 PDF 内容
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '794px'; // A4 宽度 (210mm = 794px)
        tempDiv.style.fontFamily = 'Arial, "Microsoft YaHei", sans-serif';
        tempDiv.style.padding = '40px';
        tempDiv.style.boxSizing = 'border-box';
        
        // 添加 PDF 内容
        tempDiv.innerHTML = `
          <div style="margin-bottom: 20px;">
            <h1 style="font-size: 24px; margin-bottom: 10px;">PDF 翻译结果</h1>
            <p style="font-size: 12px; color: #666;">生成时间: ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; margin-bottom: 10px;">原文:</h2>
            <div style="font-size: 14px; white-space: pre-wrap;">${currentResult.originalText}</div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; margin-bottom: 10px;">翻译:</h2>
            <div style="font-size: 14px; white-space: pre-wrap;">${currentResult.translatedText}</div>
          </div>
          
          <div style="margin-top: 40px; font-size: 10px; color: #999; text-align: center;">
            由 PDF 翻译工具生成
          </div>
        `;
        
        document.body.appendChild(tempDiv);
        
        try {
          // 使用 html2canvas 将 HTML 转换为 canvas
          const canvas = await html2canvas(tempDiv, {
            scale: 2, // 提高清晰度
            useCORS: true,
            logging: false,
            allowTaint: true
          });
          
          // 创建 PDF
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          // 将 canvas 添加到 PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210; // A4 宽度 (210mm)
          const pageHeight = 297; // A4 高度 (297mm)
          const imgHeight = canvas.height * imgWidth / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
          
          // 添加第一页
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          
          // 如果内容超过一页，添加更多页面
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          
          // 保存 PDF
          pdf.save(`翻译结果_${new Date().getTime()}.pdf`);
          
          toast({
            title: "下载成功",
            description: "PDF 翻译结果已下载",
          });
        } finally {
          // 清理临时元素
          document.body.removeChild(tempDiv);
        }
      } else {
        // 文本文件下载
        const response = await fetch("/api/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            originalText: currentResult.originalText,
            translatedText: currentResult.translatedText,
            fileName: currentResult.fileName,
            format: 'txt'
          }),
        })

        if (!response.ok) {
          throw new Error("下载失败")
        }

        const data = await response.json()
        const blob = new Blob([data.content], { type: "text/plain;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = data.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "下载成功",
          description: "翻译结果已下载",
        })
      }
    } catch (error) {
      console.error("下载失败:", error)
      toast({
        title: "下载失败",
        description: "无法下载翻译结果",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  };
  
  // 设置滚动同步
  useEffect(() => {
    const originalElement = originalTextRef.current;
    const translatedElement = translatedTextRef.current;
    
    if (!originalElement || !translatedElement) return;
    
    const handleOriginalScroll = () => {
      if (!originalElement || !translatedElement) return;
      
      const percentage = originalElement.scrollTop / 
        (originalElement.scrollHeight - originalElement.clientHeight);
      
      translatedElement.scrollTop = percentage * 
        (translatedElement.scrollHeight - translatedElement.clientHeight);
    };
    
    const handleTranslatedScroll = () => {
      if (!originalElement || !translatedElement) return;
      
      const percentage = translatedElement.scrollTop / 
        (translatedElement.scrollHeight - translatedElement.clientHeight);
      
      originalElement.scrollTop = percentage * 
        (originalElement.scrollHeight - originalElement.clientHeight);
    };
    
    originalElement.addEventListener('scroll', handleOriginalScroll);
    translatedElement.addEventListener('scroll', handleTranslatedScroll);
    
    return () => {
      originalElement.removeEventListener('scroll', handleOriginalScroll);
      translatedElement.removeEventListener('scroll', handleTranslatedScroll);
    };
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>翻译结果</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            disabled={copied}
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? '已复制' : '复制翻译'}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" disabled={isDownloading}>
                {isDownloading ? '下载中...' : '下载结果'} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDownload('txt')}>
                <FileText className="h-4 w-4 mr-2" />
                <span>下载为文本文件 (.txt)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                <FileType className="h-4 w-4 mr-2" />
                <span>下载为PDF文件 (.pdf)</span>
              </DropdownMenuItem>
              
              {babelDocFiles && (
                <>
                  <DropdownMenuSeparator />
                  {babelDocFiles.monoPdf && (
                    <DropdownMenuItem onClick={() => handleBabelDocDownload(babelDocFiles.monoPdf, '单语言')}>
                      <FileOutput className="h-4 w-4 mr-2" />
                      <span>下载 BabelDOC 单语言 PDF</span>
                    </DropdownMenuItem>
                  )}
                  {babelDocFiles.dualPdf && (
                    <DropdownMenuItem onClick={() => handleBabelDocDownload(babelDocFiles.dualPdf, '双语言')}>
                      <FileOutput className="h-4 w-4 mr-2" />
                      <span>下载 BabelDOC 双语言 PDF</span>
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="split" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="split">分屏对比</TabsTrigger>
            <TabsTrigger value="original">原文</TabsTrigger>
            <TabsTrigger value="translated">翻译</TabsTrigger>
          </TabsList>
          
          <TabsContent value="split" className="mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">原文</h3>
                <div
                  ref={originalTextRef}
                  className="max-h-[500px] overflow-y-auto whitespace-pre-wrap"
                >
                  {currentResult.originalText}
                </div>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">翻译</h3>
                <div
                  ref={translatedTextRef}
                  className="max-h-[500px] overflow-y-auto whitespace-pre-wrap"
                >
                  {currentResult.translatedText}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="original" className="mt-0">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">原文</h3>
              <div className="max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                {currentResult.originalText}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="translated" className="mt-0">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">翻译</h3>
              <div className="max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                {currentResult.translatedText}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* 隐藏的 PDF 内容区域，用于生成 PDF */}
        <div ref={pdfContentRef} className="hidden"></div>
      </CardContent>
    </Card>
  );
} 