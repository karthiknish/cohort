import { headers } from 'next/headers'

import { Sidebar, Header } from '@/shared/layout/navigation'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { NavigationProvider } from '@/shared/contexts/navigation-context'
import { NavigationBreadcrumbs } from '@/shared/layout/navigation/breadcrumbs'

import { ScrollArea } from '@/shared/ui/scroll-area'
import { ClientAccessGate } from '@/features/dashboard/home/components/client-access-gate'
import { PreviewDataBanner } from '@/features/dashboard/home/components/preview-data-banner'
import { AgentMode } from '@/shared/components/agent-mode'
import { WorkspaceProviders } from '@/shared/providers/workspace-providers'
import { PREVIEW_ROUTE_REQUEST_HEADER } from '@/lib/preview-data'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const requestHeaders = await headers()
  const allowPreviewAccess = requestHeaders.get(PREVIEW_ROUTE_REQUEST_HEADER) === '1'

  return (
    <ProtectedRoute allowPreviewAccess={allowPreviewAccess}>
      <WorkspaceProviders enablePreview enableProject>
        <NavigationProvider>
          <div className="relative flex min-h-screen bg-background">
            <div className="flex h-full w-full">
              <Sidebar />
              <div className="flex flex-1 flex-col bg-muted/20">
                <Header />
                <ScrollArea className="flex-1">
                  <main className="min-h-full space-y-6 px-6 py-6">
                    <NavigationBreadcrumbs />
                    <PreviewDataBanner />
                    <ClientAccessGate>
                      {children}
                    </ClientAccessGate>
                  </main>
                </ScrollArea>
              </div>
            </div>
            <AgentMode />
          </div>
        </NavigationProvider>
      </WorkspaceProviders>
    </ProtectedRoute>
  )
}
