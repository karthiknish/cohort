/**
 * Chart image generator using QuickChart API.
 *
 * Native PPTX charts (pptxgenjs addChart) have rendering issues across
 * different PowerPoint viewers — bars/lines can appear empty even when
 * the XML contains valid data. This module renders charts as PNG images
 * via the QuickChart API (Chart.js under the hood) and returns base64
 * data ready for `slide.addImage({ data })`.
 *
 * This guarantees charts render identically in every viewer.
 */

const QUICKCHART_URL = 'https://quickchart.io/chart';

export interface ChartImageOptions {
    width?: number;
    height?: number;
    backgroundColor?: string;
}

/**
 * Fetch a bar chart as a base64-encoded PNG image.
 */
export async function renderBarChart(
    labels: string[],
    datasets: { label: string; data: number[]; color: string }[],
    options: ChartImageOptions & {
        horizontal?: boolean;
        title?: string;
        valueFormat?: string;
    } = {},
): Promise<string | null> {
    const { width = 800, height = 500, backgroundColor = 'white', horizontal, title, valueFormat } = options;

    const config: Record<string, unknown> = {
        type: horizontal ? 'bar' : 'bar',
        data: {
            labels,
            datasets: datasets.map((ds) => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: ds.color,
                borderColor: ds.color,
                borderWidth: 0,
                borderRadius: 4,
            })),
        },
        options: {
            indexAxis: horizontal ? 'y' : 'x',
            responsive: false,
            maintainAspectRatio: false,
            layout: { padding: { top: 20, right: 20, bottom: 10, left: 10 } },
            plugins: {
                legend: { display: datasets.length > 1, position: 'top', labels: { color: '#0F172A', font: { size: 13, family: 'Segoe UI' } } },
                title: title ? { display: true, text: title, color: '#0F172A', font: { size: 16, family: 'Segoe UI', weight: 'bold' } } : undefined,
                datalabels: {
                    display: true,
                    color: '#0F172A',
                    font: { size: 12, family: 'Segoe UI' },
                    anchor: horizontal ? 'start' : 'end',
                    align: horizontal ? 'right' : 'top',
                    formatter: (value: number) => valueFormat ? formatValue(value, valueFormat) : String(value),
                },
            },
            scales: {
                x: {
                    grid: { color: horizontal ? '#E2E8F0' : 'transparent', drawBorder: false },
                    ticks: { color: '#0F172A', font: { size: 11, family: 'Segoe UI' } },
                    beginAtZero: true,
                },
                y: {
                    grid: { color: horizontal ? 'transparent' : '#E2E8F0', drawBorder: false },
                    ticks: { color: horizontal ? '#0F172A' : '#64748B', font: { size: 10, family: 'Segoe UI' } },
                    beginAtZero: true,
                },
            },
        },
    };

    return fetchChartImage(config, width, height, backgroundColor);
}

/**
 * Fetch a line chart as a base64-encoded PNG image.
 */
export async function renderLineChart(
    labels: string[],
    datasets: { label: string; data: number[]; color: string }[],
    options: ChartImageOptions & {
        title?: string;
        valueFormat?: string;
        smooth?: boolean;
    } = {},
): Promise<string | null> {
    const { width = 800, height = 500, backgroundColor = 'white', title, valueFormat, smooth } = options;

    const config: Record<string, unknown> = {
        type: 'line',
        data: {
            labels,
            datasets: datasets.map((ds) => ({
                label: ds.label,
                data: ds.data,
                borderColor: ds.color,
                backgroundColor: ds.color + '20',
                borderWidth: 3,
                tension: smooth ? 0.4 : 0,
                pointRadius: 5,
                pointBackgroundColor: ds.color,
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                fill: false,
            })),
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            layout: { padding: { top: 20, right: 20, bottom: 10, left: 10 } },
            plugins: {
                legend: { display: datasets.length > 1, position: 'top', labels: { color: '#0F172A', font: { size: 13, family: 'Segoe UI' } } },
                title: title ? { display: true, text: title, color: '#0F172A', font: { size: 16, family: 'Segoe UI', weight: 'bold' } } : undefined,
                datalabels: {
                    display: true,
                    color: '#0F172A',
                    font: { size: 12, family: 'Segoe UI' },
                    align: 'top',
                    formatter: (value: number) => valueFormat ? formatValue(value, valueFormat) : String(value),
                },
            },
            scales: {
                x: {
                    grid: { color: 'transparent', drawBorder: false },
                    ticks: { color: '#0F172A', font: { size: 11, family: 'Segoe UI' } },
                },
                y: {
                    grid: { color: '#E2E8F0', drawBorder: false },
                    ticks: { color: '#64748B', font: { size: 10, family: 'Segoe UI' } },
                    beginAtZero: true,
                },
            },
        },
    };

    return fetchChartImage(config, width, height, backgroundColor);
}

/**
 * Fetch a doughnut chart as a base64-encoded PNG image.
 */
export async function renderDoughnutChart(
    labels: string[],
    data: number[],
    colors: string[],
    options: ChartImageOptions & { title?: string } = {},
): Promise<string | null> {
    const { width = 600, height = 500, backgroundColor = 'white', title } = options;

    const config: Record<string, unknown> = {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#FFFFFF',
            }],
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            layout: { padding: 20 },
            plugins: {
                legend: { display: true, position: 'right', labels: { color: '#0F172A', font: { size: 12, family: 'Segoe UI' }, padding: 15 } },
                title: title ? { display: true, text: title, color: '#0F172A', font: { size: 16, family: 'Segoe UI', weight: 'bold' } } : undefined,
                datalabels: {
                    display: true,
                    color: '#FFFFFF',
                    font: { size: 13, family: 'Segoe UI', weight: 'bold' },
                    formatter: (value: number, ctx: { chart: { data: { datasets: { data: number[] }[] } } }) => {
                        const total = ctx.chart.data.datasets[0]!.data.reduce((a, b) => a + b, 0);
                        const pct = Math.round((value / total) * 100);
                        return pct + '%';
                    },
                },
            },
        },
    };

    return fetchChartImage(config, width, height, backgroundColor);
}

// ─── Internal helpers ─────────────────────────────────────────────

function formatValue(value: number, format: string): string {
    if (format.includes('£')) {
        return '£' + value.toLocaleString('en-GB');
    }
    if (format.includes('%')) {
        return value + '%';
    }
    return value.toLocaleString('en-GB');
}

async function fetchChartImage(
    config: Record<string, unknown>,
    width: number,
    height: number,
    backgroundColor: string,
): Promise<string | null> {
    try {
        const params = new URLSearchParams();
        params.set('c', JSON.stringify(config));
        params.set('w', String(width));
        params.set('h', String(height));
        params.set('backgroundColor', backgroundColor);
        params.set('devicePixelRatio', '2');

        const url = `${QUICKCHART_URL}?${params.toString()}`;
        const resp = await fetch(url);

        if (!resp.ok) {
            console.warn(`[QuickChart] Failed: ${resp.status} ${resp.statusText}`);
            return null;
        }

        const arrayBuffer = await resp.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < buffer.length; i += chunkSize) {
            const chunk = buffer.subarray(i, Math.min(i + chunkSize, buffer.length));
            binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        return `image/png;base64,${btoa(binary)}`;
    } catch (err) {
        console.warn('[QuickChart] Error:', err);
        return null;
    }
}
