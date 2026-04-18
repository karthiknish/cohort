import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { AgentValidationError } from '@/lib/agent-errors'
import type { AgentConversationSummary, AgentMessage } from '@/shared/hooks/use-agent-mode'

import { AgentModePanel } from './agent-mode-panel'

const noop = () => {}
const noopAsync = async () => {}

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  LazyMotion: ({ children }: { children: React.ReactNode }) => children,
  domAnimation: {},
  m: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}))

vi.mock('@/shared/hooks/use-mention-data', () => ({
  useMentionData: () => ({
    clients: [],
    projects: [],
    teams: [],
    users: [],
    allItems: [],
    isLoading: false,
  }),
}))

vi.mock('@/shared/ui/voice-input', () => ({
  VoiceInputButton: () => <button type="button">Voice</button>,
}))

vi.mock('./mention-dropdown', () => ({
  MentionDropdown: () => null,
  formatMention: (item: { label: string }) => `@${item.label}`,
}))

vi.mock('./agent-message-card', () => ({
  AgentMessageCard: ({ message }: { message: AgentMessage }) => <div>{message.content}</div>,
}))

function renderPanel(overrides: Partial<React.ComponentProps<typeof AgentModePanel>> = {}) {
  return renderToStaticMarkup(
    <AgentModePanel
      isOpen
      onClose={noop}
      messages={[]}
      isProcessing={false}
      onSendMessage={noop}
      pendingAttachments={[]}
      onAddAttachments={noopAsync}
      onRemoveAttachment={noop}
      isExtractingAttachments={false}
      onClear={noop}
      conversationId={null}
      history={[] satisfies AgentConversationSummary[]}
      isHistoryLoading={false}
      onOpenHistory={noop}
      onSelectConversation={noop}
      onUpdateConversationTitle={noop}
      onDeleteConversation={noop}
      {...overrides}
    />,
  )
}

describe('AgentModePanel', () => {
  it('renders the centered empty-state composer when there are no messages', () => {
    const markup = renderPanel()

    expect(markup).toContain('Where would you like to go?')
    expect(markup).toContain('Schedule a meeting')
    expect(markup).toContain('Agent Mode')
  })

  it('renders the failed-message banner for active conversations', () => {
    const markup = renderPanel({
      messages: [
        {
          id: 'message-1',
          type: 'user',
          content: 'Retry this',
          timestamp: new Date('2026-03-07T18:26:10.000Z'),
        } as AgentMessage,
      ],
      lastFailedMessage: 'Retry this',
      onRetry: () => {},
    })

    expect(markup).toContain('Message failed to send')
    expect(markup).toContain('Retry')
  })

  it('renders dismissible error banner when error has no lastFailedMessage', () => {
    const err = new AgentValidationError('Message too long (max 500 characters)')
    const markup = renderPanel({
      error: err,
      lastFailedMessage: null,
      onClearError: () => {},
    })

    expect(markup).toContain('Message too long (max 500 characters)')
    expect(markup).toContain('Dismiss')
  })
})
