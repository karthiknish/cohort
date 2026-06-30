'use client';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PptViewerError, PptViewerFilmstrip, PptViewerLoading } from './ppt-viewer-sections';
import type { PptViewerProps } from './ppt-viewer-types';
import { usePptViewer } from './use-ppt-viewer';

export function PptViewer({ url, refreshUrl, className, title = 'Presentation' }: PptViewerProps) {
    const {
        containerRef,
        slideCount,
        currentSlide,
        isLoading,
        error,
        isFullscreen,
        goToSlide,
        handlePrevSlide,
        handleNextSlide,
        handleToggleFullscreen,
        handleRetry,
    } = usePptViewer({ url, refreshUrl });

    if (error) {
        return <PptViewerError className={className} error={error} url={url} onRetry={handleRetry} />;
    }

    const hasMultiple = slideCount > 1;

    const viewerBody = (
        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden', className)}>
            <div className="relative w-full max-w-full overflow-hidden rounded-xl border border-border/60 bg-white shadow-inner ring-1 ring-white/5">
                {/* PptxViewer renders slides as HTML/SVG into this container.
                    Must always be in the DOM so the viewer can attach to it.
                    The library manages its own aspect ratio via fitMode: 'contain'. */}
                <div ref={containerRef} className="w-full max-w-full min-h-[min(60dvh,480px)] overflow-x-hidden" />

                {/* Loading overlay on top of the container */}
                {isLoading ? <PptViewerLoading overlay /> : null}

                {hasMultiple && !isLoading ? (
                    <>
                        <button
                            type="button"
                            className="absolute left-3 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 text-white shadow-lg backdrop-blur-sm hover:bg-black/75 disabled:opacity-25"
                            onClick={handlePrevSlide}
                            disabled={currentSlide === 0}
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="size-6" aria-hidden />
                        </button>
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 text-white shadow-lg backdrop-blur-sm hover:bg-black/75 disabled:opacity-25"
                            onClick={handleNextSlide}
                            disabled={currentSlide === slideCount - 1}
                            aria-label="Next slide"
                        >
                            <ChevronRight className="size-6" aria-hidden />
                        </button>
                    </>
                ) : null}

                {!isLoading ? (
                    <>
                        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-8 pt-3">
                            <span className="rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
                                {title}
                            </span>
                            <button
                                type="button"
                                className="pointer-events-auto size-9 rounded-full border border-white/10 bg-black/50 text-white hover:bg-black/70"
                                onClick={handleToggleFullscreen}
                                aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
                            >
                                {isFullscreen ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}
                            </button>
                        </div>

                        <div
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/65 px-4 py-1.5 text-sm font-medium tabular-nums text-white shadow-lg backdrop-blur-sm"
                            aria-live="polite"
                        >
                            {currentSlide + 1} / {slideCount}
                        </div>
                    </>
                ) : null}
            </div>

            {!isLoading ? (
                <>
                    <PptViewerFilmstrip slideCount={slideCount} currentSlide={currentSlide} onGoToSlide={goToSlide} />
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        Arrow keys to navigate · Home / End for first and last slide
                    </p>
                </>
            ) : null}
        </div>
    );

    if (isFullscreen) {
        return (
            <dialog
                open
                className="fixed inset-0 z-[100] m-0 flex max-h-none w-full max-w-none flex-col border-0 bg-black/95 p-4 sm:p-8"
                aria-label={`${title} full screen`}
            >
                <div className="mx-auto flex size-full max-w-6xl flex-col justify-center">{viewerBody}</div>
            </dialog>
        );
    }

    return viewerBody;
}
