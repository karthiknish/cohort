import { Sidebar, Header } from '@/shared/layout/navigation'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { NavigationProvider } from '@/shared/contexts/navigation-context'
import { NavigationBreadcrumbs } from '@/shared/layout/navigation/breadcrumbs'
import { AgentModeDynamic } from '@/shared/components/agent-mode/agent-mode-dynamic'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { WorkspaceProviders } from '@/shared/providers/workspace-providers'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <WorkspaceProviders enablePreview enablePreferences>
        <NavigationProvider>
          <div className="relative flex min-h-screen bg-background">
            <div className="flex min-h-0 w-full flex-1">
              <Sidebar />
              <div className="flex min-h-0 flex-1 flex-col bg-muted/20">
                <Header />
                <ScrollArea className="min-h-0 flex-1">
                  <main className="min-h-full space-y-6 px-6 py-6">
                    <NavigationBreadcrumbs />
                    {children}
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
