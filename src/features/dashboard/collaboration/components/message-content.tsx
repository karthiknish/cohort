"use client";
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { Fragment, memo, useMemo, useState, useCallback, Children } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { asErrorMessage, logError } from "@/lib/convex-errors";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { CodeSyntaxHighlighter } from "@/shared/ui/code-syntax-highlighter";
import { LazyImage } from "@/shared/ui/lazy-image";
import { LiveRegion } from "@/shared/ui/live-region";
import type { CollaborationMention } from "@/types/collaboration";
import { CHAT_MARKDOWN_CLASS, CHAT_MESSAGE_BODY_CLASS } from '../lib/chat-text';
import { MENTION_PROTOCOL } from "../utils/mentions";
import { highlightText, hasHighlightTerms } from "./search-highlighter";
interface MessageContentProps {
    content: string;
    mentions?: CollaborationMention[];
    highlightTerms?: string[];
}
// Language detection from class name (e.g., "language-javascript")
function extractLanguage(className?: string): string | null {
    if (!className)
        return null;
    const match = className.match(/language-(\w+)/);
    return match ? match[1] ?? null : null;
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
};
function normalizeLanguage(lang: string | null): string {
    if (!lang)
        return "text";
    const normalized = lang.toLowerCase();
    return LANGUAGE_ALIASES[normalized] || normalized;
}
// Copy to clipboard button component
function CopyButton({ code }: {
    code: string;
}) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch (err) {
            reportConvexFailure({
                error: err,
                context: 'MessageContent:CopyButton',
                title: 'Copy failed',
                fallbackMessage: 'Copy failed',
            });
        }
    };
    return (<>
      <LiveRegion message={copied ? 'Code block copied to clipboard.' : ''}/>
      <Button variant="ghost" size="icon" className="absolute right-2 top-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity border border-muted/40 bg-background/80 shadow-sm hover:bg-background" onClick={handleCopy} title={copied ? "Copied!" : "Copy code"} aria-label={copied ? "Code copied" : "Copy code block to clipboard"}>
        {copied ? (<Check className="size-3.5 text-success" aria-hidden/>) : (<Copy className="size-3.5" aria-hidden/>)}
      </Button>
    </>);
}
type CodeProps = ComponentPropsWithoutRef<'code'> & {
    inline?: boolean;
};
type AnchorProps = ComponentPropsWithoutRef<'a'>;
type ImageProps = ComponentPropsWithoutRef<'img'>;
// Create markdown components factory (light theme only)
function highlightChildren(children: ReactNode, terms?: string[]) {
    if (!hasHighlightTerms(terms))
        return children;
    let textOffset = 0;
    return Children.map(children as ReactNode, (child) => {
        if (typeof child === "string") {
            const key = `fragment-${textOffset}`;
            textOffset += child.length;
            return <Fragment key={key}>{highlightText(child, terms)}</Fragment>;
        }
        return child;
    });
}
function createMarkdownComponents(highlightTerms?: string[]): Components {
    return {
        p: ({ children }) => (<div className="leading-relaxed text-sm text-foreground [&:not(:first-child)]:mt-2">{highlightChildren(children, highlightTerms)}</div>),
        strong: ({ children }) => <strong className="font-semibold text-foreground">{highlightChildren(children, highlightTerms)}</strong>,
        em: ({ children }) => <em className="italic text-foreground">{highlightChildren(children, highlightTerms)}</em>,
        ul: ({ children }) => <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">{children}</ul>,
        ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">{children}</ol>,
        li: ({ children }) => <li>{highlightChildren(children, highlightTerms)}</li>,
        blockquote: ({ children }) => (<blockquote className="rounded-md bg-gradient-to-r from-primary/5 to-muted/20 px-3 py-1.5 text-sm italic text-muted-foreground ring-1 ring-primary/10">{highlightChildren(children, highlightTerms)}</blockquote>),
        code: ({ inline, className, children }: CodeProps) => {
            const language = extractLanguage(className);
            const normalizedLang = normalizeLanguage(language);
            const codeString = String(children).replace(/\n$/, "");
            if (inline || !codeString.includes('\n')) {
                return (<code className={cn("rounded border border-muted/60 bg-muted px-1.5 py-0.5 text-[13px] font-mono text-primary/90", className)}>
            {children}
          </code>);
            }
            return (<span className="block group relative mt-3 max-w-full rounded-lg border border-muted/60 overflow-hidden">
          {/* Language label and copy button */}
          <div className="flex items-center justify-between bg-muted/40 px-3 py-1.5 border-b border-muted/40">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {normalizedLang}
            </span>
            <CopyButton code={codeString}/>
          </div>
          <CodeSyntaxHighlighter language={normalizedLang} code={codeString}/>
        </span>);
        },
        a: ({ href, children }: AnchorProps) => {
            if (!href)
                return <span>{children}</span>;
            if (href.startsWith(MENTION_PROTOCOL)) {
                return (<span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-xs font-medium leading-none text-primary">
            {children}
          </span>);
            }
            return (<a href={href} target="_blank" rel="noreferrer noopener" className="break-all text-sm font-medium text-primary hover:underline">
          {children}
        </a>);
        },
        img: ({ src, alt }: ImageProps) => {
            if (!src)
                return null;
            return (<LazyImage src={src} alt={alt ?? "Shared image"} className="my-3 block h-auto max-h-80 w-full max-w-full rounded-md border border-muted/50 object-contain"/>);
        },
        table: ({ children }) => (<div className="mt-3 max-w-full overflow-x-auto rounded-md border border-muted/40">
        <table className="w-full max-w-full divide-y divide-muted/40 text-sm">{children}</table>
      </div>),
        thead: ({ children }) => (<thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">{children}</thead>),
        tbody: ({ children }) => <tbody className="divide-y divide-muted/40">{children}</tbody>,
        th: ({ children }) => <th className="px-3 py-2 font-medium">{children}</th>,
        td: ({ children }) => <td className="px-3 py-2 align-top text-foreground">{children}</td>,
        // Horizontal rule
        hr: () => <hr className="my-4 border-muted/60"/>,
        // Headings in messages
        h1: ({ children }) => <h1 className="mt-4 mb-2 text-lg text-foreground">{children}</h1>,
        h2: ({ children }) => <h2 className="mt-3 mb-2 text-base text-foreground">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-3 mb-1 text-sm text-foreground">{children}</h3>,
        h4: ({ children }) => <h4 className="mt-2 mb-1 text-sm text-foreground">{children}</h4>,
        h5: ({ children }) => <h5 className="mt-2 mb-1 text-sm font-medium text-foreground">{children}</h5>,
        h6: ({ children }) => <h6 className="mt-2 mb-1 text-sm font-medium text-muted-foreground">{children}</h6>,
        // Strikethrough
        del: ({ children }) => <del className="line-through text-muted-foreground">{children}</del>,
    };
}
function RawMessageContent({ content, mentions, highlightTerms }: MessageContentProps) {
    const markdown = content?.trim() ?? "";
    const markdownComponents = createMarkdownComponents(highlightTerms);
    const mentionBadges = (() => {
        if (!Array.isArray(mentions)) {
            return [];
        }
        return mentions.flatMap((item) => item && typeof item.name === "string" && item.name.trim().length > 0
            ? [{
                    key: item.slug ?? item.name,
                    name: item.name.trim(),
                    role: item.role ?? null,
                }]
            : []);
    })();
    if (!markdown) {
        return null;
    }
    return (<div className={cn(CHAT_MESSAGE_BODY_CLASS, 'space-y-2')}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents} className={CHAT_MARKDOWN_CLASS} skipHtml>
        {markdown}
      </ReactMarkdown>
      {mentionBadges.length > 0 && (<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Mentions:</span>
          {mentionBadges.map((mention) => (<span key={mention.key} className="inline-flex items-center gap-1 rounded-full border border-muted/60 bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
              @{mention.name}
              {mention.role ? <span className="text-[10px] uppercase text-muted-foreground">{mention.role}</span> : null}
            </span>))}
        </div>)}
    </div>);
}
export const MessageContent = Object.assign(RawMessageContent, { displayName: 'MessageContent' });
