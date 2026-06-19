/**
 * String-href `<Link>` backed by TanStack Router's `useNavigate`.
 *
 * Accepts the Next.js `href` ergonomics (plain strings, including dynamically
 * interpolated paths) so call sites can migrate off `next/link` without a
 * per-route type-safe `to`/`params` rewrite. Renders a real anchor for
 * accessibility and middle-click/⌘-click support, intercepting only plain
 * left-clicks for client-side navigation.
 */
import { forwardRef } from 'react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { useNavigate, useRouter as useTanStackRouter } from '@tanstack/react-router'

type LinkUrl = {
  pathname: string
  query?: Record<string, string | string[]>
  hash?: string
  search?: string
}

function resolveHref(href: string | LinkUrl): string {
  if (typeof href === 'string') return href
  const search =
    href.search ??
    (href.query
      ? `?${new URLSearchParams(href.query as Record<string, string>).toString()}`
      : '')
  return `${href.pathname}${search}${href.hash ?? ''}`
}

function isModifiedEvent(e: React.MouseEvent) {
  return e.metaKey || e.altKey || e.ctrlKey || e.shiftKey
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string | LinkUrl
  children?: ReactNode
  replace?: boolean
  prefetch?: boolean | null
  scroll?: boolean
  passHref?: boolean
  legacyBehavior?: boolean
  shallow?: boolean
  locale?: string | false
  transitionTypes?: string[]
}

// eslint-disable-next-line react-dom/no-missing-button-type -- <a> + preventDefault is intentional client-side routing
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    children,
    onClick,
    onMouseEnter,
    onPointerDown,
    replace,
    target,
    prefetch = true,
    scroll: _scroll,
    passHref: _passHref,
    legacyBehavior: _legacy,
    shallow: _shallow,
    locale: _locale,
    transitionTypes: _transitionTypes,
    ...rest
  },
  ref,
) {
  const navigate = useNavigate()
  const router = useTanStackRouter()
  const to = resolveHref(href)

  const warmRoute = () => {
    if (prefetch === false) return
    void router.preloadRoute({ to: to as never })
  }

  return (
    <a
      ref={ref}
      href={to}
      target={target}
      onMouseEnter={(e) => {
        warmRoute()
        onMouseEnter?.(e)
      }}
      onPointerDown={(e) => {
        warmRoute()
        onPointerDown?.(e)
      }}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if (target === '_blank' || isModifiedEvent(e) || e.button !== 0) return
        e.preventDefault()
        void navigate({ to: to as never, replace })
      }}
      {...rest}
    >
      {children}
    </a>
  )
})

export default Link
