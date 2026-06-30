'use client';
import * as React from 'react';
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card';
export { HoverCardTrigger } from './hover-card-trigger';
export { HoverCardContent } from './hover-card-content';

function HoverCard({ ...props }: React.ComponentProps<typeof PreviewCardPrimitive.Root>) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />;
}

export { HoverCard };
