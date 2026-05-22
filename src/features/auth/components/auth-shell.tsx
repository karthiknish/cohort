'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AuthShellProps = {
  children: ReactNode
  className?: string
}

/** Centers auth content (card or panel) on a plain full-height canvas. */
export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div
      className={cn(
        'flex min-h-dvh items-center justify-center bg-background px-5 py-10 sm:px-8',
        className,
      )}
    >
      <div className="w-full max-w-md lg:max-w-120">{children}</div>
    </div>
  )
}
