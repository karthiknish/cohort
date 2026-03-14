import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
}))

vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

import { PinnedMessages } from './pinned-messages'

describe('PinnedMessages', () => {
  it('renders a deterministic empty state when requested', () => {
    const markup = renderToStaticMarkup(
      <PinnedMessages messages={[]} workspaceId={null} userId={null} showEmptyState={true} />,
    )

    expect(markup).toContain('Pinned Messages')
    expect(markup).toContain('No pinned messages')
    expect(markup).toContain('Pin important messages to keep them easy to find.')
  })
})