/// <reference types="react/canary" />
'use client';

import * as React from 'react';

// ViewTransitionProps is declared in react/canary via namespace augmentation.
// The triple-slash reference above loads it into the global React namespace.
type VTProps = React.ViewTransitionProps;

export type ViewTransitionProps = VTProps;

const ReactViewTransition = (
  React as typeof React & {
    ViewTransition?: React.ExoticComponent<VTProps>;
  }
).ViewTransition;

/**
 * React View Transitions wrapper. Falls back to a fragment when the runtime
 * does not export ViewTransition (stable React builds without the API).
 */
export function ViewTransition({
  children,
  ...props
}: VTProps) {
  if (typeof ReactViewTransition === 'function') {
    return <ReactViewTransition {...props}>{children}</ReactViewTransition>;
  }
  return <>{children}</>;
}
