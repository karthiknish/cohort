'use client';

import { useSearchParams } from '@/shared/ui/navigation';

/**
 * Returns the current URL search params.
 * Directly backed by TanStack Router's `useRouterState` — no context
 * provider needed.
 */
export function useUrlSearchParams(): URLSearchParams {
  return useSearchParams();
}
