export type DeltaTone = 'positive' | 'negative' | 'neutral';
export type MetricItem = {
    label: string;
    value: string;
    numericValue?: number;
    delta?: string | null;
    deltaTone?: DeltaTone;
    emphasis?: 'primary' | 'default';
};
export type ListItem = {
    primary: string;
    secondary?: string;
    href?: string | null;
    delta?: string | null;
    deltaTone?: DeltaTone;
    numericValue?: number;
};
export type AgentDataSection = {
    type: 'metrics';
    title: string;
    items: MetricItem[];
} | {
    type: 'list';
    title: string;
    items: ListItem[];
};
export type AgentChartPoint = {
    name: string;
    value: number;
    href?: string | null;
};
export type AgentChartSeries = {
    id: string;
    title: string;
    subtitle?: string;
    points: AgentChartPoint[];
    valueFormat: 'currency' | 'number' | 'percent';
    currencyCode?: string;
    layout: 'horizontal' | 'vertical';
};
