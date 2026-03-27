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

const launcherOpen = vi.fn()
const panelHandler = vi.fn()
const sharedFileInputRef = { current: null }
const sharedMessageEndRef = { current: null }
const sharedTextareaRef = { current: null }
const sharedMentionResults = [{ avatarUrl: null, id: 'user-1', identity: 'alex', isLocal: false, label: 'Alex Kim' }]
const sharedPendingAttachments = [
  { file: new File(['notes'], 'notes.txt', { type: 'text/plain' }), id: 'att-1', mimeType: 'text/plain', name: 'notes.txt', sizeLabel: '1 KB' },
]
const sharedPanelProps = {
  attachmentAccept: '.png,.pdf',
  canSend: false,
  chatMessages: [],
  draft: '',
  fileInputRef: sharedFileInputRef,
  highlightedMentionIndex: 0,
  isSending: false,
  localAvatarUrl: null,
  maxAttachments: 10,
  mentionLabels: [],
  mentionResults: [],
  messageEndRef: sharedMessageEndRef,
  onAttachmentSelection: panelHandler,
  onClose: panelHandler,
  onComposerBlur: panelHandler,
  onDraftChange: panelHandler,
  onKeyDown: panelHandler,
  onMentionMouseDown: panelHandler,
  onRemoveAttachment: panelHandler,
  onSelectMention: panelHandler,
  onSend: panelHandler,
  pendingAttachments: [],
  showMentionResults: false,
  textareaRef: sharedTextareaRef,
  uploadingFiles: false,
}
const dockPanelProps = {
  ...sharedPanelProps,
  mentionResults: sharedMentionResults,
  pendingAttachments: sharedPendingAttachments,
}

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
        <MeetingChatLauncherButton unreadCount={3} onOpen={launcherOpen} />
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
    const markup = renderToStaticMarkup(
      <MeetingChatPanel
        attachmentAccept=".png,.pdf"
        canSend={true}
        chatMessages={[]}
        draft="@a"
        fileInputRef={sharedFileInputRef}
        highlightedMentionIndex={0}
        isSending={false}
        localAvatarUrl={null}
        maxAttachments={10}
        mentionLabels={[]}
        mentionResults={sharedMentionResults}
        messageEndRef={sharedMessageEndRef}
        onAttachmentSelection={panelHandler}
        onClose={panelHandler}
        onComposerBlur={panelHandler}
        onDraftChange={panelHandler}
        onKeyDown={panelHandler}
        onMentionMouseDown={panelHandler}
        onRemoveAttachment={panelHandler}
        onSelectMention={panelHandler}
        onSend={panelHandler}
        pendingAttachments={sharedPendingAttachments}
        showMentionResults={true}
        textareaRef={sharedTextareaRef}
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
    const closedMarkup = renderToStaticMarkup(
      <MeetingChatFloatingDock
        compact={false}
        isOpen={false}
        onOpen={launcherOpen}
        unreadCount={2}
        panelProps={dockPanelProps}
      />,
    )

    const openMarkup = renderToStaticMarkup(
      <MeetingChatFloatingDock
        compact={false}
        isOpen={true}
        onOpen={launcherOpen}
        unreadCount={0}
        panelProps={dockPanelProps}
      />,
    )

    expect(closedMarkup).toContain('Meeting chat')
    expect(closedMarkup).toContain('2')
    expect(openMarkup).toContain('Only people currently in the room receive these messages.')
  })
})