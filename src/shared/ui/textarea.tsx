import * as React from 'react'

import { interactiveTransitionClass } from '@/lib/animation-system'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoGrow?: boolean
  ref?: React.Ref<HTMLTextAreaElement>
}

const Textarea = ({ className, autoGrow, onChange, ref, ...props }: TextareaProps) => {
  const internalRef = React.useRef<HTMLTextAreaElement>(null)

  const handleTextareaRef = React.useCallback((node: HTMLTextAreaElement | null) => {
    internalRef.current = node

    if (typeof ref === 'function') {
      ref(node)
      return
    }

    if (ref) {
      ref.current = node
    }
  }, [ref])

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoGrow && internalRef.current) {
        internalRef.current.style.height = 'auto'
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`
      }
      onChange?.(e)
    },
    [autoGrow, onChange]
  )

  return (
    <textarea
      ref={handleTextareaRef}
      className={cn(
        'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60',
        'focus-ring-subtle focus-visible:border-primary hover:border-muted-foreground/30',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50',
        'resize-y',
        autoGrow && 'resize-none overflow-hidden',
        interactiveTransitionClass,
        className
      )}
      onChange={handleChange}
      {...props}
    />
  )
}
Textarea.displayName = 'Textarea'

export { Textarea }
