import { SvglBrandLogo, type SvglBrandSlug } from '@/shared/components/svgl-brand-logo';
import { cn } from '@/lib/utils';
/** Paid-media brands shown on marketing surfaces (logos from https://svgl.app). */
export type PlatformBrandSlug = 'googleads' | 'meta' | 'linkedin' | 'tiktok';
const SLUG_TO_SVGL: Record<PlatformBrandSlug, SvglBrandSlug> = {
    googleads: 'googleads',
    meta: 'meta',
    linkedin: 'linkedin',
    tiktok: 'tiktok',
};
export const HOME_HERO_BRAND_ORDER: PlatformBrandSlug[] = ['googleads', 'meta', 'linkedin', 'tiktok'];
type PlatformBrandLogoProps = {
    brand: PlatformBrandSlug;
    className?: string;
    /** When false, mark decorative (parent supplies visible label). Default true. */
    labeled?: boolean;
};
export function PlatformBrandLogo({ brand, className, labeled = true }: PlatformBrandLogoProps) {
    return <SvglBrandLogo brand={SLUG_TO_SVGL[brand]} className={className} labeled={labeled}/>;
}
type PlatformLogoStripProps = {
    brands: PlatformBrandSlug[];
    className?: string;
    /** Pill around each logo (e.g. on hero). */
    variant?: 'plain' | 'pill';
};
export function PlatformLogoStrip({ brands, className, variant = 'plain' }: PlatformLogoStripProps) {
    return (<ul className={cn('flex flex-wrap items-center justify-center gap-2 sm:gap-3', className)}>
      {brands.map((slug) => (<li key={slug}>
          {variant === 'pill' ? (<span className="flex size-11 items-center justify-center rounded-xl bg-card/95 shadow-md shadow-foreground/10 ring-1 ring-border/60">
              <PlatformBrandLogo brand={slug} className="size-6" labeled/>
            </span>) : (<span className="flex size-9 items-center justify-center rounded-lg bg-background/80 ring-1 ring-border/60">
              <PlatformBrandLogo brand={slug} className="size-5" labeled/>
            </span>)}
        </li>))}
    </ul>);
}
