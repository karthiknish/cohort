'use client';
import { useCallback, useMemo, useState } from 'react';
import { FileText, Presentation } from 'lucide-react';
import { DeckDocumentViewer } from '@/features/dashboard/proposals/viewer/components/deck-document-viewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
type DeckPageViewerSectionProps = {
    pdfUrl: string | null;
    pptxUrl: string | null;
    proposalDisplayName: string;
    /** Callback to fetch a fresh signed PPTX URL when the current one expires. */
    refreshPptxUrl?: () => Promise<string | null>;
    /** Sample slide outline shown in preview mode when no file URLs exist. */
    previewInstructions?: string | null;
};
function PreviewDeckInstructions({ instructions, proposalDisplayName, }: {
    instructions: string;
    proposalDisplayName: string;
}) {
    const slides = instructions.split(/(?=Slide \d+:)/).map((part) => part.trim()).filter(Boolean);
    return (<div className="max-w-full space-y-4 overflow-hidden rounded-xl border border-dashed border-warning/30 bg-warning/5 p-4 sm:p-5">
      <p className="text-sm font-medium text-foreground">Preview deck — sample slides</p>
      <p className="text-xs text-muted-foreground">
        Showing representative slide content for {proposalDisplayName}. Download actions use live proposal files when you exit preview mode.
      </p>
      <ol className="max-h-[min(60dvh,560px)] space-y-3 overflow-y-auto overscroll-y-contain pr-1">
        {slides.map((slide) => (<li key={slide.slice(0, 40)} className="break-words rounded-lg border border-border/60 bg-background p-4 text-sm leading-relaxed text-muted-foreground">
            {slide}
          </li>))}
      </ol>
    </div>);
}
export function DeckPageViewerSection({ pdfUrl, pptxUrl, proposalDisplayName, refreshPptxUrl, previewInstructions = null, }: DeckPageViewerSectionProps) {
    const defaultTab = pdfUrl ? 'pdf' : 'pptx';
    const [tab, setTab] = useState<'pdf' | 'pptx'>(defaultTab);
    const activeSrc = (() => {
        if (tab === 'pdf' && pdfUrl)
            return pdfUrl;
        if (tab === 'pptx' && pptxUrl)
            return pptxUrl;
        return pdfUrl ?? pptxUrl;
    })();
    const handleTabChange = (value: string) => {
        setTab(value as 'pdf' | 'pptx');
    };
    if (!pdfUrl && !pptxUrl) {
        if (previewInstructions?.trim()) {
            return <PreviewDeckInstructions instructions={previewInstructions} proposalDisplayName={proposalDisplayName}/>;
        }
        return (<div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-12 text-center text-sm text-muted-foreground">
        No presentation file is available for this proposal yet.
      </div>);
    }
    const showTabs = Boolean(pdfUrl && pptxUrl);
    if (!showTabs && activeSrc) {
        return (<DeckDocumentViewer src={activeSrc} refreshUrl={tab === 'pptx' ? refreshPptxUrl : undefined} embedded subtitle={proposalDisplayName}/>);
    }
    return (<div className="min-w-0 max-w-full space-y-4 overflow-hidden">
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="inline-flex h-auto w-full max-w-md gap-1 rounded-xl bg-muted/40 p-1">
          <TabsTrigger value="pdf" disabled={!pdfUrl} className="flex-1 gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm">
            <FileText className="size-3.5 shrink-0" aria-hidden/>
            PDF
          </TabsTrigger>
          <TabsTrigger value="pptx" disabled={!pptxUrl} className="flex-1 gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm">
            <Presentation className="size-3.5 shrink-0" aria-hidden/>
            PowerPoint
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pdf" className="mt-4 focus-visible:outline-none">
          {pdfUrl ? (<DeckDocumentViewer src={pdfUrl} embedded subtitle={`${proposalDisplayName} · PDF`}/>) : null}
        </TabsContent>
        <TabsContent value="pptx" className="mt-4 focus-visible:outline-none">
          {pptxUrl ? (<DeckDocumentViewer src={pptxUrl} refreshUrl={refreshPptxUrl} embedded subtitle={`${proposalDisplayName} · Slides`}/>) : null}
        </TabsContent>
      </Tabs>
    </div>);
}
