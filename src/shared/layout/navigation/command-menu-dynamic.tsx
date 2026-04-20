'use client'

import dynamic from 'next/dynamic'

/** Defer cmdk + command palette chunk until after shell paint. */
export const CommandMenuDynamic = dynamic(
  () => import('./command-menu').then((m) => m.CommandMenu),
  { ssr: false, loading: () => null }
)
