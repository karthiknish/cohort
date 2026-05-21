'use client'

import dynamic from 'next/dynamic'

/** Defer date-fns + infinite query bundle off header critical path. */
export const NotificationsDropdownDynamic = dynamic(
  () => import('./notifications-dropdown').then((m) => m.NotificationsDropdown),
  {
    ssr: false,
    loading: () => (
      <div
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/20"
        aria-hidden
      >
        <span className="h-4 w-4 rounded-md bg-muted/60 motion-safe:animate-pulse" />
      </div>
    ),
  }
)
