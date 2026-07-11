'use client';
import { Download, Image as ImageIcon, LoaderCircle, ZoomIn } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
import { ImagePreviewModal } from './image-preview-modal';

interface ImageGalleryProps {
    images: Array<{
        url: string;
        name: string;
        size?: string;
    }>;
    className?: string;
    /** Flat mode removes card chrome for surfaces like the channel info dialog */
    flat?: boolean;
    /** Compact mode constrains image sizes for DM bubbles */
    compact?: boolean;
}

function PreviewTile({
    image,
    previewIndex,
    onPreview,
    className,
    aspectClassName = 'aspect-square',
    overlayCount,
    flat,
}: {
    image: ImageGalleryProps['images'][number];
    previewIndex: number;
    onPreview: (index: number) => void;
    className?: string;
    aspectClassName?: string;
    overlayCount?: number;
    flat?: boolean;
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        setIsLoading(true);
        setHasError(false);
        const img = imgRef.current;
        if (img && img.complete) {
            if (img.naturalWidth === 0) {
                setHasError(true);
            } else {
                setIsLoading(false);
            }
        }
    }, [image.url]);
    const handlePreview = (event: MouseEvent<HTMLButtonElement>) => {
        const index = Number(event.currentTarget.dataset.previewIndex);
        onPreview(index);
    };
    return (
        <button
            type="button"
            onClick={handlePreview}
            data-preview-index={previewIndex}
            className={cn(
                'group relative overflow-hidden rounded-lg text-left motion-chromatic',
                flat
                    ? 'border-0 bg-transparent'
                    : 'border border-muted/60 bg-muted/10 hover:border-muted',
                className,
            )}
            aria-label={`Preview image ${image.name}`}
        >
            <div className={cn('relative overflow-hidden', aspectClassName)}>
                <img
                    ref={imgRef}
                    src={image.url}
                    alt={image.name}
                    className={cn(
                        'size-full object-cover transition-transform duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none group-hover:scale-105',
                        isLoading && 'opacity-0',
                    )}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                    draggable={false}
                />
                {isLoading && !hasError ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/20">
                        <LoaderCircle className="size-5 animate-spin text-muted-foreground" aria-hidden />
                    </div>
                ) : null}
                {hasError ? (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-muted/30 text-muted-foreground">
                        <ImageIcon className="size-6" aria-hidden />
                        <span className="px-2 text-center text-[10px] leading-tight">{image.name}</span>
                    </div>
                ) : null}
                {!hasError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                        {typeof overlayCount === 'number' ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-bold text-viewer-chrome">
                                +{overlayCount}
                            </div>
                        ) : (
                            <div className="rounded-full bg-black/60 p-2 text-viewer-chrome opacity-0 transition-opacity group-hover:opacity-100">
                                <ZoomIn className="size-4" />
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </button>
    );
}

export function ImageGallery({ images, className, flat = false, compact = false }: ImageGalleryProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const handleImageClick = (index: number) => {
        setPreviewIndex(index);
        setPreviewOpen(true);
    };
    const handleClosePreview = () => {
        setPreviewOpen(false);
    };

    if (!images.length) return null;

    if (images.length === 1) {
        const image = images[0];
        if (!image) return null;
        return (
            <>
                <figure
                    className={cn(
                        'my-2 overflow-hidden rounded-lg',
                        compact ? 'w-full max-w-xs' : 'max-w-xl',
                        flat ? 'border-0 bg-transparent' : 'border border-muted/60 bg-muted/10',
                        className,
                    )}
                >
                    <PreviewTile
                        image={image}
                        previewIndex={0}
                        onPreview={handleImageClick}
                        aspectClassName="aspect-video max-h-96"
                        className="rounded-none border-0 bg-transparent"
                        flat={flat}
                    />
                    <figcaption
                        className={cn(
                            'flex items-center justify-between gap-3 p-3 text-xs text-muted-foreground',
                            flat ? 'border-t-0' : 'border-t border-muted/40',
                        )}
                    >
                        <div className="flex flex-1 items-center gap-2 truncate">
                            <ImageIcon className="size-4 shrink-0" />
                            <span className="truncate">{image.name}</span>
                            {image.size ? (
                                <span className="whitespace-nowrap text-muted-foreground/60">{image.size}</span>
                            ) : null}
                        </div>
                        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            <a href={image.url} download={image.name}>
                                <Download className="mr-1 size-3.5" />
                                Download
                            </a>
                        </Button>
                    </figcaption>
                </figure>
                <ImagePreviewModal
                    images={images}
                    initialIndex={previewIndex}
                    isOpen={previewOpen}
                    onClose={handleClosePreview}
                />
            </>
        );
    }

    const modal = (
        <ImagePreviewModal
            images={images}
            initialIndex={previewIndex}
            isOpen={previewOpen}
            onClose={handleClosePreview}
        />
    );

    if (images.length === 2) {
        return (
            <>
                <div className={cn('grid grid-cols-2 gap-2', compact ? 'w-full max-w-xs' : 'max-w-xl', className)}>
                    {images.map((image, index) => (
                        <PreviewTile
                            key={image.url}
                            image={image}
                            previewIndex={index}
                            onPreview={handleImageClick}
                            flat={flat}
                        />
                    ))}
                </div>
                {modal}
            </>
        );
    }

    if (images.length === 3) {
        const firstImage = images[0];
        if (!firstImage) return null;
        return (
            <>
                <div className={cn('grid grid-cols-2 gap-2', compact ? 'w-full max-w-xs' : 'max-w-xl', className)}>
                    <PreviewTile
                        image={firstImage}
                        previewIndex={0}
                        onPreview={handleImageClick}
                        className="col-span-1 row-span-2"
                        aspectClassName="aspect-[3/4]"
                        flat={flat}
                    />
                    {images.slice(1, 3).map((image, index) => (
                        <PreviewTile
                            key={image.url}
                            image={image}
                            previewIndex={index + 1}
                            onPreview={handleImageClick}
                            flat={flat}
                        />
                    ))}
                </div>
                {modal}
            </>
        );
    }

    const displayImages = images.slice(0, 4);
    const remainingCount = images.length - 4;
    return (
        <>
            <div className={cn('grid grid-cols-2 gap-2', compact ? 'w-full max-w-xs' : 'max-w-xl', className)}>
                {displayImages.map((image, index) => (
                    <PreviewTile
                        key={image.url}
                        image={image}
                        previewIndex={index}
                        onPreview={handleImageClick}
                        overlayCount={index === 3 && remainingCount > 0 ? remainingCount : undefined}
                        flat={flat}
                    />
                ))}
            </div>
            {modal}
        </>
    );
}
