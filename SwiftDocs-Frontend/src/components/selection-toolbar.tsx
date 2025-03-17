import { Button } from '@/components/ui/button';
import { Translate, Copy, X } from 'lucide-react';
import { useTranslationStore } from '@/store/translation-store';
import { OCRResult } from '@/types';
import { toast } from 'sonner';

interface SelectionToolbarProps {
  result?: OCRResult;
  onTranslate?: () => void;
  onClose?: () => void;
}

export function SelectionToolbar({ result, onTranslate, onClose }: SelectionToolbarProps) {
  const handleCopy = async () => {
    if (!result?.text) return;
    
    try {
      await navigator.clipboard.writeText(result.text);
      toast('复制成功', {
        description: '已将选中文本复制到剪贴板',
      });
    } catch (error) {
      console.error('复制失败:', error);
      toast('复制失败', {
        description: '无法复制文本到剪贴板',
        style: { backgroundColor: 'red', color: 'white' },
      });
    }
  };
  
  if (!result) return null;
  
  return (
    <div className="absolute z-20 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg p-2 flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={onTranslate}
        className="text-primary"
      >
        <Translate className="h-4 w-4 mr-2" />
        翻译
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4 mr-2" />
        复制
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
} 