'use client';

import { useEffect } from 'react';
import { FileUpload } from '@/components/file-upload';
import { TranslationForm } from '@/components/translation-form';
import { ResultView } from '@/components/result-view';
import { useTranslationStore } from '@/store/translation-store';
import { Toaster } from '@/components/ui/toaster';
import { motion } from 'framer-motion';

export default function Home() {
  const { result, progress } = useTranslationStore();
  
  // 在组件挂载时重置状态
  useEffect(() => {
    // 这里可以添加一些初始化逻辑
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
          上传PDF文件，选择翻译服务和目标语言，快速获取翻译结果
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FileUpload />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <TranslationForm />
        </motion.div>
      </div>
      
      {result && progress.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
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
      
      <Toaster />
    </main>
  );
} 