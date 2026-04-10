import { logError } from '@/lib/convex-errors'

export type ResponseBodyParseErrorReason = 'empty' | 'invalid-json' | 'unreadable'

export class ResponseBodyParseError extends Error {
  readonly context: string
  readonly reason: ResponseBodyParseErrorReason

  constructor(context: string, reason: ResponseBodyParseErrorReason, cause?: unknown) {
    super(getResponseBodyParseErrorMessage(context, reason))
    this.name = 'ResponseBodyParseError'
    this.context = context
    this.reason = reason

    if (cause !== undefined) {
      ;(this as { cause?: unknown }).cause = cause
    }
  }
}

function getResponseBodyParseErrorMessage(context: string, reason: ResponseBodyParseErrorReason) {
  if (reason === 'empty') {
    return `${context} returned an empty response body.`
  }

  if (reason === 'unreadable') {
    return `${context} response body could not be read.`
  }

  return `${context} returned invalid JSON.`
}

type ParseJsonBodyOptions = {
  context: string
  allowEmpty?: boolean
}

export async function parseJsonBody<T>(response: Response, options: ParseJsonBodyOptions): Promise<T | null> {
  const { context, allowEmpty = false } = options

  let rawBody: string
  try {
    if (typeof response.text === 'function') {
      rawBody = await response.text()
    } else if (typeof response.json === 'function') {
      const jsonPayload = await response.json()
      rawBody = JSON.stringify(jsonPayload)
    } else {
      throw new TypeError('Response body readers are unavailable.')
    }
  } catch (error) {
    logError(error, `${context}:readResponseBody`)
    throw new ResponseBodyParseError(context, 'unreadable', error)
  }

  if (rawBody.trim().length === 0) {
    if (allowEmpty) {
      return null
    }

    throw new ResponseBodyParseError(context, 'empty')
  }

  try {
    return JSON.parse(rawBody) as T
  } catch (error) {
    logError(error, `${context}:parseJsonBody`)
    throw new ResponseBodyParseError(context, 'invalid-json', error)
  }
}

export async function parseJsonBodySafely<T>(response: Response, options: ParseJsonBodyOptions): Promise<T | null> {
  try {
    return await parseJsonBody<T>(response, options)
  } catch (error) {
    if (error instanceof ResponseBodyParseError) {
      return null
    }

    throw error
  }
}

export async function parseRequiredJsonBody<T>(response: Response, options: ParseJsonBodyOptions): Promise<T> {
  const payload = await parseJsonBody<T>(response, {
    ...options,
    allowEmpty: false,
  })

  if (payload === null) {
    throw new ResponseBodyParseError(options.context, 'empty')
  }

  return payload
}