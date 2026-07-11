'use client';
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Download, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/lib/utils';
import type { PptLoadingPhase, PptThumbnailMount } from './use-ppt-viewer';

const LOADING_COPY: Record<PptLoadingPhase, { title: string; detail: string }> = {
    fetching: {
        title: 'Loading presentation',
        detail: 'Fetching the deck file…',
    },
    rendering: {
        title: 'Preparing slides',
        detail: 'Rendering with full fidelity…',
    },
};

export function PptViewerLoading({
    className,
    overlay,
    phase = 'fetching',
}: {
    className?: string;
    overlay?: boolean;
    phase?: PptLoadingPhase;
}) {
    const copy = LOADING_COPY[phase];

    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className={cn(
                overlay
                    ? 'absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-white/90 backdrop-blur-sm'
                    : 'flex min-h-[min(40dvh,320px)] max-h-[min(58dvh,520px)] w-full flex-1 flex-col items-center justify-center gap-5 rounded-xl border border-border/60 bg-muted/30',
                className,
            )}
        >
            <div className="flex w-[min(70%,280px)] flex-col gap-2" aria-hidden>
                <Skeleton className="h-3 w-1/3 rounded-full" />
                <Skeleton className="h-2.5 w-full rounded-full" />
                <Skeleton className="h-2.5 w-5/6 rounded-full" />
                <Skeleton className="mt-2 h-16 w-full rounded-lg" />
            </div>
            <div className="flex flex-col items-center gap-3 text-foreground/70">
                <Loader2 className="size-8 animate-spin" aria-hidden />
                <div className="text-center">
                    <p className="text-sm font-medium text-foreground/90">{copy.title}</p>
                    <p className="mt-1 text-xs text-foreground/50">{copy.detail}</p>
                </div>
            </div>
            <span className="sr-only">{copy.title}. {copy.detail}</span>
        </div>
    );
}

/** Placeholder chrome shown under the slide while the deck is loading. */
export function PptViewerLoadingChrome({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-2', className)} aria-hidden>
            <div className="flex max-w-full items-center gap-2 overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-1.5 sm:gap-3 sm:p-2 sm:px-3">
                <Skeleton className="size-9 shrink-0 rounded-full sm:size-10" />
                <Skeleton className="mx-auto h-4 w-16 rounded-full" />
                <Skeleton className="size-9 shrink-0 rounded-full sm:size-10" />
                <Skeleton className="size-9 shrink-0 rounded-full sm:size-10" />
            </div>
            <div className="flex max-w-full gap-2 overflow-hidden px-1">
                {['thumb-a', 'thumb-b', 'thumb-c', 'thumb-d'].map((key) => (
                    <Skeleton key={key} className="h-12 w-20 shrink-0 rounded-lg sm:h-14 sm:w-24" />
                ))}
            </div>
        </div>
    );
}

export function PptViewerError({
    className,
    error,
    url,
    onRetry,
}: {
    className?: string;
    error: string;
    url: string;
    onRetry: () => void;
}) {
    return (
        <div
            className={cn(
                'flex min-h-[min(40dvh,400px)] flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-10',
                className,
            )}
        >
            <AlertCircle className="size-10 text-destructive" aria-hidden />
            <div className="max-w-md text-center">
                <p className="font-medium text-foreground">Unable to load presentation</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" size="sm" onClick={onRetry}>
                    <RotateCcw className="mr-2 size-4" />
                    Try again
                </Button>
                <Button variant="secondary" size="sm" asChild>
                    <a href={url} target="_blank" rel="noreferrer">
                        <Download className="mr-2 size-4" />
                        Download file
                    </a>
                </Button>
            </div>
        </div>
    );
}

export function PptViewerFilmstrip({
    slideCount,
    currentSlide,
    onGoToSlide,
    viewerReady,
    renderThumbnail,
}: {
    slideCount: number;
    currentSlide: number;
    onGoToSlide: (index: number) => void;
    viewerReady: boolean;
    renderThumbnail: (index: number, container: HTMLElement) => PptThumbnailMount | null;
}) {
    if (slideCount <= 1) {
        return null;
    }
    return (
        // w-0 min-w-full: scroll without expanding ScrollArea/table ancestors
        <div className="relative mt-2 w-0 min-w-full max-w-full overflow-hidden">
            <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background to-transparent sm:w-8"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background to-transparent sm:w-8"
                aria-hidden
            />
            <div
                className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 pt-0.5 scroll-smooth"
                role="tablist"
                aria-label="Slide thumbnails"
            >
                {Array.from({ length: slideCount }, (_, index) => (
                    <SlideThumbnailButton
                        key={index}
                        index={index}
                        isActive={index === currentSlide}
                        onSelect={() => onGoToSlide(index)}
                        viewerReady={viewerReady}
                        renderThumbnail={renderThumbnail}
                    />
                ))}
            </div>
        </div>
    );
}

function SlideThumbnailButton({
    index,
    isActive,
    onSelect,
    viewerReady,
    renderThumbnail,
}: {
    index: number;
    isActive: boolean;
    onSelect: () => void;
    viewerReady: boolean;
    renderThumbnail: (index: number, container: HTMLElement) => PptThumbnailMount | null;
}) {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount || !viewerReady) {
            return;
        }
        setIsReady(false);
        setFailed(false);
        const thumbnail = renderThumbnail(index, mount);
        if (!thumbnail) {
            setFailed(true);
            return;
        }
        void thumbnail.ready
            .then(() => setIsReady(true))
            .catch(() => setFailed(true));
        return () => {
            thumbnail.dispose();
        };
    }, [index, renderThumbnail, viewerReady]);

    return (
        <button
            type="button"
            role="tab"
            onClick={onSelect}
            aria-label={
                isActive
                    ? `Currently viewing slide ${index + 1}`
                    : `Go to slide ${index + 1}`
            }
            aria-selected={isActive}
            className={cn(
                'relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-[border-color,box-shadow,opacity] sm:h-14 sm:w-24',
                isActive
                    ? 'border-primary shadow-md shadow-primary/20 ring-2 ring-primary/25'
                    : 'border-transparent opacity-80 hover:border-muted-foreground/50 hover:opacity-100',
            )}
        >
            <div
                ref={mountRef}
                className="size-full max-h-full max-w-full overflow-hidden bg-white [&>*]:!size-full [&>*]:!max-h-full [&>*]:!max-w-full [&>*]:overflow-hidden"
                aria-hidden
            />
            {!isReady && !failed ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-muted/40">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                </div>
            ) : null}
            {failed ? (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-muted/50 text-sm font-medium tabular-nums text-muted-foreground">
                    {index + 1}
                </span>
            ) : null}
        </button>
    );
}
