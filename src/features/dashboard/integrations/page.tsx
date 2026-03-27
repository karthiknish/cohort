'use client'

import { useCallback } from 'react'
import Link from 'next/link'

import { AdConnectionsCard } from '@/features/dashboard/home/components/ad-connections-card'
import { FadeIn } from '@/shared/ui/animate-in'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { usePreview } from '@/shared/contexts/preview-context'
import { DASHBOARD_THEME, PAGE_TITLES, getButtonClasses } from '@/lib/dashboard-theme'

import { SetupAlerts, ADS_WORKFLOW_STEPS } from '../ads/components'
import { useAdsConnections } from '../ads/hooks/use-ads-connections'

export default function IntegrationsPage() {
  const { isPreviewMode } = usePreview()

  const {
    connectedProviders,
    connectingProvider,
    connectionErrors,
    metaSetupMessage,
    tiktokSetupMessage,
    initializingMeta,
    initializingTikTok,
    metaNeedsAccountSelection,
    tiktokNeedsAccountSelection,
    metaAccountOptions,
    selectedMetaAccountId,
    setSelectedMetaAccountId,
    loadingMetaAccountOptions,
    handleConnect,
    handleDisconnect,
    handleOauthRedirect,
    initializeMetaIntegration,
    initializeTikTokIntegration,
    reloadMetaAccountOptions,
    adPlatforms,
    triggerRefresh,
  } = useAdsConnections()

  const handleInitializeMeta = useCallback(
    () => void initializeMetaIntegration(undefined, selectedMetaAccountId || null),
    [initializeMetaIntegration, selectedMetaAccountId]
  )

  const handleReloadMetaAccountOptions = useCallback(
    () => void reloadMetaAccountOptions(),
    [reloadMetaAccountOptions]
  )

  const handleInitializeTikTok = useCallback(
    () => void initializeTikTokIntegration(),
    [initializeTikTokIntegration]
  )

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <FadeIn>
        <div className={DASHBOARD_THEME.layout.header}>
          <div className="space-y-2">
            <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.integrations?.title ?? 'Integrations'}</h1>
            <p className={DASHBOARD_THEME.layout.subtitle}>
              {PAGE_TITLES.integrations?.description ?? 'Connect your ad platforms and verify sync status.'}
            </p>
          </div>
          <Button asChild variant="outline" className={getButtonClasses('outline')}>
            <Link href="/dashboard/ads">Go to Ads Hub</Link>
          </Button>
        </div>
      </FadeIn>

      <FadeIn>
        <Card className="border-muted/70 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Integration checklist</CardTitle>
            <CardDescription>
              Complete these steps to start pulling media performance into Cohorts.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {ADS_WORKFLOW_STEPS.map((step, index) => (
              <div
                key={step.title}
                className="space-y-2 rounded-lg border border-muted/60 p-4"
              >
                <Badge variant="secondary">Step {index + 1}</Badge>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </FadeIn>

      {!isPreviewMode && (
        <>
          <FadeIn>
            <SetupAlerts
              metaSetupMessage={metaSetupMessage}
              metaNeedsAccountSelection={metaNeedsAccountSelection}
              initializingMeta={initializingMeta}
              onInitializeMeta={handleInitializeMeta}
              metaAccountOptions={metaAccountOptions}
              selectedMetaAccountId={selectedMetaAccountId}
              onMetaAccountSelectionChange={setSelectedMetaAccountId}
              loadingMetaAccountOptions={loadingMetaAccountOptions}
              onReloadMetaAccountOptions={handleReloadMetaAccountOptions}
              tiktokSetupMessage={tiktokSetupMessage}
              tiktokNeedsAccountSelection={tiktokNeedsAccountSelection}
              initializingTikTok={initializingTikTok}
              onInitializeTikTok={handleInitializeTikTok}
            />
          </FadeIn>

          <FadeIn>
            <div id="connect-ad-platforms">
              <AdConnectionsCard
                providers={adPlatforms}
                connectedProviders={connectedProviders}
                connectingProvider={connectingProvider}
                connectionErrors={connectionErrors}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onOauthRedirect={handleOauthRedirect}
                onRefresh={triggerRefresh}
                refreshing={false}
              />
            </div>
          </FadeIn>
        </>
      )}

      <FadeIn>
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/dashboard/ads#connect-ad-platforms">Continue to Ads Hub</Link>
          </Button>
        </div>
      </FadeIn>
    </div>
  )
}
