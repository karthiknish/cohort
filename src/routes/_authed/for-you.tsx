import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { NavigationProvider } from '@/shared/contexts/navigation-context'
import { ClientAccessGate } from '@/features/dashboard/home/components/client-access-gate'
import { PreviewDataBanner } from '@/features/dashboard/home/components/preview-data-banner'
import { ForYouAgentMode } from '@/features/marketing/for-you/components/for-you-agent-mode'
import { ForYouShell } from '@/features/marketing/for-you/components/for-you-shell'
import { NetworkStatusBanner } from '@/shared/components/network-status-banner'
import { WorkspaceProviders } from '@/shared/providers/workspace-providers'
import {
  isScreenRecordingAuthBypassEnabled,
  PREVIEW_ROUTE_REQUEST_HEADER,
} from '@/lib/preview-data'
import ForYouPageClient from '@/features/marketing/for-you/page.client'
import { DashboardError as ForYouError } from '@/shared/ui/route-boundaries/dashboard-error'
import { ForYouLoading } from '@/shared/ui/route-boundaries/for-you-loading'

const loadForYouShell = createServerFn({ method: 'GET' }).handler(async () => {
  const { getRequestHeader } = await import('@tanstack/react-start/server')
  return {
    allowPreviewAccess:
      isScreenRecordingAuthBypassEnabled() ||
      getRequestHeader(PREVIEW_ROUTE_REQUEST_HEADER) === '1',
  }
})

export const Route = createFileRoute('/_authed/for-you')({
  head: () => ({
    meta: [
      { title: 'For You | Cohorts' },
      {
        name: 'description',
        content:
          'Review your activity feed, client work, meeting momentum, and dashboard priorities in one place.',
      },
    ],
  }),
  loader: () => loadForYouShell(),
  component: ForYouRoute,
  errorComponent: ForYouError,
  pendingComponent: ForYouLoading,
})

function ForYouRoute() {
  const { allowPreviewAccess } = Route.useLoaderData()

  return (
    <ProtectedRoute allowPreviewAccess={allowPreviewAccess}>
      <WorkspaceProviders enablePreview enableProject>
        <NavigationProvider>
          <div className="relative min-h-screen bg-gradient-to-b from-primary/[0.04] via-background to-background">
            <NetworkStatusBanner />
            <ForYouShell />
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
              <PreviewDataBanner />
              <ClientAccessGate>
                <div className="pb-12 pt-6 sm:pt-8">
                  <ForYouPageClient />
                </div>
              </ClientAccessGate>
            </div>
            <ForYouAgentMode />
          </div>
        </NavigationProvider>
      </WorkspaceProviders>
    </ProtectedRoute>
  )
}
