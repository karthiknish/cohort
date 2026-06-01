'use client';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
/** Wordmark SVG (~4:1). Use height + w-auto, not square boxes. */
const LOGO_SIZES = {
    wordmark: { className: 'h-9 w-auto sm:h-11', width: 148, height: 40 },
    wordmarkLg: { className: 'h-11 w-auto sm:h-14', width: 188, height: 52 },
    wordmarkXl: { className: 'h-14 w-auto sm:h-16', width: 220, height: 64 },
} as const;
type SiteLogoSize = keyof typeof LOGO_SIZES;
type SiteLogoProps = {
    size?: SiteLogoSize;
    className?: string;
    /** When set, wraps the logo in a link. Omit for decorative-only usage. */
    href?: string;
};
export function SiteLogo({ size = 'wordmark', className, href }: SiteLogoProps) {
    const { className: sizeClass, width, height } = LOGO_SIZES[size];
    const image = (<Image src="/logo.svg" alt="Cohorts" width={width} height={height} className={cn('shrink-0 object-contain object-left', sizeClass, className)} priority/>);
    if (href === undefined || href === null || href === '') {
        return <span className="inline-flex shrink-0 items-center">{image}</span>;
    }
    return (<Link href={href} className="inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Cohorts home">
      {image}
    </Link>);
}
