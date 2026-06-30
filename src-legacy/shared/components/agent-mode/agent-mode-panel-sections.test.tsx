import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
vi.mock('framer-motion', async () => {
    const { motionTestMock } = await import('@/test/motion-mock');
    return motionTestMock;
});
vi.mock('@/shared/ui/voice-input', () => ({
    VoiceInputButton: () => <button type="button">Voice</button>,
}));
vi.mock('./mention-dropdown', () => ({
    MentionDropdown: () => <div>Mention Dropdown</div>,
}));
vi.mock('@/shared/ui/sheet', () => ({
    Sheet: ({ children, open }: {
        children: ReactNode;
        open?: boolean;
    }) => open ? <div data-slot="agent-sheet">{children}</div> : null,
    SheetContent: ({ children, ...props }: {
        children: ReactNode;
        className?: string;
    }) => (<div data-slot="agent-sheet-content" {...props}>
      {children}
    </div>),
}));
vi.mock('@/shared/ui/motion', async () => {
    const { motionTestMock } = await import('@/test/motion-mock');
    return motionTestMock;
});
const noop = vi.fn();
const emptyRef = { current: null };
const emptyArray: [
] = [];
const sharedHeaderProps = {
    connectionStatus: 'connected' as const,
    conversationId: 'chat-1',
    messagesCount: 1,
    showHistory: false,
    onClose: noop,
    onStartNewChat: noop,
    onToggleHistory: noop,
};
const sharedHistoryPanelProps = {
    showHistory: false,
    history: [] as AgentConversationSummary[],
    isHistoryLoading: false,
    conversationId: 'chat-1',
    messagesCount: 1,
    isConversationLoading: false,
    loadingConversationId: null,
    editingConversationId: null,
    editingTitle: '',
    setEditingTitle: noop,
    onSelectConversation: noop,
    onUpdateConversationTitle: noop,
    onDeleteConversation: noop,
    onStartNewChat: noop,
    onClose: noop,
    onStartEditing: noop,
    onStopEditing: noop,
};
const sharedDockComposerProps = {
    layout: 'dock' as const,
    inputValue: '',
    inputRef: emptyRef,
    mentionLabels: emptyArray,
    showMentions: false,
    mentionQuery: '',
    clients: emptyArray,
    projects: emptyArray,
    teams: emptyArray,
    users: emptyArray,
    mentionsLoading: false,
    pendingAttachments: emptyArray,
    isExtractingAttachments: false,
    disabled: false,
    onInputChange: noop,
    onKeyDown: noop,
    onOpenFilePicker: noop,
    onCloseMentions: noop,
    onSelectMention: noop,
    onVoiceTranscript: noop,
    onVoiceInterim: noop,
    onRemoveAttachment: noop,
    onSubmit: noop,
};
const sharedEmptyComposerProps = {
    ...sharedDockComposerProps,
    layout: 'centered' as const,
    quickSuggestions: [{ id: 'test', label: 'Test suggestion', prompt: 'Test prompt', capability: 'navigate' as const }],
    onSuggestionClick: noop,
};
import type { AgentConversationSummary, AgentMessage } from '@/shared/hooks/use-agent-mode';
import { AgentComposerSection, AgentEmptyState, AgentHistoryRail, AgentMessagesSection, AgentModeHeader, AgentModePanelContent, AgentModePanelShell, FailedMessageBanner, RateLimitBanner, } from './agent-mode-panel-sections';
describe('agent mode panel sections', () => {
    it('renders header, history, and messages shells', () => {
        const history: AgentConversationSummary[] = [
            { id: 'chat-1', title: 'Launch plan', messageCount: 3, lastMessageAt: '2026-03-11T12:00:00.000Z' } as AgentConversationSummary,
        ];
        const markup = renderToStaticMarkup(<>
        <AgentModeHeader connectionStatus="retrying" conversationId="chat-1" messagesCount={1} showHistory={true} onClose={noop} onStartNewChat={noop} onToggleHistory={noop}/>
        <AgentHistoryRail showHistory={true} history={history} isHistoryLoading={false} historyError={null} historyHasMore={false} historySearch="" onHistorySearchChange={noop} showArchivedHistory={false} onShowArchivedHistoryChange={noop} conversationId="chat-1" messagesCount={1} isConversationLoading={false} loadingConversationId={null} editingConversationId={null} editingTitle="" setEditingTitle={noop} onSelectConversation={noop} onUpdateConversationTitle={noop} onDeleteConversation={noop} onStartNewChat={noop} onClose={noop} onStartEditing={noop} onStopEditing={noop} onRetryHistory={noop} onLoadMoreHistory={noop} onPinConversation={noop} onArchiveConversation={noop}/>
        <AgentMessagesSection isConversationLoading={false} isProcessing={true} mentionLabels={[]} messages={[
                {
                    id: 'm1',
                    clientId: 'm1',
                    content: 'Hello',
                    type: 'user',
                    timestamp: '2024-01-15T12:00:00.000Z',
                } as AgentMessage,
            ]} processingSteps={[
                { id: 'parse', label: 'Parsed request', status: 'active' },
            ]} processingLabel="Understanding request…" scrollAreaRef={emptyRef} onMessagesScroll={noop} showJumpToLatest={false} onJumpToLatest={noop}/>
      </>);
        expect(markup).toContain('Agent Mode');
        expect(markup).toContain('Reconnecting');
        expect(markup).toContain('Chats');
        expect(markup).toContain('Launch plan');
        expect(markup).toContain('Hello');
        expect(markup).toContain('Parsed request');
        expect(markup).toContain('Understanding request');
    });
    it('renders the empty-state composer and banners', () => {
        const markup = renderToStaticMarkup(<>
        <AgentEmptyState>
          <AgentComposerSection layout="centered" inputValue="" inputRef={emptyRef} mentionLabels={[]} showMentions={false} mentionQuery="" clients={[]} projects={[]} teams={[]} users={[]} mentionsLoading={false} pendingAttachments={[]} isExtractingAttachments={false} disabled={false} onInputChange={noop} onKeyDown={noop} onOpenFilePicker={noop} onCloseMentions={noop} onSelectMention={noop} onVoiceTranscript={noop} onVoiceInterim={noop} onRemoveAttachment={noop} onSubmit={noop} quickSuggestions={[{ id: 'meet', label: 'Open meetings', prompt: 'Open meetings', capability: 'navigate' }]} onSuggestionClick={noop}/>
        </AgentEmptyState>
        <RateLimitBanner countdown={12} onDismiss={noop}/>
        <FailedMessageBanner lastFailedMessage="Failed" onRetry={noop}/>
      </>);
        expect(markup).toContain('What can I help with?');
        expect(markup).toContain('Mention Dropdown');
        expect(markup).toContain('Voice');
        expect(markup).toContain('Open meetings');
        expect(markup).toContain('12');
        expect(markup).toContain('Message failed to send');
    });
    it('renders the panel shell and content branches', () => {
        const shellMarkup = renderToStaticMarkup(<AgentModePanelShell isOpen onOpenChange={noop} attachmentAccept=".pdf" fileInputRef={emptyRef} headerProps={sharedHeaderProps} historyPanelProps={sharedHistoryPanelProps} onClearError={noop} onDragLeave={noop} onDragOver={noop} onDrop={noop} onFileSelection={noop} rateLimitCountdown={9}>
        <div>Body Content</div>
      </AgentModePanelShell>);
        const contentMarkup = renderToStaticMarkup(<AgentModePanelContent dockComposerProps={sharedDockComposerProps} emptyComposerProps={sharedEmptyComposerProps} viewState={{
                conversationLoading: false,
                processing: false,
                showJumpToLatest: false,
                showEmptyState: false,
            }} lastFailedMessage="Failed again" mentionLabels={[]} messages={[
                {
                    id: 'm1',
                    clientId: 'm1',
                    content: 'Hello again',
                    type: 'user',
                    timestamp: '2024-01-15T12:00:00.000Z',
                } as AgentMessage,
            ]} onRetry={noop} processingSteps={[]} processingLabel="Understanding request…" scrollAreaRef={emptyRef} onMessagesScroll={noop} onJumpToLatest={noop} conversationId="chat-1" workspaceId="ws-1"/>);
        expect(shellMarkup).toContain('Agent Mode');
        expect(shellMarkup).toContain('9');
        expect(shellMarkup).toContain('Body Content');
        expect(contentMarkup).toContain('Hello again');
        expect(contentMarkup).toContain('Message failed to send');
    });
});
