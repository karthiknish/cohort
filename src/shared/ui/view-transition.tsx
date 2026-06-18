'use client';

import * as React from 'react';
import type { ViewTransitionProps } from 'react';

export type { ViewTransitionProps };

const ReactViewTransition = (
  React as typeof React & {
    ViewTransition?: React.ExoticComponent<ViewTransitionProps>;
  }
).ViewTransition;

/**
 * React View Transitions wrapper. Falls back to a fragment when the runtime
 * does not export ViewTransition (stable React builds without the API).
 */
export function ViewTransition({
  children,
  ...props
}: ViewTransitionProps) {
  if (typeof ReactViewTransition === 'function') {
    return <ReactViewTransition {...props}>{children}</ReactViewTransition>;
  }
  return <>{children}</>;
}
