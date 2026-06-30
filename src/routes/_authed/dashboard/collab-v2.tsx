import { createFileRoute } from '@tanstack/react-router'
import CollaborationV2Page from '@/features/collaboration-v2/page'

export const Route = createFileRoute('/_authed/dashboard/collab-v2')({
  validateSearch: (search: Record<string, unknown>) => ({
    channelId: typeof search.channelId === 'string' ? search.channelId : undefined,
    channelType: typeof search.channelType === 'string' ? search.channelType : undefined,
    conversationId: typeof search.conversationId === 'string' ? search.conversationId : undefined,
    clientId: typeof search.clientId === 'string' ? search.clientId : undefined,
    projectId: typeof search.projectId === 'string' ? search.projectId : undefined,
    projectName: typeof search.projectName === 'string' ? search.projectName : undefined,
    messageId: typeof search.messageId === 'string' ? search.messageId : undefined,
    threadId: typeof search.threadId === 'string' ? search.threadId : undefined,
  }),
  head: () => ({
    meta: [{ title: 'Collaboration V2 | Cohorts' }],
  }),
  component: () => <CollaborationV2Page />,
})
