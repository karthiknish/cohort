import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoGrow?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, autoGrow, onChange, ...props }, ref) => {
  const internalRef = React.useRef<HTMLTextAreaElement>(null)
  const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoGrow && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
      onChange?.(e)
    },
    [autoGrow, onChange, textareaRef]
  )

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary hover:border-muted-foreground/30',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50',
        'resize-y',
        autoGrow && 'resize-none overflow-hidden',
        className
      )}
      onChange={handleChange}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
