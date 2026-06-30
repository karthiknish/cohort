'use client';
import { dynamic } from '@/shared/ui/dynamic';
import { Link } from '@/shared/ui/link';
import { useMemo } from 'react';
import { ArrowLeft, Download, ExternalLink, FileText, Loader2, Presentation, } from 'lucide-react';
import { documentKindLabel, getDocumentKind, getFileNameFromUrl, type DocumentKind, } from '@/lib/document-viewer';
import { PdfViewer } from '@/shared/components/pdf-viewer';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
const PptViewer = dynamic(() => import('@/shared/components/ppt-viewer').then((m) => ({ default: m.PptViewer })), {
    loading: () => <ViewerLoadingState label="Loading slides…"/>,
    ssr: false,
});
export type DeckDocumentViewerProps = {
    src: string;
    /** Optional callback to fetch a fresh signed URL when the current one expires (503). */
    refreshUrl?: () => Promise<string | null>;
    fileName?: string | null;
    backHref?: string;
    backLabel?: string;
    subtitle?: string | null;
    /** When true, omits page header (use inside proposal deck page). */
    embedded?: boolean;
    className?: string;
};
function ViewerLoadingState({ label }: {
    label: string;
}) {
    return (<div className="flex min-h-[min(60dvh,560px)] flex-1 items-center justify-center rounded-xl border border-border/60 bg-black/80">
      <div className="flex flex-col items-center gap-3 text-viewer-chrome/70">
        <Loader2 className="size-8 animate-spin" aria-hidden/>
        <p className="text-sm">{label}</p>
      </div>
    </div>);
}
function FormatIcon({ kind }: {
    kind: DocumentKind;
}) {
    if (kind === 'pdf') {
        return <FileText className="size-4 shrink-0 text-primary" aria-hidden/>;
    }
    if (kind === 'pptx') {
        return <Presentation className="size-4 shrink-0 text-primary" aria-hidden/>;
    }
    return <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden/>;
}
export function DeckDocumentViewer({ src, refreshUrl, fileName: fileNameProp, backHref = '/dashboard/proposals', backLabel = 'Back to proposals', subtitle, embedded = false, className, }: DeckDocumentViewerProps) {
    const fileName = fileNameProp ?? getFileNameFromUrl(src);
    const kind = getDocumentKind(fileName);
    const displayTitle = (() => {
        const base = fileName.replace(/\.(pdf|pptx?)$/i, '').replace(/[-_]/g, ' ');
        return base.length > 0 ? base : 'Presentation';
    })();
    const toolbar = (<div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
      <Button variant="outline" size="sm" asChild>
        <a href={src} target="_blank" rel="noreferrer">
          <ExternalLink className="mr-2 size-4"/>
          Open file
        </a>
      </Button>
      <Button size="sm" asChild>
        <a href={src} download={fileName} target="_blank" rel="noreferrer">
          <Download className="mr-2 size-4"/>
          Download
        </a>
      </Button>
    </div>);
    return (<div className={cn('flex min-h-0 min-w-0 flex-col gap-4 overflow-x-hidden', embedded ? 'min-h-0' : 'min-h-[calc(100dvh-10rem)]', className)}>
      {embedded ? (<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <FormatIcon kind={kind}/>
            <span className="truncate text-sm font-semibold text-foreground">{displayTitle}</span>
            <Badge variant="secondary" className="shrink-0 font-mono text-[10px] uppercase tracking-wider">
              {documentKindLabel(kind)}
            </Badge>
          </div>
          {toolbar}
        </div>) : (<header className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Button variant="ghost" size="sm" className="mt-0.5 shrink-0" asChild>
              <Link href={backHref}>
                <ArrowLeft className="mr-2 size-4"/>
                {backLabel}
              </Link>
            </Button>
            <div className="min-w-0 border-l border-border/60 pl-3">
              <div className="flex flex-wrap items-center gap-2">
                <FormatIcon kind={kind}/>
                <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
                  {displayTitle}
                </h1>
                <Badge variant="secondary" className="shrink-0 font-mono text-[10px] uppercase tracking-wider">
                  {documentKindLabel(kind)}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{fileName}</p>
              {subtitle ? (<p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>) : null}
            </div>
          </div>
          {toolbar}
        </header>)}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
        {kind === 'pdf' ? (<PdfViewer url={src} title={displayTitle} className="flex-1"/>) : kind === 'pptx' ? (<PptViewer url={src} refreshUrl={refreshUrl} title={displayTitle} className="flex-1"/>) : (<div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              This file type cannot be previewed in the browser.
            </p>
            <Button asChild>
              <a href={src} target="_blank" rel="noreferrer">
                <Download className="mr-2 size-4"/>
                Download file
              </a>
            </Button>
          </div>)}
      </div>
    </div>);
}
