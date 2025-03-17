'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { getTodayUsage, checkUsageLimit } from '@/lib/usage-tracker';

interface TranslateButtonProps {
  onTranslate: (text: string) => void;
  text: string;
  service: string;
  targetLang: string;
  disabled?: boolean;
}

export function TranslateButton({ 
  onTranslate, 
  text, 
  service, 
  targetLang, 
  disabled 
}: TranslateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState({ used: 0, remaining: 5 });
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    // 获取使用情况
    const usage = getTodayUsage();
    const { remaining } = checkUsageLimit();
    setUsageInfo({ used: usage, remaining });
  }, []);
  
  const handleTranslate = async () => {
    if (!text) return;
    
    // 检查使用限制
    const { allowed, remaining } = checkUsageLimit();
    
    if (!allowed) {
      toast({
        title: '使用次数已达上限',
        description: '您今天的免费使用次数已用完。通过分享可以获得更多使用次数！',
        variant: 'destructive',
      });
      
      // 显示分享对话框
      const shareNow = window.confirm(
        '您今天的免费使用次数已用完。通过分享可以获得更多使用次数！\n\n' +
        '点击"确定"前往分享页面，点击"取消"继续使用。'
      );
      
      if (shareNow) {
        router.push('/share');
      }
      
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          service, 
          targetLang
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // 检查是否是使用限制错误
        if (data.limitReached) {
          toast({
            title: '使用次数已达上限',
            description: '您今天的免费使用次数已用完。通过分享可以获得更多使用次数！',
            variant: 'destructive',
          });
          
          router.push('/share');
          return;
        }
        
        throw new Error(data.error || '翻译失败');
      }
      
      // 更新使用情况
      if (data.usageInfo) {
        setUsageInfo({
          used: data.usageInfo.used,
          remaining: data.usageInfo.remaining
        });
      }
      
      onTranslate(data.translatedText);
    } catch (error: any) {
      toast({
        title: '翻译失败',
        description: error.message || '发生未知错误',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <Button
        onClick={handleTranslate}
        disabled={disabled || loading}
        className="w-full"
      >
        {loading ? '翻译中...' : '开始翻译'}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        今日剩余: {usageInfo.remaining} 次
        {usageInfo.remaining < 3 && (
          <Button 
            variant="link" 
            className="p-0 h-auto ml-1 text-xs"
            onClick={() => router.push('/share')}
          >
            分享获取更多次数
          </Button>
        )}
      </p>
    </div>
  );
} 