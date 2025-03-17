'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getUserId } from '@/lib/usage-tracker';

export default function SharePage() {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const searchParams = useSearchParams();
  const refId = searchParams.get('ref');
  
  // 生成当前用户的分享链接
  const userId = getUserId();
  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/share?ref=${userId}`;
  
  useEffect(() => {
    // 如果是通过分享链接访问的，记录一次点击
    if (refId && refId !== userId) {
      fetch('/api/share/record-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refId }),
      });
    }
    
    // 获取当前用户的分享统计
    fetch('/api/share/stats')
      .then(res => res.json())
      .then(data => {
        setShareCount(data.clickCount || 0);
      });
  }, [refId, userId]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      toast('复制成功', {
        description: '分享链接已复制到剪贴板',
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const shareToSocialMedia = (platform: string) => {
    let url = '';
    const text = '我发现了一个超好用的PDF翻译工具，支持多种翻译服务和语言，快来试试吧！';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case 'weibo':
        url = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(text)}`;
        break;
      case 'wechat':
        // 微信分享需要生成二维码，这里简化处理
        toast('微信分享', {
          description: '请截图或复制链接，通过微信分享给好友',
        });
        return;
    }
    
    window.open(url, '_blank');
  };
  
  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">分享获得更多翻译次数</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>您的专属分享链接</CardTitle>
          <CardDescription>
            每当有人通过您的链接访问网站，您将获得额外的翻译次数奖励
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input value={shareLink} readOnly />
            <Button onClick={copyToClipboard}>
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start">
          <p className="text-sm text-muted-foreground mb-4">
            已有 <span className="font-bold">{shareCount}</span> 人通过您的链接访问，
            您获得了 <span className="font-bold">{shareCount}</span> 次额外的翻译次数奖励！
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => shareToSocialMedia('twitter')}>
              分享到 Twitter
            </Button>
            <Button variant="outline" onClick={() => shareToSocialMedia('facebook')}>
              分享到 Facebook
            </Button>
            <Button variant="outline" onClick={() => shareToSocialMedia('weibo')}>
              分享到微博
            </Button>
            <Button variant="outline" onClick={() => shareToSocialMedia('wechat')}>
              分享到微信
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">如何获得更多翻译次数？</h2>
        <ul className="text-left space-y-2 mb-6">
          <li>1. 复制您的专属分享链接</li>
          <li>2. 分享给您的朋友、同事或社交媒体</li>
          <li>3. 当有人通过您的链接访问网站时，您将获得1次额外的翻译次数</li>
          <li>4. 额外的翻译次数将在30天内有效</li>
        </ul>
        <Button onClick={() => window.location.href = '/'}>
          返回首页
        </Button>
      </div>
    </div>
  );
} 