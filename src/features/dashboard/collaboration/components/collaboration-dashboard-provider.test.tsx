import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { useImperativeHandle, type RefObject } from 'react';

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

function Harness({ ref }: { ref: RefObject<ReturnType<typeof useCollaborationDashboard> | null> }) {
  const value = useCollaborationDashboard();
  useImperativeHandle(ref, () => value);
  return null;
}

describe('useCollaborationDashboard', () => {
  it('returns a context value with expected shape', () => {
    const ref = { current: null as ReturnType<typeof useCollaborationDashboard> | null };
    renderToStaticMarkup(<Harness ref={ref} />);
    expect(ref.current).toBeDefined();
    expect(ref.current!.currentUserId).toBe('admin-1');
    expect(ref.current!.isAdmin).toBe(true);
    expect(ref.current!.workspaceId).toBe('workspace-1');
  });
});
