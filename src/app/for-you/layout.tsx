import { ProtectedRoute } from '@/shared/components/protected-route'
import { PreviewDataBanner } from '@/features/dashboard/home/components/preview-data-banner'
import { AgentMode } from '@/shared/components/agent-mode'
import { NavigationProvider } from '@/shared/contexts/navigation-context'
import { WorkspaceProviders } from '@/shared/providers/workspace-providers'

export default function ForYouLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <WorkspaceProviders enablePreview enableProject>
        <NavigationProvider>
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <PreviewDataBanner />
            {children}
          </div>
          <AgentMode />
        </NavigationProvider>
      </WorkspaceProviders>
    </ProtectedRoute>
  )
}
