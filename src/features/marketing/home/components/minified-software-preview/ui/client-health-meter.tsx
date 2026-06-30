'use client';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
export function ClientHealthMeter({ health }: {
    health: number;
}) {
    const widthStyle = ({ width: `${health}%` });
    const toneClass = health >= 80 ? 'bg-success' : health >= 60 ? 'bg-accent' : 'bg-warning';
    return <div className={cn('h-full rounded-full transition-[width]', toneClass)} style={widthStyle}/>;
}
