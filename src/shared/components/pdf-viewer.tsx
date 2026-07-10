'use client';
import { ExternalLink, FileText, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
type PdfViewerProps = {
    url: string;
    title?: string;
    className?: string;
    /** When true, uses a shorter viewport height for in-page deck cards. */
    embedded?: boolean;
};
export function PdfViewer({ url, title = 'PDF document', className, embedded = false }: PdfViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const frameMinHeight = embedded ? 'min-h-[min(42dvh,360px)]' : 'min-h-[min(60dvh,560px)]';
    const frameMaxHeight = embedded ? 'max-h-[min(55dvh,480px)]' : 'max-h-[min(72dvh,720px)]';
    const handleLoad = () => {
        setIsLoading(false);
        setLoadError(false);
    };
    const handleError = () => {
        setIsLoading(false);
        setLoadError(true);
    };
    return (<div className={cn('flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-hidden', className)}>
      <div className={cn('relative flex-1 overflow-hidden rounded-xl border border-border/60 bg-foreground shadow-inner ring-1 ring-border/40', frameMinHeight, frameMaxHeight)}>
        {isLoading && !loadError ? (<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-foreground/90">
            <Loader2 className="size-8 animate-spin text-viewer-chrome/70" aria-hidden/>
            <p className="text-sm text-viewer-chrome/60">Loading PDF…</p>
          </div>) : null}

        {loadError ? (<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <FileText className="size-10 text-viewer-chrome/50" aria-hidden/>
            <div className="space-y-1">
              <p className="font-medium text-viewer-chrome">Preview unavailable in browser</p>
              <p className="max-w-sm text-sm text-viewer-chrome/60">
                Open the file in a new tab or download it to view this PDF.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" size="sm" asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 size-4"/>
                  Open in new tab
                </a>
              </Button>
            </div>
          </div>) : null}

        <iframe src={url} title={title} sandbox="" className={cn('h-full w-full bg-foreground', frameMinHeight)} onLoad={handleLoad} onError={handleError}/>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Use your browser&apos;s PDF controls to zoom and navigate pages.
      </p>
    </div>);
}
