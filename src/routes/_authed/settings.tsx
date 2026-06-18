import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { NavigationProvider } from '@/shared/contexts/navigation-context'
import { Sidebar, Header } from '@/shared/layout/navigation'
import { NavigationBreadcrumbs } from '@/shared/layout/navigation/breadcrumbs'
import { AgentModeDynamic } from '@/shared/components/agent-mode/agent-mode-dynamic'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { WorkspaceProviders } from '@/shared/providers/workspace-providers'
import {
  isScreenRecordingAuthBypassEnabled,
  PREVIEW_ROUTE_REQUEST_HEADER,
} from '@/lib/preview-data'
import SettingsPage from '@/features/settings/page'
import { SettingsError } from '@/shared/ui/route-boundaries/settings-error'
import { SettingsLoading } from '@/shared/ui/route-boundaries/settings-loading'

const loadSettingsShell = createServerFn({ method: 'GET' }).handler(async () => {
  const { getRequestHeader } = await import('@tanstack/react-start/server')
  return {
    allowPreviewAccess:
      isScreenRecordingAuthBypassEnabled() ||
      getRequestHeader(PREVIEW_ROUTE_REQUEST_HEADER) === '1',
  }
})

export const Route = createFileRoute('/_authed/settings')({
  head: () => ({
    meta: [{ title: 'Settings | Cohorts' }],
  }),
  loader: () => loadSettingsShell(),
  component: SettingsRoute,
  errorComponent: SettingsError,
  pendingComponent: SettingsLoading,
})

function SettingsRoute() {
  const { allowPreviewAccess } = Route.useLoaderData()
  return (
    <ProtectedRoute allowPreviewAccess={allowPreviewAccess}>
      <WorkspaceProviders enablePreview enablePreferences>
        <NavigationProvider>
          <div className="relative flex min-h-screen bg-background">
            <div className="flex min-h-0 w-full flex-1">
              <Sidebar />
              <div className="flex min-h-0 flex-1 flex-col bg-muted/20">
                <Header />
                <ScrollArea className="min-h-0 flex-1">
                  <main className="min-h-full space-y-6 p-6">
                    <NavigationBreadcrumbs />
                    <SettingsPage />
                  </main>
                </ScrollArea>
              </div>
            </div>
            <AgentModeDynamic />
          </div>
        </NavigationProvider>
      </WorkspaceProviders>
    </ProtectedRoute>
  )
}
