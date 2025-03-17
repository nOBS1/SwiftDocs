'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TranslationResult, PROVIDER_NAMES, TARGET_LANGUAGE_NAMES } from '@/types';
import { Download, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const [history, setHistory] = useState<TranslationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 加载历史记录
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem('translationResults');
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults) as TranslationResult[];
        setHistory(parsedResults);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: '无法加载翻译历史记录',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 下载翻译结果
  const handleDownload = async (result: TranslationResult) => {
    try {
      // 调用下载API
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: result.originalText,
          translatedText: result.translatedText,
          fileName: result.fileName,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '下载请求失败');
      }
      
      const data = await response.json();
      
      // 创建下载链接
      const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.fileName;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: '下载成功',
        description: `文件已保存为 ${data.fileName}`,
      });
    } catch (error) {
      console.error('下载失败:', error);
      toast({
        variant: 'destructive',
        title: '下载失败',
        description: error instanceof Error ? error.message : '生成下载内容时出错',
      });
    }
  };
  
  // 删除历史记录
  const handleDelete = (id: string) => {
    try {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem('translationResults', JSON.stringify(updatedHistory));
      
      toast({
        title: '删除成功',
        description: '已从历史记录中删除该翻译结果',
      });
    } catch (error) {
      console.error('删除历史记录失败:', error);
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: '无法删除该历史记录',
      });
    }
  };
  
  // 清空所有历史记录
  const handleClearAll = () => {
    try {
      setHistory([]);
      localStorage.removeItem('translationResults');
      
      toast({
        title: '清空成功',
        description: '已清空所有翻译历史记录',
      });
    } catch (error) {
      console.error('清空历史记录失败:', error);
      toast({
        variant: 'destructive',
        title: '清空失败',
        description: '无法清空历史记录',
      });
    }
  };
  
  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">翻译历史记录</h1>
        </div>
        
        {history.length > 0 && (
          <Button variant="destructive" onClick={handleClearAll}>
            清空历史记录
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">暂无翻译历史记录</h2>
          <p className="text-muted-foreground mb-6">
            翻译完成后的结果将自动保存在这里
          </p>
          <Link href="/">
            <Button>
              返回首页开始翻译
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {history.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{result.fileName}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {formatDate(result.timestamp)}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    翻译服务：{PROVIDER_NAMES[result.provider]} • 
                    目标语言：{TARGET_LANGUAGE_NAMES[result.targetLanguage]}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">原文</h3>
                      <div className="bg-muted p-3 rounded-md text-sm max-h-32 overflow-y-auto">
                        <p className="whitespace-pre-wrap">
                          {result.originalText.length > 200 
                            ? `${result.originalText.slice(0, 200)}...` 
                            : result.originalText}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">翻译结果</h3>
                      <div className="bg-muted p-3 rounded-md text-sm max-h-32 overflow-y-auto">
                        <p className="whitespace-pre-wrap">
                          {result.translatedText.length > 200 
                            ? `${result.translatedText.slice(0, 200)}...` 
                            : result.translatedText}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDelete(result.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </Button>
                  
                  <Button onClick={() => handleDownload(result)}>
                    <Download className="h-4 w-4 mr-2" />
                    下载结果
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      <Toaster />
    </div>
  );
} 