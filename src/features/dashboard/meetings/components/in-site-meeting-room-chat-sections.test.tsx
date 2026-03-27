import type { ReceivedChatMessage } from '@livekit/components-react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import { buildMeetingChatMessageContent } from './in-site-meeting-room-chat.utils'
import {
  MeetingChatFloatingDock,
  MeetingChatLauncherButton,
  MeetingChatMessageItem,
  MeetingChatPanel,
} from './in-site-meeting-room-chat-sections'

vi.mock('@/shared/components/agent-mode/mention-highlights', () => ({
  AgentMentionText: ({ text }: { text: string }) => <span>{text}</span>,
}))

function makeMessage(overrides: Partial<ReceivedChatMessage> = {}): ReceivedChatMessage {
  return {
    id: 'message-1',
    message: 'Hello room',
    timestamp: 100,
    from: undefined,
    ...overrides,
  }
}

describe('meeting room chat sections', () => {
  it('renders the launcher and message item content', () => {
    const message = makeMessage({
      message: buildMeetingChatMessageContent({
        text: 'Please review this',
        attachments: [{ name: 'brief.pdf', size: '2 MB', type: 'application/pdf', url: 'https://example.com/brief.pdf' }],
      }),
      from: { name: 'Alex Kim', identity: 'alex', isLocal: false } as ReceivedChatMessage['from'],
    })

    const markup = renderToStaticMarkup(
      <>
        <MeetingChatLauncherButton unreadCount={3} onOpen={vi.fn()} />
        <MeetingChatMessageItem mentionLabels={['Alex Kim']} localAvatarUrl={null} message={message} />
      </>,
    )

    expect(markup).toContain('Meeting chat')
    expect(markup).toContain('3')
    expect(markup).toContain('Alex Kim')
    expect(markup).toContain('Please review this')
    expect(markup).toContain('brief.pdf')
  })

  it('renders the open panel states', () => {
    const fileInputRef = { current: null }
    const messageEndRef = { current: null }
    const textareaRef = { current: null }
    const mentionResults = [{ avatarUrl: null, id: 'user-1', identity: 'alex', isLocal: false, label: 'Alex Kim' }]
    const pendingAttachments = [
      { file: new File(['notes'], 'notes.txt', { type: 'text/plain' }), id: 'att-1', mimeType: 'text/plain', name: 'notes.txt', sizeLabel: '1 KB' },
    ]

    const markup = renderToStaticMarkup(
      <MeetingChatPanel
        attachmentAccept=".png,.pdf"
        canSend={true}
        chatMessages={[]}
        draft="@a"
        fileInputRef={fileInputRef}
        highlightedMentionIndex={0}
        isSending={false}
        localAvatarUrl={null}
        maxAttachments={10}
        mentionLabels={[]}
        mentionResults={mentionResults}
        messageEndRef={messageEndRef}
        onAttachmentSelection={vi.fn()}
        onClose={vi.fn()}
        onComposerBlur={vi.fn()}
        onDraftChange={vi.fn()}
        onKeyDown={vi.fn()}
        onMentionMouseDown={vi.fn()}
        onRemoveAttachment={vi.fn()}
        onSelectMention={vi.fn()}
        onSend={vi.fn()}
        pendingAttachments={pendingAttachments}
        showMentionResults={true}
        textareaRef={textareaRef}
        uploadingFiles={false}
      />,
    )

    expect(markup).toContain('Only people currently in the room receive these messages.')
    expect(markup).toContain('No messages yet. Say hello to everyone in the room.')
    expect(markup).toContain('notes.txt')
    expect(markup).toContain('Alex Kim')
    expect(markup).toContain('Share up to 10 files per message.')
    expect(markup).toContain('Send')
  })

  it('renders the floating dock launcher and panel branches', () => {
    const fileInputRef = { current: null }
    const messageEndRef = { current: null }
    const textareaRef = { current: null }
    const panelProps = {
      attachmentAccept: '.png,.pdf',
      canSend: false,
      chatMessages: [],
      draft: '',
      fileInputRef,
      highlightedMentionIndex: 0,
      isSending: false,
      localAvatarUrl: null,
      maxAttachments: 10,
      mentionLabels: [],
      mentionResults: [],
      messageEndRef,
      onAttachmentSelection: vi.fn(),
      onClose: vi.fn(),
      onComposerBlur: vi.fn(),
      onDraftChange: vi.fn(),
      onKeyDown: vi.fn(),
      onMentionMouseDown: vi.fn(),
      onRemoveAttachment: vi.fn(),
      onSelectMention: vi.fn(),
      onSend: vi.fn(),
      pendingAttachments: [],
      showMentionResults: false,
      textareaRef,
      uploadingFiles: false,
    }

    const closedMarkup = renderToStaticMarkup(
      <MeetingChatFloatingDock
        compact={false}
        isOpen={false}
        onOpen={vi.fn()}
        unreadCount={2}
        panelProps={panelProps}
      />,
    )

    const openMarkup = renderToStaticMarkup(
      <MeetingChatFloatingDock
        compact={false}
        isOpen={true}
        onOpen={vi.fn()}
        unreadCount={0}
        panelProps={panelProps}
      />,
    )

    expect(closedMarkup).toContain('Meeting chat')
    expect(closedMarkup).toContain('2')
    expect(openMarkup).toContain('Only people currently in the room receive these messages.')
  })
})