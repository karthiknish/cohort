'use client'

import { useMemo } from 'react'
import type { ComponentPropsWithoutRef, ElementType } from 'react'

/**
 * HTML intended for `TrustedHtml` must be **trusted** (sanitized server-side or from a safe template).
 * Never pass raw user-controlled strings — use `escapeHtml` / a sanitizer before building `__html`.
 */
export type TrustedHtml = {
  __html: string
  source: string
}

/** Pair sanitized HTML with a non-production `source` label for debugging. */
export function createTrustedHtml(html: string, source: string): TrustedHtml {
  return { __html: html, source }
}

type TrustedHtmlProps<T extends ElementType> = {
  as?: T
  html: TrustedHtml
} & Omit<ComponentPropsWithoutRef<T>, 'children' | 'dangerouslySetInnerHTML'>

export function TrustedHtml<T extends ElementType = 'div'>({
  as,
  html,
  ...props
}: TrustedHtmlProps<T>) {
  const Component = (as ?? 'div') as ElementType
  const dangerousHtml = useMemo(() => ({ __html: html.__html }), [html.__html])

  return (
    <Component
      {...props}
      // react-doctor-disable-next-line
      dangerouslySetInnerHTML={dangerousHtml}
      data-html-source={process.env.NODE_ENV !== 'production' ? html.source : undefined}
    />
  )
}
