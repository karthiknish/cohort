'use client';
import { useMemo } from 'react';
export function BouncingStatusDot({ style }: {
    style: {
        animationDelay: string;
    };
}) {
    const dotStyle = style;
    return (<span className="block size-1.5 animate-subtle-dot-drift rounded-full bg-accent" style={dotStyle}/>);
}
