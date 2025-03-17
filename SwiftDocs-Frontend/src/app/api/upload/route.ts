import { NextResponse } from 'next/server';
import { extractPagesFromBuffer } from '@/lib/pdf-processor';

// 设置最大文件大小（20MB）
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }
    
    // 检查文件类型
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: '只支持PDF文件' },
        { status: 400 }
      );
    }
    
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '文件大小超过限制（20MB）' },
        { status: 400 }
      );
    }
    
    // 读取文件内容
    const buffer = await file.arrayBuffer();
    
    // 提取PDF文本
    const pages = await extractPagesFromBuffer(buffer);
    
    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      pages,
      totalPages: pages.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('PDF上传处理错误:', error);
    return NextResponse.json(
      { error: '处理PDF文件时出错' },
      { status: 500 }
    );
  }
} 