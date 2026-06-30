'use client';
import type { ReactNode } from 'react';
import { ContentRevealBoundary } from '@/shared/ui/content-reveal-boundary';
type PageSkeletonBoundaryProps = {
    loading: boolean;
    loadingContent?: ReactNode;
    children: ReactNode;
    className?: string;
};
/**
 * Shows layout-matched skeleton UI while loading, then reveals page content.
 */
export function PageSkeletonBoundary({ loading, loadingContent, children, className, }: PageSkeletonBoundaryProps) {
    if (loading) {
        return loadingContent ?? null;
    }
    return <ContentRevealBoundary ready className={className}>{children}</ContentRevealBoundary>;
}
