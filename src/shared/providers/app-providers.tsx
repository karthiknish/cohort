'use client';

import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
import { usePathname } from '@/shared/ui/navigation';
import { logPageView, setAnalyticsUserId } from '@/lib/analytics';
import { useAuth } from '@/shared/contexts/auth-context';
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params';
import { Toaster as SonnerToaster } from '@/shared/ui/sonner';

declare global {
  // eslint-disable-next-line no-var
  var __cohortsPostHogInitialized: boolean | undefined;
}

const PAGE_VIEW_DEBOUNCE_MS = 300;

type PostHogClient = typeof import('posthog-js').default;
type PostHogProviderComponent = ComponentType<{
  client: PostHogClient;
  children?: ReactNode;
}>;

function AnalyticsAndPostHog({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useUrlSearchParams();
  const { user } = useAuth();
  const serializedSearch = searchParams?.toString() ?? '';
  const [posthogClient, setPosthogClient] = useState<PostHogClient | null>(null);
  const [PostHogProvider, setPostHogProvider] = useState<PostHogProviderComponent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    void (async () => {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
      if (!key || !host) return;

      const [{ default: posthog }, { PostHogProvider: PHProvider }] = await Promise.all([
        import('posthog-js'),
        import('posthog-js/react'),
      ]);

      if (cancelled) return;

      if (!globalThis.__cohortsPostHogInitialized) {
        posthog.init(key, {
          api_host: host,
          person_profiles: 'always',
          capture_pageview: false,
          capture_pageleave: true,
        });
        globalThis.__cohortsPostHogInitialized = true;
      }

      setPosthogClient(posthog);
      setPostHogProvider(() => PHProvider);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const nextUserId = user?.id ?? null;
    void (async () => {
      if (!isMounted) return;
      await setAnalyticsUserId(nextUserId);
    })();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!pathname) return;
    const timeout = setTimeout(() => {
      const fullPath = serializedSearch.length > 0 ? `${pathname}?${serializedSearch}` : pathname;
      void logPageView(fullPath);
    }, PAGE_VIEW_DEBOUNCE_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [pathname, serializedSearch]);

  if (!posthogClient || !PostHogProvider) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthogClient}>{children}</PostHogProvider>;
}

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AnalyticsAndPostHog>
      {children}
      <SonnerToaster />
    </AnalyticsAndPostHog>
  );
}
