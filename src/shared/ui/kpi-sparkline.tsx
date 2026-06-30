'use client';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface KpiSparklineProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
    className?: string;
}

/**
 * Lightweight inline SVG sparkline for KPI cards.
 * Renders a smooth area + line path without chart library overhead.
 */
export function KpiSparkline({ data, color = 'var(--kpi-accent, var(--primary))', width = 120, height = 36, className }: KpiSparklineProps) {
    const { linePath, areaPath, gradientId } = useMemo(() => {
        if (!data || data.length < 2) {
            return { linePath: '', areaPath: '', gradientId: '' };
        }
        const id = `kpi-spark-${Math.random().toString(36).slice(2, 9)}`;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const stepX = width / (data.length - 1);
        const points = data.map((v, i) => {
            const x = i * stepX;
            const y = height - ((v - min) / range) * (height - 4) - 2;
            return { x, y };
        });
        // Build smooth path using simple line segments (keeps it lightweight)
        const line = points
            .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
            .join(' ');
        const area = `${line} L ${width} ${height} L 0 ${height} Z`;
        return { linePath: line, areaPath: area, gradientId: id };
    }, [data, width, height]);

    if (!data || data.length < 2) {
        return <div className={cn('shrink-0', className)} style={{ width, height }} />;
    }

    return (
        <div className={cn('shrink-0', className)} style={{ width, height }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <path d={areaPath} fill={`url(#${gradientId})`} />
                <path d={linePath} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
        </div>
    );
}
