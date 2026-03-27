'use client'

import Image, { type ImageProps } from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

type LazyImageProps = Omit<ImageProps, 'alt' | 'src' | 'fill' | 'loading'> & {
  src: ImageProps['src'] | Blob
  alt?: string
}

export function LazyImage({ src, alt = '', className, onLoad, onError, ...rest }: LazyImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

  const objectUrl = useMemo(() => {
    if (src instanceof Blob) {
      return URL.createObjectURL(src)
    }

    return null
  }, [src])

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  const resolvedSrc = src instanceof Blob ? objectUrl : src
  const isLoaded = typeof resolvedSrc === 'string' && loadedSrc === resolvedSrc

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (typeof resolvedSrc === 'string') {
        setLoadedSrc(resolvedSrc)
      }
      onLoad?.(event)
    },
    [onLoad, resolvedSrc],
  )

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      onError?.(event)
    },
    [onError],
  )

  if (!resolvedSrc) {
    return null
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      sizes={rest.sizes ?? '100vw'}
      loading="lazy"
      className={cn(
        'transition-opacity duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      {...rest}
    />
  )
}
