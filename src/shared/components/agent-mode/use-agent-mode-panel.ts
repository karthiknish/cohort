'use client';
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/shared/contexts/auth-context';
import { useMentionData } from '@/shared/hooks/use-mention-data';
import { getAgentSuggestions, trackAgentSuggestionClick, type AgentSuggestion } from '@/lib/agent-context';
import { AGENT_ATTACHMENT_ACCEPT } from '@/lib/agent-attachments';
import { notifySuccess } from '@/lib/notifications';
import { agentCloseBlockerMessage, getAgentCloseBlockers, shouldBlockAgentClose, } from '@/lib/agent-close-guard';
import { readAgentPanelLayout, writeAgentPanelLayout, type AgentPanelLayout } from '@/lib/agent-panel-layout';
import { useAgentPanelUrl } from '@/shared/hooks/use-agent-panel-url';
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcuts';
import { useAgentPanelComposer } from './use-agent-panel-composer';
import type { AgentComposerSectionProps } from './agent-mode-panel-sections';
import type { AgentModePanelProps } from './agent-mode-panel-types';
const noop = () => { };
const EMPTY_PROCESSING_STEPS: AgentModePanelProps['processingSteps'] = [];
export function useAgentModePanel({ runtime, maxMessageLength, onClose, onOpenChange, requestCloseRef, onPanelLayoutChange, messages, onSendMessage, pendingAttachments, onAddAttachments, onRemoveAttachment, onClear, conversationId, history, historyLoad, loadingConversationId = null, onOpenHistory, onSelectConversation, onUpdateConversationTitle, onDeleteConversation, onDuplicateConversation, onExportConversation, onShareConversation, onClearError, lastFailedMessage, onRetry, onRetryLastUserTurn, onRetryUserMessage, onConfirmPending, onUndoAction, processingSteps = EMPTY_PROCESSING_STEPS, processingLabel = 'Thinking…', scrollContainerRef: scrollContainerRefProp, onMessagesScroll, scrollBehavior, onJumpToLatest, connectionStatus = 'connected', rateLimitCountdown, workspaceId = null, onStoreSpreadsheetExport, error = null, historyError = null, historyHasMore = false, historySearch = '', onHistorySearchChange, onShowArchivedHistoryChange, onLoadMoreHistory, onRetryHistory, onPinConversation, onArchiveConversation, }: AgentModePanelProps) {
    const { open: isOpen, processing: isProcessing, extractingAttachments: isExtractingAttachments } = runtime;
    const { historyLoading: isHistoryLoading, conversationLoading: isConversationLoading = false, showArchived: showArchivedHistory = false, } = historyLoad;
    const { pinnedToBottom: isPinnedToBottom = true } = scrollBehavior ?? {};
    const pathname = usePathname();
    const { user } = useAuth();
    const [panelLayout, setPanelLayout] = useState<AgentPanelLayout>(() => typeof window === 'undefined' ? 'fullscreen' : readAgentPanelLayout());
    const [showHistory, setShowHistory] = useState(false);
    const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const localScrollRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = scrollContainerRefProp ?? localScrollRef;
    const isDraggingFilesRef = useRef(false);
    const { clients, projects, teams, users, allItems, isLoading: mentionsLoading } = useMentionData();
    const mentionLabels = allItems.map((item) => item.name);
    const quickSuggestions = getAgentSuggestions(pathname, { role: user?.role });
    const { inputValue, showMentions, mentionQuery, inputRef, mentionDropdownRef, handleVoiceTranscript, handleVoiceInterim, handleSubmit, handleInputChange, handleMentionSelect, clearComposer, closeMentions, } = useAgentPanelComposer({
        isOpen,
        isProcessing,
        isExtractingAttachments,
        onSendMessage,
    });
    const handleRetryUserMessage = (clientId: string, content: string) => {
        onRetryUserMessage?.(clientId, content);
    };
    const handleSetPanelLayout = (layout: AgentPanelLayout) => {
        setPanelLayout(layout);
        writeAgentPanelLayout(layout);
        onPanelLayoutChange?.(layout);
    };
    const closeGuardState = ({
        composerText: inputValue,
        pendingAttachments,
        isProcessing,
        isExtractingAttachments,
        messages,
    });
    const requestClose = useEffectEvent(() => {
        if (shouldBlockAgentClose(closeGuardState)) {
            const confirmed = window.confirm(agentCloseBlockerMessage(getAgentCloseBlockers(closeGuardState)));
            if (!confirmed)
                return;
        }
        onClose();
    });
    useEffect(() => {
        if (!requestCloseRef) {
            return;
        }
        requestCloseRef.current = requestClose;
    }, [requestCloseRef]);
    useEffect(() => {
        if (!requestCloseRef)
            return;
        const closeRef = requestCloseRef;
        return () => {
            closeRef.current = null;
        };
    }, [requestCloseRef]);
    const { openHistoryView, closeHistoryView } = useAgentPanelUrl({
        isOpen,
        setOpen: (open) => {
            if (open)
                onOpenChange?.(true);
            else
                requestClose();
        },
        showHistory,
        setShowHistory,
        conversationId,
        onLoadConversation: (id) => {
            void onSelectConversation(id);
        },
    });
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (showMentions && mentionDropdownRef.current?.handleKeyDown(e)) {
            return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            if (showHistory && editingConversationId) {
                setEditingConversationId(null);
                return;
            }
            if (showHistory) {
                closeHistoryView();
                return;
            }
            requestClose();
        }
    };
    const handleSuggestionClick = (suggestion: AgentSuggestion) => {
        trackAgentSuggestionClick({
            suggestionId: suggestion.id,
            prompt: suggestion.prompt,
            pathname,
            operation: suggestion.operation,
        });
        onSendMessage(suggestion.prompt);
    };
    const handleCloseMentions = closeMentions;
    const handleOpenFilePicker = () => {
        fileInputRef.current?.click();
    };
    const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0)
            return;
        await onAddAttachments(files);
        event.target.value = '';
    };
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.types.includes('Files')) {
            isDraggingFilesRef.current = true;
        }
    };
    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const nextTarget = event.relatedTarget;
        if (!nextTarget || !(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
            isDraggingFilesRef.current = false;
        }
    };
    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        isDraggingFilesRef.current = false;
        if (event.dataTransfer.files.length === 0)
            return;
        await onAddAttachments(event.dataTransfer.files);
    };
    const handleRetry = () => {
        onClearError?.();
        onRetry?.();
    };
    const handleStartNewChat = () => {
        onClear();
        clearComposer();
        closeHistoryView();
        setEditingConversationId(null);
        setEditingTitle('');
        setTimeout(() => inputRef.current?.focus(), 0);
    };
    const handleToggleHistory = () => {
        if (showHistory) {
            closeHistoryView();
            return;
        }
        void onOpenHistory();
        openHistoryView();
    };
    const handleCloseHistory = () => {
        closeHistoryView();
    };
    const handleDuplicateConversation = async (targetConversationId: string) => {
        const newId = await onDuplicateConversation?.(targetConversationId);
        if (newId) {
            notifySuccess({ message: 'Chat duplicated' });
            await onSelectConversation(newId);
        }
    };
    const handleExportConversation = async (targetConversationId: string) => {
        const exported = await onExportConversation?.(targetConversationId, 'markdown');
        if (!exported)
            return;
        const blob = new Blob([exported.content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${exported.title.replace(/[^\w.-]+/g, '-').slice(0, 48) || 'agent-chat'}.md`;
        anchor.click();
        URL.revokeObjectURL(url);
        notifySuccess({ message: 'Chat exported' });
    };
    const handleShareConversation = async (targetConversationId: string) => {
        const shared = await onShareConversation?.(targetConversationId);
        if (!shared)
            return;
        const payload = `${shared.markdown}\n\nOpen in Cohort: ${shared.deepLink}`;
        try {
            await navigator.clipboard.writeText(payload);
            notifySuccess({ message: 'Share link copied to clipboard' });
        }
        catch {
            notifySuccess({ message: 'Share text ready — copy from export if clipboard is blocked' });
        }
    };
    const handleStartNewChatShortcut = () => {
        if (!isOpen)
            return;
        handleStartNewChat();
    };
    const handleToggleHistoryShortcut = () => {
        if (!isOpen)
            return;
        handleToggleHistory();
    };
    const handleAttachShortcut = () => {
        if (!isOpen || isProcessing)
            return;
        handleOpenFilePicker();
    };
    const handleFocusComposerShortcut = () => {
        if (!isOpen)
            return;
        inputRef.current?.focus();
    };
    useKeyboardShortcut({ combo: 'mod+shift+n', callback: handleStartNewChatShortcut, enabled: isOpen });
    useKeyboardShortcut({ combo: 'mod+shift+h', callback: handleToggleHistoryShortcut, enabled: isOpen });
    useKeyboardShortcut({ combo: 'mod+shift+u', callback: handleAttachShortcut, enabled: isOpen });
    useKeyboardShortcut({ combo: 'mod+shift+l', callback: handleFocusComposerShortcut, enabled: isOpen });
    const handleStartEditingConversation = (conversationIdValue: string, title: string) => {
        setEditingConversationId(conversationIdValue);
        setEditingTitle(title);
    };
    const handleStopEditingConversation = () => {
        setEditingConversationId(null);
    };
    const handleDocumentEscape = useEffectEvent((e: globalThis.KeyboardEvent) => {
        if (e.key !== 'Escape')
            return;
        if (showMentions)
            return;
        if (showHistory && editingConversationId) {
            e.preventDefault();
            e.stopPropagation();
            setEditingConversationId(null);
            return;
        }
        if (showHistory) {
            e.preventDefault();
            e.stopPropagation();
            closeHistoryView();
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        requestClose();
    });
    useEffect(() => {
        if (!isOpen)
            return;
        const onDocumentKeyDown = (e: globalThis.KeyboardEvent) => {
            handleDocumentEscape(e);
        };
        document.addEventListener('keydown', onDocumentKeyDown, true);
        return () => document.removeEventListener('keydown', onDocumentKeyDown, true);
    }, [isOpen]);
    const showEmptyState = messages.length === 0 && !isConversationLoading;
    const hasExtractingAttachments = pendingAttachments.some((attachment) => attachment.extractionStatus === 'extracting');
    const isInputDisabled = isProcessing ||
        isExtractingAttachments ||
        hasExtractingAttachments ||
        (typeof rateLimitCountdown === 'number' && rateLimitCountdown > 0);
    const sharedComposerProps = ({
        inputValue,
        inputRef,
        mentionLabels,
        maxMessageLength,
        showMentions,
        mentionQuery,
        clients,
        projects,
        teams,
        users,
        mentionsLoading,
        pendingAttachments,
        isExtractingAttachments,
        onInputChange: handleInputChange,
        onKeyDown: handleKeyDown,
        onOpenFilePicker: handleOpenFilePicker,
        onCloseMentions: handleCloseMentions,
        onSelectMention: handleMentionSelect,
        onVoiceTranscript: handleVoiceTranscript,
        onVoiceInterim: handleVoiceInterim,
        onRemoveAttachment,
        onSubmit: handleSubmit,
        mentionDropdownRef,
    });
    const emptyComposerProps: AgentComposerSectionProps = {
        ...sharedComposerProps,
        layout: 'centered',
        disabled: isInputDisabled,
        quickSuggestions,
        onSuggestionClick: handleSuggestionClick,
    };
    const dockComposerProps: AgentComposerSectionProps = {
        ...sharedComposerProps,
        layout: 'dock',
        disabled: isInputDisabled || isConversationLoading,
    };
    useEffect(() => {
        if (!showHistory || !onRetryHistory)
            return;
        const timeoutId = window.setTimeout(() => {
            onRetryHistory();
        }, 350);
        return () => window.clearTimeout(timeoutId);
    }, [historySearch, onRetryHistory, showArchivedHistory, showHistory]);
    const historyPanelProps = ({
        showHistory,
        history,
        isHistoryLoading,
        historyError: historyError ?? null,
        historyHasMore: historyHasMore ?? false,
        historySearch: historySearch ?? '',
        onHistorySearchChange: onHistorySearchChange ?? (() => { }),
        showArchivedHistory: showArchivedHistory ?? false,
        onShowArchivedHistoryChange: onShowArchivedHistoryChange ?? (() => { }),
        conversationId,
        messagesCount: messages.length,
        isConversationLoading,
        loadingConversationId,
        editingConversationId,
        editingTitle,
        setEditingTitle,
        onSelectConversation,
        onUpdateConversationTitle,
        onDeleteConversation,
        onStartNewChat: handleStartNewChat,
        onClose: handleCloseHistory,
        onStartEditing: handleStartEditingConversation,
        onStopEditing: handleStopEditingConversation,
        onRetryHistory: onRetryHistory ?? (() => { }),
        onLoadMoreHistory: onLoadMoreHistory ?? (() => { }),
        onPinConversation: onPinConversation ?? (() => { }),
        onArchiveConversation: onArchiveConversation ?? (() => { }),
        onDuplicateConversation: handleDuplicateConversation,
        onExportConversation: handleExportConversation,
        onShareConversation: handleShareConversation,
    });
    const activeConversationTitle = (() => {
        if (!conversationId)
            return null;
        const match = history.find((entry) => entry.id === conversationId);
        return match?.title?.trim() || null;
    })();
    const headerProps = ({
        connectionStatus,
        conversationId,
        activeConversationTitle,
        messagesCount: messages.length,
        showHistory,
        panelLayout,
        onClose: requestClose,
        onStartNewChat: handleStartNewChat,
        onToggleHistory: handleToggleHistory,
        onSetPanelLayout: handleSetPanelLayout,
    });
    const handleShellOpenChange = (open: boolean) => {
        if (open)
            onOpenChange?.(true);
    };
    useKeyboardShortcut({
        combo: 'mod+shift+a',
        callback: () => {
            if (isOpen)
                requestClose();
            else
                onOpenChange?.(true);
        },
    });
    return {
        isOpen,
        panelLayout,
        attachmentAccept: AGENT_ATTACHMENT_ACCEPT,
        fileInputRef,
        composerInputRef: inputRef,
        headerProps,
        historyPanelProps,
        agentError: error,
        lastFailedMessage: lastFailedMessage ?? null,
        onClearError,
        onDragLeave: handleDragLeave,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
        onFileSelection: handleFileSelection,
        rateLimitCountdown,
        handleShellOpenChange,
        requestClose,
        dockComposerProps,
        emptyComposerProps,
        isConversationLoading,
        isProcessing,
        mentionLabels,
        messages,
        onRetry: handleRetry,
        onRetryLastUserTurn,
        onRetryUserMessage: handleRetryUserMessage,
        onConfirmPending,
        onUndoAction,
        processingSteps,
        processingLabel,
        scrollAreaRef,
        onMessagesScroll: onMessagesScroll ?? noop,
        showJumpToLatest: !isPinnedToBottom && messages.length > 0,
        onJumpToLatest: onJumpToLatest ?? noop,
        showEmptyState,
        workspaceId,
        onStoreSpreadsheetExport,
    };
}
