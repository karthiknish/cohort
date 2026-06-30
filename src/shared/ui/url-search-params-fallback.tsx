import { LoaderCircle } from 'lucide-react'

export function UrlSearchParamsFallback() {
  return (
    <div className="flex min-h-8 items-center justify-center" aria-live="polite">
      <LoaderCircle className="size-4 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">Loading page state…</span>
    </div>
  )
}
