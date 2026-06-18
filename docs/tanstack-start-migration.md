# TanStack Start migration — complete

The web shell has been fully migrated from Next.js 16 App Router to TanStack
Start. The Convex backend is unchanged; the app runs entirely under
`src/routes/**`. Next.js is no longer a dependency.

## Dev commands

```bash
# Dev server (Vite + TanStack Start, port 3000)
bun run dev

# Production build
bun run build

# Typecheck (single tsconfig.json — no longer a separate Start config)
bun run typecheck

# Full CI gate (biome + typecheck + convex typecheck + oxlint)
bun run ci:check
```

## Architecture

| Area | Location |
|------|----------|
| Vite + TanStack Start plugin | `vite.config.mts` (React Compiler via babel plugin) |
| Global middleware | `src/start.ts` (CSP, security headers, PostHog `/ingest/*`, legacy redirects, blocked API user-agents, Convex-backed rate limiting) |
| Router factory | `src/router.tsx` (`scrollRestoration`, `defaultPreload: 'intent'`) |
| Root layout | `src/routes/__root.tsx` (fonts, providers, GA, PWA, Convex `initialToken` via `createServerFn`) |
| Auth gate | `src/routes/_authed.tsx` (session + account-status redirects in `beforeLoad`) |
| Global styles | `src/styles/globals.css` (Tailwind v4 + design tokens) |

### Page routes (`src/routes/**`)

All routes live under `src/routes/`. Protected routes are nested under the
`_authed` pathless layout. Public routes (`/`, `/privacy`, `/terms`,
`/auth/*`, `/pending-approval`) live at the top level.

Error/loading boundaries for each route segment are co-located in
`src/routes/_components/` and wired via the route file's `errorComponent` /
`pendingComponent` options.

### API routes (`src/routes/api/**`)

All 32 API routes use `adaptApiHandler` from `@/lib/api-handler-start`, which
adapts the existing `createApiHandler` definitions to TanStack Start
`server.handlers`. Auth, rate limiting, and validation options are unchanged.

## Former `next/*` imports — native replacements

The codebase no longer imports from `next`. The Next.js APIs are replaced by
first-class modules:

| Next.js import | Native replacement | Notes |
|----------------|--------------------|-------|
| `next/link` | `@/shared/ui/link` | String-href `<Link>` backed by TanStack `useNavigate` |
| `next/navigation` | `@/shared/ui/navigation` | `useRouter`, `usePathname`, `useSearchParams`, `useParams`, `redirect`, `permanentRedirect` |
| `next/image` | `@/shared/ui/image` | Unoptimized `<img>` (optimization deferred to a future CDN pass) |
| `next/dynamic` | `@/shared/ui/dynamic` | `dynamic(loader, { ssr, loading })` on React `lazy` + `Suspense` |
| `next/script` | `@/shared/providers/google-analytics-script.tsx` | `useEffect`-injected scripts (`afterInteractive` parity) |
| `next/headers` | `@/lib/server-headers` | `headers()` / `cookies()` via TanStack Start request |
| `next/server` | `@/lib/http-server-types` | `NextRequest`, `NextResponse`, `after` (names kept) |
| `next` `Metadata` type | local `PageMetadata` in `marketing-home-metadata.ts` | Subset actually consumed (title + description for `head`) |

## Auth

`src/lib/auth-server.ts` is the single auth utility module, using
`convexBetterAuthReactStart` from `@convex-dev/better-auth/react-start`. OAuth
URL rewriting (so browsers never navigate to `*.convex.site`) is preserved.
`/api/auth/*` is proxied via `src/routes/api/auth/$.ts`.

## Concept mapping (quick reference)

| Next.js | TanStack Start |
|---------|----------------|
| `app/page.tsx` | `src/routes/...tsx` with `createFileRoute` |
| `app/layout.tsx` | Parent route + `<Outlet />` or pathless `_layout` |
| `[param]` | `$param` in filename |
| `metadata` / `generateMetadata` | `head: () => ({ meta: [...] })` |
| `middleware.ts` | `src/start.ts` + route `beforeLoad` |
| `route.ts` API | `server.handlers` on route file |
| `"use client"` | Remove — components are isomorphic; use `createServerFn` for server-only |
