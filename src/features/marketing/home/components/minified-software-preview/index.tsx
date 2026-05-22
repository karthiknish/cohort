'use client'

import { MousePointer2 } from 'lucide-react'

import { PreviewWindow } from './preview-window'
import { useMinifiedPreview } from './use-minified-preview'

export function MinifiedSoftwarePreview() {
  const preview = useMinifiedPreview()

  return (
    <section className="relative mx-auto w-full max-w-5xl" aria-label="Interactive product preview (sample data)">
      <div
        aria-hidden="true"
        className="absolute inset-x-16 -top-8 h-32 rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-8 top-16 size-40 rounded-full bg-info/10 blur-3xl"
      />

      <div
        className="relative perspective-[1600px] motion-reduce:perspective-none"
        onMouseEnter={preview.handlePreviewMouseEnter}
        onMouseLeave={preview.handlePreviewMouseLeave}
        onMouseMove={preview.handlePreviewMouseMove}
      >
        <PreviewWindow {...preview} />
      </div>

      <p className="mt-4 flex flex-col items-center gap-2 text-center text-[11px] font-medium tracking-wide text-muted-foreground sm:flex-row sm:justify-center sm:gap-6">
        <span className="inline-flex items-center gap-1.5">
          <MousePointer2 className="size-3.5 shrink-0 text-primary/70" aria-hidden />
          Click sections or metrics to explore
        </span>
        <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden>
          ·
        </span>
        <span className="text-muted-foreground/80">
          {preview.isAutoRotationPaused
            ? 'Tour paused while you interact'
            : 'Sections auto-advance — hover to pause'}
        </span>
      </p>
    </section>
  )
}
