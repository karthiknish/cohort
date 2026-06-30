'use client';
import { useCallback, useMemo, useState, type ComponentType } from 'react';
import { getPublicAssetUrl } from '@/lib/public-assets';
import { cn } from '@/lib/utils';
/** Brand slugs mapped to logos from https://svgl.app (stored under /public/svgl). */
export type SvglBrandSlug = 'google' | 'googleads' | 'meta' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'twitter' | 'x' | 'youtube' | 'excel' | 'pdf';
const BRAND_TITLES: Record<SvglBrandSlug, string> = {
    google: 'Google',
    googleads: 'Google Ads',
    meta: 'Meta',
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    twitter: 'Twitter',
    x: 'X',
    youtube: 'YouTube',
    excel: 'Microsoft Excel',
    pdf: 'PDF',
};
const BRAND_SRC: Record<Exclude<SvglBrandSlug, 'tiktok' | 'x'>, string> = {
    google: '/svgl/google.svg',
    googleads: '/svgl/google.svg',
    meta: '/svgl/meta.svg',
    facebook: '/svgl/facebook-icon.svg',
    instagram: '/svgl/instagram-icon.svg',
    linkedin: '/svgl/linkedin.svg',
    twitter: '/svgl/twitter.svg',
    youtube: '/svgl/youtube.svg',
    excel: '/svgl/microsoft-excel.svg',
    pdf: '/svgl/pdf.svg',
};
function BrandImage({ src, className, labeled, title, }: {
    src: string;
    className?: string;
    labeled: boolean;
    title: string;
}) {
    const resolvedSrc = getPublicAssetUrl(src);
    const [failed, setFailed] = useState(false);
    const handleError = () => {
        setFailed(true);
    };
    if (failed) {
        return (<span className={cn('inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold uppercase text-muted-foreground', className)} aria-hidden={labeled ? undefined : true} role={labeled ? 'img' : undefined} aria-label={labeled ? title : undefined} title={title}>
        {title.charAt(0)}
      </span>);
    }
    return (
    // eslint-disable-next-line @next/next/no-img-element -- local SVGL assets; absolute URLs avoid wrong OAuth origins
    <img src={resolvedSrc} alt={labeled ? title : ''} width={24} height={24} loading="lazy" decoding="async" className={cn('inline-block size-6 shrink-0 object-contain', className)} aria-hidden={labeled ? undefined : true} role={labeled ? 'img' : undefined} aria-label={labeled ? title : undefined} onError={handleError}/>);
}
function ThemeBrandLogo({ brand, className, labeled, title, }: {
    brand: 'tiktok' | 'x';
    className?: string;
    labeled: boolean;
    title: string;
}) {
    const lightSrc = brand === 'tiktok' ? '/svgl/tiktok-light.svg' : '/svgl/x-light.svg';
    return <BrandImage src={lightSrc} className={className} labeled={labeled} title={title}/>;
}
type SvglBrandLogoProps = {
    brand: SvglBrandSlug;
    className?: string;
    /** When false, mark decorative (parent supplies visible label). Default true. */
    labeled?: boolean;
};
export function SvglBrandLogo({ brand, className, labeled = true }: SvglBrandLogoProps) {
    const title = BRAND_TITLES[brand];
    if (brand === 'tiktok' || brand === 'x') {
        return <ThemeBrandLogo brand={brand} className={className} labeled={labeled} title={title}/>;
    }
    return <BrandImage src={BRAND_SRC[brand]} className={className} labeled={labeled} title={title}/>;
}
/** Lucide-compatible icon wrapper for provider maps and panels. */
export function createSvglBrandIcon(brand: SvglBrandSlug): ComponentType<{
    className?: string;
}> {
    function BrandIcon({ className }: {
        className?: string;
    }) {
        return <SvglBrandLogo brand={brand} className={className} labeled={false}/>;
    }
    BrandIcon.displayName = `SvglBrandIcon(${brand})`;
    return BrandIcon;
}
export const SvglExcelIcon = createSvglBrandIcon('excel');
export const SvglPdfIcon = createSvglBrandIcon('pdf');
