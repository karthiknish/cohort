'use client';
import Image from '@/shared/ui/image';
import { useCallback } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Download, Loader2, Maximize2, Minimize2, RotateCcw, } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
import type { Slide } from './ppt-viewer-types';
export function PptViewerLoading({ className }: {
    className?: string;
}) {
    return (<div className={cn('flex min-h-[min(60dvh,560px)] flex-1 items-center justify-center rounded-xl border border-border/60 bg-foreground', className)}>
      <div className="flex flex-col items-center gap-4 text-viewer-chrome/70">
        <Loader2 className="size-9 animate-spin" aria-hidden/>
        <div className="text-center">
          <p className="text-sm font-medium text-viewer-chrome/90">Extracting slides</p>
          <p className="mt-1 text-xs text-viewer-chrome/50">This may take a few seconds for large decks</p>
        </div>
      </div>
    </div>);
}
export function PptViewerError({ className, error, url, onRetry, }: {
    className?: string;
    error: string;
    url: string;
    onRetry: () => void;
}) {
    return (<div className={cn('flex min-h-[min(40dvh,400px)] flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-10', className)}>
      <AlertCircle className="size-10 text-destructive" aria-hidden/>
      <div className="max-w-md text-center">
        <p className="font-medium text-foreground">Unable to load presentation</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw className="mr-2 size-4"/>
          Try again
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <Download className="mr-2 size-4"/>
            Download file
          </a>
        </Button>
      </div>
    </div>);
}
export function PptViewerThumbnailButton({ slide, index, currentSlide, onGoToSlide, 'aria-label': ariaLabel, }: {
    slide: Slide;
    index: number;
    currentSlide: number;
    onGoToSlide: (index: number) => void;
    'aria-label': string;
}) {
    const onSelectSlideThumbnail = () => {
        onGoToSlide(index);
    };
    return (<button type="button" role="tab" onClick={onSelectSlideThumbnail} aria-label={ariaLabel} aria-selected={index === currentSlide} className={cn('flex-shrink-0 overflow-hidden rounded-lg border-2 motion-chromatic transition-[border-color,box-shadow,opacity]', index === currentSlide
            ? 'border-primary shadow-md shadow-primary/20 ring-2 ring-primary/25'
            : 'border-transparent opacity-70 hover:border-muted-foreground/30 hover:opacity-100')}>
      <div className="relative h-14 w-24 bg-foreground/90 sm:h-16 sm:w-28">
        {slide.imageUrl ? (<Image src={slide.imageUrl} alt="" fill unoptimized sizes="112px" className="object-cover"/>) : (<span className="flex size-full items-center justify-center text-xs font-medium tabular-nums text-viewer-chrome/60">
            {index + 1}
          </span>)}
      </div>
    </button>);
}
type PptViewerCanvasProps = {
    title: string;
    slides: Slide[];
    currentSlide: number;
    isFullscreen: boolean;
    onPrevSlide: () => void;
    onNextSlide: () => void;
    onToggleFullscreen: () => void;
};
export function PptViewerCanvas({ title, slides, currentSlide, isFullscreen, onPrevSlide, onNextSlide, onToggleFullscreen, }: PptViewerCanvasProps) {
    const currentSlideData = slides[currentSlide]!;
    const hasMultiple = slides.length > 1;
    return (<div className="relative aspect-video w-full max-h-[min(72dvh,720px)] overflow-hidden rounded-xl border border-border/60 bg-foreground shadow-inner ring-1 ring-white/5">
      {currentSlideData?.imageUrl ? (<Image src={currentSlideData.imageUrl} alt={`${title} — slide ${currentSlide + 1}`} fill unoptimized sizes={isFullscreen ? '100vw' : '(max-width: 1280px) 90vw'} className="object-contain" priority={currentSlide === 0}/>) : (<div className="flex h-full min-h-[280px] w-full items-center justify-center bg-gradient-to-b from-foreground/90 to-foreground p-8 sm:min-h-[360px]">
          <div className="max-w-lg text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-viewer-chrome/40">
              Slide {currentSlide + 1}
            </p>
            {currentSlideData?.textContent ? (<p className="mt-4 text-base leading-relaxed text-viewer-chrome/85">
                {currentSlideData.textContent}
              </p>) : (<p className="mt-4 text-sm text-viewer-chrome/50">No preview image for this slide</p>)}
          </div>
        </div>)}

      {hasMultiple ? (<>
          <Button variant="ghost" size="icon" className="absolute left-3 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 text-viewer-chrome shadow-lg backdrop-blur-sm hover:bg-black/75 disabled:opacity-25" onClick={onPrevSlide} disabled={currentSlide === 0} aria-label="Previous slide">
            <ChevronLeft className="size-6" aria-hidden/>
          </Button>
          <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 text-viewer-chrome shadow-lg backdrop-blur-sm hover:bg-black/75 disabled:opacity-25" onClick={onNextSlide} disabled={currentSlide === slides.length - 1} aria-label="Next slide">
            <ChevronRight className="size-6" aria-hidden/>
          </Button>
        </>) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-8 pt-3">
        <span className="rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-viewer-chrome/80 backdrop-blur-sm">
          {title}
        </span>
        <Button variant="ghost" size="icon" className="pointer-events-auto size-9 rounded-full border border-white/10 bg-black/50 text-viewer-chrome hover:bg-black/70" onClick={onToggleFullscreen} aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}>
          {isFullscreen ? (<Minimize2 className="size-4" aria-hidden/>) : (<Maximize2 className="size-4" aria-hidden/>)}
        </Button>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/65 px-4 py-1.5 text-sm font-medium tabular-nums text-viewer-chrome shadow-lg backdrop-blur-sm" aria-live="polite">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>);
}
export function PptViewerFilmstrip({ slides, currentSlide, onGoToSlide, }: {
    slides: Slide[];
    currentSlide: number;
    onGoToSlide: (index: number) => void;
}) {
    if (slides.length <= 1) {
        return null;
    }
    return (<div className="relative mt-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" aria-hidden/>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" aria-hidden/>
      <div className="flex gap-2 overflow-x-auto px-1 pb-1 pt-0.5 scroll-smooth" role="tablist" aria-label="Slide thumbnails">
        {slides.map((slide, index) => (<PptViewerThumbnailButton key={slide.index} index={index} currentSlide={currentSlide} onGoToSlide={onGoToSlide} slide={slide} aria-label={index === currentSlide
                ? `Currently viewing slide ${index + 1}`
                : `Go to slide ${index + 1}`}/>))}
      </div>
    </div>);
}
