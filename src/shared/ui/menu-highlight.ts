/**
 * Hover/focus styles for Radix menu & select items on light popover surfaces.
 * Uses muted + foreground (not accent-foreground) to avoid white-on-white when
 * highlight background fails to apply alongside accent text color.
 */
export const menuItemHighlightClass =
  'focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground'
