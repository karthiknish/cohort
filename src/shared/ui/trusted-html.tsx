'use client'

import { useMemo } from 'react'
import type { ComponentPropsWithoutRef, ElementType } from 'react'

import type { TrustedHtml } from '@/shared/ui/trusted-html-types'

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
