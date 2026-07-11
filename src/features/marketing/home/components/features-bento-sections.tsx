import { ArrowUpRight, BarChart2, Globe, Sparkles, TrendingUp, Users, type LucideProps, } from 'lucide-react';
import type { ComponentType } from 'react';
import { RetainerSlider } from '@/features/marketing/home/components/retainer-slider';
import { PlatformBrandLogo } from '@/features/marketing/home/components/platform-brand-logos';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { FadeIn } from '@/shared/ui/animate-in';
import { ACTIVITY_ITEMS, BADGE_BOB_STYLE, CHART_POINTS, CLIENT_SPOTLIGHT, CLIENT_SPOTLIGHT_STYLES, MARQUEE_STYLE, PLATFORM_BARS, PLATFORM_BAR_HEIGHT_STYLES, PLATFORM_STATS, SEGMENT_BADGES, } from './features-bento-data';
type ActivityItemProps = {
    item: {
        Icon: ComponentType<LucideProps>;
        name: string;
        detail: string;
        value: string;
        positive: boolean;
    };
};
function FeaturesBentoActivityItem({ item }: ActivityItemProps) {
    return (<div className="flex w-56 shrink-0 items-center gap-3 rounded-xl border bg-card py-1.5 pr-3 pl-2 shadow-sm">
      <div className="grid size-9 shrink-0 place-content-center rounded-xl bg-accent/10">
        <item.Icon className="size-4 text-primary" aria-hidden="true"/>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-xs font-light text-muted-foreground">{item.detail}</span>
        <span className="truncate text-sm">{item.name}</span>
      </div>
      <span className={cn('shrink-0 text-xs font-medium', item.positive ? 'text-primary' : 'text-muted-foreground')}>
        {item.value}
      </span>
    </div>);
}
export function FeaturesBentoCampaignReachCard() {
    return (<FadeIn>
      <div className="flex flex-col gap-26.5 rounded-xl border bg-card py-6 shadow-none">
        <div className="flex flex-col items-center gap-8 px-4">
          <div className="flex w-full flex-col gap-4 rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-content-center rounded-sm bg-accent/10">
                  <BarChart2 className="size-4 text-primary" aria-hidden="true"/>
                </div>
                <span className="text-sm">Total impressions</span>
              </div>
              <span className="rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground">Report</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold">2.4M</span>
              <Badge variant="success" className="rounded-sm">+18%</Badge>
            </div>
          </div>

          <div className="relative flex w-full rounded-xl border px-4 py-6">
            {PLATFORM_BARS.map((bar, i) => (<div key={bar.label} className={cn('flex grow flex-col gap-2.5 border-dashed px-3 py-2', i < PLATFORM_BARS.length - 1 && 'border-r')}>
                <div className="flex items-center gap-2">
                  <PlatformBrandLogo brand={bar.slug} className="size-4" labeled={false}/>
                  <span className="text-sm text-muted-foreground">{bar.label}</span>
                </div>
                <div className="text-2xl font-medium">{bar.pct}%</div>
                <div className="flex min-h-25 flex-1 items-end">
                  <div className={cn('grow rounded-xl', i === 0 ? 'bg-primary' : i === 1 ? 'bg-secondary' : 'bg-accent/60')} style={PLATFORM_BAR_HEIGHT_STYLES[i]}/>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">{bar.value}</span>
                  <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true"/>
                </div>
              </div>))}

            <div className="absolute -bottom-14 left-1/2 w-72 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-xl border bg-card p-4 shadow-lg">
                <div className="grid size-9 shrink-0 place-content-center rounded-full bg-accent/10">
                  <TrendingUp className="size-4 text-primary" aria-hidden="true"/>
                </div>
                <p className="text-xs text-muted-foreground">
                  Campaigns improved by <span className="text-card-foreground">18%</span> this month, 312 qualified leads generated
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6">
          <h5 className="text-2xl font-semibold">Campaign Reach</h5>
          <p className="text-lg text-muted-foreground">See how many people your clients' campaigns reach across every ad platform, in one unified view.</p>
        </div>
      </div>
    </FadeIn>);
}
export function FeaturesBentoAudienceSegmentsCard() {
    return (<FadeIn>
      <div className="flex flex-col gap-0 rounded-xl border bg-card pt-0 pb-6 shadow-none">
        <div className="relative flex min-h-72 justify-center overflow-hidden">
          <svg width="1em" height="1em" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none size-45 select-none text-border" aria-hidden="true">
            <circle strokeOpacity="0.3" cx="100" cy="100" r="94" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5"/>
            <circle strokeOpacity="0.6" cx="100" cy="100" r="76" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5"/>
            <circle strokeOpacity="0.9" cx="100" cy="100" r="53" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5"/>
          </svg>

          <div className="absolute top-1/2 -translate-y-1/2">
            <div className="grid size-16 place-content-center rounded-full border bg-background shadow-lg">
              <Users className="size-8 stroke-1 text-primary" aria-hidden="true"/>
            </div>
          </div>

          {SEGMENT_BADGES.map(({ Icon, label, rotation, pos }) => (<div key={label} className={cn(pos, rotation)} style={BADGE_BOB_STYLE}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
                <Icon className="size-3.5" aria-hidden="true"/>
                {label}
              </span>
            </div>))}
        </div>

        <div className="flex flex-col gap-4 px-6">
          <h5 className="text-2xl font-semibold">Audience Segments</h5>
          <p className="text-lg text-muted-foreground">Target the right audience for each client by industry, intent, or behaviour, with precision you can actually see.</p>
        </div>
      </div>
    </FadeIn>);
}
export function FeaturesBentoRevenueGoalsCard() {
    return (<FadeIn>
      <div className="flex h-84 flex-col gap-6 rounded-xl border bg-card py-6 shadow-none">
        <div className="flex flex-col gap-6 px-6">
          <RetainerSlider />
          <div className="flex flex-col gap-4">
            <h5 className="text-2xl font-semibold">Revenue Goals</h5>
            <p className="text-lg text-muted-foreground">Set billing targets for any quarter and watch your agency's revenue track in real time.</p>
          </div>
        </div>
      </div>
    </FadeIn>);
}
export function FeaturesBentoClientPerformanceCard() {
    return (<FadeIn>
      <div className="flex grow flex-col justify-between gap-8 rounded-xl border bg-card py-6 shadow-none">
        <div className="flex flex-col gap-6">
          <div className="px-6">
            <div className="flex flex-col gap-4 rounded-xl border p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-content-center rounded-sm bg-accent/10">
                    <TrendingUp className="size-4 text-primary" aria-hidden="true"/>
                  </div>
                  <span className="text-sm">Total revenue</span>
                </div>
                <span className="rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent">Details</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">$42,500</span>
                <Badge variant="success" className="rounded-sm">+8.3%</Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col gap-1 px-6">
              <div className="flex items-center justify-between gap-2 border-b py-2.5">
                <div className="flex items-center gap-2">
                  <Globe className="size-4" aria-hidden="true"/>
                  <span>Campaign spend</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-card-foreground">$380K</span>
                  <span>+14.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 py-2.5">
                <div className="flex items-center gap-2">
                  <Users className="size-4" aria-hidden="true"/>
                  <span>Retainer fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-card-foreground">$42.5K</span>
                  <span>+8.3%</span>
                </div>
              </div>
            </div>

            <div className="px-6">
              <svg viewBox="0 0 372 127" className="h-36 w-full" fill="none" aria-hidden="true">
                {CHART_POINTS.map(({ x, barH, label }) => (<rect key={label} x={x - 10} y={127 - barH} width={20} height={barH} rx={3} fill="var(--primary)" fillOpacity="0.1"/>))}
                <polyline points={CHART_POINTS.map(({ x, lineY }) => `${x},${lineY}`).join(' ')} stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                {CHART_POINTS.map(({ x, lineY, label }) => (<circle key={label} cx={x} cy={lineY} r="3.5" fill="var(--primary)"/>))}
                {CHART_POINTS.map(({ x, label }) => (<text key={label} x={x} y={122} fill="var(--muted-foreground)" fontSize={11} textAnchor="middle">
                    {label}
                  </text>))}
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6">
          <h5 className="text-2xl font-semibold">Client Performance</h5>
          <p className="text-lg text-muted-foreground">Monitor revenue, ad spend, and retainer performance across all clients in a single dashboard.</p>
        </div>
      </div>
    </FadeIn>);
}
export function FeaturesBentoClientSpotlightCard() {
    return (<FadeIn>
      <div className="flex flex-col gap-12 rounded-xl border bg-card py-6 shadow-none">
        <div className="relative flex justify-center">
          <div className="absolute inset-x-3 top-2 flex min-h-28 justify-center gap-3">
            {PLATFORM_STATS.map(({ Icon, label, value }) => (<div key={label} className="flex w-28 flex-col items-start gap-2.5 rounded-xl border bg-card p-3 shadow-lg">
                <div className="grid size-9 place-content-center rounded-full border">
                  <Icon className="size-5" aria-hidden="true"/>
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold">{value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                </div>
              </div>))}
          </div>

          <svg width="1em" height="1em" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none size-96 select-none text-border" aria-hidden="true">
            <circle strokeOpacity="0.4" cx="250" cy="250" r="245" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5"/>
            <circle strokeOpacity="0.4" cx="250" cy="250" r="200" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5"/>
            <circle strokeOpacity="0.4" cx="250" cy="250" r="155" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5"/>
            <circle strokeOpacity="0.4" cx="250" cy="250" r="108" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5"/>
          </svg>

          <div className="absolute top-1/2 size-24 -translate-y-1/2" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="50" className="fill-foreground"/>
              <rect x="18" y="18" width="26" height="26" rx="5" className="fill-background"/>
              <rect x="56" y="18" width="26" height="26" rx="5" className="fill-background"/>
              <rect x="18" y="56" width="26" height="26" rx="5" className="fill-background"/>
              <rect x="56" y="56" width="26" height="26" rx="5" className="fill-background"/>
            </svg>
          </div>

          {CLIENT_SPOTLIGHT.map((client, i) => (<div key={client.name} className="absolute left-1/2 flex h-20 w-72 items-center justify-between rounded-xl border bg-card p-4 shadow-xl" style={CLIENT_SPOTLIGHT_STYLES[i]}>
              <div className="flex flex-col gap-1">
                <h5 className="text-base font-semibold leading-tight">{client.name}</h5>
                <Badge variant="success" className="w-fit rounded-sm text-xs">
                  <TrendingUp className="size-3" aria-hidden="true"/>
                  {client.badge}
                </Badge>
              </div>
              <div className={cn('grid size-12 shrink-0 place-content-center rounded-xl', client.iconBg)}>
                <client.Icon className={cn('size-6', client.iconColor)} aria-hidden="true"/>
              </div>
            </div>))}
        </div>

        <div className="flex flex-col gap-4 px-6">
          <h5 className="text-2xl font-semibold">Client Spotlight</h5>
          <p className="text-lg text-muted-foreground">Live performance cards for every client: revenue trend, ROI, and campaign health at a glance.</p>
        </div>
      </div>
    </FadeIn>);
}
export function FeaturesBentoLiveActivityCard() {
    return (<FadeIn>
      <div className="flex flex-col gap-6 rounded-xl border bg-card py-6 shadow-none">
        <div className="overflow-hidden px-2 py-1">
          <div className="flex w-max gap-2" style={MARQUEE_STYLE}>
            {ACTIVITY_ITEMS.map((item) => (<FeaturesBentoActivityItem key={`first-${item.name}`} item={item}/>))}
            {ACTIVITY_ITEMS.map((item) => (<FeaturesBentoActivityItem key={`second-${item.name}`} item={item}/>))}
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6">
          <h5 className="text-2xl font-semibold">Live Activity</h5>
          <p className="text-lg text-muted-foreground">Track proposals sent, meeting notes ready, and campaign alerts as they happen, no more status chasing.</p>
        </div>
      </div>
    </FadeIn>);
}
