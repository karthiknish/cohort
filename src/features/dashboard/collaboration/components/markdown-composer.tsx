'use client'

import { type AnchorHTMLAttributes, type ChangeEvent, type ComponentPropsWithoutRef, useCallback, useState } from 'react'
import { Eye, EyeOff, Type } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/lib/utils'

function MarkdownPreviewLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:no-underline"
    >
      {props.children}
    </a>
  )
}

function MarkdownPreviewCode({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'code'>) {
  if (!className) {
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono" {...props}>
        {children}
      </code>
    )
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  )
}

const MARKDOWN_PREVIEW_COMPONENTS = {
  a: MarkdownPreviewLink,
  code: MarkdownPreviewCode,
}

function MarkdownToolbarActionButton({
  insert,
  title,
  icon,
  onInsert,
}: {
  insert: string
  title: string
  icon: string
  onInsert: (markdown: string) => void
}) {
  const handleClick = useCallback(() => {
    onInsert(insert)
  }, [insert, onInsert])

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2"
      onClick={handleClick}
      title={title}
    >
      {icon}
    </Button>
  )
}
interface MarkdownPreviewProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
  minRows?: number
}

/**
 * Message composer with markdown preview
 * Shows both the raw markdown and a live preview side by side
 */
export function MarkdownPreview({
  value,
  onChange,
  placeholder = 'Type your message…',
  maxLength = 2000,
  className,
  minRows = 3,
}: MarkdownPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const handleTogglePreview = useCallback(() => {
    setShowPreview((current) => !current)
  }, [])
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((current) => !current)
  }, [])
  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value), [onChange])

  const charCount = value.length
  const remaining = maxLength - charCount
  const isNearLimit = remaining < 100
  const isAtLimit = remaining <= 0

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        isFullscreen && 'fixed inset-4 z-50 rounded-lg shadow-2xl',
        className
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Message</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Preview toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleTogglePreview}
            className="h-7 px-2"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-1" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1" />
                Preview
              </>
            )}
          </Button>

          {/* Fullscreen toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <span aria-hidden>{isFullscreen ? '↙' : '↗'}</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      {showPreview ? (
        // Preview mode
        <div className="p-4 min-h-[120px] max-h-[400px] overflow-y-auto">
          {value ? (
            <MarkdownPreviewContent value={value} />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Nothing to preview…
            </p>
          )}
        </div>
      ) : (
        // Edit mode with live preview hint
        <Tabs defaultValue="write" className="w-full">
          <div className="px-3 pt-2">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="write" className="flex-1">
                Write
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="write" className="mt-0">
            <Textarea
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              maxLength={maxLength}
              rows={minRows}
              className="min-h-[120px] max-h-[400px] resize-none border-0 rounded-none focus-visible:ring-0"
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="p-4 min-h-[120px] max-h-[400px] overflow-y-auto">
              {value ? (
                <MarkdownPreviewContent value={value} />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Nothing to preview…
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Footer with character count and markdown hint */}
      <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/50">
        {/* Markdown hint */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Formatting:</span> **bold**, *italic*, `code`, {'>'} quote
        </div>

        {/* Character count */}
        <div
          className={cn(
            'text-xs',
            isNearLimit && !isAtLimit && 'text-warning',
            isAtLimit && 'text-destructive'
          )}
        >
          {charCount}/{maxLength}
        </div>
      </div>
    </div>
  )
}

function MarkdownPreviewContent({ value }: { value: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MARKDOWN_PREVIEW_COMPONENTS}
      >
        {value}
      </ReactMarkdown>
    </div>
  )
}

/**
 * Markdown toolbar with formatting buttons
 */
export function MarkdownToolbar({
  onInsert,
  className,
}: {
  onInsert: (markdown: string) => void
  className?: string
}) {
  const buttons = [
    { label: 'Bold', icon: '**text**', insert: '**', title: 'Bold (Ctrl+B)' },
    { label: 'Italic', icon: '*text*', insert: '*', title: 'Italic (Ctrl+I)' },
    { label: 'Code', icon: '</>', insert: '`', title: 'Inline code' },
    { label: 'Link', icon: '🔗', insert: '[text](url)', title: 'Insert link' },
    { label: 'List', icon: '•', insert: '- ', title: 'Bullet list' },
    { label: 'Quote', icon: '>', insert: '> ', title: 'Blockquote' },
  ]

  return (
    <div className={cn('flex items-center gap-1 p-1 border-b bg-muted/50', className)}>
      {buttons.map((btn) => (
        <MarkdownToolbarActionButton
          key={btn.label}
          insert={btn.insert}
          title={btn.title}
          icon={btn.icon}
          onInsert={onInsert}
        />
      ))}
    </div>
  )
}
