import { useTranslationStore } from '@/store/translation-store';
import { TranslationTask } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function TaskList() {
  const { tasks, removeTask } = useTranslationStore();
  
  if (tasks.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">翻译任务</h2>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onRemove={() => removeTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: TranslationTask;
  onRemove: () => void;
}

function TaskCard({ task, onRemove }: TaskCardProps) {
  const getStatusText = (status: TranslationTask['status']) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return '未知状态';
    }
  };
  
  const getStatusColor = (status: TranslationTask['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            {task.mode === 'selection' ? '划词翻译' : '全文翻译'}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              创建于 {formatDistanceToNow(new Date(task.created_at), { 
                locale: zhCN,
                addSuffix: true 
              })}
            </span>
            
            {task.status === 'processing' && (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                {task.progress}%
              </span>
            )}
          </div>
          
          {task.status === 'processing' && (
            <Progress value={task.progress} className="h-1" />
          )}
          
          {task.error && (
            <p className="text-sm text-red-500">
              错误: {task.error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 