'use client';
import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { AgentModeButton } from './agent-mode-button';
import { AgentModePanel } from './agent-mode-panel';
import { readAgentPanelLayout, shouldHideAgentFab, type AgentPanelLayout, } from '@/lib/agent-panel-layout';
import { useAgentMode, type AgentMessageMetadata } from '@/shared/hooks/use-agent-mode';
/**
 * Agent Mode Container
 *
 * Renders the floating action button and chat panel for Agent Mode.
 * Add this component to the dashboard layout to enable Agent Mode globally.
 */
function AgentModeInner() {
    const { isOpen, setOpen, messages, isProcessing, processInput, pendingAttachments, addAttachments, removeAttachment, isExtractingAttachments, clearMessages, conversationId, history, isHistoryLoading, historyError, historyHasMore, historySearch, setHistorySearch, showArchivedHistory, setShowArchivedHistory, fetchHistory, loadMoreHistory, setConversationPinned, setConversationArchived, loadConversation, isConversationLoading, loadingConversationId, updateConversationTitle, deleteConversation, duplicateConversation, exportConversation, shareConversation, 
    // Error handling
    error, clearError, lastFailedMessage, retryLastMessage, retryLastUserTurn, editLastUserMessage, confirmPendingAction, undoAgentAction, processingSteps, processingLabel, isPinnedToBottom, scrollToLatest, onMessagesScroll, scrollContainerRef, connectionStatus, rateLimitCountdown, activeContext, maxMessageLength, workspaceId, storeSpreadsheetExportForMessage, } = useAgentMode();
    const requestCloseRef = useRef<(() => void) | null>(null);
    const [panelLayout, setPanelLayout] = useState<AgentPanelLayout>(() => readAgentPanelLayout());
    const hideFab = shouldHideAgentFab(isOpen, panelLayout);
    const handleClose = () => {
        setOpen(false);
        requestAnimationFrame(() => {
            document.getElementById('agent-mode-launcher')?.focus();
        });
    };
    const handleLauncherClick = () => {
        if (isOpen) {
            if (requestCloseRef.current) {
                requestCloseRef.current();
            }
            else {
                handleClose();
            }
            return;
        }
        setOpen(true);
    };
    const handleSendMessage = (text: string, options?: Parameters<typeof processInput>[1]) => {
        void processInput(text, options);
    };
    const handleOpenHistory = () => {
        void fetchHistory({ reset: true });
    };
    const handleRetryHistory = () => {
        void fetchHistory({ reset: true });
    };
    const handleLoadMoreHistory = () => {
        void loadMoreHistory();
    };
    const handlePinConversation = (id: string, pinned: boolean) => {
        void setConversationPinned(id, pinned);
    };
    const handleArchiveConversation = (id: string, archived: boolean) => {
        void setConversationArchived(id, archived);
    };
    const handleRetryUserMessage = (clientId: string, content: string) => {
        void processInput(content, { retryClientId: clientId });
    };
    const handleUndoAction = (messageId: string, undoHint: NonNullable<AgentMessageMetadata['undoHint']> | undefined) => {
        if (!undoHint)
            return;
        void undoAgentAction(messageId, undoHint);
    };
    const runtime = ({
        open: isOpen,
        processing: isProcessing,
        extractingAttachments: isExtractingAttachments,
    });
    const historyLoad = ({
        historyLoading: isHistoryLoading,
        conversationLoading: isConversationLoading,
        showArchived: showArchivedHistory,
    });
    const scrollBehavior = ({ pinnedToBottom: isPinnedToBottom });
    return (<>
      {!hideFab ? <AgentModeButton onClick={handleLauncherClick} isOpen={isOpen}/> : null}
      <AgentModePanel onPanelLayoutChange={setPanelLayout} runtime={runtime} activeContext={activeContext} maxMessageLength={maxMessageLength} onClose={handleClose} onOpenChange={setOpen} requestCloseRef={requestCloseRef} messages={messages} onSendMessage={handleSendMessage} pendingAttachments={pendingAttachments} onAddAttachments={addAttachments} onRemoveAttachment={removeAttachment} onClear={clearMessages} conversationId={conversationId} history={history} historyLoad={historyLoad} historyError={historyError} historyHasMore={historyHasMore} historySearch={historySearch} onHistorySearchChange={setHistorySearch} onShowArchivedHistoryChange={setShowArchivedHistory} onOpenHistory={handleOpenHistory} onRetryHistory={handleRetryHistory} onLoadMoreHistory={handleLoadMoreHistory} onPinConversation={handlePinConversation} onArchiveConversation={handleArchiveConversation} onSelectConversation={loadConversation} loadingConversationId={loadingConversationId} onUpdateConversationTitle={updateConversationTitle} onDeleteConversation={deleteConversation} onDuplicateConversation={duplicateConversation} onExportConversation={exportConversation} onShareConversation={shareConversation} 
    // Error handling
    error={error} onClearError={clearError} lastFailedMessage={lastFailedMessage} onRetry={retryLastMessage} onRetryLastUserTurn={retryLastUserTurn} onRetryUserMessage={handleRetryUserMessage} onConfirmPending={confirmPendingAction} onUndoAction={handleUndoAction} processingSteps={processingSteps} processingLabel={processingLabel} scrollContainerRef={scrollContainerRef} onMessagesScroll={onMessagesScroll} scrollBehavior={scrollBehavior} onJumpToLatest={scrollToLatest} connectionStatus={connectionStatus} rateLimitCountdown={rateLimitCountdown} workspaceId={workspaceId} onStoreSpreadsheetExport={storeSpreadsheetExportForMessage}/>
    </>);
}
export function AgentMode() {
    return (<Suspense fallback={null}>
      <AgentModeInner />
    </Suspense>);
}
export { AgentModeButton } from './agent-mode-button';
export { AgentModePanel } from './agent-mode-panel';
