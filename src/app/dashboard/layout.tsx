import { Sidebar, Header } from '@/components/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { AuthProvider } from '@/contexts/auth-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="h-screen bg-white">
          <div className="flex h-full">
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <Header />
              <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-6">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
