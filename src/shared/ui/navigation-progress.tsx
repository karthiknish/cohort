'use client';

import { useRouterState } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Top-of-page loading bar shown during client-side route transitions.
 *
 * Uses TanStack Router's `isLoading` + `isTransitioning` state to detect
 * in-flight navigation. The bar animates in with a slight delay (to avoid
 * flicker on instant navigations) and fades out when the route settles.
 *
 * Render once near the root, above all page content.
 */
export function NavigationProgress() {
  const isLoading = useRouterState({
    select: (s) => s.isLoading,
  });
  const isTransitioning = useRouterState({
    select: (s) => s.isTransitioning,
  });

  const isNavigating = isLoading || isTransitioning;

  // Delay showing the bar so instant navigations don't flash it.
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (isNavigating) {
      showTimerRef.current = setTimeout(() => setVisible(true), 80);
    } else {
      setVisible(false);
    }

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isNavigating]);

  return (
    <>
      {/* Top progress bar */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none fixed inset-x-0 top-0 z-[2000] h-0.5',
          visible ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-200',
        )}
      >
        <div
          className={cn(
            'h-full bg-primary/80 shadow-[0_0_8px_rgba(0,0,0,0.12)]',
            visible ? 'nav-progress-indeterminate' : '',
          )}
        />
      </div>
      {/* Subtle content dim overlay during navigation */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none fixed inset-0 z-[1900] bg-foreground/[0.03]',
          visible ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-150',
        )}
      />
      <style>{`
        @keyframes nav-progress-grow {
          0% { transform: scaleX(0); transform-origin: left; }
          50% { transform: scaleX(0.7); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: right; }
        }
        .nav-progress-indeterminate {
          animation: nav-progress-grow 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
}
