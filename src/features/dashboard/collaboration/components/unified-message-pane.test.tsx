import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { UnifiedMessagePane } from './unified-message-pane'

const handleLoadMore = () => {}
const handleMessageInputChange = () => {}
const handleSendMessage = async () => {}
const handleToggleReaction = async () => {}

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
        onLoadMore={handleLoadMore}
        messageInput=""
        onMessageInputChange={handleMessageInputChange}
        onSendMessage={handleSendMessage}
        isSending={false}
        onToggleReaction={handleToggleReaction}
      />,
    )

    expect(markup).toContain('Select a conversation')
    expect(markup).toContain('Choose a conversation from the sidebar to start messaging')
  })
})