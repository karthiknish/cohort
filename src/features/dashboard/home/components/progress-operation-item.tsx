'use client';
import { Pause, Play, RotateCcw, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { ClientFormattedDate } from '@/shared/components/client-formatted-date';
import { cn } from '@/lib/utils';
import type { Operation, OperationStatus } from './progress-indicators-types';
import { getElapsedTime } from './progress-elapsed-time';
import { ProgressOperationStepIndicator } from './progress-operation-step-indicator';
export function ProgressOperationItem({ operation, isCollapsed, onToggleCollapse, }: {
    operation: Operation;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}) {
    const statusBadges: Record<OperationStatus, {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        label: string;
    }> = {
        pending: { variant: 'secondary', label: 'Pending' },
        running: { variant: 'default', label: 'Running' },
        paused: { variant: 'outline', label: 'Paused' },
        completed: { variant: 'outline', label: 'Completed' },
        failed: { variant: 'destructive', label: 'Failed' },
        cancelled: { variant: 'secondary', label: 'Cancelled' },
    };
    const progressText = operation.total && operation.current
        ? `${operation.current} of ${operation.total}`
        : `${operation.progress}%`;
    return (<div className="space-y-2 p-3 rounded-lg bg-muted/50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Badge variant={statusBadges[operation.status].variant} className="shrink-0">
            {statusBadges[operation.status].label}
          </Badge>
          <span className="text-sm font-medium truncate">{operation.name}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {operation.status === 'running' && operation.onPause && (<Button variant="ghost" size="icon" className="size-7" onClick={operation.onPause} title="Pause" aria-label={`Pause ${operation.name}`}>
              <Pause className="size-3.5" aria-hidden/>
            </Button>)}
          {operation.status === 'paused' && operation.onResume && (<Button variant="ghost" size="icon" className="size-7" onClick={operation.onResume} title="Resume" aria-label={`Resume ${operation.name}`}>
              <Play className="size-3.5" aria-hidden/>
            </Button>)}
          {operation.status === 'failed' && operation.onRetry && (<Button variant="ghost" size="icon" className="size-7" onClick={operation.onRetry} title="Retry" aria-label={`Retry ${operation.name}`}>
              <RotateCcw className="size-3.5" aria-hidden/>
            </Button>)}
          {operation.onCancel && ['running', 'pending', 'paused'].includes(operation.status) && (<Button variant="ghost" size="icon" className="size-7" onClick={operation.onCancel} title="Cancel" aria-label={`Cancel ${operation.name}`}>
              <X className="size-3.5" aria-hidden/>
            </Button>)}
          <Button variant="ghost" size="icon" className="size-7" onClick={onToggleCollapse} aria-expanded={!isCollapsed} aria-label={isCollapsed ? `Expand details for ${operation.name}` : `Collapse details for ${operation.name}`}>
            {isCollapsed ? (<Minimize2 className="size-3.5" aria-hidden/>) : (<Maximize2 className="size-3.5" aria-hidden/>)}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progressText}</span>
          {operation.startTime && operation.status !== 'pending' && (<span>{getElapsedTime(operation.startTime, operation.endTime)}</span>)}
        </div>
        <Progress value={operation.progress} className="h-2"/>
      </div>

      {!isCollapsed && (<div className="space-y-2 pt-2 border-t">
          {operation.description && (<p className="text-xs text-muted-foreground">{operation.description}</p>)}

          {operation.steps && operation.steps.length > 0 && (<div className="space-y-1">
              {operation.steps.map((step) => (<div key={`${step.name}-${step.timestamp ?? step.status}`} className="flex items-center gap-2 text-xs">
                  <ProgressOperationStepIndicator status={step.status}/>
                  <span className={cn(step.status === 'completed' && 'text-muted-foreground line-through', step.status === 'failed' && 'text-destructive', step.status === 'running' && 'font-medium')}>
                    {step.name}
                  </span>
                  {step.timestamp ? (<ClientFormattedDate value={step.timestamp} formatStr="h:mm:ss a" className="text-muted-foreground ml-auto"/>) : null}
                </div>))}
            </div>)}

          {operation.status === 'failed' && operation.error && (<p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
              {operation.error}
            </p>)}
        </div>)}
    </div>);
}
