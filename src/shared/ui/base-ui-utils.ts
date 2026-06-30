"use client";
import * as React from "react";

/**
 * Detects whether a React element renders a native <button> element.
 * Used to set Base UI's `nativeButton` prop automatically when using `render`/`asChild`.
 */
function isNativeButtonElement(element: React.ReactElement): boolean {
  // Direct DOM element <button>
  if (typeof element.type === 'string') {
    return element.type === 'button';
  }
  // Forward ref components or function components that render a <button>
  // (e.g. our Button component). Check displayName or function name as a heuristic.
  const type = element.type as any;
  const displayName =
    type?.displayName ??
    type?.render?.displayName ??
    type?.name ??
    type?.render?.name ??
    '';
  if (displayName === 'Button' || displayName === 'ButtonComponent') {
    return true;
  }
  return false;
}

/**
 * Returns the appropriate `nativeButton` value for a Base UI Trigger/Close component
 * based on whether the render prop child is a native <button>.
 * If `nativeButton` is explicitly provided in props, that takes precedence.
 */
export function resolveNativeButton(
  renderProp: React.ReactElement | undefined,
  props: Record<string, unknown>,
): boolean {
  if (props.nativeButton !== undefined) {
    return Boolean(props.nativeButton);
  }
  if (renderProp && isNativeButtonElement(renderProp)) {
    return true;
  }
  return false;
}
