'use client';
import { useMemo, useState } from 'react';
import { MetaAdvancedToolsPanel } from '@/features/dashboard/ads/components/meta-advanced-tools-panel';
import { MetaEventsToolsPanel } from '@/features/dashboard/ads/components/meta-events-tools-panel';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { hasAnyMetaCampaignTools, hasMetaAdvancedTools, hasMetaEventsTools, resolveMetaCampaignUiVisibility, } from '@/lib/meta-campaign-ui';
import { useAuth } from '@/shared/contexts/auth-context';
import { CardContent } from '@/shared/ui/card';
import { MotionCard } from '@/shared/ui/motion-primitives';
import { MotionTabsContent, Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { CampaignControlHeader } from './campaign-control-header';
import { Radio, Webhook, Wrench } from 'lucide-react';
type CampaignMetaToolsSectionProps = {
    clientId?: string | null;
    isPreviewMode?: boolean;
    campaignObjective?: string | null;
};
export function CampaignMetaToolsSection({ clientId, isPreviewMode, campaignObjective, }: CampaignMetaToolsSectionProps) {
    const { user } = useAuth();
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const [metaToolsTab, setMetaToolsTab] = useState('events');
    const visibility = resolveMetaCampaignUiVisibility({
        campaignObjective,
        scope: 'campaign',
    });
    const showEvents = hasMetaEventsTools(visibility);
    const showAdvanced = hasMetaAdvancedTools(visibility);
    if (isPreviewMode || !workspaceId || !hasAnyMetaCampaignTools(visibility)) {
        return null;
    }
    const panelProps = {
        workspaceId,
        clientId,
        campaignObjective,
        scope: 'campaign' as const,
    };
    if (showEvents && !showAdvanced) {
        return (<MotionCard className={ADS_PAGE_THEME.surfaceCard}>
        <CampaignControlHeader icon={Wrench} title="Meta tools" description={visibility.metaToolsDescription}/>
        <CardContent className="pt-2">
          <MetaEventsToolsPanel {...panelProps}/>
        </CardContent>
      </MotionCard>);
    }
    if (!showEvents && showAdvanced) {
        return (<MotionCard className={ADS_PAGE_THEME.surfaceCard}>
        <CampaignControlHeader icon={Wrench} title="Meta tools" description={visibility.metaToolsDescription}/>
        <CardContent className="pt-2">
          <MetaAdvancedToolsPanel {...panelProps}/>
        </CardContent>
      </MotionCard>);
    }
    return (<MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CampaignControlHeader icon={Wrench} title="Meta tools" description={visibility.metaToolsDescription}/>
      <CardContent className="pt-2">
        <Tabs value={metaToolsTab} onValueChange={setMetaToolsTab} className="w-full">
          <TabsList className="mb-4 grid h-auto w-full grid-cols-2 gap-1 bg-muted/40 p-1">
            <TabsTrigger value="events" className="gap-1.5 text-xs sm:text-sm">
              <Radio className="size-3.5 shrink-0" aria-hidden/>
              Conversions API
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-1.5 text-xs sm:text-sm">
              <Webhook className="size-3.5 shrink-0" aria-hidden/>
              Pixel &amp; webhooks
            </TabsTrigger>
          </TabsList>
          <MotionTabsContent activeTab={metaToolsTab} tabValue="events" className="mt-0">
            <MetaEventsToolsPanel {...panelProps}/>
          </MotionTabsContent>
          <MotionTabsContent activeTab={metaToolsTab} tabValue="advanced" className="mt-0">
            <MetaAdvancedToolsPanel {...panelProps}/>
          </MotionTabsContent>
        </Tabs>
      </CardContent>
    </MotionCard>);
}
