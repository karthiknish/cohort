import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('emoji-picker-react', () => ({
  __esModule: true,
  default: () => <div>emoji-picker</div>,
  Theme: { LIGHT: 'light' },
}))

vi.mock('@/shared/ui/voice-input', () => ({
  VoiceInputButton: () => <button type="button">voice-input</button>,
}))

import type { ClientTeamMember } from '@/types/clients'

import {
  RichComposerMentionMenu,
  RichComposerTextareaShell,
  RichComposerToolbar,
} from './rich-composer-sections'

const participants: ClientTeamMember[] = [
  { name: 'Alex Kim', role: 'manager', email: 'alex@example.com' } as ClientTeamMember,
  { name: 'Sam Lee', role: 'designer', email: 'sam@example.com' } as ClientTeamMember,
]
const EMPTY_TEXTAREA_REF = { current: null }

describe('rich composer sections', () => {
  it('renders the toolbar actions', () => {
    const markup = renderToStaticMarkup(
      <RichComposerToolbar
        disabled={false}
        emojiPickerOpen={false}
        hasAttachments={true}
        onAction={vi.fn()}
        onAttachClick={vi.fn()}
        onEmojiClick={vi.fn()}
        onInsertMention={vi.fn()}
        onOpenEmojiChange={vi.fn()}
        onVoiceTranscript={vi.fn()}
      />,
    )

    expect(markup).toContain('Bold')
    expect(markup).toContain('Numbered list')
    expect(markup).toContain('Attach')
    expect(markup).toContain('voice-input')
  })

  it('renders the textarea shell and mention menu', () => {
    const markup = renderToStaticMarkup(
      <>
        <RichComposerTextareaShell
          disabled={false}
          isDraggingOver={true}
          onBlur={vi.fn()}
          onChange={vi.fn()}
          onDragEnter={vi.fn()}
          onDragLeave={vi.fn()}
          onDragOver={vi.fn()}
          onDrop={vi.fn()}
          onFocus={vi.fn()}
          onKeyDown={vi.fn()}
          onPaste={vi.fn()}
          placeholder="Share an update…"
          textareaRef={EMPTY_TEXTAREA_REF}
          value="@a"
        />
        <RichComposerMentionMenu
          highlightedMention={0}
          mentionQuery="a"
          mentionResults={participants}
          onMentionClick={vi.fn()}
          onMentionMouseDown={vi.fn()}
        />
      </>,
    )

    expect(markup).toContain('Drop files here to attach')
    expect(markup).toContain('Mention teammate')
    expect(markup).toContain('Alex Kim')
    expect(markup).toContain('Sam Lee')
  })

  it('renders a stable no-results mention state', () => {
    const markup = renderToStaticMarkup(
      <RichComposerMentionMenu
        highlightedMention={0}
        mentionQuery="zoe"
        mentionResults={[]}
        onMentionClick={vi.fn()}
        onMentionMouseDown={vi.fn()}
      />,
    )

    expect(markup).toContain('Mention teammate')
    expect(markup).toContain('No teammates match')
    expect(markup).toContain('zoe')
  })
})