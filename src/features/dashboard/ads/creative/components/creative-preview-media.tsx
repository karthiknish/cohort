import type { CSSProperties, RefObject } from 'react';
import NextImage from '@/shared/ui/image';
import { m } from '@/shared/ui/motion';
import { FileText, Image as ImageIcon, Maximize2, Pause, Play, Video } from 'lucide-react';
import { scaleVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { Creative } from './types';
import { isDirectVideoUrl } from './helpers';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, } from '@/shared/ui/dialog';
const crispEdgesStyle: CSSProperties = { imageRendering: 'crisp-edges' };
const whileHoverScale: {
    scale: number;
} = { scale: 1.1 };
const whileTapScale: {
    scale: number;
} = { scale: 0.9 };
export type CreativePreviewMediaProps = {
    creative: Creative;
    displayName: string;
    mediaAspectClass: string;
    imageLoadFailed: boolean;
    imageLightboxOpen: boolean;
    isPlaying: boolean;
    videoRef: RefObject<HTMLVideoElement | null>;
    onPlay: () => void;
    onPause: () => void;
    onEnded: () => void;
    onImageLoadFailed: () => void;
    onOpenImageLightbox: () => void;
    onImageLightboxOpenChange: (open: boolean) => void;
    onTogglePlayPause: () => void;
};
export function CreativePreviewMedia({ creative, displayName, mediaAspectClass, imageLoadFailed, imageLightboxOpen, isPlaying, videoRef, onPlay, onPause, onEnded, onImageLoadFailed, onOpenImageLightbox, onImageLightboxOpenChange, onTogglePlayPause, }: CreativePreviewMediaProps) {
    if (creative.videoUrl && isDirectVideoUrl(creative.videoUrl)) {
        return (<div className={cn('relative bg-foreground overflow-hidden group/video', mediaAspectClass)}>
        <video ref={videoRef} src={creative.videoUrl} aria-label={`${displayName} video preview`} className="size-full object-cover" poster={creative.imageUrl || creative.thumbnailUrl} onPlay={onPlay} onPause={onPause} onEnded={onEnded} style={crispEdgesStyle}>
          <track kind="captions"/>
        </video>
        <button type="button" onClick={onTogglePlayPause} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none">
          <div className="size-14 rounded-full bg-background/40 backdrop-blur-xl border border-background/20 flex items-center justify-center shadow-2xl">
            {isPlaying ? <Pause className="size-6 text-background"/> : <Play className="size-6 text-background ml-1"/>}
          </div>
        </button>
      </div>);
    }
    if (creative.videoUrl) {
        return (<div className={cn('relative bg-foreground flex items-center justify-center overflow-hidden group', mediaAspectClass)}>
        {creative.imageUrl && !imageLoadFailed ? (<NextImage src={creative.imageUrl} alt={displayName} fill unoptimized sizes="(max-width: 768px) 100vw, 640px" className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-[var(--motion-duration-xslow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none" onError={onImageLoadFailed} style={crispEdgesStyle}/>) : (<div className="text-muted-foreground flex flex-col items-center">
            <Video className="size-10 mb-2 opacity-20"/>
            <p className="text-[10px] text-background/40 uppercase tracking-widest font-black">Video Preview</p>
          </div>)}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none">
          <m.div whileHover={whileHoverScale} whileTap={whileTapScale} variants={scaleVariants} className="size-14 rounded-full bg-background/40 backdrop-blur-xl border border-background/20 flex items-center justify-center shadow-2xl cursor-pointer">
            <Video className="size-6 text-background"/>
          </m.div>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <div className="rounded-md bg-foreground/60 backdrop-blur-md text-background px-2 py-0.5 text-[8px] font-black tracking-widest uppercase border border-background/10">
            4K Stream
          </div>
        </div>
      </div>);
    }
    if (creative.imageUrl) {
        return (<>
        <div className={cn('relative overflow-hidden bg-muted/10 group', mediaAspectClass)}>
          {imageLoadFailed ? (<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ImageIcon className="mb-2 size-8 opacity-20" aria-hidden/>
              <p className="text-[10px] font-bold uppercase tracking-tighter">Asset Unavailable</p>
            </div>) : (<button type="button" className="relative block size-full cursor-zoom-in" onClick={onOpenImageLightbox} aria-label={`View full image for ${displayName}`}>
              <NextImage src={creative.imageUrl} alt={displayName} fill unoptimized sizes="(max-width: 768px) 100vw, 640px" className="object-cover transition-transform duration-[var(--motion-duration-xslow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none group-hover:scale-110" onError={onImageLoadFailed} style={crispEdgesStyle}/>
            </button>)}
          {!imageLoadFailed ? (<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] group-hover:opacity-100 motion-reduce:opacity-0"/>) : null}
          {!imageLoadFailed ? (<div className="absolute bottom-3 right-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <Button type="button" size="sm" variant="secondary" className="pointer-events-auto h-8 gap-1.5 bg-background/95 shadow-md" onClick={onOpenImageLightbox}>
                <Maximize2 className="size-3.5" aria-hidden/>
                Expand
              </Button>
            </div>) : null}
        </div>
        <Dialog open={imageLightboxOpen} onOpenChange={onImageLightboxOpenChange}>
          <DialogContent className="max-w-4xl gap-0 overflow-hidden border-border/60 p-0">
            <DialogTitle className="sr-only">{displayName}</DialogTitle>
            <DialogDescription className="sr-only">Full-size creative preview</DialogDescription>
            <div className="relative max-h-[85vh] min-h-[240px] w-full bg-foreground/95">
              <NextImage src={creative.imageUrl} alt={displayName} width={1200} height={1200} unoptimized className="mx-auto h-auto max-h-[85vh] w-full object-contain" onError={onImageLoadFailed}/>
            </div>
          </DialogContent>
        </Dialog>
      </>);
    }
    return (<div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed border-muted">
      <FileText className="size-10 mb-2 opacity-10"/>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No Asset Data</p>
    </div>);
}
