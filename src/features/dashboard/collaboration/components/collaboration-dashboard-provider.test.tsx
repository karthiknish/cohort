import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
  useQuery: () => undefined,
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/collaboration',
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock('@/shared/contexts/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'admin-1',
      agencyId: 'workspace-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
    },
  }),
}));
vi.mock('@/lib/convex-api', () => ({
  collaborationChannelsApi: {
    create: 'collaborationChannels.create',
    updateMembers: 'collaborationChannels.updateMembers',
    remove: 'collaborationChannels.remove',
  },
  usersApi: {
    listWorkspaceMembers: 'users.listWorkspaceMembers',
  },
}));
vi.mock('../hooks/use-collaboration-data', () => ({
  useCollaborationData: () => ({
    clearThreadReplies: vi.fn(),
    channels: [],
    selectedChannel: null,
    selectChannel: vi.fn(),
  }),
}));
vi.mock('../hooks/use-direct-messages', () => ({
  useDirectMessages: () => ({
    selectedConversation: null,
    selectConversation: vi.fn(),
    startNewDM: vi.fn(),
  }),
}));

import { useCollaborationDashboard } from './collaboration-dashboard-provider';

let captured: ReturnType<typeof useCollaborationDashboard> | null = null;
function Harness() {
  captured = useCollaborationDashboard();
  return null;
}

describe('useCollaborationDashboard', () => {
  it('returns a context value with expected shape', () => {
    renderToStaticMarkup(<Harness />);
    expect(captured).toBeDefined();
    expect(captured!.currentUserId).toBe('admin-1');
    expect(captured!.isAdmin).toBe(true);
    expect(captured!.workspaceId).toBe('workspace-1');
  });
});
