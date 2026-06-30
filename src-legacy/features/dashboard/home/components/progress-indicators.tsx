'use client';
import { useState, useCallback, useMemo } from 'react';
import { Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/lib/utils';
import type { Operation } from './progress-indicators-types';
import { ProgressOperationItem } from './progress-operation-item';
import { CompletedProgressOperationItem } from './completed-progress-operation-item';
import { MinimalProgressIndicator } from './minimal-progress-indicator';
export type { OperationStatus, Operation } from './progress-indicators-types';
export { useProgressOperations } from './use-progress-operations';
export { InlineProgress } from './inline-progress';
export { StepProgress } from './step-progress';
const noop = () => { };
interface ProgressIndicatorsProps {
    operations: Operation[];
    onDismiss?: (operationId: string) => void;
    onDismissAll?: () => void;
    className?: string;
    variant?: 'default' | 'compact' | 'minimal';
    position?: 'top-right' | 'top-center' | 'bottom-right';
}
/**
 * Progress indicators for long-running operations
 * Supports batch operations, multi-step processes, and pause/resume
 */
export function ProgressIndicators({ operations, onDismiss, onDismissAll, className, variant = 'default', position = 'top-right', }: ProgressIndicatorsProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [collapsedOps, setCollapsedOps] = useState<Set<string>>(new Set());
    const activeOperations = operations.filter((op) => ['pending', 'running', 'paused'].includes(op.status));
    const completedOperations = operations.filter((op) => ['completed', 'failed', 'cancelled'].includes(op.status));
    const toggleCollapsed = (opId: string) => {
        setCollapsedOps((prev) => {
            const next = new Set(prev);
            if (next.has(opId)) {
                next.delete(opId);
            }
            else {
                next.add(opId);
            }
            return next;
        });
    };
    const handleToggleExpanded = () => {
        setIsExpanded((prev) => !prev);
    };
    const collapseHandlers = Object.fromEntries(operations.map((op) => [op.id, () => toggleCollapsed(op.id)])) as Record<string, () => void>;
    const dismissHandlers = Object.fromEntries(operations.map((op) => [op.id, () => onDismiss?.(op.id)])) as Record<string, () => void>;
    if (variant === 'minimal') {
        return (<div className={cn('fixed top-4 right-4 z-50 flex flex-col gap-2', className)}>
        {activeOperations.map((op) => (<MinimalProgressIndicator key={op.id} operation={op}/>))}
      </div>);
    }
    return (<div className={cn('fixed z-50 flex flex-col gap-2 max-w-md w-full', {
            'top-4 right-4': position === 'top-right',
            'top-4 left-1/2 -translate-x-1/2': position === 'top-center',
            'bottom-4 right-4': position === 'bottom-right',
        }, className)}>
      {activeOperations.length > 0 && (<Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="size-2 animate-pulse rounded-full bg-primary"/>
              <CardTitle className="text-sm">
                {activeOperations.length} operation{activeOperations.length !== 1 ? 's' : ''} in progress
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-7" onClick={handleToggleExpanded} aria-expanded={isExpanded} aria-label={isExpanded ? 'Collapse progress panel' : 'Expand progress panel'}>
                {isExpanded ? (<Minimize2 className="size-4" aria-hidden/>) : (<Maximize2 className="size-4" aria-hidden/>)}
              </Button>
              {onDismissAll && activeOperations.length > 1 && (<Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onDismissAll}>
                  Dismiss All
                </Button>)}
            </div>
          </CardHeader>

          {isExpanded && (<CardContent className="pt-0 px-4 pb-4 space-y-3">
              {activeOperations.map((op) => (<ProgressOperationItem key={op.id} operation={op} isCollapsed={collapsedOps.has(op.id)} onToggleCollapse={collapseHandlers[op.id] ?? noop}/>))}
            </CardContent>)}
        </Card>)}

      {completedOperations.length > 0 && variant !== 'compact' && (<div className="space-y-2">
          {completedOperations.slice(0, 3).map((op) => (<CompletedProgressOperationItem key={op.id} operation={op} onDismiss={dismissHandlers[op.id] ?? noop}/>))}
        </div>)}
    </div>);
}
