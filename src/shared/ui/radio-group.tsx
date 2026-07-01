'use client';
import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { Circle } from 'lucide-react';
import { interactiveTransitionClass } from '@/lib/motion';
import { useHaptics } from '@/shared/lib/haptics';
import { cn } from '@/lib/utils';

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive>) {
  return (
    <RadioGroupPrimitive data-slot="radio-group" className={cn('grid gap-2', className)} {...props} />
  );
}

function RadioGroupItem({ className, onPointerDown, ...props }: React.ComponentProps<typeof RadioPrimitive.Root>) {
  const haptics = useHaptics();
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      onPointerDown={(e) => { haptics.selection(); onPointerDown?.(e); }}
      className={cn(
        'aspect-square size-4 rounded-full border border-primary text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        interactiveTransitionClass,
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator data-slot="radio-group-indicator" className="flex items-center justify-center">
        <Circle className="size-2.5 fill-primary" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
