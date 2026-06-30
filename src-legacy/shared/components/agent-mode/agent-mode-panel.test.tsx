import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { AgentContextIds } from '@/lib/agent-context';
import { AgentValidationError } from '@/lib/agent-errors';
import type { AgentConversationSummary, AgentMessage } from '@/shared/hooks/use-agent-mode';
import { AgentModePanel } from './agent-mode-panel';
const noop = () => { };
const noopAsync = async () => { };
const EMPTY_ACTIVE_CONTEXT = {} satisfies AgentContextIds;
vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: {
        children: React.ReactNode;
    }) => children,
    LazyMotion: ({ children }: {
        children: React.ReactNode;
    }) => children,
    domAnimation: {},
    m: {
        div: ({ children }: {
            children: React.ReactNode;
        }) => <div>{children}</div>,
    },
}));
vi.mock('@/shared/ui/navigation', () => ({
    usePathname: () => '/dashboard',
    useRouter: () => ({ replace: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/shared/hooks/use-agent-panel-url', () => ({
    useAgentPanelUrl: () => ({
        openHistoryView: vi.fn(),
        closeHistoryView: vi.fn(),
        replaceUrl: vi.fn(),
    }),
}));
vi.mock('@/shared/contexts/client-context', () => ({
    useClientContext: () => ({ selectedClient: null, selectedClientId: null }),
}));
vi.mock('@/shared/contexts/auth-context', () => ({
    useAuth: () => ({ user: { role: 'admin' } }),
}));
vi.mock('@/shared/ui/sheet', () => ({
    Sheet: ({ children, open }: {
        children: React.ReactNode;
        open?: boolean;
    }) => open ? <div data-slot="agent-sheet">{children}</div> : null,
    SheetContent: ({ children, ...props }: {
        children: React.ReactNode;
        className?: string;
    }) => (<div data-slot="agent-sheet-content" {...props}>
      {children}
    </div>),
}));
vi.mock('@/shared/hooks/use-keyboard-shortcuts', () => ({
    useKeyboardShortcut: () => { },
}));
vi.mock('@/shared/hooks/use-mention-data', () => ({
    useMentionData: () => ({
        clients: [],
        projects: [],
        teams: [],
        users: [],
        allItems: [],
        isLoading: false,
    }),
}));
vi.mock('@/shared/ui/voice-input', () => ({
    VoiceInputButton: () => <button type="button">Voice</button>,
}));
vi.mock('./mention-dropdown', () => ({
    MentionDropdown: () => null,
    formatMention: (item: {
        label: string;
    }) => `@${item.label}`,
}));
vi.mock('@/shared/ui/motion', async () => {
    const { motionTestMock } = await import('@/test/motion-mock');
    return motionTestMock;
});
const DEFAULT_RUNTIME = {
    open: true,
    processing: false,
    extractingAttachments: false,
} as const;
const DEFAULT_HISTORY_LOAD = {
    historyLoading: false,
    conversationLoading: false,
} as const;
function renderPanel(overrides: Partial<React.ComponentProps<typeof AgentModePanel>> = {}) {
    return renderToStaticMarkup(<AgentModePanel runtime={DEFAULT_RUNTIME} historyLoad={DEFAULT_HISTORY_LOAD} activeContext={EMPTY_ACTIVE_CONTEXT} maxMessageLength={4000} onClose={noop} messages={[]} onSendMessage={noop} pendingAttachments={[]} onAddAttachments={noopAsync} onRemoveAttachment={noop} onClear={noop} conversationId={null} history={[] satisfies AgentConversationSummary[]} onOpenHistory={noop} onSelectConversation={noop} onUpdateConversationTitle={noop} onDeleteConversation={noop} {...overrides}/>);
}
describe('AgentModePanel', () => {
    it('renders the centered empty-state composer when there are no messages', () => {
        const markup = renderPanel();
        expect(markup).toContain('What can I help with?');
        expect(markup).toContain('Tasks due this week');
        expect(markup).toContain('Agent Mode');
    });
    it('renders the failed-message banner for active conversations', () => {
        const markup = renderPanel({
            messages: [
                {
                    id: 'message-1',
                    clientId: 'message-1',
                    type: 'user',
                    content: 'Retry this',
                    timestamp: new Date('2026-03-07T18:26:10.000Z'),
                } as AgentMessage,
            ],
            lastFailedMessage: 'Retry this',
            onRetry: () => { },
        });
        expect(markup).toContain('Message failed to send');
        expect(markup).toContain('Retry');
    });
    it('renders dismissible error banner when error has no lastFailedMessage', () => {
        const err = new AgentValidationError('Message too long (max 500 characters)');
        const markup = renderPanel({
            error: err,
            lastFailedMessage: null,
            onClearError: () => { },
        });
        expect(markup).toContain('Message too long (max 500 characters)');
        expect(markup).toContain('Dismiss');
    });
});
