import { Sidebar, Header } from '@/components/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { NavigationProvider } from '@/contexts/navigation-context'
import { NavigationBreadcrumbs } from '@/components/navigation/breadcrumbs'
import { AgentMode } from '@/components/agent-mode'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  )
}
