import { headers } from 'next/headers';
import { ProtectedRoute } from '@/shared/components/protected-route';
import { NavigationProvider } from '@/shared/contexts/navigation-context';
import { ClientAccessGate } from '@/features/dashboard/home/components/client-access-gate';
import { PreviewDataBanner } from '@/features/dashboard/home/components/preview-data-banner';
import { ForYouAgentMode } from '@/features/marketing/for-you/components/for-you-agent-mode';
import { ForYouShell } from '@/features/marketing/for-you/components/for-you-shell';
import { NetworkStatusBanner } from '@/shared/components/network-status-banner';
import { WorkspaceProviders } from '@/shared/providers/workspace-providers';
import { isScreenRecordingAuthBypassEnabled, PREVIEW_ROUTE_REQUEST_HEADER } from '@/lib/preview-data';
export const dynamic = 'force-dynamic';
export default async function ForYouLayout({ children }: {
    children: React.ReactNode;
}) {
    const requestHeaders = await headers();
    const allowPreviewAccess = isScreenRecordingAuthBypassEnabled() || requestHeaders.get(PREVIEW_ROUTE_REQUEST_HEADER) === '1';
    return (<ProtectedRoute allowPreviewAccess={allowPreviewAccess}>
      <WorkspaceProviders enablePreview enableProject>
        <NavigationProvider>
          <div className="relative min-h-screen bg-gradient-to-b from-primary/[0.04] via-background to-background">
            <NetworkStatusBanner />
            <ForYouShell />
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
              <PreviewDataBanner />
              <ClientAccessGate>
                <div className="pb-12 pt-6 sm:pt-8">{children}</div>
              </ClientAccessGate>
            </div>
            <ForYouAgentMode />
          </div>
        </NavigationProvider>
      </WorkspaceProviders>
    </ProtectedRoute>);
}
