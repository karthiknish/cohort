/**
 * `dynamic()` — lazy component loader replacing `next/dynamic`.
 *
 * Mirrors the Next.js API shape used in this codebase:
 * `dynamic(loader, { ssr?, loading? })`. Built on React `lazy` + `Suspense`.
 *
 * Loaders resolve to one of:
 *   - a component directly:   `.then((m) => m.CommandMenu)`
 *   - a `{ default }` object:  `.then((m) => ({ default: m.AgentMode }))`
 * Both are handled.
 *
 * `ssr: false` renders the fallback on the server and hydrates the real
 * component on the client (matches Next.js client-only dynamic behavior).
 *
 * Like `next/dynamic`, this is intentionally loose about props typing: the
 * returned component accepts the props of the loaded component.
 */
import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react'

type DynamicOptions = {
  ssr?: boolean
  loading?: () => ReactNode
}

// A loaded component is intentionally props-agnostic so call sites keep their
// specific component prop types (mirrors next/dynamic's looseness).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoadedComponent = ComponentType<any>
type LoadResult =
  | LoadedComponent
  | { default: LoadedComponent }
  | Record<string, LoadedComponent>
type Loader = () => Promise<LoadResult>

function toDefaultComponent(mod: LoadResult): LoadedComponent {
  if (typeof mod === 'function') {
    return mod as LoadedComponent
  }
  if (mod && typeof mod === 'object') {
    if ('default' in mod && mod.default) {
      return mod.default as LoadedComponent
    }
    const first = Object.values(mod)[0]
    if (first) return first
  }
  throw new Error('[dynamic] loader did not return a component')
}

/**
 * Wrap a `lazy` component so that when `ssr: false` it renders the fallback
 * on the server and only mounts the real component after hydration.
 */
function withSsrGuard(
  Lazy: LazyExoticComponent<LoadedComponent>,
  loading: (() => ReactNode) | undefined,
): LoadedComponent {
  const Fallback = loading ?? (() => null)
  return function DynamicSsrFalse(props) {
    if (typeof window === 'undefined') {
      return <>{Fallback()}</>
    }
    return (
      <Suspense fallback={<>{Fallback()}</>}>
        <Lazy {...props} />
      </Suspense>
    )
  }
}

export function dynamic<P = Record<string, unknown>>(
  loader: Loader,
  options: DynamicOptions = {},
): ComponentType<P> {
  const { ssr = true, loading } = options
  const Lazy = lazy(async () => ({ default: toDefaultComponent(await loader()) }))

  if (!ssr) {
    return withSsrGuard(Lazy, loading) as ComponentType<P>
  }

  const Fallback = loading ?? (() => null)
  return (function Dynamic(props: P) {
    return (
      <Suspense fallback={<>{Fallback()}</>}>
        <Lazy {...(props as Record<string, unknown>)} />
      </Suspense>
    )
  }) as unknown as ComponentType<P>
}

export default dynamic
