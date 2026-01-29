'use client'

import { useState, useCallback, useMemo } from 'react'
import { Eye, EyeOff, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { InlineCode } from './code-block'

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
  placeholder = 'Type your message...',
  maxLength = 2000,
  className,
  minRows = 3,
}: MarkdownPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const renderedMarkdown = useMemo(() => {
    return parseMarkdown(value)
  }, [value])

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
            onClick={() => setShowPreview(!showPreview)}
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
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <span className="sr-only">Toggle fullscreen</span>
            {isFullscreen ? '↙' : '↗'}
          </Button>
        </div>
      </div>

      {/* Content */}
      {showPreview ? (
        // Preview mode
        <div className="p-4 min-h-[120px] max-h-[400px] overflow-y-auto">
          {value ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
            />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Nothing to preview...
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
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              rows={minRows}
              className="min-h-[120px] max-h-[400px] resize-none border-0 rounded-none focus-visible:ring-0"
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="p-4 min-h-[120px] max-h-[400px] overflow-y-auto">
              {value ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Nothing to preview...
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
            isNearLimit && !isAtLimit && 'text-amber-600 dark:text-amber-400',
            isAtLimit && 'text-red-600 dark:text-red-400'
          )}
        >
          {charCount}/{maxLength}
        </div>
      </div>
    </div>
  )
}

/**
 * Simple markdown parser for preview
 * Supports: bold, italic, code, links, mentions, lists, blockquotes, headers
 */
function parseMarkdown(text: string): string {
  if (!text) return ''

  let html = text

  // Escape HTML tags first
  html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="bg-muted p-3 rounded-lg overflow-x-auto my-2"><code class="text-sm font-mono">${code}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-sm font-mono bg-muted">$1</code>')

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')

  // Mentions (@username)
  html = html.replace(/@(\w+)/g, '<span class="px-1 py-0.5 rounded bg-primary/10 text-primary font-medium">@$1</span>')

  // Hashtags
  html = html.replace(/#(\w+)/g, '<span class="text-primary">#$1</span>')

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-muted-foreground/30 pl-3 italic my-2">$1</blockquote>')

  // Unordered lists
  html = html.replace(/^[\-*] (.+)$/gm, '<li class="ml-4">$1</li>')
  html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc list-inside my-2">$&</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
  html = html.replace(/(<li.*<\/li>\n?)+/g, '<ol class="list-decimal list-inside my-2">$&</ol>')

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-3 mb-1">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-3 mb-1">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-3 mb-1">$1</h1>')

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p class="my-2">')
  html = html.replace(/\n/g, '<br />')

  return `<p class="my-0">${html}</p>`
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
        <Button
          key={btn.label}
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => onInsert(btn.insert)}
          title={btn.title}
        >
          {btn.icon}
        </Button>
      ))}
    </div>
  )
}
