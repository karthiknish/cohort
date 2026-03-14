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
          onClose={vi.fn()}
          onStartNewChat={vi.fn()}
          onToggleHistory={vi.fn()}
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
          setEditingTitle={vi.fn()}
          onSelectConversation={vi.fn()}
          onUpdateConversationTitle={vi.fn()}
          onDeleteConversation={vi.fn()}
          onStartNewChat={vi.fn()}
          onClose={vi.fn()}
          onStartEditing={vi.fn()}
          onStopEditing={vi.fn()}
        />
        <AgentMessagesSection
          isConversationLoading={false}
          isProcessing={true}
          mentionLabels={[]}
          messages={[{ id: 'm1', content: 'Hello', type: 'user', timestamp: new Date() } as AgentMessage]}
          scrollAreaRef={{ current: null }}
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
            inputRef={{ current: null }}
            mentionLabels={[]}
            showMentions={false}
            mentionQuery=""
            clients={[]}
            projects={[]}
            teams={[]}
            users={[]}
            mentionsLoading={false}
            pendingAttachments={[]}
            isDraggingFiles={true}
            isExtractingAttachments={false}
            disabled={false}
            onInputChange={vi.fn()}
            onKeyDown={vi.fn()}
            onOpenFilePicker={vi.fn()}
            onCloseMentions={vi.fn()}
            onSelectMention={vi.fn()}
            onVoiceTranscript={vi.fn()}
            onVoiceInterim={vi.fn()}
            onRemoveAttachment={vi.fn()}
            onSubmit={vi.fn()}
            quickSuggestions={['Schedule a meeting']}
            onSuggestionClick={vi.fn()}
          />
        </AgentEmptyState>
        <RateLimitBanner countdown={12} onDismiss={vi.fn()} />
        <FailedMessageBanner lastFailedMessage="Failed" onRetry={vi.fn()} />
      </>,
    )

    expect(markup).toContain('Where would you like to go?')
    expect(markup).toContain('Drop docs here for context')
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
        fileInputRef={{ current: null }}
        headerProps={{
          connectionStatus: 'connected',
          conversationId: 'chat-1',
          messagesCount: 1,
          showHistory: false,
          onClose: vi.fn(),
          onStartNewChat: vi.fn(),
          onToggleHistory: vi.fn(),
        }}
        historyPanelProps={{
          showHistory: false,
          history: [],
          isHistoryLoading: false,
          conversationId: 'chat-1',
          messagesCount: 1,
          isConversationLoading: false,
          loadingConversationId: null,
          editingConversationId: null,
          editingTitle: '',
          setEditingTitle: vi.fn(),
          onSelectConversation: vi.fn(),
          onUpdateConversationTitle: vi.fn(),
          onDeleteConversation: vi.fn(),
          onStartNewChat: vi.fn(),
          onClose: vi.fn(),
          onStartEditing: vi.fn(),
          onStopEditing: vi.fn(),
        }}
        onClearError={vi.fn()}
        onDragLeave={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
        onFileSelection={vi.fn()}
        rateLimitCountdown={9}
      >
        <div>Body Content</div>
      </AgentModePanelShell>,
    )

    const contentMarkup = renderToStaticMarkup(
      <AgentModePanelContent
        dockComposerProps={{
          layout: 'dock',
          inputValue: '',
          inputRef: { current: null },
          mentionLabels: [],
          showMentions: false,
          mentionQuery: '',
          clients: [],
          projects: [],
          teams: [],
          users: [],
          mentionsLoading: false,
          pendingAttachments: [],
          isDraggingFiles: false,
          isExtractingAttachments: false,
          disabled: false,
          onInputChange: vi.fn(),
          onKeyDown: vi.fn(),
          onOpenFilePicker: vi.fn(),
          onCloseMentions: vi.fn(),
          onSelectMention: vi.fn(),
          onVoiceTranscript: vi.fn(),
          onVoiceInterim: vi.fn(),
          onRemoveAttachment: vi.fn(),
          onSubmit: vi.fn(),
        }}
        emptyComposerProps={{
          layout: 'centered',
          inputValue: '',
          inputRef: { current: null },
          mentionLabels: [],
          showMentions: false,
          mentionQuery: '',
          clients: [],
          projects: [],
          teams: [],
          users: [],
          mentionsLoading: false,
          pendingAttachments: [],
          isDraggingFiles: false,
          isExtractingAttachments: false,
          disabled: false,
          onInputChange: vi.fn(),
          onKeyDown: vi.fn(),
          onOpenFilePicker: vi.fn(),
          onCloseMentions: vi.fn(),
          onSelectMention: vi.fn(),
          onVoiceTranscript: vi.fn(),
          onVoiceInterim: vi.fn(),
          onRemoveAttachment: vi.fn(),
          onSubmit: vi.fn(),
          quickSuggestions: ['Schedule a meeting'],
          onSuggestionClick: vi.fn(),
        }}
        isConversationLoading={false}
        isProcessing={false}
        lastFailedMessage="Failed again"
        mentionLabels={[]}
        messages={[{ id: 'm1', content: 'Hello again', type: 'user', timestamp: new Date() } as AgentMessage]}
        onRetry={vi.fn()}
        scrollAreaRef={{ current: null }}
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