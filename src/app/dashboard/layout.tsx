import { Sidebar, Header } from '@/components/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { AuthProvider } from '@/contexts/auth-context'
import Chatbot from '@/components/chatbot'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="relative flex min-h-screen bg-background">
          <div className="flex h-full w-full">
            <Sidebar />
            <div className="flex flex-1 flex-col bg-muted/20">
              <Header />
              <ScrollArea className="flex-1">
                <main className="min-h-full px-6 py-6">
                  {children}
                </main>
              </ScrollArea>
            </div>
          </div>
          <Chatbot />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
