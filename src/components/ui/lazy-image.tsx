'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type LazyImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  rootMargin?: string
}

export function LazyImage({ src, alt = '', className, rootMargin = '200px', onLoad, onError, ...rest }: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    setIsVisible(false)
    setIsLoaded(false)
  }, [src])

  useEffect(() => {
    const node = imgRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [rootMargin])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={isVisible ? src : undefined}
      alt={alt}
      className={cn('transition-opacity duration-300 ease-out', isLoaded ? 'opacity-100' : 'opacity-0', className)}
      loading="lazy"
      decoding="async"
      onLoad={(event) => {
        setIsLoaded(true)
        onLoad?.(event)
      }}
      onError={(event) => {
        onError?.(event)
      }}
      {...rest}
    />
  )
}
