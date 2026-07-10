/**
 * Split a Next-style href (`/path?a=1#hash`) into TanStack Router navigate options.
 * Passing `?search` inside `to` breaks route matching and can crash the dashboard error boundary.
 */
export type TanStackHrefNavigateOptions = {
  to: string
  search?: Record<string, string>
  hash?: string
}

export function toTanStackNavigateOptions(href: string): TanStackHrefNavigateOptions {
  const [withoutHash, hashFragment] = href.split('#', 2)
  const [pathname, queryString] = (withoutHash ?? href).split('?', 2)
  const searchEntries = queryString
    ? Object.fromEntries(new URLSearchParams(queryString).entries())
    : undefined
  const search =
    searchEntries && Object.keys(searchEntries).length > 0 ? searchEntries : undefined

  return {
    to: pathname && pathname.length > 0 ? pathname : '/',
    ...(search ? { search } : {}),
    ...(hashFragment ? { hash: hashFragment } : {}),
  }
}
