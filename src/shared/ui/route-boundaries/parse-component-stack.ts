import { useMemo } from 'react'
import type { ErrorComponentProps } from '@tanstack/react-router'

/**
 * Module-level console.error interceptor.
 *
 * React 18+ patches console.error to append the current component stack
 * (from the fiber tree) to errors caught by error boundaries. For "Too many
 * re-renders" errors, info.componentStack is empty but this console message
 * has the component name because React's error logger has direct fiber access.
 *
 * The interceptor stores the most recent React component name so the parsing
 * layer can consume it as an additional fallback source.
 */
let _capturedComponentName: string | undefined
let _interceptorInstalled = false

export function installConsoleInterceptor(): void {
  if (_interceptorInstalled) return
  _interceptorInstalled = true

  const original = console.error
  console.error = (...args: unknown[]) => {
    const message = args.join(' ')
    const m = message.match(
      /The above error occurred in the <([^>]+)> component:/,
    )
    if (m) _capturedComponentName = m[1]
    original.apply(console, args as [unknown, ...unknown[]])
  }
}

export function consumeReactComponentName(): string | undefined {
  const name = _capturedComponentName
  _capturedComponentName = undefined
  return name
}

export type ParsedComponent = {
  name: string
  filePath?: string
  line?: number
  column?: number
  /** How confident we are in this component being the actual culprit.
   *  1 = user source path found (best), 6 = absolute last resort. */
  _matchLevel?: number
}

export type ErrorKind = 'too-many-renders' | 'render-error' | 'other'

export type ParsedErrorInfo = {
  culprit: ParsedComponent | null
  all: ParsedComponent[]
  kind: ErrorKind
  suggestion?: string
  culpritLocation?: string
  /** True when we had to fall back to JS error stack. */
  fromJsStack?: boolean
}

const INTERNAL_PATTERNS = [
  /^ErrorBoundary$/,
  /^Suspense$/,
  /^Provider$/,
  /^Consumer$/,
  /^Context\./,
  /^Router/,
  /^Route/,
  /^ShellRoute/,
  /^PageMotion/,
  /^Motion/,
  /^AnimatePresence$/,
  /^Lazy/,
]

type StackFrame = {
  name: string
  filePath?: string
  line?: number
  column?: number
  _matchLevel?: number
}

function parseReactComponentStack(componentStack?: string): StackFrame[] {
  if (!componentStack) return []

  const componentRe = /^\s+at\s+(?:\w+\s+)?(\w[\w$.]*)\s*(?:\((.+?)\))?$/
  const frameRe = /^(.+?)(?::(\d+))(?::(\d+))?$/

  const lines = componentStack.trim().split('\n')
  const frames: StackFrame[] = []

  for (const line of lines) {
    const m = line.match(componentRe)
    if (!m || !m[1]) continue
    const name = m[1]
    const location = m[2]
    if (!location) {
      frames.push({ name })
      continue
    }
    const f = location.match(frameRe)
    if (f) {
      frames.push({
        name,
        filePath: f[1],
        line: Number(f[2]),
        column: f[3] ? Number(f[3]) : undefined,
      })
    } else {
      frames.push({ name, filePath: location })
    }
  }

  return frames
}

function parseJsErrorStack(jsStack?: string): StackFrame[] {
  if (!jsStack) return []

  // JS stack trace format:
  //   at FunctionName (file://path:line:col)
  //   at file://path:line:col
  //   at new ClassName (file://path:line:col)
  const jsRe = /^\s+at\s+(?:(.+?)\s+\()?(?:(.+?)(?::(\d+))(?::(\d+))?)\)?\s*$/
  const lines = jsStack.trim().split('\n')
  const frames: StackFrame[] = []

  for (const line of lines) {
    const m = line.match(jsRe)
    if (!m) continue
    const rawName = m[1] ?? '(anonymous)'
    const filePath = m[2]
    const lineNum = m[3] ? Number(m[3]) : undefined
    const colNum = m[4] ? Number(m[4]) : undefined

    const name = rawName

    if (filePath) {
      frames.push({ name, filePath, line: lineNum, column: colNum })
    } else {
      frames.push({ name })
    }
  }

  return frames
}

function pickCulprit(
  frames: StackFrame[],
  opts?: { strict?: boolean },
): StackFrame | null {
  if (frames.length === 0) return null
  const { strict = false } = opts ?? {}

  const hasUserPath = (c: StackFrame) =>
    c.filePath &&
    !c.filePath.includes('/node_modules/') &&
    /\/src\//.test(c.filePath)

  const isNamed = (c: StackFrame) =>
    !!c.name && c.name !== '(anonymous)'

  // Level 1: Non-internal frame with a user source path (best match)
  const withUserSource = frames.find((c) => {
    if (!isNamed(c)) return false
    if (!hasUserPath(c)) return false
    if (INTERNAL_PATTERNS.some((p) => p.test(c.name!))) return false
    return true
  })
  if (withUserSource) return { ...withUserSource, _matchLevel: 1 }

  // Level 2: Frame with a user source path even when name matches internal pattern
  // Catches cases like "Suspense" wrapping user code — the file path is still useful
  const withSourcePath = frames.find((c) => hasUserPath(c))
  if (withSourcePath) return { ...withSourcePath, _matchLevel: 2 }

  // Strict mode: only accept frames with user source paths.
  // Used for JS error stack fallback where remaining frames are React internals
  // (renderWithHooks, beginWork, etc.) — guessing from those is misleading.
  if (strict) return null

  // Non-strict follows for React component stack frames, where names are
  // meaningful React component names even without file paths.

  // Level 3: Named, non-internal frame (no file path needed)
  const firstNonInternal = frames.find((c) => {
    if (!isNamed(c)) return false
    if (INTERNAL_PATTERNS.some((p) => p.test(c.name!))) return false
    return true
  })
  if (firstNonInternal) return { ...firstNonInternal, _matchLevel: 3 }

  // Level 4: Any frame with a file path
  const withAnyPath = frames.find((c) => !!c.filePath)
  if (withAnyPath) return { ...withAnyPath, _matchLevel: 4 }

  // Level 5: Any named frame
  const firstNamed = frames.find((c) => isNamed(c))
  if (firstNamed) return { ...firstNamed, _matchLevel: 5 }

  // Level 6: Absolute last resort
  return frames[0] ? { ...frames[0], _matchLevel: 6 } : null
}

