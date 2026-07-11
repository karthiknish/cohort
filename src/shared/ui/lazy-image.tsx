'use client';
import Image, { type ImageProps } from '@/shared/ui/image';
import { useEffect, useState } from 'react';
import { interactiveTransitionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
type LazyImageProps = Omit<ImageProps, 'alt' | 'src' | 'fill' | 'loading'> & {
    src: ImageProps['src'] | Blob;
    alt?: string;
    /** Fallback content to show when the image fails to load */
    fallback?: React.ReactNode;
};
export function LazyImage({ src, alt = '', className, onLoad, onError, fallback, ...rest }: LazyImageProps) {
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const objectUrl = (() => {
        if (src instanceof Blob) {
            return URL.createObjectURL(src);
        }
        return null;
    })();
    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);
    useEffect(() => {
        setHasError(false);
    }, [src]);
    const resolvedSrc = src instanceof Blob ? objectUrl : src;
    const isLoaded = typeof resolvedSrc === 'string' && loadedSrc === resolvedSrc;
    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        if (typeof resolvedSrc === 'string') {
            setLoadedSrc(resolvedSrc);
        }
        setHasError(false);
        onLoad?.(event);
    };
    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
        setHasError(true);
        onError?.(event);
    };
    if (!resolvedSrc || hasError) {
        if (fallback) {
            return <>{fallback}</>;
        }
        return null;
    }
    return (<Image src={resolvedSrc} alt={alt} fill sizes={rest.sizes ?? '100vw'} loading="lazy" className={cn(interactiveTransitionClass, isLoaded ? 'opacity-100' : 'opacity-0', className)} onLoad={handleLoad} onError={handleError} {...rest}/>);
}
