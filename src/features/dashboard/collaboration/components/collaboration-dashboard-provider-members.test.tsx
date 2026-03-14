import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const useQueryMock = vi.fn()

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/collaboration',
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => ({
    get: () => null,
    toString: () => '',
  }),
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
    listAllUsers: 'users.listAllUsers',
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

import {
  CollaborationDashboardProvider,
  useCollaborationDashboardContext,
} from './collaboration-dashboard-provider'

function WorkspaceMembersConsumer() {
  const { workspaceMembers } = useCollaborationDashboardContext()
  return <div>{workspaceMembers.map((member) => member.name).join(', ')}</div>
}

describe('CollaborationDashboardProvider workspace members', () => {
  beforeEach(() => {
    useQueryMock.mockReset()
    useQueryMock.mockImplementation((apiRef: string) => {
      if (apiRef === 'users.listWorkspaceMembers') {
        return [
          { id: 'member-1', name: 'Alex Johnson', email: 'alex@example.com', role: 'member' },
          { id: 'member-2', name: 'Jordan Lee', email: 'jordan@example.com', role: 'admin' },
        ]
      }
      return undefined
    })
  })

  it('loads admin channel member options from workspace members instead of all users', () => {
    const markup = renderToStaticMarkup(
      <CollaborationDashboardProvider>
        <WorkspaceMembersConsumer />
      </CollaborationDashboardProvider>,
    )

    expect(markup).toContain('Alex Johnson')
    expect(markup).toContain('Jordan Lee')
    expect(useQueryMock).toHaveBeenCalledWith('users.listWorkspaceMembers', {
      workspaceId: 'workspace-1',
      limit: 500,
    })
    expect(useQueryMock).not.toHaveBeenCalledWith('users.listAllUsers', expect.anything())
  })
})