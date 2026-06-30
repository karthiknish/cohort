'use client';

import { type ReactNode, useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
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

function AnalyticsAndPostHog({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useUrlSearchParams();
  const { user } = useAuth();
  const serializedSearch = searchParams?.toString() ?? '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (globalThis.__cohortsPostHogInitialized) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || !host) return;
    posthog.init(key, {
      api_host: host,
      person_profiles: 'always',
      capture_pageview: false,
      capture_pageleave: true,
    });
    globalThis.__cohortsPostHogInitialized = true;
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

  return <PHProvider client={posthog}>{children}</PHProvider>;
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
