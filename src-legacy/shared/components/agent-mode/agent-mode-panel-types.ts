import type { RefObject } from 'react';
import type { AgentError } from '@/lib/agent-errors';
import type { AgentPanelLayout } from '@/lib/agent-panel-layout';
import type { AgentMentionEntity } from '@/lib/agent-mentions';
import type { AgentAttachmentContext } from '@/lib/agent-attachments';
import type { AgentContextIds } from '@/lib/agent-context';
import type { AgentConversationSummary, AgentExecutionStep, AgentMessage, AgentPendingConfirmation, ConnectionStatus, } from '@/shared/hooks/use-agent-mode';
export type AgentPanelRuntimeState = {
    open: boolean;
    processing: boolean;
    extractingAttachments: boolean;
};
export type AgentHistoryLoadState = {
    historyLoading: boolean;
    conversationLoading: boolean;
    showArchived?: boolean;
};
export type AgentScrollBehavior = {
    pinnedToBottom?: boolean;
};
export interface AgentModePanelProps {
    runtime: AgentPanelRuntimeState;
    activeContext: AgentContextIds;
    maxMessageLength: number;
    onClose: () => void;
    onOpenChange?: (open: boolean) => void;
    requestCloseRef?: RefObject<(() => void) | null>;
    onPanelLayoutChange?: (layout: AgentPanelLayout) => void;
    messages: AgentMessage[];
    onSendMessage: (text: string, options?: {
        mentions?: AgentMentionEntity[];
    }) => void;
    pendingAttachments: AgentAttachmentContext[];
    onAddAttachments: (files: FileList | File[]) => Promise<void>;
    onRemoveAttachment: (attachmentId: string) => void;
    onClear: () => void;
    conversationId: string | null;
    history: AgentConversationSummary[];
    historyLoad: AgentHistoryLoadState;
    historyError?: string | null;
    historyHasMore?: boolean;
    historySearch?: string;
    onHistorySearchChange?: (value: string) => void;
    onShowArchivedHistoryChange?: (value: boolean) => void;
    onLoadMoreHistory?: () => void;
    onRetryHistory?: () => void;
    onPinConversation?: (conversationId: string, pinned: boolean) => void;
    onArchiveConversation?: (conversationId: string, archived: boolean) => void;
    loadingConversationId?: string | null;
    onOpenHistory: () => void;
    onSelectConversation: (conversationId: string) => void;
    onUpdateConversationTitle: (conversationId: string, title: string) => void;
    onDeleteConversation: (conversationId: string) => void;
    onDuplicateConversation?: (conversationId: string) => Promise<string | null>;
    onExportConversation?: (conversationId: string, format?: 'json' | 'markdown') => Promise<{
        content: string;
        title: string;
    } | null>;
    onShareConversation?: (conversationId: string) => Promise<{
        markdown: string;
        deepLink: string;
    } | null>;
    error?: AgentError | null;
    onClearError?: () => void;
    lastFailedMessage?: string | null;
    onRetry?: () => void;
    onRetryLastUserTurn?: () => void;
    onRetryUserMessage?: (clientId: string, content: string) => void;
    onConfirmPending?: (pending: AgentPendingConfirmation, decision: 'confirm' | 'cancel' | 'edit') => void;
    onUndoAction?: (messageId: string, undoHint: NonNullable<AgentMessage['metadata']>['undoHint']) => void;
    processingSteps?: AgentExecutionStep[];
    processingLabel?: string;
    scrollContainerRef?: RefObject<HTMLDivElement | null>;
    onMessagesScroll?: () => void;
    scrollBehavior?: AgentScrollBehavior;
    onJumpToLatest?: () => void;
    connectionStatus?: ConnectionStatus;
    rateLimitCountdown?: number | null;
    workspaceId?: string | null;
    onStoreSpreadsheetExport?: (messageId: string, attachment: AgentAttachmentContext) => void;
}
