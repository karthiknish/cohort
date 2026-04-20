'use client'

import dynamic from 'next/dynamic'

/**
 * Code-splits Agent Mode (panel + FAB) so dashboard/settings shells pay less initial JS.
 * Client-only — FAB/panel need browser APIs anyway.
 */
export const AgentModeDynamic = dynamic(
  () => import('./index').then((m) => m.AgentMode),
  { ssr: false, loading: () => null }
)
