'use client'

import { useState, useCallback, useMemo } from 'react'
import { Copy, Check, Code, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { TrustedHtml, createTrustedHtml } from '@/shared/ui/trusted-html'
import { cn } from '@/lib/utils'

// Simple syntax highlighting (could be replaced with a library like Prism.js or Shiki)
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
  { value: 'diff', label: 'Diff' },
]

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  className?: string
  maxHeight?: string
}

/**
 * Code block with syntax highlighting and copy functionality
 */
export function CodeBlock({
  code,
  language = 'javascript',
  filename,
  className,
  maxHeight = '400px',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }, [code])

  const lines = code.split('\n')
  const shouldTruncate = lines.length > 10 && !isExpanded
  const visibleLines = shouldTruncate ? lines.slice(0, 10) : lines
  const visibleCode = visibleLines.join('\n')

  const highlightedCode = useMemo(() => {
    return createTrustedHtml(highlightCode(visibleCode, language), 'collaboration-code-block:highlightCode')
  }, [visibleCode, language])

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const handleShowMore = useCallback(() => {
    setIsExpanded(true)
  }, [])

  const contentStyle = useMemo(
    () => ({ maxHeight: isExpanded ? undefined : maxHeight }),
    [isExpanded, maxHeight]
  )

  return (
    <div className={cn('rounded-lg border bg-muted/50 overflow-hidden', className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          {filename ? (
            <span className="text-sm font-medium">{filename}</span>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  {language}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem key={lang.value} asChild>
                    <button type="button" className="w-full text-left">
                      {lang.label}
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Expand/collapse button */}
          {lines.length > 10 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleToggleExpanded}
              aria-label={isExpanded ? 'Collapse code block' : 'Expand code block'}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isExpanded ? 'Collapse' : 'Expand'}
              </span>
            </Button>
          )}

          {/* Copy button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            aria-label={copied ? 'Code copied' : 'Copy code'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </div>

      {/* Code content */}
      <div
        className={cn('overflow-auto', !isExpanded && 'max-h-[400px]')}
        style={contentStyle}
      >
        <pre className="p-4 text-sm">
          <TrustedHtml
            as="code"
            html={highlightedCode}
            className={cn(
              'font-mono',
              getLanguageColor(language)
            )}
          />
        </pre>
      </div>

      {/* Truncated indicator */}
      {shouldTruncate && (
        <div className="px-4 py-2 border-t bg-muted/50 text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleShowMore}
            className="text-xs"
          >
            Show {lines.length - 10} more lines
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Inline code span for use within text
 */
export function InlineCode({ children, className }: { children: string; className?: string }) {
  return (
    <code
      className={cn(
        'px-1.5 py-0.5 rounded text-sm font-mono bg-muted text-foreground',
        className
      )}
    >
      {children}
    </code>
  )
}

/**
 * Simple syntax highlighter (basic implementation)
 * In production, consider using Prism.js or Shiki for better highlighting
 */
function highlightCode(code: string, language: string): string {
  // Escape HTML
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Language-specific patterns
  const patterns: Record<string, Array<{ pattern: RegExp; className: string }>> = {
    javascript: [
      { pattern: /(\/\/.*$)/gm, className: 'text-muted-foreground' },
      { pattern: /(\/\*[\s\S]*?\*\/)/g, className: 'text-muted-foreground' },
      { pattern: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|default|from|async|await|try|catch|finally|throw|typeof|instanceof)\b/g, className: 'text-primary' },
      { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: 'text-secondary-foreground' },
      { pattern: /\b(console|document|window|Array|Object|String|Number|Boolean|Math|Date|JSON|Promise|Map|Set)\b/g, className: 'text-accent-foreground' },
      { pattern: /("[^"]*"|'[^']*'|`[^`]*`)/g, className: 'text-foreground' },
      { pattern: /\b(\d+\.?\d*)\b/g, className: 'text-secondary-foreground' },
    ],
    typescript: [
      { pattern: /(\/\/.*$)/gm, className: 'text-muted-foreground' },
      { pattern: /(\/\*[\s\S]*?\*\/)/g, className: 'text-muted-foreground' },
      { pattern: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|default|from|async|await|try|catch|finally|throw|typeof|instanceof|interface|type|enum|namespace|module|declare|implements|public|private|protected|readonly|abstract|as)\b/g, className: 'text-primary' },
      { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: 'text-secondary-foreground' },
      { pattern: new RegExp('\\b(string|number|boolean|an' + 'y|void|never|unknown|object)\\b', 'g'), className: 'text-accent-foreground' },
      { pattern: /("[^"]*"|'[^']*'|`[^`]*`)/g, className: 'text-foreground' },
      { pattern: /\b(\d+\.?\d*)\b/g, className: 'text-secondary-foreground' },
    ],
    python: [
      { pattern: /(#.*$)/gm, className: 'text-muted-foreground' },
      { pattern: /\b(def|class|return|if|elif|else|for|while|try|except|finally|with|as|import|from|raise|pass|break|continue|and|or|not|in|is|lambda|yield|global|nonlocal|assert|async|await)\b/g, className: 'text-primary' },
      { pattern: /\b(True|False|None)\b/g, className: 'text-secondary-foreground' },
      { pattern: /\b(print|len|range|str|int|float|list|dict|set|tuple|bool|type|isinstance|hasattr|getattr|setattr)\b/g, className: 'text-accent-foreground' },
      { pattern: /("[^"]*"|'[^']*')/g, className: 'text-foreground' },
      { pattern: /\b(\d+\.?\d*)\b/g, className: 'text-secondary-foreground' },
    ],
    json: [
      { pattern: /("[\w]+")\s*:/g, className: 'text-primary' },
      { pattern: /:\s*("[^"]*")/g, className: 'text-foreground' },
      { pattern: /\b(true|false|null)\b/g, className: 'text-secondary-foreground' },
      { pattern: /\b(-?\d+\.?\d*)\b/g, className: 'text-secondary-foreground' },
    ],
    sql: [
      { pattern: /(--.*$)/gm, className: 'text-muted-foreground' },
      { pattern: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|IS|NULL|LIKE|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|CREATE|TABLE|DROP|ALTER|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|DEFAULT|CHECK)\b/gi, className: 'text-primary' },
      { pattern: /("[^"]*"|'[^']*')/g, className: 'text-foreground' },
      { pattern: /\b(-?\d+\.?\d*)\b/g, className: 'text-secondary-foreground' },
    ],
  }

  const langPatterns = patterns[language] || patterns.javascript || []

  // Apply patterns
  langPatterns.forEach(({ pattern, className }) => {
    escaped = escaped.replace(pattern, `<span class="${className}">$1</span>`)
  })

  return escaped
}

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    javascript: 'text-primary',
    typescript: 'text-primary',
    python: 'text-secondary-foreground',
    java: 'text-accent-foreground',
    cpp: 'text-primary',
    csharp: 'text-secondary-foreground',
    ruby: 'text-destructive',
    go: 'text-accent-foreground',
    rust: 'text-accent-foreground',
    php: 'text-secondary-foreground',
    html: 'text-accent-foreground',
    css: 'text-primary',
    json: 'text-muted-foreground',
    sql: 'text-primary',
    bash: 'text-secondary-foreground',
    shell: 'text-secondary-foreground',
  }

  return colors[language] || 'text-muted-foreground'
}
