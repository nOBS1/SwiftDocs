import { PDFFile, PDFPage, PDFTextItem } from '@/types';

/**
 * 从PDF文件中提取文本
 * @param file PDF文件
 * @returns 提取的文本内容
 */
export async function extractTextFromPDF(file: File): Promise<PDFFile> {
  try {
    // 将文件转换为ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // 提取PDF页面
    const pages = await extractPagesFromBuffer(arrayBuffer);
    
    // 合并所有页面文本
    const text = pages.map(page => page.text).join('\n\n');
    
    // 创建PDF文件信息对象
    const pdfFile: PDFFile = {
      id: generateId(),
      name: file.name,
      size: file.size,
      text,
      timestamp: Date.now()
    };
    
    return pdfFile;
  } catch (error) {
    console.error('PDF文本提取失败:', error);
    throw new Error('无法从PDF中提取文本。该PDF可能是扫描件或受保护的文档。');
  }
}

/**
 * 从ArrayBuffer中提取PDF页面
 * @param buffer PDF文件的ArrayBuffer
 * @returns PDF页面数组
 */
export async function extractPagesFromBuffer(buffer: ArrayBuffer): Promise<PDFPage[]> {
  try {
    // 动态导入PDF.js
    const pdfjs = await import('pdfjs-dist');
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    
    // 加载PDF文档
    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    
    // 获取页数
    const numPages = pdf.numPages;
    const pages: PDFPage[] = [];
    
    // 遍历每一页并提取文本
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      // 提取文本项
      const textItems: PDFTextItem[] = content.items.map((item: any) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
        fontName: item.fontName,
        fontSize: item.fontSize
      }));
      
      // 合并页面文本
      const pageText = textItems.map(item => item.text).join(' ');
      
      // 清理文本
      const cleanedText = cleanText(pageText);
      
      // 添加到页面数组
      pages.push({
        pageNumber: i,
        text: cleanedText,
        textItems
      });
    }
    
    return pages;
  } catch (error) {
    console.error('PDF页面提取失败:', error);
    throw new Error('无法从PDF中提取页面。该PDF可能是扫描件或受保护的文档。');
  }
}

/**
 * 清理提取的文本
 * @param text 原始文本
 * @returns 清理后的文本
 */
function cleanText(text: string): string {
  // 移除多余的空白字符
  text = text.replace(/\s+/g, ' ');
  
  // 移除页码等无关内容
  text = text.replace(/\b\d+\s*\|\s*Page\b/g, '');
  
  // 清理后返回
  return text.trim();
}

/**
 * 生成唯一ID
 * @returns 唯一ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
} 