import { createFileRoute } from '@tanstack/react-router'
import ProposalDeckPage from '@/features/dashboard/proposals/[proposalId]/deck/page'

export const Route = createFileRoute('/_authed/dashboard/proposals/$proposalId/deck')({
  head: () => ({
    meta: [{ title: 'Proposal Deck | Cohorts' }],
  }),
  component: () => <ProposalDeckPage />,
})
