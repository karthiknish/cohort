import { Sidebar, Header } from '@/components/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { NavigationProvider } from '@/contexts/navigation-context'
import { NavigationBreadcrumbs } from '@/components/navigation/breadcrumbs'

import { ScrollArea } from '@/components/ui/scroll-area'
import { PreviewDataBanner } from '@/components/dashboard/preview-data-banner'
import { AgentMode } from '@/components/agent-mode'
import { WorkspaceProviders } from '@/components/providers/workspace-providers'

// No ClientAccessGate — For You is always accessible, independent of client selection
export default function ForYouLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
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
                    {children}
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
