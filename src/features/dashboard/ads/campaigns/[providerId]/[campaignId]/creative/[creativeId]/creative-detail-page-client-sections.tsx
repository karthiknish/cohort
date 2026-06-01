'use client';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { CreativeEditorTabs } from '@/features/dashboard/ads/creative/components/creative-editor-tabs';
import { CreativeHeader } from '@/features/dashboard/ads/creative/components/creative-header';
import { CreativeSaveBar } from '@/features/dashboard/ads/creative/components/creative-save-bar';
import { CreativeSocialPreview, type CreativePerformanceSummary, } from '@/features/dashboard/ads/creative/components/creative-social-preview';
import { normalizeStringList } from '@/features/dashboard/ads/creative/components/creative-editing-utils';
import type { Creative } from '@/features/dashboard/ads/creative/components/types';
import type { AlgorithmicInsight } from '@/lib/ad-algorithms';
type CreativeDetailPageContentProps = {
    creative: Creative;
    previewCreative: Creative;
    backUrl: string;
    campaignName: string;
    displayName: string;
    isDirty: boolean;
    isSaving: boolean;
    copiedField: string | null;
    isEditing: boolean;
    editedHeadlines: string[];
    editedDescriptions: string[];
    editedCta: string;
    editedLandingPage: string;
    previewHeadlineIndex: number;
    previewDescriptionIndex: number;
    generatingHeadlines: boolean;
    generatingDescriptions: boolean;
    performanceSummary: CreativePerformanceSummary | null;
    efficiencyScore: number | null;
    algorithmicInsights: AlgorithmicInsight[];
    onCopy: (text: string, field: string) => void;
    onCancelEditing: () => void;
    onSave: () => void;
    onRefreshCreative: () => void;
    onRefreshPerformance: () => void;
    onPreviewHeadlineIndexChange: (index: number) => void;
    onPreviewDescriptionIndexChange: (index: number) => void;
    onAddHeadline: () => void;
    onRemoveHeadline: (index: number) => void;
    onUpdateHeadline: (index: number, value: string) => void;
    onAddDescription: () => void;
    onRemoveDescription: (index: number) => void;
    onUpdateDescription: (index: number, value: string) => void;
    onChangeCta: (value: string) => void;
    onChangeLandingPage: (value: string) => void;
    onGenerateHeadlines: () => void;
    onGenerateDescriptions: () => void;
};
export function CreativeDetailPageContent({ creative, previewCreative, backUrl, campaignName, displayName, isDirty, isSaving, copiedField, isEditing, editedHeadlines, editedDescriptions, editedCta, editedLandingPage, previewHeadlineIndex, previewDescriptionIndex, generatingHeadlines, generatingDescriptions, performanceSummary, efficiencyScore, algorithmicInsights, onCopy, onCancelEditing, onSave, onRefreshCreative, onRefreshPerformance, onPreviewHeadlineIndexChange, onPreviewDescriptionIndexChange, onAddHeadline, onRemoveHeadline, onUpdateHeadline, onAddDescription, onRemoveDescription, onUpdateDescription, onChangeCta, onChangeLandingPage, onGenerateHeadlines, onGenerateDescriptions, }: CreativeDetailPageContentProps) {
    return (<div className={ADS_PAGE_THEME.innerContainer}>
      <CreativeHeader creative={creative} backUrl={backUrl} displayName={displayName} isDirty={isDirty} isSaving={isSaving} onCancelEditing={onCancelEditing} onSave={onSave} onRefreshCreative={onRefreshCreative} onRefreshPerformance={onRefreshPerformance}/>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <CreativeSocialPreview creative={previewCreative} campaignName={campaignName} displayName={displayName} performanceSummary={performanceSummary} efficiencyScore={efficiencyScore} headlineVariantCount={normalizeStringList(editedHeadlines).length} descriptionVariantCount={normalizeStringList(editedDescriptions).length} previewHeadlineIndex={previewHeadlineIndex} previewDescriptionIndex={previewDescriptionIndex} onPreviewHeadlineIndexChange={onPreviewHeadlineIndexChange} onPreviewDescriptionIndexChange={onPreviewDescriptionIndexChange}/>

        <div className="flex flex-col lg:col-span-7">
          <CreativeEditorTabs creative={creative} copiedField={copiedField} onCopy={onCopy} isEditing={isEditing} isDirty={isDirty} editedHeadlines={editedHeadlines} editedDescriptions={editedDescriptions} editedCta={editedCta} editedLandingPage={editedLandingPage} previewHeadlineIndex={previewHeadlineIndex} previewDescriptionIndex={previewDescriptionIndex} onPreviewHeadlineIndexChange={onPreviewHeadlineIndexChange} onPreviewDescriptionIndexChange={onPreviewDescriptionIndexChange} onAddHeadline={onAddHeadline} onRemoveHeadline={onRemoveHeadline} onUpdateHeadline={onUpdateHeadline} onAddDescription={onAddDescription} onRemoveDescription={onRemoveDescription} onUpdateDescription={onUpdateDescription} onChangeCta={onChangeCta} onChangeLandingPage={onChangeLandingPage} generatingHeadlines={generatingHeadlines} generatingDescriptions={generatingDescriptions} onGenerateHeadlines={onGenerateHeadlines} onGenerateDescriptions={onGenerateDescriptions} performanceSummary={performanceSummary} onRefreshPerformance={onRefreshPerformance} algorithmicInsights={algorithmicInsights}/>
          <CreativeSaveBar isDirty={isDirty} isSaving={isSaving} onSave={onSave} onDiscard={onCancelEditing}/>
        </div>
      </div>
    </div>);
}
