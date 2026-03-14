'use client'

import type { ComponentPropsWithoutRef, ElementType } from 'react'

export type TrustedHtml = {
  __html: string
  source: string
}

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

  return (
    <Component
      {...props}
      dangerouslySetInnerHTML={{ __html: html.__html }}
      data-html-source={process.env.NODE_ENV !== 'production' ? html.source : undefined}
    />
  )
}