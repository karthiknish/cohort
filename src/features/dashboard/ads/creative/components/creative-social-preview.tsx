import React, { useReducer, useCallback, useMemo } from 'react';
import { LazyMotion, domAnimation } from '@/shared/ui/motion';
import type { Creative } from './types';
import { CreativePlatformMock } from './creative-platform-mock';
import { CreativeSocialPreviewVariantButton } from './creative-social-preview-variant-button';
import { CreativeSocialPreviewToolbar } from './creative-social-preview-toolbar';
import { CreativeSocialPreviewScoreCard } from './creative-social-preview-score-card';
import { createInitialCreativeSocialPreviewState, creativeSocialPreviewReducer, safeHostname, type CreativePerformanceSummary, type Platform, } from './creative-social-preview-state';
export type { CreativePerformanceSummary } from './creative-social-preview-state';
export function CreativeSocialPreview(props: {
    creative: Creative;
    campaignName: string;
    displayName: string;
    performanceSummary: CreativePerformanceSummary | null;
    efficiencyScore: number | null;
    headlineVariantCount?: number;
    descriptionVariantCount?: number;
    previewHeadlineIndex?: number;
    previewDescriptionIndex?: number;
    onPreviewHeadlineIndexChange?: (index: number) => void;
    onPreviewDescriptionIndexChange?: (index: number) => void;
}) {
    const { creative, campaignName, displayName, performanceSummary, efficiencyScore, headlineVariantCount = 0, descriptionVariantCount = 0, previewHeadlineIndex = 0, previewDescriptionIndex = 0, onPreviewHeadlineIndexChange, onPreviewDescriptionIndexChange, } = props;
    const availablePlatforms: Platform[] = creative.providerId === 'linkedin'
        ? ['linkedin']
        : creative.providerId === 'tiktok'
            ? ['tiktok' as Platform]
            : ['facebook', 'instagram'];
    const [previewState, dispatch] = useReducer(creativeSocialPreviewReducer, availablePlatforms[0] ?? 'facebook', createInitialCreativeSocialPreviewState);
    const { imageLoadFailed, imageLightboxOpen, profileImageError, aspectRatio, isPlaying, activePlatform, } = previewState;
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const mediaAspectClass = aspectRatio === 'reel' ? 'aspect-[9/16]' : 'aspect-square';
    const handlePlay = () => dispatch({ type: 'setIsPlaying', value: true });
    const handlePause = () => dispatch({ type: 'setIsPlaying', value: false });
    const handleEnded = () => dispatch({ type: 'setIsPlaying', value: false });
    const handleImageLoadFailed = () => dispatch({ type: 'setImageLoadFailed', value: true });
    const handleOpenImageLightbox = () => dispatch({ type: 'setImageLightboxOpen', value: true });
    const handleProfileImageError = () => dispatch({ type: 'setProfileImageError', value: true });
    const handleSetFeed = () => dispatch({ type: 'setAspectRatio', value: 'feed' });
    const handleSetReel = () => dispatch({ type: 'setAspectRatio', value: 'reel' });
    const handleImageLightboxOpenChange = (value: boolean) => dispatch({ type: 'setImageLightboxOpen', value });
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            }
            else {
                videoRef.current.play();
            }
            dispatch({ type: 'setIsPlaying', value: !isPlaying });
        }
    };
    const pageDisplayName = creative.pageName || creative.campaignName || creative.name || campaignName;
    const handlePreviewHeadlineSelect = (index: number) => onPreviewHeadlineIndexChange?.(index);
    const handlePreviewDescriptionSelect = (index: number) => onPreviewDescriptionIndexChange?.(index);
    const primaryText = creative.descriptions?.[0] || '';
    const headlineText = creative.headlines?.[0] || displayName;
    const landingHostname = safeHostname(creative.landingPageUrl, pageDisplayName.replace(/\s+/g, '').toLowerCase() + '.com');
    const handlePlatformChange = (v: string) => dispatch({ type: 'setActivePlatform', value: v as Platform });
    const previewMediaProps = ({
        creative,
        displayName,
        mediaAspectClass,
        imageLoadFailed,
        imageLightboxOpen,
        isPlaying,
        videoRef,
        onPlay: handlePlay,
        onPause: handlePause,
        onEnded: handleEnded,
        onImageLoadFailed: handleImageLoadFailed,
        onOpenImageLightbox: handleOpenImageLightbox,
        onImageLightboxOpenChange: handleImageLightboxOpenChange,
        onTogglePlayPause: togglePlayPause,
    });
    return (<LazyMotion features={domAnimation}>
      <div className="lg:col-span-5 self-start space-y-6">
        <div className="space-y-4">
          <CreativeSocialPreviewToolbar aspectRatio={aspectRatio} activePlatform={activePlatform} availablePlatforms={availablePlatforms} onSetFeed={handleSetFeed} onSetReel={handleSetReel} onPlatformChange={handlePlatformChange}/>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-[#f0f2f5] p-3 shadow-sm">
            <div className="overflow-hidden rounded-lg border border-[#dadde1] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
              <CreativePlatformMock activePlatform={activePlatform} campaignName={campaignName} creative={creative} displayName={displayName} pageDisplayName={pageDisplayName} primaryText={primaryText} headlineText={headlineText} landingHostname={landingHostname} profileImageError={profileImageError} onProfileImageError={handleProfileImageError} previewMediaProps={previewMediaProps}/>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-medium uppercase tracking-wider">
                  {aspectRatio === 'reel' ? '9:16 Reel/Story' : '1:1 Feed Post'}
                </span>
              </div>
              {(headlineVariantCount > 1 || descriptionVariantCount > 1) && (<div className="flex flex-wrap gap-2">
                  {headlineVariantCount > 1 && onPreviewHeadlineIndexChange ? (<div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2 py-1">
                      <span className="text-[10px] font-semibold text-muted-foreground">Headline</span>
                      {Array.from({ length: headlineVariantCount }, (_, variantIndex) => (<CreativeSocialPreviewVariantButton key={`headline-preview-v${variantIndex}`} index={variantIndex} selected={previewHeadlineIndex === variantIndex} onSelect={handlePreviewHeadlineSelect}/>))}
                    </div>) : null}
                  {descriptionVariantCount > 1 && onPreviewDescriptionIndexChange ? (<div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2 py-1">
                      <span className="text-[10px] font-semibold text-muted-foreground">Copy</span>
                      {Array.from({ length: descriptionVariantCount }, (_, variantIndex) => (<CreativeSocialPreviewVariantButton key={`description-preview-v${variantIndex}`} index={variantIndex} selected={previewDescriptionIndex === variantIndex} onSelect={handlePreviewDescriptionSelect}/>))}
                    </div>) : null}
                </div>)}
            </div>
          </div>
        </div>

        {performanceSummary && efficiencyScore !== null ? (<CreativeSocialPreviewScoreCard creative={creative} performanceSummary={performanceSummary} efficiencyScore={efficiencyScore}/>) : null}
      </div>
    </LazyMotion>);
}
