/**
 * Navigation hooks backed by TanStack Router, exposing the Next.js
 * `next/navigation` API shape (`useRouter`, `usePathname`, `useSearchParams`,
 * `useParams`, `redirect`, `permanentRedirect`) so existing call sites keep
 * working under the TanStack Start build.
 */
import { useMemo } from 'react'
import {
  useLocation,
  useNavigate,
  useParams as useTanStackParams,
  useRouter as useTanStackRouter,
  useRouterState,
  redirect as tsRedirect,
} from '@tanstack/react-router'
import { toTanStackNavigateOptions } from '@/shared/lib/tanstack-href'

export function usePathname(): string {
  return useRouterState({ select: (s) => s.location.pathname })
}

export function useSearchParams(): URLSearchParams {
  const search = useRouterState({
    select: (s) => s.location.search as Record<string, unknown>,
  })
  return useMemo(() => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(search ?? {})) {
      if (value == null) continue
      if (Array.isArray(value)) {
        for (const v of value) params.append(key, String(v))
      } else {
        params.set(key, String(value))
      }
    }
    return params
  }, [search])
}

type Router = {
  push: (href: string, opts?: Record<string, unknown>) => void
  replace: (href: string, opts?: Record<string, unknown>) => void
  back: () => void
  forward: () => void
  refresh: () => void
  prefetch: (href?: string) => void
}

export function useRouter(): Router {
  const navigate = useNavigate()
  const router = useTanStackRouter()
  return {
    push: (href, opts) => {
      const { to, search, hash } = toTanStackNavigateOptions(href)
      void navigate({
        to: to as never,
        ...(search ? { search: search as never } : {}),
        ...(hash ? { hash } : {}),
        ...opts,
      })
    },
    replace: (href, opts) => {
      const { to, search, hash } = toTanStackNavigateOptions(href)
      void navigate({
        to: to as never,
        replace: true,
        ...(search ? { search: search as never } : {}),
        ...(hash ? { hash } : {}),
        ...opts,
      })
    },
    back: () => router.history.back(),
    forward: () => router.history.forward(),
    refresh: () => void router.invalidate(),
    prefetch: (href?: string) => {
      if (!href) return
      const { to, search } = toTanStackNavigateOptions(href)
      void router.preloadRoute({
        to: to as never,
        ...(search ? { search: search as never } : {}),
      })
    },
  }
}

type RedirectTarget = string | { href: string }
export function redirect(url: RedirectTarget): never
export function redirect(url: RedirectTarget, type?: 'replace' | 'push'): never
export function redirect(
  url: RedirectTarget,
  _type?: 'replace' | 'push',
): never {
  const href = typeof url === 'string' ? url : url.href
  const { to, search, hash } = toTanStackNavigateOptions(href)
  throw tsRedirect({
    to: to as never,
    ...(search ? { search: search as never } : {}),
    ...(hash ? { hash } : {}),
  })
}

export function permanentRedirect(url: string): never
export function permanentRedirect(url: string, type?: 'replace' | 'push'): never
export function permanentRedirect(
  url: string,
  _type?: 'replace' | 'push',
): never {
  const { to, search, hash } = toTanStackNavigateOptions(url)
  throw tsRedirect({
    to: to as never,
    statusCode: 308,
    ...(search ? { search: search as never } : {}),
    ...(hash ? { hash } : {}),
  })
}

export function notFound(): never {
  // TanStack Router renders the nearest `notFoundComponent` for notFound
  // results thrown during navigation; a 404 Response reaches the same end.
  throw new Response(null, { status: 404, statusText: 'Not Found' })
}

export function useParams(): Record<string, string | string[] | undefined> {
  return useTanStackParams({ strict: false })
}

export { useLocation }
