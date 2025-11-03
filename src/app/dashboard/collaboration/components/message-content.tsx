"use client"

import { memo, useMemo } from "react"
import type { ComponentPropsWithoutRef } from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"
import type { CollaborationMention } from "@/types/collaboration"

import { isLikelyImageUrl } from "../utils"
import { MENTION_PROTOCOL } from "../utils/mentions"

interface MessageContentProps {
  content: string
  mentions?: CollaborationMention[]
}

const BASE_LINK_REL = "noreferrer noopener"

type CodeProps = ComponentPropsWithoutRef<'code'> & { inline?: boolean }

type AnchorProps = ComponentPropsWithoutRef<'a'>

type ImageProps = ComponentPropsWithoutRef<'img'>

const markdownComponents: Components = {
  p: ({ children }) => <p className="leading-relaxed text-sm text-foreground [&:not(:first-child)]:mt-2">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic text-foreground">{children}</em>,
  ul: ({ children }) => <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">{children}</ul>,
  ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-muted/60 pl-3 text-sm italic text-muted-foreground">{children}</blockquote>
  ),
  code: ({ inline, className, children }: CodeProps) => {
    if (inline) {
      return <code className={cn("rounded bg-muted px-1 py-0.5 text-[13px]", className)}>{children}</code>
    }

    return (
      <pre className="mt-3 overflow-x-auto rounded-md border border-muted/60 bg-muted/30 p-3 text-sm text-foreground">
        <code className={cn("block whitespace-pre", className)}>{children}</code>
      </pre>
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
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[320px] divide-y divide-muted/40 text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">{children}</thead>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-muted/40">{children}</tbody>,
  th: ({ children }) => <th className="px-3 py-2 font-medium">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 align-top text-foreground">{children}</td>,
}

function RawMessageContent({ content, mentions }: MessageContentProps) {
  const markdown = useMemo(() => content?.trim() ?? "", [content])
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
