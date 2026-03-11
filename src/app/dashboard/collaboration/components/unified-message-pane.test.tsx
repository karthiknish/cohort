import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { UnifiedMessagePane } from './unified-message-pane'

describe('UnifiedMessagePane', () => {
  it('renders the select-conversation empty state without a header', () => {
    const markup = renderToStaticMarkup(
      <UnifiedMessagePane
        header={null}
        messages={[]}
        currentUserId="user-1"
        isLoading={false}
        isLoadingMore={false}
        hasMore={false}
        onLoadMore={() => {}}
        messageInput=""
        onMessageInputChange={() => {}}
        onSendMessage={async () => {}}
        isSending={false}
        onToggleReaction={async () => {}}
      />,
    )

    expect(markup).toContain('Select a conversation')
    expect(markup).toContain('Choose a conversation from the sidebar to start messaging')
  })
})