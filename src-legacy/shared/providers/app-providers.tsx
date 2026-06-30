'use client';
import { Suspense, type ReactNode } from 'react';
import { AuthProvider } from '@/shared/contexts/auth-context';
import { UrlSearchParamsProvider } from '@/shared/contexts/url-search-params-context';
import { AnalyticsProvider } from '@/shared/providers/analytics-provider';
import { PostHogProvider } from '@/shared/providers/posthog-provider';
import { ConvexClientProvider } from '@/shared/providers/convex-provider';
import { QueryProvider } from '@/shared/providers/query-provider';
import { Toaster as SonnerToaster } from '@/shared/ui/sonner';
interface AppProvidersProps {
    children: ReactNode;
    initialToken?: string | null;
}
export function AppProviders({ children, initialToken }: AppProvidersProps) {
    return (<ConvexClientProvider initialToken={initialToken}>
      <AuthProvider>
        <QueryProvider>
          <Suspense fallback={null}>
            <UrlSearchParamsProvider>
              <AnalyticsProvider>
                <PostHogProvider>
                  {children}
                  <SonnerToaster />
                </PostHogProvider>
              </AnalyticsProvider>
            </UrlSearchParamsProvider>
          </Suspense>
        </QueryProvider>
      </AuthProvider>
    </ConvexClientProvider>);
}
