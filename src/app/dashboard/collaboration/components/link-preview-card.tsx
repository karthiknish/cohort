"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { ExternalLink, Image as ImageIcon, LoaderCircle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { LazyImage } from "@/components/ui/lazy-image"
import { cn } from "@/lib/utils"

interface LinkPreviewCardProps {
  url: string
}

interface LinkPreviewResponse {
  url: string
  title?: string | null
  description?: string | null
  image?: string | null
  siteName?: string | null
}

const fetchLinkPreview = async ([, requestUrl]: [string, string]): Promise<LinkPreviewResponse> => {
  const response = await fetch("/api/utils/link-preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: requestUrl }),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch link preview")
  }

  return response.json()
}

export function LinkPreviewCard({ url }: LinkPreviewCardProps) {
  const { data, error, isLoading } = useSWR<LinkPreviewResponse, Error>(["link-preview", url], fetchLinkPreview, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const parsedUrl = useMemo(() => {
    try {
      return new URL(url)
    } catch {
      return null
    }
  }, [url])

  const preview = data ?? { url }
  const title = preview.title?.trim() || preview.siteName?.trim() || parsedUrl?.hostname || url
  const description = preview.description?.trim() || ""
  const imageUrl = preview.image?.trim()
  const domain = parsedUrl?.hostname || ""

  return (
    <Card className="max-w-xl border-muted/60 bg-muted/10">
      <CardContent className="flex gap-3 p-3">
        <div
          className={cn(
            "relative hidden h-24 w-32 flex-shrink-0 overflow-hidden rounded-md border border-muted/40 bg-background sm:block",
            imageUrl ? undefined : "flex items-center justify-center p-3",
          )}
          aria-hidden={!imageUrl}
        >
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : imageUrl ? (
            <LazyImage
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <a
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              className="line-clamp-2 text-sm font-semibold text-foreground hover:underline"
            >
              {title}
            </a>
            {domain ? <p className="text-xs text-muted-foreground">{domain}</p> : null}
          </div>
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Fetching preview…</p>
          ) : error ? (
            <p className="text-xs text-muted-foreground">Preview unavailable</p>
          ) : description ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex h-24 flex-shrink-0 items-start">
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:text-primary"
            aria-label="Open link"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
