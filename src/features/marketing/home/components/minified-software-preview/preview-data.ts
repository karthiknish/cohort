import type { NoteStatus, OverviewMetric, PreviewTone } from './types';
export const OVERVIEW_METRICS: readonly OverviewMetric[] = [
    {
        id: 'delivery',
        label: 'Delivery',
        value: '86%',
        delta: '+8%',
        tone: 'success',
        chartLabel: 'Delivery velocity',
        bars: [
            { id: 'b1', h: 'h-[38%]' },
            { id: 'b2', h: 'h-[52%]' },
            { id: 'b3', h: 'h-[46%]' },
            { id: 'b4', h: 'h-[68%]', accent: true },
            { id: 'b5', h: 'h-[58%]' },
            { id: 'b6', h: 'h-[72%]' },
            { id: 'b7', h: 'h-[62%]' },
        ],
    },
    {
        id: 'revenue',
        label: 'Revenue risk',
        value: '$18k',
        delta: '-3%',
        tone: 'warning',
        chartLabel: 'Revenue at risk',
        bars: [
            { id: 'b1', h: 'h-[58%]' },
            { id: 'b2', h: 'h-[52%]' },
            { id: 'b3', h: 'h-[63%]', accent: true },
            { id: 'b4', h: 'h-[48%]' },
            { id: 'b5', h: 'h-[54%]' },
            { id: 'b6', h: 'h-[46%]' },
            { id: 'b7', h: 'h-[41%]' },
        ],
    },
    {
        id: 'meetings',
        label: 'Meetings',
        value: '12',
        delta: 'Today',
        tone: 'info',
        chartLabel: 'Meeting load',
        bars: [
            { id: 'b1', h: 'h-[31%]' },
            { id: 'b2', h: 'h-[44%]' },
            { id: 'b3', h: 'h-[57%]' },
            { id: 'b4', h: 'h-[69%]', accent: true },
            { id: 'b5', h: 'h-[66%]' },
            { id: 'b6', h: 'h-[38%]' },
            { id: 'b7', h: 'h-[29%]' },
        ],
    },
];
export const INITIAL_OVERVIEW_METRIC_ID = OVERVIEW_METRICS[0]!.id;
export const PROPOSAL_STAGES: readonly {
    id: string;
    label: string;
    count: number;
    tone: PreviewTone;
}[] = [
    { id: 's1', label: 'Draft', count: 3, tone: 'info' },
    { id: 's2', label: 'Review', count: 2, tone: 'warning' },
    { id: 's3', label: 'Sent', count: 4, tone: 'accent' },
    { id: 's4', label: 'Accepted', count: 3, tone: 'success' },
];
export const PROPOSALS: readonly {
    id: string;
    title: string;
    stage: string;
    tone: PreviewTone;
    value: string;
}[] = [
    { id: 'p1', title: 'Apex Technologies Q3 pitch', stage: 'Sent', tone: 'accent', value: '$14.5K' },
    { id: 'p2', title: 'BlueOrbit brand refresh', stage: 'Review', tone: 'warning', value: '$8.2K' },
    { id: 'p3', title: 'Meridian Health retainer', stage: 'Accepted', tone: 'success', value: '$22K' },
];
export const CLIENT_ACCOUNTS: readonly {
    id: string;
    initials: string;
    name: string;
    tag: string;
    health: number;
    revenue: string;
    tone: PreviewTone;
    color: string;
}[] = [
    {
        id: 'c1',
        initials: 'NT',
        name: 'NovaTech Digital',
        tag: 'SaaS',
        health: 94,
        revenue: '$12.4K',
        tone: 'success',
        color: 'bg-primary',
    },
    {
        id: 'c2',
        initials: 'BO',
        name: 'BlueOrbit Media',
        tag: 'E-commerce',
        health: 71,
        revenue: '$8.6K',
        tone: 'accent',
        color: 'bg-info',
    },
    {
        id: 'c3',
        initials: 'MH',
        name: 'Meridian Health',
        tag: 'Healthcare',
        health: 52,
        revenue: '$9.1K',
        tone: 'warning',
        color: 'bg-success',
    },
];
export const MEETING_ITEMS: readonly {
    id: string;
    timeHour: string;
    timeAmPm: string;
    title: string;
    attendees: readonly string[];
    type: string;
    tone: PreviewTone;
    note: string;
    noteStatus: NoteStatus;
}[] = [
    {
        id: 'm1',
        timeHour: '10:00',
        timeAmPm: 'AM',
        title: 'Apex Q3 kickoff',
        attendees: ['JL', 'SR', 'KP'],
        type: 'Kickoff',
        tone: 'accent',
        note: 'Brief ready',
        noteStatus: 'ready',
    },
    {
        id: 'm2',
        timeHour: '2:00',
        timeAmPm: 'PM',
        title: 'BlueOrbit weekly review',
        attendees: ['MA', 'DW', 'JL'],
        type: 'Review',
        tone: 'info',
        note: 'In progress',
        noteStatus: 'active',
    },
    {
        id: 'm3',
        timeHour: '4:30',
        timeAmPm: 'PM',
        title: 'Internal standup',
        attendees: ['SR', 'KP', 'MA', 'DW'],
        type: 'Internal',
        tone: 'info',
        note: 'Upcoming',
        noteStatus: 'upcoming',
    },
];
export const AGENT_FLOWS: readonly {
    id: string;
    label: string;
    status: string;
    tone: PreviewTone;
}[] = [
    { id: 'f1', label: 'Client follow-up sequences', status: 'Running', tone: 'success' },
    { id: 'f2', label: 'Proposal nudges & reminders', status: 'Running', tone: 'success' },
    { id: 'f3', label: 'Budget anomaly detection', status: 'Active', tone: 'accent' },
    { id: 'f4', label: 'Meeting recap publisher', status: 'Queued', tone: 'info' },
];
export const AGENT_RECENT: readonly {
    id: string;
    text: string;
    time: string;
    tone: PreviewTone;
}[] = [
    { id: 'r1', text: 'NovaTech follow-up drafted & queued', time: '1 min ago', tone: 'success' },
    { id: 'r2', text: 'LinkedIn spend anomaly flagged (+18%)', time: '6 min ago', tone: 'warning' },
    { id: 'r3', text: 'BlueOrbit meeting recap published', time: '10 min ago', tone: 'accent' },
];
