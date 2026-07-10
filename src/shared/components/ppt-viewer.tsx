'use client';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PptViewerError, PptViewerFilmstrip, PptViewerLoading, PptViewerLoadingChrome } from './ppt-viewer-sections';
import type { PptViewerProps } from './ppt-viewer-types';
import { usePptViewer } from './use-ppt-viewer';

export function PptViewer({ url, refreshUrl, className, title = 'Presentation', embedded = false }: PptViewerProps) {
    const {
        frameRef,
        containerRef,
        slideCount,
        currentSlide,
        isLoading,
        loadingPhase,
        error,
        isFullscreen,
        goToSlide,
        handlePrevSlide,
        handleNextSlide,
        handleToggleFullscreen,
        handleRetry,
        isViewerReady,
        renderThumbnail,
    } = usePptViewer({ url, refreshUrl, embedded });

    if (error) {
        return <PptViewerError className={className} error={error} url={url} onRetry={handleRetry} />;
    }

    const hasMultiple = slideCount > 1;
    const frameMaxHeight = embedded ? 'max-h-[min(62dvh,560px)]' : 'max-h-[min(72dvh,680px)]';
    const loadingMinHeight = embedded ? 'min-h-[min(44dvh,340px)]' : 'min-h-[min(52dvh,400px)]';

    const viewerBody = (
        <div className={cn('flex min-h-0 w-0 min-w-full max-w-full flex-1 flex-col overflow-x-clip', className)}>
            <div className="flex min-h-0 w-full min-w-0 max-w-full shrink justify-center overflow-hidden">
                <div
                    ref={frameRef}
                    className={cn(
                        // PptxViewer sets the mount node to position:relative and
                        // sizes slides to container width — keep an explicit box
                        // with overflow clipping so content cannot expand the page.
                        'relative w-full max-w-full shrink-0 overflow-hidden rounded-xl border border-border/60 bg-white shadow-inner ring-1 ring-white/5',
                        frameMaxHeight,
                        isLoading && loadingMinHeight,
                        isLoading && 'aspect-video',
                    )}
                >
                    <div
                        ref={containerRef}
                        className="size-full max-h-full max-w-full overflow-hidden [&>*]:max-h-full [&>*]:max-w-full"
                    />

                    {isLoading ? <PptViewerLoading overlay phase={loadingPhase} /> : null}

                    {!isLoading ? (
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-8 pt-3">
                            <span className="max-w-[70%] truncate rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
                                {title}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/*
              w-0 min-w-full: filmstrip thumbs must not inflate the dashboard
              ScrollArea (display:table) past the viewport — classic flex/table fix.
            */}
            <div className="mt-2 w-0 min-w-full max-w-full shrink-0 overflow-x-clip">
                {isLoading ? <PptViewerLoadingChrome /> : null}

                {hasMultiple && !isLoading ? (
                    <div
                        className="flex w-full min-w-0 max-w-full items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-1.5 sm:gap-3 sm:p-2 sm:px-3"
                        role="toolbar"
                        aria-label="Slide navigation"
                    >
                        <button
                            type="button"
                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-foreground shadow-sm hover:bg-muted disabled:opacity-30 sm:size-10"
                            onClick={handlePrevSlide}
                            disabled={currentSlide === 0}
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="size-5" aria-hidden />
                        </button>
                        <p className="min-w-0 flex-1 truncate text-center text-sm font-medium tabular-nums text-foreground" aria-live="polite">
                            {currentSlide + 1} / {slideCount}
                        </p>
                        <button
                            type="button"
                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-foreground shadow-sm hover:bg-muted disabled:opacity-30 sm:size-10"
                            onClick={handleNextSlide}
                            disabled={currentSlide === slideCount - 1}
                            aria-label="Next slide"
                        >
                            <ChevronRight className="size-5" aria-hidden />
                        </button>
                        <button
                            type="button"
                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-foreground shadow-sm hover:bg-muted sm:size-10"
                            onClick={handleToggleFullscreen}
                            aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
                        >
                            {isFullscreen ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}
                        </button>
                    </div>
                ) : !isLoading ? (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background text-foreground shadow-sm hover:bg-muted sm:size-10"
                            onClick={handleToggleFullscreen}
                            aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
                        >
                            {isFullscreen ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}
                        </button>
                    </div>
                ) : null}

                {!isLoading ? (
                    <>
                        <PptViewerFilmstrip
                            slideCount={slideCount}
                            currentSlide={currentSlide}
                            onGoToSlide={goToSlide}
                            viewerReady={isViewerReady}
                            renderThumbnail={renderThumbnail}
                        />
                        <p className="mt-1.5 truncate text-center text-xs text-muted-foreground">
                            Arrow keys to navigate · Home / End for first and last slide
                        </p>
                    </>
                ) : null}
            </div>
        </div>
    );

    if (isFullscreen) {
        return (
            <div
                className="fixed inset-0 z-[100] flex size-full flex-col bg-black/95 p-4 sm:p-8"
                aria-label={`${title} full screen`}
            >
                <div className="mx-auto flex size-full max-w-6xl flex-col justify-center overflow-hidden">{viewerBody}</div>
            </div>
        );
    }

    return viewerBody;
}
