import { headers } from 'next/headers'

import { Sidebar, Header } from '@/shared/layout/navigation'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { NavigationProvider } from '@/shared/contexts/navigation-context'
import { NavigationBreadcrumbs } from '@/shared/layout/navigation/breadcrumbs'

import { ScrollArea } from '@/shared/ui/scroll-area'
import { ClientAccessGate } from '@/features/dashboard/home/components/client-access-gate'
import { DashboardMainRoleFrame } from '@/features/dashboard/home/components/dashboard-main-role-frame'
import { PreviewDataBanner } from '@/features/dashboard/home/components/preview-data-banner'
import { AgentModeDynamic } from '@/shared/components/agent-mode/agent-mode-dynamic'
import { WorkspaceProviders } from '@/shared/providers/workspace-providers'
import { isScreenRecordingAuthBypassEnabled, PREVIEW_ROUTE_REQUEST_HEADER } from '@/lib/preview-data'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const requestHeaders = await headers()
  const allowPreviewAccess = isScreenRecordingAuthBypassEnabled() || requestHeaders.get(PREVIEW_ROUTE_REQUEST_HEADER) === '1'

  return (
    <ProtectedRoute allowPreviewAccess={allowPreviewAccess}>
      <WorkspaceProviders enablePreview enableProject>
        <NavigationProvider>
          <div className="relative flex min-h-screen bg-background">
            <div className="flex min-h-0 w-full flex-1">
              <Sidebar />
              <div className="flex min-h-0 flex-1 flex-col bg-muted/20">
                <Header />
                <ScrollArea className="min-h-0 flex-1">
                  <main className="min-h-full">
                    <DashboardMainRoleFrame>
                      <NavigationBreadcrumbs />
                      <PreviewDataBanner />
                      <ClientAccessGate>
                        {children}
                      </ClientAccessGate>
                    </DashboardMainRoleFrame>
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
