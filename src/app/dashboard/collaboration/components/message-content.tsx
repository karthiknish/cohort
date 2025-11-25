"use client"

import { memo, useMemo, useState, useCallback } from "react"
import type { ComponentPropsWithoutRef } from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { CollaborationMention } from "@/types/collaboration"

import { isLikelyImageUrl } from "../utils"
import { MENTION_PROTOCOL } from "../utils/mentions"

interface MessageContentProps {
  content: string
  mentions?: CollaborationMention[]
}

const BASE_LINK_REL = "noreferrer noopener"

// Language detection from class name (e.g., "language-javascript")
function extractLanguage(className?: string): string | null {
  if (!className) return null
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : null
}

// Common language aliases
const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  py: "python",
  rb: "ruby",
  yml: "yaml",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  dockerfile: "docker",
  md: "markdown",
}

function normalizeLanguage(lang: string | null): string {
  if (!lang) return "text"
  const normalized = lang.toLowerCase()
  return LANGUAGE_ALIASES[normalized] || normalized
}

// Copy to clipboard button component
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }, [code])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}

type CodeProps = ComponentPropsWithoutRef<'code'> & { inline?: boolean }

type AnchorProps = ComponentPropsWithoutRef<'a'>

type ImageProps = ComponentPropsWithoutRef<'img'>

// Create markdown components factory (to support theme)
function createMarkdownComponents(isDark: boolean): Components {
  return {
    p: ({ children }) => <p className="leading-relaxed text-sm text-foreground [&:not(:first-child)]:mt-2">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic text-foreground">{children}</em>,
    ul: ({ children }) => <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">{children}</ul>,
    ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground bg-muted/20 py-1 rounded-r-md">{children}</blockquote>
    ),
    code: ({ inline, className, children }: CodeProps) => {
      const language = extractLanguage(className)
      const normalizedLang = normalizeLanguage(language)
      const codeString = String(children).replace(/\n$/, "")

      if (inline) {
        return (
          <code className={cn(
            "rounded bg-muted px-1.5 py-0.5 text-[13px] font-mono text-primary/90",
            className
          )}>
            {children}
          </code>
        )
      }

      // Multi-line code block with syntax highlighting
      return (
        <div className="group relative mt-3 rounded-lg border border-muted/60 overflow-hidden">
          {/* Language label and copy button */}
          <div className="flex items-center justify-between bg-muted/40 px-3 py-1.5 border-b border-muted/40">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {normalizedLang}
            </span>
            <CopyButton code={codeString} />
          </div>
          <SyntaxHighlighter
            style={isDark ? oneDark : oneLight}
            language={normalizedLang}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "transparent",
              fontSize: "13px",
              lineHeight: "1.5",
            }}
            codeTagProps={{
              className: "font-mono",
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      )
    },
    a: ({ href, children }: AnchorProps) => {
      if (!href) return <span>{children}</span>
      if (href.startsWith(MENTION_PROTOCOL)) {
        return (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium leading-none text-primary">
            {children}
          </span>
        )
      }
      if (isLikelyImageUrl(href)) {
        return (
          <img
            src={href}
            alt={typeof children === "string" ? children : "Shared image"}
            className="mt-3 max-h-80 w-full max-w-xl rounded-md border border-muted/50 object-contain"
            loading="lazy"
            decoding="async"
          />
        )
      }
      return (
        <a href={href} target="_blank" rel={BASE_LINK_REL} className="break-words text-sm font-medium text-primary hover:underline">
          {children}
        </a>
      )
    },
    img: ({ src, alt }: ImageProps) => {
      if (!src) return null
      return (
        <img
          src={src}
          alt={alt ?? "Shared image"}
          className="mt-3 max-h-80 w-full max-w-xl rounded-md border border-muted/50 object-contain"
          loading="lazy"
          decoding="async"
        />
      )
    },
    table: ({ children }) => (
      <div className="mt-3 overflow-x-auto rounded-md border border-muted/40">
        <table className="w-full min-w-[320px] divide-y divide-muted/40 text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">{children}</thead>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-muted/40">{children}</tbody>,
    th: ({ children }) => <th className="px-3 py-2 font-medium">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 align-top text-foreground">{children}</td>,
    // Horizontal rule
    hr: () => <hr className="my-4 border-muted/60" />,
    // Headings in messages
    h1: ({ children }) => <h1 className="mt-4 mb-2 text-lg font-bold text-foreground">{children}</h1>,
    h2: ({ children }) => <h2 className="mt-3 mb-2 text-base font-bold text-foreground">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-3 mb-1 text-sm font-bold text-foreground">{children}</h3>,
    h4: ({ children }) => <h4 className="mt-2 mb-1 text-sm font-semibold text-foreground">{children}</h4>,
    h5: ({ children }) => <h5 className="mt-2 mb-1 text-sm font-medium text-foreground">{children}</h5>,
    h6: ({ children }) => <h6 className="mt-2 mb-1 text-sm font-medium text-muted-foreground">{children}</h6>,
    // Strikethrough
    del: ({ children }) => <del className="line-through text-muted-foreground">{children}</del>,
  }
}

function RawMessageContent({ content, mentions }: MessageContentProps) {
  const markdown = useMemo(() => content?.trim() ?? "", [content])
  
  // Detect dark mode from CSS variable
  const isDark = useMemo(() => {
    if (typeof window === "undefined") return false
    return document.documentElement.classList.contains("dark")
  }, [])

  const markdownComponents = useMemo(() => createMarkdownComponents(isDark), [isDark])

  const mentionBadges = useMemo(() => {
    if (!Array.isArray(mentions)) {
      return []
    }

    return mentions
      .filter((item) => item && typeof item.name === "string" && item.name.trim().length > 0)
      .map((item) => ({
        key: item.slug ?? item.name,
        name: item.name.trim(),
        role: item.role ?? null,
      }))
  }, [mentions])

  if (!markdown) {
    return null
  }

  return (
    <div className="space-y-2">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents} className="space-y-2" skipHtml>
        {markdown}
      </ReactMarkdown>
      {mentionBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Mentions:</span>
          {mentionBadges.map((mention) => (
            <span
              key={mention.key}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
            >
              @{mention.name}
              {mention.role ? <span className="text-[10px] uppercase text-muted-foreground">{mention.role}</span> : null}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export const MessageContent = memo(RawMessageContent)

MessageContent.displayName = "MessageContent"
