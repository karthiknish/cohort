'use client';
import { useCallback, useMemo, useState } from 'react';
import { FileText, Presentation } from 'lucide-react';
import { DeckDocumentViewer } from '@/features/dashboard/proposals/viewer/components/deck-document-viewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
type DeckPageViewerSectionProps = {
    pdfUrl: string | null;
    pptxUrl: string | null;
    proposalDisplayName: string;
};
export function DeckPageViewerSection({ pdfUrl, pptxUrl, proposalDisplayName, }: DeckPageViewerSectionProps) {
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
        return (<div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-12 text-center text-sm text-muted-foreground">
        No presentation file is available for this proposal yet.
      </div>);
    }
    const showTabs = Boolean(pdfUrl && pptxUrl);
    if (!showTabs && activeSrc) {
        return (<DeckDocumentViewer src={activeSrc} embedded subtitle={proposalDisplayName}/>);
    }
    return (<div className="space-y-4">
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
          {pptxUrl ? (<DeckDocumentViewer src={pptxUrl} embedded subtitle={`${proposalDisplayName} · Slides`}/>) : null}
        </TabsContent>
      </Tabs>
    </div>);
}
