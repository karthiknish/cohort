'use client';
import { AlertCircle, Check, Clock, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentExecutionStep } from '@/shared/hooks/use-agent-mode';
import { ChatTypingIndicator } from '@/shared/ui/chat-typing-indicator';
const AGENT_TYPING_ICON = <Sparkles className="size-4 text-primary" aria-hidden/>;
const EMPTY_AGENT_EXECUTION_STEPS: AgentExecutionStep[] = [];
function stepStatusIcon(status: AgentExecutionStep['status']) {
    if (status === 'completed')
        return <Check className="size-3.5 text-primary" aria-hidden/>;
    if (status === 'failed')
        return <AlertCircle className="size-3.5 text-destructive" aria-hidden/>;
    if (status === 'active')
        return <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden/>;
    return <Clock className="size-3.5 text-muted-foreground" aria-hidden/>;
}
export function AgentExecutionTimeline({ steps = EMPTY_AGENT_EXECUTION_STEPS, label, }: {
    steps?: AgentExecutionStep[];
    label: string;
}) {
    if (steps.length === 0) {
        return <ChatTypingIndicator label={label} variant="bubble" icon={AGENT_TYPING_ICON}/>;
    }
    return (<output className="flex gap-3" aria-live="polite" aria-atomic="true">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15">
        <Sparkles className="size-4 text-primary" aria-hidden/>
      </div>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border/60 bg-card/90 p-3 shadow-sm">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <ol className="mt-2 space-y-2">
          {steps.map((step) => (<li key={step.id} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 shrink-0">{stepStatusIcon(step.status)}</span>
              <span className="min-w-0">
                <span className={cn('font-medium', step.status === 'failed' && 'text-destructive', step.status === 'active' && 'text-foreground', step.status === 'completed' && 'text-foreground', step.status === 'pending' && 'text-muted-foreground')}>
                  {step.label}
                </span>
                {step.detail ? <span className="mt-0.5 block text-muted-foreground">{step.detail}</span> : null}
              </span>
            </li>))}
        </ol>
      </div>
    </output>);
}
