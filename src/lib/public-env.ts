/// <reference types="vite/client" />

/**
 * Read public env vars from Vite (`import.meta.env`) with `process.env` fallback.
 * Vite inlines `NEXT_PUBLIC_*` at build time when `envPrefix` / `define` are set.
 */
export function getPublicEnv(name: string): string | undefined {
  try {
    const fromMeta = import.meta.env[name]
    if (typeof fromMeta === 'string' && fromMeta.length > 0) return fromMeta
  } catch {
    // import.meta.env unavailable outside Vite bundles
  }

  const fromProcess =
    typeof process !== 'undefined'
      ? (process.env as Record<string, string | undefined>)[name]
      : undefined
  if (typeof fromProcess === 'string' && fromProcess.length > 0) return fromProcess

  return undefined
}
