import { createFileRoute } from '@tanstack/react-router'
import ProposalDeckViewerPageClient from '@/features/dashboard/proposals/viewer/proposal-deck-viewer-client'

export const Route = createFileRoute('/_authed/dashboard/proposals/viewer')({
  validateSearch: (search: Record<string, unknown>) => ({
    src: typeof search.src === 'string' ? search.src : undefined,
  }),
  head: () => ({
    meta: [{ title: 'Proposal Viewer | Cohorts' }],
  }),
  component: ProposalViewerRoute,
})

function ProposalViewerRoute() {
  const { src } = Route.useSearch()
  return <ProposalDeckViewerPageClient src={src ?? null} />
}
