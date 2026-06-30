'use client';
import * as React from 'react';
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card';
import { surfaceMotionClasses } from '@/lib/motion';
import { cn } from '@/lib/utils';

type HoverCardContentProps = React.ComponentProps<typeof PreviewCardPrimitive.Popup> & {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  className?: string;
};

function HoverCardContent({ className, align = 'center', side, sideOffset = 6, ...props }: HoverCardContentProps) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner align={align} side={side} sideOffset={sideOffset}>
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            'z-[1200] w-64 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
            surfaceMotionClasses.popoverContent,
            className,
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

export { HoverCardContent };
