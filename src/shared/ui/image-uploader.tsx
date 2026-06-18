'use client';
import { notifyFailure } from '@/lib/notifications';
import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { LazyImage } from '@/shared/ui/lazy-image';
import { asErrorMessage } from '@/lib/convex-errors';
import { cn } from '@/lib/utils';
interface ImageUploaderProps {
    value?: string | null;
    onChange: (url: string | null) => void;
    onUpload: (file: File) => Promise<string>;
    className?: string;
    disabled?: boolean;
    maxSizeMB?: number;
    placeholder?: string;
}
export function ImageUploader({ value, onChange, onUpload, className, disabled = false, maxSizeMB = 5, placeholder = 'Upload an image', }: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const onOpenFilePicker = () => {
        if (!disabled && !isUploading) {
            inputRef.current?.click();
        }
    };
    const validateFile = (file: File): string | null => {
        if (!file.type.startsWith('image/')) {
            return 'Please select an image file (PNG, JPG, WebP, or GIF)';
        }
        if (file.size > maxSizeBytes) {
            return `Image must be smaller than ${maxSizeMB}MB`;
        }
        return null;
    };
    const processFile = (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        setIsUploading(true);
        // Create preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        void onUpload(file)
            .then((uploadedUrl) => {
            URL.revokeObjectURL(objectUrl);
            setPreviewUrl(uploadedUrl);
            onChange(uploadedUrl);
        })
            .catch((err) => {
            console.error('Image upload failed:', err);
            const message = asErrorMessage(err);
            setError('Upload failed. Please try again.');
            notifyFailure({
                title: 'Upload failed',
                message: message,
            });
            URL.revokeObjectURL(objectUrl);
            setPreviewUrl(value ?? null);
        })
            .finally(() => {
            setIsUploading(false);
        });
    };
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            void processFile(file);
        }
        event.target.value = '';
    };
    const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };
    const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (disabled || isUploading)
            return;
        const file = event.dataTransfer.files?.[0];
        if (file) {
            void processFile(file);
        }
    };
    const handleRemove = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        onChange(null);
        setError(null);
    };
    return (<div className={cn('space-y-2', className)}>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" aria-label="Upload image" className="hidden" onChange={handleFileChange} disabled={disabled || isUploading}/>

      {previewUrl ? (<div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
            <LazyImage src={previewUrl} alt="Feature preview" className="size-full object-cover"/>
            {isUploading && (<div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <LoaderCircle className="size-8 animate-spin text-primary"/>
              </div>)}
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <Button type="button" variant="secondary" size="icon" className="size-8 bg-background/90 hover:bg-background" onClick={onOpenFilePicker} disabled={disabled || isUploading} aria-label="Replace image">
              <ImagePlus className="size-4" aria-hidden/>
            </Button>
            <Button type="button" variant="destructive" size="icon" className="size-8" onClick={handleRemove} disabled={disabled || isUploading} aria-label="Remove image">
              <Trash2 className="size-4" aria-hidden/>
            </Button>
          </div>
        </div>) : (<button type="button" onClick={onOpenFilePicker} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={cn('flex flex-col items-center justify-center gap-2 p-6', 'aspect-video w-full rounded-lg border-2 border-dashed', 'cursor-pointer transition-colors', isDragging
                ? 'border-primary bg-accent/5'
                : 'border-muted-foreground/25 hover:border-accent/50 hover:bg-muted/50', (disabled || isUploading) && 'cursor-not-allowed opacity-50')}>
          {isUploading ? (<LoaderCircle className="size-8 animate-spin text-muted-foreground"/>) : (<Upload className="size-8 text-muted-foreground"/>)}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isUploading ? 'Uploading…' : placeholder}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to browse
            </p>
          </div>
        </button>)}

      {error && (<p className="text-xs text-destructive">{error}</p>)}
    </div>);
}
