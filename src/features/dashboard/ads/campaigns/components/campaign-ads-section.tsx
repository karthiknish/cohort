'use client'

import { FileText, Layers } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { Button } from '@/shared/ui/button'
import { CardContent } from '@/shared/ui/card'
import { MotionCard } from '@/shared/ui/motion-primitives'
import { Skeleton } from '@/shared/ui/skeleton'

import { CreateMetaAdSetDialog } from './create-meta-ad-set-dialog'
import { MetaAdSetsStrip } from './meta-ad-sets-strip'
import { CampaignCreativesPerformanceStrip } from './campaign-creatives-performance'
import {
  CampaignAdsFilters,
  CampaignAdsGrid,
  CampaignAdsHeader,
  CampaignAdsList,
} from './campaign-ads-section-sections'
import type { CampaignAdsSectionProps } from './campaign-ads-section-types'
export type { CampaignAd } from './campaign-ads-section-types'
import { useCampaignAdsSection } from './use-campaign-ads-section'

export function CampaignAdsSection({
  providerId,
  campaignId,
  campaignObjective,
  clientId,
  isPreviewMode,
  currency,
}: CampaignAdsSectionProps) {
  const {
    workspaceId,
    displayCurrency,
    convexProviderId,
    isMeta,
    canLoad,
  setViewMode,
    setSearchQuery,
    setStatusFilter,
    setTypeFilter,
    setPeriodDays,
    setSortKey,
    handleAdSetDialogOpenChange,
    uniqueTypes,
    uniqueStatuses,
    availableAdSets,
    firstAdSetId,
    sortedFilteredAds,
    filteredAds,
    performanceTotals,
    creativeInsights,
    maxSpend,
    handleCreativeClick,
    handleToggleAdStatus,
  summaryStats,
    handleClearFilters,
    handleRefreshAll,
    handleAdSetCreated,
    handleOpenAdSetDialog,
    handleToggleAdSetStatus,
    togglingAdSetId,
    loading,
    hasLoaded,
  viewMode,
    adMetrics,
    metricsLoading,
    periodDays,
    sortKey,
  searchQuery,
  statusFilter,
  typeFilter,
    adSetDialogOpen,
    state,
  } = useCampaignAdsSection({ providerId, campaignId, clientId, isPreviewMode, currency })

  const ads = state.ads

  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CampaignAdsHeader
        availableAdSets={availableAdSets}
        campaignId={campaignId}
        campaignObjective={campaignObjective}
        canLoad={canLoad}
        clientId={clientId}
        convexProviderId={convexProviderId}
        fetchAds={handleRefreshAll}
        firstAdSetId={firstAdSetId}
        isMeta={isMeta}
        isPreviewMode={isPreviewMode}
        loading={loading}
        onCreateAdSet={handleOpenAdSetDialog}
        setViewMode={setViewMode}
        summaryStats={summaryStats}
        viewMode={viewMode}
        workspaceId={workspaceId}
      />
      {isMeta ? (
        <CreateMetaAdSetDialog
          open={adSetDialogOpen}
          onOpenChange={handleAdSetDialogOpenChange}
          campaignId={campaignId}
          campaignObjective={campaignObjective}
          onCreated={handleAdSetCreated}
        />
      ) : null}

      {isMeta && state.adSets.length > 0 ? (
        <MetaAdSetsStrip
          adSets={state.adSets}
          togglingId={togglingAdSetId}
          onToggleStatus={handleToggleAdSetStatus}
        />
      ) : null}

      <CardContent className="space-y-4 pt-6">
        {loading && !hasLoaded ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-32" />
            </div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {['skeleton-a', 'skeleton-b', 'skeleton-c', 'skeleton-d'].map((skeletonId) => (
                  <Skeleton key={skeletonId} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : (
              <Skeleton className="h-64" />
            )}
          </div>
        ) : !canLoad ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
              <Layers className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Preview Mode</p>
            <p className="mt-1 text-xs text-muted-foreground">Enable live mode to view ad creatives</p>
          </div>
        ) : ads.length === 0 && hasLoaded ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No Creatives Found</p>
            <p className="mt-1 text-xs text-muted-foreground">This campaign doesn&apos;t have ad creatives yet</p>
          </div>
        ) : (
          <>
            <CampaignCreativesPerformanceStrip
              totals={performanceTotals}
              currency={displayCurrency}
              periodDays={periodDays}
              onPeriodChange={setPeriodDays}
              sortKey={sortKey}
              onSortChange={setSortKey}
              metricsLoading={metricsLoading}
              isMeta={isMeta}
            />

            <CampaignAdsFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              uniqueStatuses={uniqueStatuses}
              uniqueTypes={uniqueTypes}
            />

            {filteredAds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No creatives match your filters</p>
                <Button variant="link" size="sm" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <CampaignAdsGrid
                adMetrics={adMetrics}
                ads={sortedFilteredAds}
                creativeInsights={creativeInsights}
                currency={displayCurrency}
                maxSpend={maxSpend}
                onCreativeClick={handleCreativeClick}
                onToggleStatus={handleToggleAdStatus}
                providerId={convexProviderId}
              />
            ) : (
              <CampaignAdsList
                adMetrics={adMetrics}
                ads={sortedFilteredAds}
                creativeInsights={creativeInsights}
                currency={displayCurrency}
                onCreativeClick={handleCreativeClick}
                onToggleStatus={handleToggleAdStatus}
                providerId={convexProviderId}
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Showing {sortedFilteredAds.length} of {ads.length} creatives
                {metricsLoading ? ' · refreshing metrics…' : ''}
              </span>
              {isMeta ? (
                <span>Metrics are per Meta ad (last {periodDays} days)</span>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </MotionCard>
  )
}
