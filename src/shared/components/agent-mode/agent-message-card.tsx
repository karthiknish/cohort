'use client';
import { useCallback } from 'react';
import { domAnimation, LazyMotion, m } from '@/shared/ui/motion';
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, HelpCircle, Info, LoaderCircle, Navigation, RefreshCw, Sparkles, Zap, } from 'lucide-react';
import { Link } from '@/shared/ui/link';
import type { AgentAttachmentContext } from '@/lib/agent-attachments';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import type { AgentMessage, AgentPendingConfirmation } from '@/shared/hooks/use-agent-mode';
import { motionDurationSeconds, motionEasing } from '@/lib/animation-system';
import { cn } from '@/lib/utils';
import { buildAgentDataSections, type AgentDataSection } from './agent-message-data';
import { AgentDataSections } from './agent-data-sections';
import { AgentPlainText } from './agent-plain-text';
import { AgentMentionPills, AgentMentionText } from './mention-highlights';
import { AgentSpreadsheetDownload } from './agent-spreadsheet-download';
import { AgentMessageAttachmentChips } from './agent-mode-panel-sections';
const AGENT_MESSAGE_INITIAL = { opacity: 0, y: 10 } as const;
const AGENT_MESSAGE_ANIMATE = { opacity: 1, y: 0 } as const;
const AGENT_MESSAGE_ENHANCED_INITIAL = { opacity: 0, y: 10, scale: 0.98 } as const;
const AGENT_MESSAGE_ENHANCED_ANIMATE = { opacity: 1, y: 0, scale: 1 } as const;
const AGENT_MESSAGE_TRANSITION = {
    duration: motionDurationSeconds.normal,
    ease: motionEasing.out,
} as const;
type PresentationTone = 'success' | 'error' | 'warning' | 'info';
interface AgentMessageCardProps {
    message: AgentMessage;
    mentionLabels?: string[];
    conversationId?: string | null;
    workspaceId?: string | null;
    onStoreSpreadsheetExport?: (messageId: string, attachment: AgentAttachmentContext) => void;
    onRetryLastUserTurn?: () => void;
    onRetryUserMessage?: (clientId: string, content: string) => void;
    onConfirmPending?: (pending: AgentPendingConfirmation, decision: 'confirm' | 'cancel' | 'edit') => void;
    onUndoAction?: (messageId: string, undoHint: NonNullable<AgentMessage['metadata']>['undoHint']) => void;
    isProcessing?: boolean;
}
const EMPTY_MENTION_LABELS: string[] = [];
function AgentAvatar({ className }: {
    className?: string;
}) {
    return (<div className={cn('flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15', className)} aria-hidden>
      <Sparkles className="size-4 text-primary"/>
    </div>);
}
function getActionLabel(action?: string, operation?: string): string {
    if (operation === 'summarizeAdsPerformance') {
        return 'Ads Snapshot';
    }
    if (operation === 'summarizeAnalyticsPerformance') {
        return 'Analytics Snapshot';
    }
    if (operation === 'summarizeSocialPerformance') {
        return 'Social Insights';
    }
    if (operation === 'generatePerformanceReport') {
        return 'Report';
    }
    if (operation === 'summarizeMyTasks' || operation === 'summarizeClientTasks') {
        return 'Task Summary';
    }
    if (operation === 'listWorkspaceClients') {
        return 'Clients';
    }
    if (operation === 'listActiveProjects') {
        return 'Projects';
    }
    if (operation === 'listProposals') {
        return 'Proposals';
    }
    if (operation === 'summarizeMeetings') {
        return 'Meetings';
    }
    if (operation === 'requestAdsSync') {
        return 'Ads Sync';
    }
    if (operation === 'requestAnalyticsSync') {
        return 'Analytics Sync';
    }
    if (operation === 'requestSocialSync') {
        return 'Social Sync';
    }
    if (operation === 'markAllNotificationsRead') {
        return 'Notifications';
    }
    if (operation === 'exportSpreadsheet') {
        return 'Excel Export';
    }
    if (operation === 'createProject' || operation === 'updateProject') {
        return 'Project Action';
    }
    switch (action) {
        case 'navigate':
            return 'Navigation';
        case 'execute':
            return 'Action Executed';
        case 'clarify':
            return 'Clarification';
        default:
            return 'Response';
    }
}
function getActionIcon(action?: string) {
    switch (action) {
        case 'navigate':
            return <Navigation className="size-4"/>;
        case 'execute':
            return <Zap className="size-4"/>;
        case 'clarify':
            return <HelpCircle className="size-4"/>;
        default:
            return <Sparkles className="size-4"/>;
    }
}
function derivePresentationTone(message: AgentMessage): PresentationTone {
    const { status, metadata } = message;
    if (status === 'success')
        return 'success';
    if (status === 'error')
        return 'error';
    if (status === 'warning')
        return 'warning';
    if (metadata?.action === 'clarify')
        return 'warning';
    return 'info';
}
function usesStructuredAgentCard(message: AgentMessage): boolean {
    if (message.type !== 'agent')
        return false;
    const { status, metadata } = message;
    const action = metadata?.action;
    if (metadata?.requiresConfirmation)
        return true;
    if (status === 'error' || status === 'warning')
        return true;
    if (status === 'success' && action)
        return true;
    if (status === 'info' && action)
        return true;
    return false;
}
function getPresentationHeading(tone: PresentationTone, action?: string, operation?: string): string {
    if (tone === 'warning' && action !== 'clarify' && action !== 'execute' && action !== 'navigate') {
        return 'Heads up';
    }
    if (action === 'clarify') {
        return tone === 'warning' ? 'Need a bit more detail' : 'Clarification';
    }
    if (action === 'navigate') {
        if (tone === 'success')
            return 'Navigation ready';
        if (tone === 'error')
            return 'Navigation failed';
        return 'Navigation';
    }
    if (operation === 'summarizeAdsPerformance') {
        if (tone === 'success')
            return 'Snapshot ready';
        if (tone === 'error')
            return 'Snapshot failed';
        return 'Ads snapshot';
    }
    if (operation === 'summarizeAnalyticsPerformance') {
        if (tone === 'success')
            return 'Analytics ready';
        if (tone === 'error')
            return 'Analytics failed';
        return 'Analytics snapshot';
    }
    if (operation === 'summarizeSocialPerformance') {
        if (tone === 'success')
            return 'Social insights ready';
        if (tone === 'error')
            return 'Social insights failed';
        return 'Social insights';
    }
    if (operation === 'generatePerformanceReport') {
        if (tone === 'success')
            return 'Report ready';
        if (tone === 'error')
            return 'Report failed';
        return 'Report';
    }
    if (operation === 'createProject') {
        if (tone === 'success')
            return 'Project created';
        if (tone === 'error')
            return 'Project action failed';
        return 'Project';
    }
    if (operation === 'updateProject') {
        if (tone === 'success')
            return 'Project updated';
        if (tone === 'error')
            return 'Project action failed';
        return 'Project';
    }
    if (action === 'execute') {
        if (tone === 'success')
            return 'Action complete';
        if (tone === 'error')
            return 'Action failed';
        return 'Action';
    }
    if (tone === 'error')
        return 'Something went wrong';
    if (tone === 'info')
        return 'Reply';
    return 'Update';
}
function toneSurfaceClasses(tone: PresentationTone): {
    shell: string;
    header: string;
} {
    switch (tone) {
        case 'success':
            return {
                shell: 'border-accent/25 bg-accent/[0.07]',
                header: 'border-accent/20 bg-accent/10',
            };
        case 'error':
            return {
                shell: 'border-destructive/25 bg-destructive/[0.08]',
                header: 'border-destructive/20 bg-destructive/10',
            };
        case 'warning':
            return {
                shell: 'border-warning/30 bg-warning/[0.09]',
                header: 'border-warning/25 bg-warning/10',
            };
        default:
            return {
                shell: 'border-border/70 bg-muted/25',
                header: 'border-border/60 bg-muted/40',
            };
    }
}
function toneAccentClasses(tone: PresentationTone): {
    icon: string;
    title: string;
    badge: string;
    mention: string;
    section: string;
} {
    switch (tone) {
        case 'success':
            return {
                icon: 'text-primary',
                title: 'text-primary',
                badge: 'bg-background text-primary',
                mention: 'bg-accent/15 text-primary ring-primary/20',
                section: 'border-accent/20',
            };
        case 'error':
            return {
                icon: 'text-destructive',
                title: 'text-destructive',
                badge: 'bg-background text-destructive',
                mention: 'bg-destructive/15 text-destructive ring-destructive/20',
                section: 'border-destructive/20',
            };
        case 'warning':
            return {
                icon: 'text-warning',
                title: 'text-warning',
                badge: 'bg-background text-warning',
                mention: 'bg-warning/15 text-warning ring-warning/25',
                section: 'border-warning/25',
            };
        default:
            return {
                icon: 'text-muted-foreground',
                title: 'text-foreground',
                badge: 'bg-background text-muted-foreground',
                mention: 'bg-muted/80 text-foreground ring-border/40',
                section: 'border-border/60',
            };
    }
}
function StatusGlyph({ tone }: {
    tone: PresentationTone;
}) {
    if (tone === 'success') {
        return <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden/>;
    }
    if (tone === 'error') {
        return <AlertCircle className="size-4 shrink-0 text-destructive" aria-hidden/>;
    }
    if (tone === 'warning') {
        return <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden/>;
    }
    return <Info className="size-4 shrink-0 text-muted-foreground" aria-hidden/>;
}
function isRetryableData(data: Record<string, unknown> | undefined): boolean {
    return data?.retryable === true;
}
const STRUCTURED_DATA_OPERATIONS = new Set([
    'summarizeAdsPerformance',
    'summarizeAnalyticsPerformance',
    'summarizeSocialPerformance',
    'generatePerformanceReport',
    'summarizeMyTasks',
    'summarizeClientTasks',
    'listWorkspaceClients',
    'listActiveProjects',
    'listProposals',
    'summarizeMeetings',
    'requestAdsSync',
    'requestAnalyticsSync',
    'requestSocialSync',
    'markAllNotificationsRead',
    'exportSpreadsheet',
]);
function usesStructuredMetricsCard(operation?: string): boolean {
    return operation !== undefined && STRUCTURED_DATA_OPERATIONS.has(operation);
}
function resolveAgentDisplayContent(content: string, operation: string | undefined, dataSections: AgentDataSection[], data?: Record<string, unknown>): string {
    if (!usesStructuredMetricsCard(operation) || dataSections.length === 0) {
        return content;
    }
    const situation = typeof data?.currentSituation === 'string' ? data.currentSituation.trim() : '';
    if (situation.length > 0)
        return situation;
    const firstLine = content
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.length > 0);
    return firstLine ?? content.trim();
}
function routeLinkLabel(operation?: string): string {
    if (operation === 'summarizeAdsPerformance' || operation === 'requestAdsSync')
        return 'Open ads dashboard';
    if (operation === 'summarizeAnalyticsPerformance' || operation === 'requestAnalyticsSync')
        return 'Open analytics';
    if (operation === 'summarizeSocialPerformance' || operation === 'requestSocialSync')
        return 'Open socials';
    if (operation === 'generatePerformanceReport')
        return 'Open analytics';
    return 'Go to page';
}
function UserMessageStatus({ lifecycle, onResend, }: {
    lifecycle?: AgentMessage['lifecycle'];
    onResend?: () => void;
}) {
    if (lifecycle === 'sending') {
        return (<span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
        <LoaderCircle className="size-3 animate-spin" aria-hidden/>
        Sending…
      </span>);
    }
    if (lifecycle === 'failed' && onResend) {
        return (<div className="mt-1 flex items-center justify-end gap-2">
        <span className="text-[11px] text-destructive">Failed to send</span>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onResend}>
          <RefreshCw className="mr-1 size-3"/>
          Resend
        </Button>
      </div>);
    }
    return null;
}
function AgentConfirmationPanel({ message, isProcessing, onConfirmPending, }: {
    message: AgentMessage;
    isProcessing?: boolean;
    onConfirmPending?: AgentMessageCardProps['onConfirmPending'];
}) {
    const pending = message.metadata?.pendingConfirmation;
    const confirmation = message.metadata?.confirmation;
    const handleConfirm = () => {
        if (!pending)
            return;
        onConfirmPending?.(pending, 'confirm');
    };
    const handleEdit = () => {
        if (!pending)
            return;
        onConfirmPending?.(pending, 'edit');
    };
    const handleCancel = () => {
        if (!pending)
            return;
        onConfirmPending?.(pending, 'cancel');
    };
    if (!message.metadata?.requiresConfirmation || !pending || !confirmation) {
        return null;
    }
    return (<div className="mt-3 rounded-lg border border-warning/35 bg-warning/5 p-3 text-xs">
      <p className="font-medium text-foreground">Confirm before running</p>
      <p className="mt-1 leading-relaxed text-muted-foreground">{confirmation.summary}</p>

      {confirmation.affectedRecords && confirmation.affectedRecords.length > 0 ? (<ul className="mt-2 space-y-1 text-muted-foreground">
          {confirmation.affectedRecords.map((record) => (<li key={record}>• {record}</li>))}
        </ul>) : null}

      {confirmation.fields && Object.keys(confirmation.fields).length > 0 ? (<dl className="mt-2 grid gap-1.5 rounded-md border border-border/50 bg-background/70 px-2.5 py-2">
          {Object.entries(confirmation.fields).map(([key, value]) => (<div key={key} className="flex gap-2">
              <dt className="shrink-0 font-medium text-foreground">{key}</dt>
              <dd className="text-muted-foreground">{String(value)}</dd>
            </div>))}
        </dl>) : null}

      {confirmation.missingFields && confirmation.missingFields.length > 0 ? (<p className="mt-2 text-warning">
          Still needed: {confirmation.missingFields.join(', ')}
        </p>) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={isProcessing} onClick={handleConfirm}>
          Confirm
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={isProcessing} onClick={handleEdit}>
          Edit
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={isProcessing} onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>);
}
export function AgentMessageCard({ message, mentionLabels = EMPTY_MENTION_LABELS, conversationId = null, workspaceId = null, onStoreSpreadsheetExport, onRetryLastUserTurn, onRetryUserMessage, onConfirmPending, onUndoAction, isProcessing, }: AgentMessageCardProps) {
    const { type, content, status, metadata, route, steps } = message;
    const handleResend = () => {
        onRetryUserMessage?.(message.clientId, message.content);
    };
    const handleUndo = () => {
        if (!metadata?.undoHint)
            return;
        onUndoAction?.(message.id, metadata.undoHint);
    };
    if (type === 'user') {
        return (<LazyMotion features={domAnimation}>
        <m.div initial={AGENT_MESSAGE_INITIAL} animate={AGENT_MESSAGE_ANIMATE} className="flex flex-col items-end gap-1">
          <div className={cn('max-w-[90%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm', message.lifecycle === 'failed'
                ? 'bg-destructive/90 ring-1 ring-destructive/30'
                : 'bg-gradient-to-br from-primary to-primary/90 ring-1 ring-primary/20', message.lifecycle === 'sending' && 'opacity-75')}>
            <AgentMentionText text={content} mentionLabels={mentionLabels} mentionClassName="bg-primary-foreground/20 text-primary ring-primary-foreground/30"/>
            {message.mentions && message.mentions.length > 0 ? (<AgentMentionPills mentions={message.mentions}/>) : null}
            {message.attachments && message.attachments.length > 0 ? (<AgentMessageAttachmentChips attachments={message.attachments}/>) : null}
          </div>
          <UserMessageStatus lifecycle={message.lifecycle} onResend={onRetryUserMessage ? handleResend : undefined}/>
        </m.div>
      </LazyMotion>);
    }
    const action = metadata?.action;
    const operation = metadata?.operation;
    const dataSections = buildAgentDataSections(operation, metadata?.data);
    const tone = derivePresentationTone(message);
    const surfaces = toneSurfaceClasses(tone);
    const accents = toneAccentClasses(tone);
    const liveRegion = tone === 'error' || tone === 'warning' ? 'assertive' : 'off';
    const usedContextNames = metadata?.usedContext?.attachmentNames ?? [];
    const executeSucceeded = metadata?.action === 'execute' && metadata.success === true;
    const showRouteLink = Boolean(route) && (tone === 'success' || executeSucceeded);
    const displayContent = resolveAgentDisplayContent(content, operation, dataSections, metadata?.data);
    const detailUserMessage = typeof metadata?.data?.userMessage === 'string' && metadata.data.userMessage.trim().length > 0
        ? metadata.data.userMessage.trim()
        : null;
    const showDetailLine = !usesStructuredMetricsCard(operation) &&
        Boolean(detailUserMessage && detailUserMessage !== content.trim() && detailUserMessage !== displayContent.trim());
    const showRetryButton = Boolean(onRetryLastUserTurn) && isRetryableData(metadata?.data) && metadata?.action === 'execute';
    if (usesStructuredAgentCard(message)) {
        const heading = getPresentationHeading(tone, action, operation);
        const statusLabel = tone === 'success'
            ? 'Success'
            : tone === 'error'
                ? 'Error'
                : tone === 'warning'
                    ? 'Warning'
                    : 'Information';
        return (<LazyMotion features={domAnimation}>
        <m.div initial={AGENT_MESSAGE_ENHANCED_INITIAL} animate={AGENT_MESSAGE_ENHANCED_ANIMATE} transition={AGENT_MESSAGE_TRANSITION} className="flex items-start gap-3">
          <AgentAvatar />
          <output aria-live={liveRegion} className={cn('min-w-0 max-w-[44rem] flex-1 overflow-hidden rounded-2xl rounded-tl-md border shadow-sm', surfaces.shell)}>
            <div className={cn('flex items-center gap-2 border-b px-4 py-2.5', surfaces.header)}>
              <StatusGlyph tone={tone}/>
              <span className={cn('min-w-0 flex-1 text-sm font-medium', accents.title)}>{heading}</span>
              <span className="sr-only">{statusLabel}</span>
              <Badge variant="secondary" className={cn('ml-auto shrink-0 text-xs', accents.badge)}>
                <span className="inline-flex items-center gap-1">
                  {getActionIcon(action)}
                  <span>{getActionLabel(action, operation)}</span>
                </span>
              </Badge>
            </div>

            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed text-foreground">
                <AgentMentionText text={displayContent} mentionLabels={mentionLabels} mentionClassName={accents.mention}/>
              </p>
              {usedContextNames.length > 0 ? (<p className="mt-2 text-xs text-muted-foreground">
                  Used context from: {usedContextNames.join(', ')}
                </p>) : null}

              {showDetailLine ? (<p className="mt-2 rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  {detailUserMessage}
                </p>) : null}

              {steps && steps.length > 0 ? (<ol className="mt-3 space-y-1 border-t border-border/50 pt-3">
                  {steps.map((step) => (<li key={step.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn('size-1.5 shrink-0 rounded-full', step.status === 'completed' && 'bg-primary', step.status === 'failed' && 'bg-destructive', step.status === 'active' && 'bg-primary animate-pulse', step.status === 'pending' && 'bg-muted-foreground/40')}/>
                      <span className={step.status === 'failed' ? 'text-destructive' : undefined}>{step.label}</span>
                    </li>))}
                </ol>) : null}

              <AgentConfirmationPanel message={message} isProcessing={isProcessing} onConfirmPending={onConfirmPending}/>

              {metadata?.undoHint && onUndoAction ? (<div className="mt-3">
                  <Button type="button" size="sm" variant="outline" className="gap-2" onClick={handleUndo}>
                    <RefreshCw className="size-3.5"/>
                    Undo {metadata.undoHint.label.toLowerCase()}
                  </Button>
                </div>) : null}

              <AgentDataSections sections={dataSections} operation={operation} data={metadata?.data} accentClass={accents.section}/>

              <AgentSpreadsheetDownload messageId={message.id} conversationId={conversationId ?? null} workspaceId={workspaceId ?? null} data={metadata?.data} attachments={message.attachments} onStored={onStoreSpreadsheetExport}/>

              {message.attachments && message.attachments.length > 0 ? (<div className="mt-3">
                  <AgentMessageAttachmentChips attachments={message.attachments}/>
                </div>) : null}

              {showRouteLink ? (<div className="mt-3">
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href={route!}>
                      {routeLinkLabel(operation)}
                      <ArrowRight className="size-3"/>
                    </Link>
                  </Button>
                </div>) : null}

              {showRetryButton ? (<div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button type="button" size="sm" variant="outline" className="gap-2" onClick={onRetryLastUserTurn}>
                    <RefreshCw className="size-3.5"/>
                    Try again
                  </Button>
                  <span className="text-xs text-muted-foreground">Resends your last request.</span>
                </div>) : null}

              {operation && !usesStructuredMetricsCard(operation) ? (<div className="mt-2 text-xs text-muted-foreground">
                  Operation: <code className="rounded bg-muted px-1 py-0.5">{operation}</code>
                </div>) : null}
            </div>
          </output>
        </m.div>
      </LazyMotion>);
    }
    return (<LazyMotion features={domAnimation}>
      <m.div initial={AGENT_MESSAGE_INITIAL} animate={AGENT_MESSAGE_ANIMATE} className="flex items-start gap-3">
        <AgentAvatar />
        <div className="max-w-[44rem] flex-1 rounded-2xl rounded-tl-md border border-border/50 bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm">
          <AgentPlainText text={content} mentionLabels={mentionLabels} mentionClassName="bg-primary/10 text-primary ring-primary/15"/>
        </div>
      </m.div>
    </LazyMotion>);
}
