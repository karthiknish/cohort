'use client';
import { useCallback, useMemo } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import { Check, Copy, Trash2, Plus, Sparkles, Edit3, Zap, Layout, Type, Link as LinkIcon, MousePointer2, FileText, Video, Eye, Pin, } from 'lucide-react';
import type { AlgorithmicInsight } from '@/lib/ad-algorithms';
import { cn } from '@/lib/utils';
import { formatCTALabel } from './helpers';
import { META_CTA_OPTIONS } from './creative-editing-utils';
import type { Creative } from './types';
import type { CreativePerformanceSummary } from './creative-social-preview';
import { CreativeImageViewer } from '@/features/dashboard/ads/components/creative-image-viewer';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Separator } from '@/shared/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { createCopyHandler, createIndexClickHandler, createTextChangeHandler, getWidthStyle, toStableStringItems, type CreativeEditorTabSharedProps, } from './creative-editor-tabs-utils';
export function HeadlineEditRow(props: {
    value: string;
    index: number;
    isPreviewing: boolean;
    onUpdate: (index: number, value: string) => void;
    onRemove: (index: number) => void;
    onSelectPreview: (index: number) => void;
}) {
    const { value, index, isPreviewing, onUpdate, onRemove, onSelectPreview } = props;
    const onHeadlineChange = (event: ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, event.target.value);
    };
    const handleRemove = () => {
        onRemove(index);
    };
    const handleSelectPreview = () => {
        onSelectPreview(index);
    };
    return (<div className={cn('group flex items-start gap-2 rounded-xl border p-2 transition-colors', isPreviewing ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-background hover:border-border')}>
      <span className="mt-2 w-5 shrink-0 text-center text-[10px] font-bold text-muted-foreground">{index + 1}</span>
      <div className="min-w-0 flex-1 space-y-1">
        <Input value={value} onChange={onHeadlineChange} placeholder="Headline variant…" className="h-9 border-muted bg-background text-sm focus-visible:ring-primary/20"/>
        <p className="text-[10px] text-muted-foreground">{value.trim().length} characters</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <Button type="button" variant={isPreviewing ? 'default' : 'ghost'} size="icon" className="size-8" onClick={handleSelectPreview} title="Show in preview" aria-label={`Preview headline ${index + 1}`}>
          {isPreviewing ? <Eye className="size-3.5"/> : <Pin className="size-3.5"/>}
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={handleRemove} aria-label={`Remove headline ${index + 1}`}>
          <Trash2 className="size-3.5"/>
        </Button>
      </div>
    </div>);
}
export function HeadlineDisplayRow(props: {
    value: string;
    index: number;
    copiedField: string | null;
    onCopy: (text: string, field: string) => void;
}) {
    const { value, index, copiedField, onCopy } = props;
    const handleCopy = () => {
        onCopy(value, `headline-${index}`);
    };
    return (<div className="group flex items-start justify-between gap-3 p-3 rounded-xl border bg-background hover:border-accent/20 transition-colors">
      <div className="flex gap-3">
        <span className="mt-0.5 text-[10px] font-bold text-muted-foreground/50">{index + 1}</span>
        <p className="text-sm font-medium">{value}</p>
      </div>
      <Button variant="ghost" size="icon" className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopy} aria-label={`Copy headline ${index + 1}`}>
        {copiedField === `headline-${index}` ? <Check className="size-3.5 text-success"/> : <Copy className="size-3.5"/>}
      </Button>
    </div>);
}
export function DescriptionEditRow(props: {
    value: string;
    index: number;
    isPreviewing: boolean;
    onUpdate: (index: number, value: string) => void;
    onRemove: (index: number) => void;
    onSelectPreview: (index: number) => void;
}) {
    const { value, index, isPreviewing, onUpdate, onRemove, onSelectPreview } = props;
    const onDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(index, event.target.value);
    };
    const handleRemove = () => {
        onRemove(index);
    };
    const handleSelectPreview = () => {
        onSelectPreview(index);
    };
    return (<div className={cn('group flex items-start gap-2 rounded-xl border p-2 transition-colors', isPreviewing ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-background hover:border-border')}>
      <span className="mt-2 w-5 shrink-0 text-center text-[10px] font-bold text-muted-foreground">{index + 1}</span>
      <div className="min-w-0 flex-1 space-y-1">
        <Textarea value={value} onChange={onDescriptionChange} placeholder="Primary text variant…" className="min-h-[88px] resize-y border-muted bg-background text-sm leading-relaxed focus-visible:ring-primary/20"/>
        <p className="text-[10px] text-muted-foreground">{value.trim().length} characters</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <Button type="button" variant={isPreviewing ? 'default' : 'ghost'} size="icon" className="size-8" onClick={handleSelectPreview} title="Show in preview" aria-label={`Preview primary text ${index + 1}`}>
          {isPreviewing ? <Eye className="size-3.5"/> : <Pin className="size-3.5"/>}
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={handleRemove} aria-label={`Remove primary text ${index + 1}`}>
          <Trash2 className="size-3.5"/>
        </Button>
      </div>
    </div>);
}
export function DescriptionDisplayRow(props: {
    value: string;
    index: number;
    copiedField: string | null;
    onCopy: (text: string, field: string) => void;
}) {
    const { value, index, copiedField, onCopy } = props;
    const handleCopy = () => {
        onCopy(value, `desc-${index}`);
    };
    return (<div className="group flex items-start justify-between gap-3 p-4 rounded-xl border bg-background hover:border-accent/20 transition-colors">
      <div className="flex gap-3">
        <span className="mt-0.5 text-[10px] font-bold text-muted-foreground/50">{index + 1}</span>
        <p className="text-sm leading-relaxed">{value}</p>
      </div>
      <Button variant="ghost" size="icon" className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopy} aria-label={`Copy primary text ${index + 1}`}>
        {copiedField === `desc-${index}` ? <Check className="size-3.5 text-success"/> : <Copy className="size-3.5"/>}
      </Button>
    </div>);
}
export function CopyValueButton(props: {
    value: string;
    field: string;
    copiedField: string | null;
    onCopy: (text: string, field: string) => void;
    className?: string;
    ariaLabel: string;
    iconClassName: string;
}) {
    const { value, field, copiedField, onCopy, className, ariaLabel, iconClassName } = props;
    const handleCopy = () => {
        onCopy(value, field);
    };
    return (<Button variant="ghost" size="icon" className={className} onClick={handleCopy} aria-label={ariaLabel}>
      {copiedField === field ? <Check className={iconClassName}/> : <Copy className={iconClassName}/>}
    </Button>);
}
export function InsightScoreBar(props: {
    score: number;
}) {
    const { score } = props;
    const style = ({ width: `${score}%` });
    return <div className="h-full bg-primary" style={style}/>;
}
export function CreativeEditorEditTab(props: CreativeEditorTabSharedProps) {
    const { creative, copiedField, onCopy, isEditing, editedHeadlines, editedDescriptions, editedCta, editedLandingPage, previewHeadlineIndex, previewDescriptionIndex, onPreviewHeadlineIndexChange, onPreviewDescriptionIndexChange, onAddHeadline, onRemoveHeadline, onUpdateHeadline, onAddDescription, onRemoveDescription, onUpdateDescription, onChangeCta, onChangeLandingPage, generatingHeadlines, generatingDescriptions, onGenerateHeadlines, onGenerateDescriptions, } = props;
    const handleLandingPageChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChangeLandingPage(event.target.value);
    };
    const editableHeadlineItems = toStableStringItems(editedHeadlines);
    const headlineItems = toStableStringItems(creative.headlines ?? []);
    const editableDescriptionItems = toStableStringItems(editedDescriptions);
    const descriptionItems = toStableStringItems(creative.descriptions ?? []);
    const showEditableContent = isEditing;
    const noopSelectPreview = () => undefined;
    const handleSelectHeadlinePreview = onPreviewHeadlineIndexChange ?? noopSelectPreview;
    const handleSelectDescriptionPreview = onPreviewDescriptionIndexChange ?? noopSelectPreview;
    return (<>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card className="border border-border/60 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MousePointer2 className="size-4 text-primary"/>
                  Call to action
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showEditableContent ? (<Select value={editedCta || undefined} onValueChange={onChangeCta}>
                    <SelectTrigger className="h-9 bg-background">
                      <SelectValue placeholder="Select CTA"/>
                    </SelectTrigger>
                    <SelectContent>
                      {META_CTA_OPTIONS.map((option) => (<SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>))}
                    </SelectContent>
                  </Select>) : creative.callToAction ? (<Badge variant="secondary" className="border-none bg-accent/10 px-3 py-1 text-primary hover:bg-accent/20">
                    {formatCTALabel(creative.callToAction)}
                  </Badge>) : (<p className="text-sm italic text-muted-foreground">Not specified</p>)}
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <LinkIcon className="size-4 text-primary"/>
                  Landing page
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showEditableContent ? (<Input value={editedLandingPage} onChange={handleLandingPageChange} placeholder="https://example.com/landing" type="url" className="h-9 bg-background"/>) : creative.landingPageUrl ? (<div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium text-primary underline underline-offset-4">
                      {creative.landingPageUrl}
                    </p>
                    <CopyValueButton value={creative.landingPageUrl ?? ''} field="landing" copiedField={copiedField} onCopy={onCopy} className="size-7 shrink-0" ariaLabel="Copy landing page URL" iconClassName="size-3"/>
                  </div>) : (<p className="text-sm italic text-muted-foreground">No link configured</p>)}
              </CardContent>
            </Card>
          </div>

          <Card className="border border-border/60 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Type className="size-4 text-primary"/>
                    Headlines
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Catch attention with short, punchy titles.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {editedHeadlines.filter((h) => h.trim()).length || creative.headlines?.length || 0} variants
                  </Badge>
                  {showEditableContent ? (<Button variant="outline" size="sm" onClick={onAddHeadline} className="h-8 gap-1">
                      <Plus className="size-3.5"/>
                      Add
                    </Button>) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {showEditableContent ? (editedHeadlines.length > 0 ? (<div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                    {editableHeadlineItems.map((headlineItem) => (<HeadlineEditRow key={headlineItem.key} value={headlineItem.value} index={headlineItem.index} isPreviewing={headlineItem.index === previewHeadlineIndex} onUpdate={onUpdateHeadline} onRemove={onRemoveHeadline} onSelectPreview={handleSelectHeadlinePreview}/>))}
                  </div>) : (<div className="rounded-lg border-2 border-dashed p-6 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">No headlines yet.</p>
                    <Button variant="outline" size="sm" onClick={onAddHeadline}>
                      <Plus className="mr-1 size-4"/> Add headline
                    </Button>
                  </div>)) : creative.headlines && creative.headlines.length > 0 ? (headlineItems.map((headlineItem) => (<HeadlineDisplayRow key={headlineItem.key} value={headlineItem.value} index={headlineItem.index} copiedField={copiedField} onCopy={onCopy}/>))) : (<p className="py-4 text-center text-sm text-muted-foreground">No headlines available</p>)}

              {showEditableContent ? (<Button type="button" variant="outline" size="sm" onClick={onGenerateHeadlines} disabled={!onGenerateHeadlines || generatingHeadlines} className="mt-2 h-8 gap-1.5 text-xs">
                  <Sparkles className="size-3.5 text-primary"/>
                  {generatingHeadlines ? 'Generating…' : 'Generate AI headlines'}
                </Button>) : null}
            </CardContent>
          </Card>

          {/* Primary Text Section */}
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4 text-primary"/>
                    Primary Text
                  </CardTitle>
                  <CardDescription className="text-xs">
                    The main copy that appears above or below your media.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {editedDescriptions.filter((d) => d.trim()).length || creative.descriptions?.length || 0} variants
                  </Badge>
                  {showEditableContent ? (<Button variant="outline" size="sm" onClick={onAddDescription} className="h-8 gap-1">
                      <Plus className="size-3.5"/>
                      Add
                    </Button>) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {showEditableContent ? (editedDescriptions.length > 0 ? (<div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                    {editableDescriptionItems.map((descriptionItem) => (<DescriptionEditRow key={descriptionItem.key} value={descriptionItem.value} index={descriptionItem.index} isPreviewing={descriptionItem.index === previewDescriptionIndex} onUpdate={onUpdateDescription} onRemove={onRemoveDescription} onSelectPreview={handleSelectDescriptionPreview}/>))}
                  </div>) : (<div className="rounded-lg border-2 border-dashed p-6 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">No primary text yet.</p>
                    <Button variant="outline" size="sm" onClick={onAddDescription}>
                      <Plus className="mr-1 size-4"/> Add primary text
                    </Button>
                  </div>)) : creative.descriptions && creative.descriptions.length > 0 ? (descriptionItems.map((descriptionItem) => (<DescriptionDisplayRow key={descriptionItem.key} value={descriptionItem.value} index={descriptionItem.index} copiedField={copiedField} onCopy={onCopy}/>))) : (<p className="py-4 text-center text-sm text-muted-foreground">No primary text available</p>)}

              {showEditableContent ? (<Button type="button" variant="outline" size="sm" onClick={onGenerateDescriptions} disabled={!onGenerateDescriptions || generatingDescriptions} className="mt-2 h-8 gap-1.5 text-xs">
                  <Sparkles className="size-3.5 text-primary"/>
                  {generatingDescriptions ? 'Generating…' : 'Generate AI primary text'}
                </Button>) : null}
            </CardContent>
          </Card>
    </>);
}
export function CreativeEditorInsightsTab({ performanceSummary = null, onRefreshPerformance, algorithmicInsights, }: Pick<CreativeEditorTabSharedProps, 'performanceSummary' | 'onRefreshPerformance' | 'algorithmicInsights'>) {
    return (<Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="size-4 text-primary"/>
                AI Creative Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Algorithmic suggestions to improve your creative performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!performanceSummary ? (<div className="p-8 text-center border-2 border-dashed rounded-2xl">
                  <Zap className="size-10 text-muted-foreground/30 mx-auto mb-3"/>
                  <p className="text-sm text-muted-foreground">Load performance metrics to generate AI insights.</p>
                  {onRefreshPerformance ? (<Button variant="outline" size="sm" className="mt-4" onClick={onRefreshPerformance}>
                      Fetch Data
                    </Button>) : null}
                </div>) : algorithmicInsights.length === 0 ? (<div className="p-8 text-center border-2 border-dashed rounded-2xl">
                  <p className="text-sm text-muted-foreground">No critical insights identified for this creative.</p>
                  <p className="text-xs text-muted-foreground mt-1">Keep monitoring performance as you scale spend.</p>
                </div>) : (<div className="grid grid-cols-1 gap-4">
                  {algorithmicInsights.map((insight) => (<div key={`${insight.title}-${insight.message}-${insight.suggestion}`} className="group relative p-5 rounded-2xl bg-gradient-to-br from-background to-muted/20 border border-muted shadow-sm hover:border-accent/20 motion-chromatic">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <p className="font-bold text-sm tracking-tight">{insight.title}</p>
                        {typeof insight.score === 'number' ? (<div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                              <InsightScoreBar score={insight.score}/>
                            </div>
                            <span className="text-[10px] font-bold">{Math.round(insight.score)}%</span>
                          </div>) : (<Badge variant="secondary" className="text-[10px] bg-accent/10 text-primary border-none">TIP</Badge>)}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{insight.message}</p>

                      <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Zap className="size-3"/> Recommendation
                        </p>
                        <p className="text-xs font-medium">{insight.suggestion}</p>
                      </div>

                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100" aria-label="Add recommendation to draft">
                        <Plus className="size-3.5"/>
                      </Button>
                    </div>))}
                </div>)}
            </CardContent>
          </Card>);
}
export function CreativeEditorDetailsTab({ creative, copiedField, onCopy, }: Pick<CreativeEditorTabSharedProps, 'creative' | 'copiedField' | 'onCopy'>) {
    return (<Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Layout className="size-4 text-primary"/>
                Technical Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/30 border border-muted/20">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Creative ID</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-mono truncate">{creative.creativeId}</p>
                    <CopyValueButton value={creative.creativeId} field="creativeId" copiedField={copiedField} onCopy={onCopy} className="size-6" ariaLabel="Copy creative ID" iconClassName="size-3"/>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-muted/20">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Campaign ID</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-mono truncate">{creative.campaignId}</p>
                    <CopyValueButton value={creative.campaignId} field="campaignId" copiedField={copiedField} onCopy={onCopy} className="size-6" ariaLabel="Copy campaign ID" iconClassName="size-3"/>
                  </div>
                </div>
              </div>

              <Separator className="my-6"/>

              <div className="space-y-4">
                {creative.imageUrl ? (<div className="space-y-2">
                    <CreativeImageViewer src={creative.imageUrl} alt={creative.name || 'Creative image'} variant="thumbnail"/>
                    <div className="flex justify-end">
                      <CopyValueButton value={creative.imageUrl} field="imageUrl" copiedField={copiedField} onCopy={onCopy} className="size-8" ariaLabel="Copy source image URL" iconClassName="size-3.5"/>
                    </div>
                  </div>) : null}

                {creative.videoUrl && (<div className="p-3 rounded-xl border bg-background flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded bg-muted flex items-center justify-center shrink-0">
                        <Video className="size-5 text-muted-foreground"/>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source Video</p>
                        <p className="text-xs truncate text-primary">{creative.videoUrl}</p>
                      </div>
                    </div>
                      <CopyValueButton value={creative.videoUrl ?? ''} field="videoUrl" copiedField={copiedField} onCopy={onCopy} className="size-8" ariaLabel="Copy source video URL" iconClassName="size-3.5"/>
                  </div>)}
              </div>
            </CardContent>
          </Card>);
}
