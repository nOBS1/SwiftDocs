'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TranslationResult, LANGUAGE_NAMES, PROVIDER_NAMES } from '@/types';
import { Eye, Download, Clock } from 'lucide-react';
import { truncateText } from '@/lib/utils';
import Link from 'next/link';

interface TranslationCardProps {
  result: TranslationResult;
  onDownload: () => void;
}

export function TranslationCard({ result, onDownload }: TranslationCardProps) {
  // 格式化时间
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <Card className="w-full card-hover">
      <CardHeader>
        <CardTitle className="truncate">{result.fileName}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(result.timestamp)}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">翻译服务：</span>
            <span className="font-medium">{PROVIDER_NAMES[result.provider]}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">目标语言：</span>
            <span className="font-medium">{LANGUAGE_NAMES[result.targetLanguage]}</span>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-1">翻译预览：</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {truncateText(result.translatedText, 150)}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/result/${result.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            查看详情
          </Link>
        </Button>
        
        <Button variant="secondary" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          下载
        </Button>
      </CardFooter>
    </Card>
  );
} 