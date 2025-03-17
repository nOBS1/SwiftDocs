'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ApiKeys {
  openai: string;
  deepseek: string;
  baidu_app_id: string;
  baidu_app_key: string;
  google: string;
  azure: string;
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    deepseek: '',
    baidu_app_id: '',
    baidu_app_key: '',
    google: '',
    azure: ''
  });
  
  // 加载保存的API密钥
  useEffect(() => {
    const loadApiKeys = () => {
      try {
        const savedKeys = localStorage.getItem('api_keys');
        if (savedKeys) {
          setApiKeys(JSON.parse(savedKeys));
        }
      } catch (error) {
        console.error('加载API密钥失败:', error);
      }
    };
    
    loadApiKeys();
  }, []);
  
  // 处理输入变化
  const handleInputChange = (key: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // 保存API密钥
  const handleSave = () => {
    try {
      localStorage.setItem('api_keys', JSON.stringify(apiKeys));
      
      toast('保存成功', {
        description: 'API密钥已保存到本地存储',
      });
    } catch (error) {
      console.error('保存API密钥失败:', error);
      
      toast('保存失败', {
        description: '无法保存API密钥',
        style: { backgroundColor: 'red', color: 'white' },
      });
    }
  };
  
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">API设置</h1>
          <p className="text-muted-foreground">
            配置各种翻译服务的API密钥，这些密钥将安全地存储在您的浏览器本地存储中。
          </p>
          <p className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
            <strong>注意：</strong> 如果您不提供自己的API密钥，系统将使用内置的默认密钥。但为了获得最佳体验和避免限制，建议使用您自己的API密钥。
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>大模型AI翻译</CardTitle>
            <CardDescription>
              配置OpenAI和DeepSeek等大模型AI的API密钥
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai">OpenAI API密钥</Label>
              <Input
                id="openai"
                type="password"
                value={apiKeys.openai}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('openai', e.target.value)}
                placeholder="sk-..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deepseek">DeepSeek API密钥</Label>
              <Input
                id="deepseek"
                type="password"
                value={apiKeys.deepseek}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('deepseek', e.target.value)}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                DeepSeek API 密钥可在 <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DeepSeek 平台</a> 获取。
                本应用使用 DeepSeek-chat 模型进行翻译。如果不提供，将使用内置的默认密钥。
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>百度翻译</CardTitle>
            <CardDescription>
              配置百度翻译API的应用ID和密钥
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="baidu_app_id">百度翻译 APP ID</Label>
              <Input
                id="baidu_app_id"
                value={apiKeys.baidu_app_id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('baidu_app_id', e.target.value)}
                placeholder="请输入百度翻译APP ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baidu_app_key">百度翻译 APP Key</Label>
              <Input
                id="baidu_app_key"
                type="password"
                value={apiKeys.baidu_app_key}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('baidu_app_key', e.target.value)}
                placeholder="请输入百度翻译APP Key"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>其他翻译服务</CardTitle>
            <CardDescription>
              配置Google翻译和Azure AI翻译的API密钥
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google">Google翻译 API密钥</Label>
              <Input
                id="google"
                type="password"
                value={apiKeys.google}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('google', e.target.value)}
                placeholder="请输入Google翻译API密钥"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="azure">Azure AI翻译 API密钥</Label>
              <Input
                id="azure"
                type="password"
                value={apiKeys.azure}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('azure', e.target.value)}
                placeholder="请输入Azure AI翻译API密钥"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>保存设置</Button>
        </div>
      </div>
    </div>
  );
} 