import type { LucideIcon } from 'lucide-react';
export type PreviewTone = 'success' | 'warning' | 'info' | 'accent';
export type PreviewTabId = 'overview' | 'proposals' | 'clients' | 'meetings' | 'agent';
export type PreviewTab = {
    id: PreviewTabId;
    Icon: LucideIcon;
    label: string;
    eyebrow: string;
    status: string;
    agentItems: readonly {
        id: string;
        text: string;
        time: string;
    }[];
};
export type BarDatum = {
    id: string;
    h: string;
    accent?: boolean;
};
export type OverviewMetric = {
    id: string;
    label: string;
    value: string;
    delta: string;
    tone: PreviewTone;
    chartLabel: string;
    bars: readonly BarDatum[];
};
export type NoteStatus = 'ready' | 'active' | 'upcoming';
