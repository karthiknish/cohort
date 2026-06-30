'use client';
import { AlertCircle, Download, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

export function PptViewerLoading({ className, overlay }: { className?: string; overlay?: boolean }) {
    return (
        <div
            className={cn(
                overlay
                    ? 'absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm'
                    : 'flex min-h-[min(60dvh,560px)] flex-1 items-center justify-center rounded-xl border border-border/60 bg-foreground',
                className,
            )}
        >
            <div className={cn('flex flex-col items-center gap-4', overlay ? 'text-foreground/70' : 'text-viewer-chrome/70')}>
                <Loader2 className="size-9 animate-spin" aria-hidden />
                <div className="text-center">
                    <p className={cn('text-sm font-medium', overlay ? 'text-foreground/90' : 'text-viewer-chrome/90')}>
                        Loading presentation
                    </p>
                    <p className={cn('mt-1 text-xs', overlay ? 'text-foreground/50' : 'text-viewer-chrome/50')}>
                        Rendering slides with full fidelity…
                    </p>
                </div>
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
}: {
    slideCount: number;
    currentSlide: number;
    onGoToSlide: (index: number) => void;
}) {
    if (slideCount <= 1) {
        return null;
    }
    return (
        <div className="relative mt-4">
            <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent"
                aria-hidden
            />
            <div
                className="flex gap-2 overflow-x-auto px-1 pb-1 pt-0.5 scroll-smooth"
                role="tablist"
                aria-label="Slide thumbnails"
            >
                {Array.from({ length: slideCount }, (_, index) => (
                    <button
                        key={index}
                        type="button"
                        role="tab"
                        onClick={() => onGoToSlide(index)}
                        aria-label={
                            index === currentSlide
                                ? `Currently viewing slide ${index + 1}`
                                : `Go to slide ${index + 1}`
                        }
                        aria-selected={index === currentSlide}
                        className={cn(
                            'flex h-14 w-24 flex-shrink-0 items-center justify-center rounded-lg border-2 text-sm font-medium tabular-nums transition-[border-color,box-shadow,opacity] sm:h-16 sm:w-28',
                            index === currentSlide
                                ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/20 ring-2 ring-primary/25'
                                : 'border-transparent bg-muted/50 text-muted-foreground opacity-70 hover:border-muted-foreground/30 hover:opacity-100',
                        )}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}
