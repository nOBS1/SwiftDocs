'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { checkUsageLimit, getTodayUsage, getShareBonus } from '@/lib/usage-tracker';

export function UsageLimitInfo() {
  const [usageInfo, setUsageInfo] = useState<{ used: number; remaining: number; bonus: number } | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const updateUsageInfo = () => {
      const used = getTodayUsage();
      const { remaining } = checkUsageLimit();
      const bonus = getShareBonus();
      setUsageInfo({ used, remaining, bonus });
    };
    
    updateUsageInfo();
    
    // 每分钟更新一次使用信息
    const interval = setInterval(updateUsageInfo, 60000);
    return () => clearInterval(interval);
  }, []);
  
  if (!usageInfo) return null;
  
  // 如果剩余次数很多，不显示提示
  if (usageInfo.remaining > 10) return null;
  
  // 如果已经用完免费次数，显示分享提示
  if (usageInfo.remaining <= 0) {
    return (
      <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
        <AlertTitle className="text-red-700 dark:text-red-400">
          今日免费使用次数已用完
        </AlertTitle>
        <AlertDescription className="text-red-600 dark:text-red-500">
          您今天的免费使用次数已用完。通过分享链接给朋友，每当有人通过您的链接访问网站，您将获得额外的翻译次数！
          <div className="mt-2">
            <Button 
              variant="default" 
              onClick={() => router.push('/share')}
            >
              立即分享获取更多次数
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  // 如果剩余次数较少，显示提醒
  if (usageInfo.remaining <= 3) {
    return (
      <Alert className="mb-6">
        <AlertTitle>今日免费使用次数即将用完</AlertTitle>
        <AlertDescription>
          您今天还剩余 {usageInfo.remaining} 次免费翻译。通过分享可以获得更多使用次数！
          {usageInfo.bonus > 0 && (
            <span className="block mt-1">
              您已通过分享获得了 {usageInfo.bonus} 次额外翻译次数！
            </span>
          )}
          <Button 
            variant="link" 
            className="p-0 h-auto ml-2"
            onClick={() => router.push('/share')}
          >
            立即分享
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
} 