function classifyError(error: Error): {
  kind: ErrorKind
  suggestion?: string
} {
  const msg = error.message ?? ''
  if (
    msg.includes('Too many re-renders') ||
    msg.includes('Rendered more hooks than during the previous render')
  ) {
    return {
      kind: 'too-many-renders',
      suggestion:
        'This usually happens when setState is called during render (not inside an event handler or effect), or when context value changes on every render causing cascading updates.',
    }
  }
  if (
    msg.includes('Minified React error') ||
    msg.includes('React encountered an unexpected error')
  ) {
    return {
      kind: 'render-error',
      suggestion:
        'A component threw an error during rendering. Look at the component stack below to locate the culprit.',
    }
  }
  return { kind: 'other' }
}

/**
 * Parses both the React component stack (from error boundary info) and the
 * JS error stack (from error.stack). Uses the React component stack as the
 * primary source; falls back to the JS error stack when component stack is
 * unavailable (common for "Too many re-renders" errors).
 */
export function useParsedErrorInfo(
  error: Error,
  info: ErrorComponentProps['info'],
): ParsedErrorInfo {
  const reactStack = info?.componentStack

  return useMemo(() => {
    const reactFrames = parseReactComponentStack(reactStack)
    let culprit = pickCulprit(reactFrames)
    let jsFrames: StackFrame[] = []
    let fromJsStack = false

    if (!culprit) {
      jsFrames = parseJsErrorStack(error.stack)
      // Strict mode: only accept frames with user source paths.
      // JS stack often contains React internals (renderWithHooks, beginWork)
      // which would be misleading if reported as the culprit.
      culprit = pickCulprit(jsFrames, { strict: true })
      fromJsStack = true
    }

    // Level 7: React's console-captured component name (fiber-aware).
    // React logs "The above error occurred in the <X> component:" for errors
    // caught by error boundaries, using its internal fiber tree. This is the
    // only source that reliably has the component name for "Too many re-renders"
    // errors, since info.componentStack is empty and JS stack is all internals.
    if (!culprit) {
      const consoleName = consumeReactComponentName()
      if (consoleName && !INTERNAL_PATTERNS.some((p) => p.test(consoleName))) {
        culprit = { name: consoleName, _matchLevel: 7 }
        fromJsStack = true
      }
    }

    const all = reactFrames.length > 0 ? reactFrames : jsFrames
    const { kind, suggestion } = classifyError(error)
    const culpritLocation = culprit?.filePath
      ? `${culprit.filePath}${culprit.line ? `:${culprit.line}` : ''}`
      : undefined

    return { culprit, all, kind, suggestion, culpritLocation, fromJsStack }
  }, [error, reactStack])
}

export function parseErrorInfo(
  error: Error,
  componentStack?: string,
): ParsedErrorInfo {
  const reactFrames = parseReactComponentStack(componentStack)
  let culprit = pickCulprit(reactFrames)
  let jsFrames: StackFrame[] = []
  let fromJsStack = false

  if (!culprit) {
    jsFrames = parseJsErrorStack(error.stack)
    culprit = pickCulprit(jsFrames, { strict: true })
    fromJsStack = true
  }

  if (!culprit) {
    const consoleName = consumeReactComponentName()
    if (consoleName && !INTERNAL_PATTERNS.some((p) => p.test(consoleName))) {
      culprit = { name: consoleName, _matchLevel: 7 }
      fromJsStack = true
    }
  }

  const all = reactFrames.length > 0 ? reactFrames : jsFrames
  const { kind, suggestion } = classifyError(error)
  const culpritLocation = culprit?.filePath
    ? `${culprit.filePath}${culprit.line ? `:${culprit.line}` : ''}`
    : undefined

  return { culprit, all, kind, suggestion, culpritLocation, fromJsStack }
}

// Install the console.error interceptor when the module is first loaded.
// This is a one-time, idempotent operation — _interceptorInstalled guards
// against double-patching on HMR.
installConsoleInterceptor()

export function buildErrorReport(
  error: Error,
  parsed: ParsedErrorInfo,
  errorDigest?: string,
): string {
  return [
    `Error: ${error.message}`,
    `Type: ${parsed.kind}`,
    parsed.culprit
      ? `Culprit: ${parsed.culprit.name}${parsed.culprit.filePath ? ` (${parsed.culprit.filePath}${parsed.culprit.line ? `:${parsed.culprit.line}` : ''})` : ''}`
      : '',
    errorDigest ? `Digest: ${errorDigest}` : '',
    '--- Component Stack ---',
    parsed.all
      .map((c) => `  at ${c.name}${c.filePath ? ` (${c.filePath}${c.line ? `:${c.line}` : ''})` : ''}`)
      .join('\n'),
    '--- JS Stack ---',
    error.stack ?? '',
  ]
    .filter(Boolean)
    .join('\n\n')
}
