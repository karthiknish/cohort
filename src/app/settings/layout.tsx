import { Sidebar, Header } from '@/shared/layout/navigation'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { NavigationProvider } from '@/shared/contexts/navigation-context'
import { NavigationBreadcrumbs } from '@/shared/layout/navigation/breadcrumbs'
import { AgentMode } from '@/shared/components/agent-mode'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { WorkspaceProviders } from '@/shared/providers/workspace-providers'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <WorkspaceProviders enablePreview enablePreferences>
        <NavigationProvider>
          <div className="relative flex min-h-screen bg-background">
            <div className="flex h-full w-full">
              <Sidebar />
              <div className="flex flex-1 flex-col bg-muted/20">
                <Header />
                <ScrollArea className="flex-1">
                  <main className="min-h-full px-6 py-6">
                    <NavigationBreadcrumbs />
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
