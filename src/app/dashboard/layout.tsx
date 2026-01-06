import { Sidebar, Header } from '@/components/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { AuthProvider } from '@/contexts/auth-context'
import { ClientProvider } from '@/contexts/client-context'
import { NavigationProvider } from '@/contexts/navigation-context'
import { PreviewProvider } from '@/contexts/preview-context'
import { NavigationBreadcrumbs } from '@/components/navigation/breadcrumbs'

import { ScrollArea } from '@/components/ui/scroll-area'
import { ClientAccessGate } from '@/components/dashboard/client-access-gate'
import { PreviewDataBanner } from '@/components/dashboard/preview-data-banner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ClientProvider>
          <NavigationProvider>
            <PreviewProvider>
              <div className="relative flex min-h-screen bg-background">
                <div className="flex h-full w-full">
                  <Sidebar />
                  <div className="flex flex-1 flex-col bg-muted/20">
                    <Header />
                    <ScrollArea className="flex-1">
                      <main className="min-h-full px-6 py-6">
                        <NavigationBreadcrumbs />
                        <PreviewDataBanner className="mb-6" />
                        <ClientAccessGate>
                          {children}
                        </ClientAccessGate>
                      </main>
                    </ScrollArea>
                  </div>
                </div>

              </div>
            </PreviewProvider>
          </NavigationProvider>
        </ClientProvider>
      </ProtectedRoute>
    </AuthProvider>
  )
}
