'use client';

import { useEffect, useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { TranslationForm } from '@/components/translation-form';
import { ResultView } from '@/components/result-view';
import { useTranslationStore } from '@/store/translation-store';
import { motion } from 'framer-motion';
import { UsageLimitInfo } from '@/components/UsageLimitInfo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PDFViewer } from '@/components/pdf-viewer';
import { TaskList } from '@/components/task-list';
import { OCRResult } from '@/types';

export default function Home() {
  const { 
    result, 
    progress,
    mode,
    setMode,
    file
  } = useTranslationStore();
  
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
  
  // 在组件挂载时检查API密钥
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem('api_keys');
      if (!savedKeys) {
        setShowApiKeyAlert(true);
      } else {
        const apiKeys = JSON.parse(savedKeys);
        if (!apiKeys.deepseek) {
          setShowApiKeyAlert(true);
        }
      }
    } catch (error) {
      console.error('检查API密钥失败:', error);
    }
  }, []);
  
  return (
    <main className="container py-10 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold">PDF翻译工具</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          上传PDF文件，选择翻译模式和目标语言，快速获取翻译结果
        </p>
      </motion.div>
      
      {showApiKeyAlert && (
        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API密钥提示</AlertTitle>
          <AlertDescription>
            您尚未配置DeepSeek API密钥，系统将使用内置的默认密钥。为了获得更好的体验，建议在
            <a href="/settings" className="text-primary font-medium hover:underline">设置页面</a>
            配置您自己的API密钥。
          </AlertDescription>
        </Alert>
      )}
      
      <UsageLimitInfo />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <FileUpload />
          
          {file && (
            <Card>
              <CardHeader>
                <CardTitle>翻译模式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={mode === 'full' ? 'default' : 'outline'}
                    onClick={() => setMode('full')}
                    className="h-auto py-4 px-6"
                  >
                    <div className="text-left">
                      <div className="font-medium">全文翻译</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        自动分析文档结构，整体翻译
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={mode === 'selection' ? 'default' : 'outline'}
                    onClick={() => setMode('selection')}
                    className="h-auto py-4 px-6"
                  >
                    <div className="text-left">
                      <div className="font-medium">划词翻译</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        选择特定区域进行翻译
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {file && mode === 'selection' ? (
            <PDFViewer 
              file={file}
              mode={mode}
              onSelectionChange={(result: OCRResult | null) => {
                // 处理OCR结果
                console.log('OCR结果:', result);
              }}
            />
          ) : (
            <TranslationForm />
          )}
        </motion.div>
      </div>
      
      <TaskList />
      
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResultView />
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-16 border-t pt-10"
      >
        <h2 className="text-2xl font-bold text-center mb-8">支持的翻译服务</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            {
              name: 'Google翻译',
              description: '支持100多种语言的翻译服务'
            },
            {
              name: 'DeepL',
              description: '提供高质量的机器翻译服务'
            },
            {
              name: 'OpenAI',
              description: '基于GPT模型的智能翻译'
            },
            {
              name: 'Azure AI翻译',
              description: '微软提供的专业翻译服务'
            },
            {
              name: '百度翻译',
              description: '中文翻译服务的领先提供商'
            }
          ].map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              className="border rounded-lg p-4 text-center hover:border-primary transition-colors"
            >
              <h3 className="font-medium mb-2">{service.name}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
} 