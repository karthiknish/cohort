import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../hooks/use-poll-message-actions', () => ({
    usePollMessageActions: () => ({
        handleVote: async () => { },
        handleEndPoll: async () => { },
    }),
}));
import { UnifiedMessagePane } from './unified-message-pane';
const handleLoadMore = () => { };
const handleMessageInputChange = () => { };
const handleSendMessage = async () => { };
const handleToggleReaction = async () => { };
describe('UnifiedMessagePane', () => {
    it('renders the select-conversation empty state without a header', () => {
        const markup = renderToStaticMarkup(<UnifiedMessagePane header={null} messages={[]} currentUserId="user-1" listState={{ loading: false, loadingMore: false, hasMore: false }} composerState={{ sending: false, uploadingAttachments: false, pendingAttachments: false }} onLoadMore={handleLoadMore} messageInput="" onMessageInputChange={handleMessageInputChange} onSendMessage={handleSendMessage} onToggleReaction={handleToggleReaction}/>);
        expect(markup).toContain('Select a conversation');
        expect(markup).toContain('Choose a conversation from the sidebar to start messaging');
    });
});
