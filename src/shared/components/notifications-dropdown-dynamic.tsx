'use client'

import dynamic from 'next/dynamic'

/** Defer date-fns + infinite query bundle off header critical path. */
export const NotificationsDropdownDynamic = dynamic(
  () => import('./notifications-dropdown').then((m) => m.NotificationsDropdown),
  {
    ssr: false,
    loading: () => (
      <div
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
        aria-hidden
      >
        <span className="h-5 w-5 rounded bg-muted/60 motion-safe:animate-pulse" />
      </div>
    ),
  }
)
