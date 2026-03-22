import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
  useQuery: () => undefined,
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/collaboration',
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

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
}))

vi.mock('@/lib/convex-api', () => ({
  collaborationChannelsApi: {
    create: 'collaborationChannels.create',
    updateMembers: 'collaborationChannels.updateMembers',
    remove: 'collaborationChannels.remove',
  },
  usersApi: {
    listWorkspaceMembers: 'users.listWorkspaceMembers',
  },
}))

vi.mock('../hooks', () => ({
  useCollaborationData: () => ({
    clearThreadReplies: vi.fn(),
    channels: [],
    selectedChannel: null,
    selectChannel: vi.fn(),
  }),
}))

vi.mock('../hooks/use-direct-messages', () => ({
  useDirectMessages: () => ({
    selectedConversation: null,
    selectConversation: vi.fn(),
    startNewDM: vi.fn(),
  }),
}))

import { useCollaborationDashboardContext } from './collaboration-dashboard-provider'

function ContextConsumer() {
  useCollaborationDashboardContext()
  return null
}

describe('useCollaborationDashboardContext', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderToStaticMarkup(<ContextConsumer />)).toThrow(
      'useCollaborationDashboardContext must be used within a CollaborationDashboardProvider',
    )
  })
})