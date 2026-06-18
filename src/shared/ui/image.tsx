/**
 * Unoptimized `<img>` replacement for `next/image`.
 *
 * Image optimization is intentionally dropped during the TanStack Start
 * migration; a CDN/`@unpic/react` pass can reintroduce it later if needed.
 * Supports the Next.js `Image` props actually used in this codebase:
 * `src`, `alt`, `width`, `height`, `fill`, `sizes`, `priority`, `className`,
 * `style`, `onError`, `onLoad`, plus standard `<img>` attributes.
 */
import type { CSSProperties, ImgHTMLAttributes } from 'react'

export type ImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'width' | 'height'
> & {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  fill?: boolean
  sizes?: string
  priority?: boolean
  quality?: number
  placeholder?: 'empty' | 'blur' | 'data-url'
  blurDataURL?: string
  unoptimized?: boolean
  loader?: () => string
  draggable?: boolean
}

export function Image({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  priority,
  quality: _quality,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  unoptimized: _unoptimized,
  loader: _loader,
  style,
  loading,
  ...rest
}: ImageProps) {
  const computedStyle: CSSProperties = fill
    ? {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }
    : { ...style }

  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      loading={priority ? 'eager' : (loading ?? 'lazy')}
      // @ts-expect-error fetchPriority is valid on HTMLImageElement but not in React's TS types
      fetchpriority={priority ? 'high' : undefined}
      style={computedStyle}
      {...rest}
    />
  )
}

export default Image
