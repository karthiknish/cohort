import { BarChart2, Bot, BriefcaseBusiness, Globe, LayoutDashboard, Mic2, Sparkles, TrendingDown, TrendingUp, Users, Zap, type LucideProps, } from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';
import type { PlatformBrandSlug } from '@/features/marketing/home/components/platform-brand-logos';
type IconType = ComponentType<LucideProps>;
export const PLATFORM_BARS: readonly {
    label: string;
    slug: PlatformBrandSlug;
    pct: number;
    value: string;
    dir: number;
}[] = [
    { label: 'Meta', slug: 'meta', pct: 52, value: '1.25M', dir: 1 },
    { label: 'Google Ads', slug: 'googleads', pct: 31, value: '744K', dir: 1 },
    { label: 'LinkedIn', slug: 'linkedin', pct: 17, value: '408K', dir: 1 },
] as const;
export const SEGMENT_BADGES = [
    { Icon: Globe as IconType, label: 'E-commerce', rotation: '-rotate-5', pos: 'absolute top-8 left-12' },
    { Icon: Bot as IconType, label: 'SaaS', rotation: 'rotate-5', pos: 'absolute bottom-10 left-8' },
    { Icon: BriefcaseBusiness as IconType, label: 'Finance', rotation: '-rotate-10', pos: 'absolute top-8 right-4' },
    { Icon: Zap as IconType, label: 'Healthcare', rotation: 'rotate-10', pos: 'absolute right-10 bottom-10' },
] as const;
export const PLATFORM_STATS = [
    { Icon: LayoutDashboard as IconType, label: 'Active Campaigns', value: '47' },
    { Icon: Users as IconType, label: 'Active Clients', value: '23' },
    { Icon: Sparkles as IconType, label: 'AI Proposals', value: '312' },
] as const;
export const CLIENT_SPOTLIGHT = [
    { name: 'NovaTech Digital', badge: '+12.4%', Icon: LayoutDashboard as IconType, iconBg: 'bg-accent/10', iconColor: 'text-primary' },
    { name: 'BlueOrbit', badge: '+5.6%', Icon: Globe as IconType, iconBg: 'bg-secondary/50', iconColor: 'text-secondary-foreground' },
    { name: 'Meridian Health', badge: '+10.2%', Icon: Sparkles as IconType, iconBg: 'bg-accent/5', iconColor: 'text-primary' },
] as const;
export const CLIENT_SPOTLIGHT_STYLES: readonly CSSProperties[] = [
    { transformOrigin: 'center bottom', transform: 'translateX(-50%) scale(1)', bottom: 16, opacity: 1, zIndex: 3 },
    { transformOrigin: 'center bottom', transform: 'translateX(-50%) scale(0.9)', bottom: 8, opacity: 0.75, zIndex: 2 },
    { transformOrigin: 'center bottom', transform: 'translateX(-50%) scale(0.8)', bottom: 0, opacity: 0.5, zIndex: 1 },
];
export const ACTIVITY_ITEMS: {
    Icon: IconType;
    name: string;
    detail: string;
    value: string;
    positive: boolean;
}[] = [
    { Icon: Sparkles, name: 'Proposal Sent', detail: 'NovaTech', value: '$8.5K', positive: true },
    { Icon: Mic2, name: 'Meeting Notes', detail: 'BlueOrbit', value: 'Ready', positive: true },
    { Icon: TrendingUp, name: 'CTR Spike', detail: 'Zentry Ads', value: '+24%', positive: true },
    { Icon: Bot, name: 'AI Draft', detail: 'Meridian', value: 'New', positive: false },
    { Icon: BarChart2, name: 'Report Ready', detail: 'NovaTech', value: 'Jul', positive: false },
    { Icon: TrendingDown, name: 'CPC Alert', detail: 'BlueOrbit', value: 'Check', positive: false },
];
export const CHART_POINTS = [
    { x: 50, barH: 40, lineY: 87, label: 'Mon' },
    { x: 118, barH: 68, lineY: 59, label: 'Tue' },
    { x: 186, barH: 52, lineY: 75, label: 'Wed' },
    { x: 254, barH: 88, lineY: 39, label: 'Thu' },
    { x: 322, barH: 76, lineY: 51, label: 'Fri' },
] as const;
export const MARQUEE_STYLE: CSSProperties = {
    animation: 'marquee-x 28s linear infinite',
    animationDirection: 'reverse',
};
export const BADGE_BOB_STYLE: CSSProperties = { animation: 'badge-bob 3s ease-in-out infinite alternate' };
export const PLATFORM_BAR_HEIGHT_STYLES: readonly CSSProperties[] = [
    { height: '52%' },
    { height: '31%' },
    { height: '17%' },
];
