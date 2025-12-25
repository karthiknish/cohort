import { NextResponse } from "next/server"
import { load } from "cheerio"
import { isIP } from "node:net"
import { z } from 'zod'
import { createApiHandler } from "@/lib/api-handler"
import { ValidationError } from '@/lib/api-errors'

const previewSchema = z.object({
  url: z.string().url(),
})

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"])
const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"])
const MAX_HTML_BYTES = 200_000
const REQUEST_TIMEOUT_MS = 5000
const USER_AGENT = "CohortsLinkPreview/1.0"

interface PreviewMetadata {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

function isPrivateHost(hostname: string): boolean {
  const lowered = hostname.toLowerCase()
  if (BLOCKED_HOSTS.has(lowered) || lowered.endsWith(".local")) {
    return true
  }

  const ipVersion = isIP(hostname)
  if (ipVersion === 4) {
    if (
      lowered.startsWith("10.") ||
      lowered.startsWith("192.168.") ||
      lowered.startsWith("127.") ||
      lowered.startsWith("169.254.")
    ) {
      return true
    }

    if (lowered.startsWith("172.")) {
      const parts = lowered.split(".")
      const second = Number(parts[1] ?? "0")
      if (second >= 16 && second <= 31) {
        return true
      }
    }

    return false
  }

  if (ipVersion === 6) {
    return lowered === "::1" || lowered.startsWith("fd") || lowered.startsWith("fe80")
  }

  return false
}

function buildErrorResponse(url: string, status = 200) {
  return NextResponse.json<PreviewMetadata & { url: string }>(
    {
      url,
      title: null,
      description: null,
      image: null,
      siteName: null,
    },
    {
      status,
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=1800",
      },
    },
  )
}

function normalizeImageUrl(value: string | undefined | null, base: URL): string | null {
  if (!value) return null
  try {
    const normalized = new URL(value, base)
    if (!ALLOWED_PROTOCOLS.has(normalized.protocol)) {
      return null
    }
    return normalized.toString()
  } catch {
    return null
  }
}

async function fetchPreviewMetadata(target: URL): Promise<PreviewMetadata | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(target, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    })

    if (!response.ok) {
      return null
    }

    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html")) {
      return null
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder("utf-8")
    let html = ""

    if (reader) {
      let received = 0
      while (received < MAX_HTML_BYTES) {
        const { value, done } = await reader.read()
        if (done) break
        if (value) {
          received += value.length
          html += decoder.decode(value, { stream: true })
          if (received >= MAX_HTML_BYTES) break
        }
      }
      html += decoder.decode()
    } else {
      html = (await response.text()).slice(0, MAX_HTML_BYTES)
    }

    if (!html) {
      return null
    }

    const $ = load(html)
    const getMeta = (selector: string) => $(selector).attr("content")?.trim()

    const rawTitle =
      getMeta('meta[property="og:title"]') ??
      getMeta('meta[name="twitter:title"]') ??
      $("title").first().text().trim()

    const title = rawTitle && rawTitle.length > 0 ? rawTitle : null

    const description =
      getMeta('meta[property="og:description"]') ??
      getMeta('meta[name="twitter:description"]') ??
      getMeta('meta[name="description"]') ??
      null

    const image = normalizeImageUrl(
      getMeta('meta[property="og:image"]') ?? getMeta('meta[name="twitter:image"]') ?? null,
      target,
    )

    const siteName =
      getMeta('meta[property="og:site_name"]') ??
      getMeta('meta[name="application-name"]') ??
      target.hostname

    return {
      title,
      description,
      image,
      siteName,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export const POST = createApiHandler(
  {
    auth: 'optional',
    bodySchema: previewSchema,
    rateLimit: 'standard',
  },
  async (req, { body }) => {
    const url = body.url
    let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    throw new ValidationError('Invalid URL')
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol) || isPrivateHost(parsed.hostname)) {
    return buildErrorResponse(parsed.toString())
  }

  const metadata = await fetchPreviewMetadata(parsed)

  if (!metadata) {
    return buildErrorResponse(parsed.toString())
  }

  return NextResponse.json(
    {
      url: parsed.toString(),
      ...metadata,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=1800",
      },
    },
  )
})
