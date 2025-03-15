import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { originalText, translatedText, fileName, format = 'txt' } = await request.json();
    
    if (!originalText || !translatedText) {
      return NextResponse.json(
        { error: '缺少必要的翻译内容' },
        { status: 400 }
      );
    }
    
    // 创建下载内容
    const content = createDownloadContent(originalText, translatedText);
    
    // 生成文件名
    const baseFileName = fileName 
      ? fileName.replace(/\.pdf$/, '')
      : `翻译结果_${new Date().toISOString().slice(0, 10)}`;
    
    const downloadFileName = `${baseFileName}_翻译结果.${format}`;
    
    // 如果是 PDF 格式，返回特殊标记，前端会处理 PDF 生成
    if (format === 'pdf') {
      return NextResponse.json({
        content,
        fileName: downloadFileName,
        format: 'pdf',
        originalText,
        translatedText
      });
    }
    
    // 否则返回文本内容
    return NextResponse.json({
      content,
      fileName: downloadFileName,
      format: 'txt'
    });
  } catch (error) {
    console.error('下载API错误:', error);
    return NextResponse.json(
      { error: '处理下载请求时出错' },
      { status: 500 }
    );
  }
}

/**
 * 创建下载内容
 * @param originalText 原文
 * @param translatedText 翻译文本
 * @returns 格式化的下载内容
 */
function createDownloadContent(originalText: string, translatedText: string): string {
  const timestamp = new Date().toLocaleString();
  
  return `# 翻译结果 - ${timestamp}

## 原文
${originalText}

## 翻译
${translatedText}

---
由 PDF翻译工具 生成 | https://pdf-translator.vercel.app
`;
} 