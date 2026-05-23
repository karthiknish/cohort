'use client'

import Image from 'next/image'
import type { ComponentType } from 'react'

import { cn } from '@/lib/utils'

/** Brand slugs mapped to logos from https://svgl.app (stored under /public/svgl). */
export type SvglBrandSlug =
  | 'google'
  | 'googleads'
  | 'meta'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'twitter'
  | 'x'
  | 'youtube'
  | 'excel'
  | 'pdf'

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
}

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
}

function BrandImage({
  src,
  className,
  labeled,
  title,
}: {
  src: string
  className?: string
  labeled: boolean
  title: string
}) {
  return (
    <Image
      src={src}
      alt={labeled ? title : ''}
      width={24}
      height={24}
      unoptimized
      className={cn('inline-block size-6 shrink-0 object-contain', className)}
      aria-hidden={labeled ? undefined : true}
      role={labeled ? 'img' : undefined}
      aria-label={labeled ? title : undefined}
    />
  )
}

function ThemeBrandLogo({
  brand,
  className,
  labeled,
  title,
}: {
  brand: 'tiktok' | 'x'
  className?: string
  labeled: boolean
  title: string
}) {
  const lightSrc = brand === 'tiktok' ? '/svgl/tiktok-light.svg' : '/svgl/x-light.svg'
  const darkSrc = brand === 'tiktok' ? '/svgl/tiktok-dark.svg' : '/svgl/x-dark.svg'
  return (
    <>
      <BrandImage src={lightSrc} className={cn(className, 'dark:hidden')} labeled={labeled} title={title} />
      <BrandImage src={darkSrc} className={cn(className, 'hidden dark:block')} labeled={labeled} title={title} />
    </>
  )
}

type SvglBrandLogoProps = {
  brand: SvglBrandSlug
  className?: string
  /** When false, mark decorative (parent supplies visible label). Default true. */
  labeled?: boolean
}

export function SvglBrandLogo({ brand, className, labeled = true }: SvglBrandLogoProps) {
  const title = BRAND_TITLES[brand]

  if (brand === 'tiktok' || brand === 'x') {
    return <ThemeBrandLogo brand={brand} className={className} labeled={labeled} title={title} />
  }

  return <BrandImage src={BRAND_SRC[brand]} className={className} labeled={labeled} title={title} />
}

/** Lucide-compatible icon wrapper for provider maps and panels. */
export function createSvglBrandIcon(brand: SvglBrandSlug): ComponentType<{ className?: string }> {
  function BrandIcon({ className }: { className?: string }) {
    return <SvglBrandLogo brand={brand} className={className} labeled={false} />
  }
  BrandIcon.displayName = `SvglBrandIcon(${brand})`
  return BrandIcon
}

export const SvglExcelIcon = createSvglBrandIcon('excel')
export const SvglPdfIcon = createSvglBrandIcon('pdf')
