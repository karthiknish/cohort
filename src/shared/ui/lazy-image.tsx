'use client';
import Image, { type ImageProps } from '@/shared/ui/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { interactiveTransitionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
type LazyImageProps = Omit<ImageProps, 'alt' | 'src' | 'fill' | 'loading'> & {
    src: ImageProps['src'] | Blob;
    alt?: string;
};
export function LazyImage({ src, alt = '', className, onLoad, onError, ...rest }: LazyImageProps) {
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
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
    const resolvedSrc = src instanceof Blob ? objectUrl : src;
    const isLoaded = typeof resolvedSrc === 'string' && loadedSrc === resolvedSrc;
    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        if (typeof resolvedSrc === 'string') {
            setLoadedSrc(resolvedSrc);
        }
        onLoad?.(event);
    };
    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
        onError?.(event);
    };
    if (!resolvedSrc) {
        return null;
    }
    return (<Image src={resolvedSrc} alt={alt} fill sizes={rest.sizes ?? '100vw'} loading="lazy" className={cn(interactiveTransitionClass, isLoaded ? 'opacity-100' : 'opacity-0', className)} onLoad={handleLoad} onError={handleError} {...rest}/>);
}
