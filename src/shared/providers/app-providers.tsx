'use client';
import { Suspense, type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/shared/contexts/auth-context';
import { UrlSearchParamsProvider } from '@/shared/contexts/url-search-params-context';
import { AnalyticsProvider } from '@/shared/providers/analytics-provider';
import { PostHogProvider } from '@/shared/providers/posthog-provider';
import { Toaster as SonnerToaster } from '@/shared/ui/sonner';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  );
}
