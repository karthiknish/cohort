/**
 * Brand marks via `react-icons/si` (Simple Icons pack bundled with react-icons).
 * @see https://react-icons.github.io/react-icons/icons/si/
 */
import type { IconType } from 'react-icons'
import { SiGoogleads, SiLinkedin, SiMeta, SiStripe, SiTiktok } from 'react-icons/si'

import { cn } from '@/lib/utils'

export type PlatformBrandSlug = 'googleads' | 'meta' | 'linkedin' | 'tiktok' | 'stripe'

const ICONS: Record<PlatformBrandSlug, IconType> = {
  googleads: SiGoogleads,
  meta: SiMeta,
  linkedin: SiLinkedin,
  tiktok: SiTiktok,
  stripe: SiStripe,
}

const TITLES: Record<PlatformBrandSlug, string> = {
  googleads: 'Google Ads',
  meta: 'Meta',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  stripe: 'Stripe',
}

export const HOME_HERO_BRAND_ORDER: PlatformBrandSlug[] = ['googleads', 'meta', 'linkedin', 'tiktok', 'stripe']

type PlatformBrandLogoProps = {
  brand: PlatformBrandSlug
  className?: string
  /** When false, mark decorative (parent supplies visible label). Default true. */
  labeled?: boolean
}

export function PlatformBrandLogo({ brand, className, labeled = true }: PlatformBrandLogoProps) {
  const Icon = ICONS[brand]
  return (
    <Icon
      className={cn('shrink-0', className)}
      aria-label={labeled ? TITLES[brand] : undefined}
      aria-hidden={labeled ? undefined : true}
      role={labeled ? 'img' : undefined}
    />
  )
}

type PlatformLogoStripProps = {
  brands: PlatformBrandSlug[]
  className?: string
  /** Pill around each logo (e.g. on hero). */
  variant?: 'plain' | 'pill'
}

export function PlatformLogoStrip({ brands, className, variant = 'plain' }: PlatformLogoStripProps) {
  return (
    <ul className={cn('flex flex-wrap items-center justify-center gap-2 sm:gap-3', className)}>
      {brands.map((slug) => (
        <li key={slug}>
          {variant === 'pill' ? (
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-card/95 shadow-md shadow-foreground/10 ring-1 ring-border/60">
              <PlatformBrandLogo brand={slug} className="h-6 w-6" labeled />
            </span>
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 ring-1 ring-border/60">
              <PlatformBrandLogo brand={slug} className="h-5 w-5" labeled />
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
