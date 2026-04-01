import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'

import { describe, expect, it, vi } from 'vitest'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  m: {
    div: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  },
}))

vi.mock('@/shared/ui/voice-input', () => ({
  VoiceInputButton: () => <button type="button">Voice</button>,
}))

vi.mock('./mention-dropdown', () => ({
  MentionDropdown: () => <div>Mention Dropdown</div>,
}))

vi.mock('./agent-message-card', () => ({
  AgentMessageCard: ({ message }: { message: { content: string } }) => <div>{message.content}</div>,
}))

const noop = vi.fn()
const emptyRef = { current: null }
const emptyArray: [] = []
const sharedHeaderProps = {
  connectionStatus: 'connected' as const,
  conversationId: 'chat-1',
  messagesCount: 1,
  showHistory: false,
  onClose: noop,
  onStartNewChat: noop,
  onToggleHistory: noop,
}
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
}
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
}
const sharedEmptyComposerProps = {
  ...sharedDockComposerProps,
  layout: 'centered' as const,
  quickSuggestions: ['Schedule a meeting'],
  onSuggestionClick: noop,
}

import type { AgentConversationSummary, AgentMessage } from '@/shared/hooks/use-agent-mode'

import {
  AgentComposerSection,
  AgentEmptyState,
  AgentHistoryPanel,
  AgentMessagesSection,
  AgentModeHeader,
  AgentModePanelContent,
  AgentModePanelShell,
  FailedMessageBanner,
  RateLimitBanner,
} from './agent-mode-panel-sections'

describe('agent mode panel sections', () => {
  it('renders header, history, and messages shells', () => {
    const history: AgentConversationSummary[] = [
      { id: 'chat-1', title: 'Launch plan', messageCount: 3, lastMessageAt: '2026-03-11T12:00:00.000Z' } as AgentConversationSummary,
    ]

    const markup = renderToStaticMarkup(
      <>
        <AgentModeHeader
          connectionStatus="retrying"
          conversationId="chat-1"
          messagesCount={1}
          showHistory={true}
          onClose={noop}
          onStartNewChat={noop}
          onToggleHistory={noop}
        />
        <AgentHistoryPanel
          showHistory={true}
          history={history}
          isHistoryLoading={false}
          conversationId="chat-1"
          messagesCount={1}
          isConversationLoading={false}
          loadingConversationId={null}
          editingConversationId={null}
          editingTitle=""
          setEditingTitle={noop}
          onSelectConversation={noop}
          onUpdateConversationTitle={noop}
          onDeleteConversation={noop}
          onStartNewChat={noop}
          onClose={noop}
          onStartEditing={noop}
          onStopEditing={noop}
        />
        <AgentMessagesSection
          isConversationLoading={false}
          isProcessing={true}
          mentionLabels={[]}
          messages={[{ id: 'm1', content: 'Hello', type: 'user', timestamp: new Date() } as AgentMessage]}
          scrollAreaRef={emptyRef}
        />
      </>,
    )

    expect(markup).toContain('Agent Mode')
    expect(markup).toContain('Reconnecting...')
    expect(markup).toContain('Previous chats')
    expect(markup).toContain('Launch plan')
    expect(markup).toContain('Hello')
    expect(markup).toContain('Thinking...')
  })

  it('renders the empty-state composer and banners', () => {
    const markup = renderToStaticMarkup(
      <>
        <AgentEmptyState>
          <AgentComposerSection
            layout="centered"
            inputValue=""
            inputRef={emptyRef}
            mentionLabels={[]}
            showMentions={false}
            mentionQuery=""
            clients={[]}
            projects={[]}
            teams={[]}
            users={[]}
            mentionsLoading={false}
            pendingAttachments={[]}
            isExtractingAttachments={false}
            disabled={false}
            onInputChange={noop}
            onKeyDown={noop}
            onOpenFilePicker={noop}
            onCloseMentions={noop}
            onSelectMention={noop}
            onVoiceTranscript={noop}
            onVoiceInterim={noop}
            onRemoveAttachment={noop}
            onSubmit={noop}
            quickSuggestions={['Schedule a meeting']}
            onSuggestionClick={noop}
          />
        </AgentEmptyState>
        <RateLimitBanner countdown={12} onDismiss={noop} />
        <FailedMessageBanner lastFailedMessage="Failed" onRetry={noop} />
      </>,
    )

    expect(markup).toContain('Where would you like to go?')
    expect(markup).toContain('Mention Dropdown')
    expect(markup).toContain('Voice')
    expect(markup).toContain('Schedule a meeting')
    expect(markup).toContain('12')
    expect(markup).toContain('Message failed to send')
  })

  it('renders the panel shell and content branches', () => {
    const shellMarkup = renderToStaticMarkup(
      <AgentModePanelShell
        attachmentAccept=".pdf"
          fileInputRef={emptyRef}
          headerProps={sharedHeaderProps}
          historyPanelProps={sharedHistoryPanelProps}
        onClearError={noop}
        onDragLeave={noop}
        onDragOver={noop}
        onDrop={noop}
        onFileSelection={noop}
        rateLimitCountdown={9}
      >
        <div>Body Content</div>
      </AgentModePanelShell>,
    )

    const contentMarkup = renderToStaticMarkup(
      <AgentModePanelContent
          dockComposerProps={sharedDockComposerProps}
          emptyComposerProps={sharedEmptyComposerProps}
        isConversationLoading={false}
        isProcessing={false}
        lastFailedMessage="Failed again"
        mentionLabels={[]}
        messages={[{ id: 'm1', content: 'Hello again', type: 'user', timestamp: new Date() } as AgentMessage]}
        onRetry={noop}
        scrollAreaRef={emptyRef}
        showEmptyState={false}
      />,
    )

    expect(shellMarkup).toContain('Agent Mode')
    expect(shellMarkup).toContain('9')
    expect(shellMarkup).toContain('Body Content')
    expect(contentMarkup).toContain('Hello again')
    expect(contentMarkup).toContain('Message failed to send')
  })
})