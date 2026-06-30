'use client';

import * as React from 'react';

const SLOTTABLE_IDENTIFIER = Symbol('slottable');

/**
 * Slottable — marks the children of a Slot that should be passed through
 * rather than treated as the element to clone.
 */
export function Slottable({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
Slottable.displayName = 'Slottable';
(Object as any).defineProperty(Slottable, '__slottableId', { value: SLOTTABLE_IDENTIFIER });
