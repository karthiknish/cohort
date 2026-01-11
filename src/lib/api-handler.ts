import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { createHash } from 'crypto'
import { ConvexHttpClient } from 'convex/browser'
import { authenticateRequest, AuthenticationError, AuthResult, assertAdmin } from './server-auth'
import { resolveWorkspaceContext, WorkspaceContext } from './workspace'
import { UnifiedError } from '@/lib/errors'
import { ApiError } from './api-errors'
import { 
  createRateLimitKey, 
  getClientIdentifier,
  buildRateLimitHeaders,
  RATE_LIMITS, 
  RateLimitPreset 
} from './rate-limiter'
import { checkConvexRateLimit } from './rate-limiter-convex'
import { sanitizeInput } from './utils'
import { logger } from './logger'
import { api } from '../../convex/_generated/api'

// Lazy-init Convex client for idempotency
let _convexClient: ConvexHttpClient | null = null
function getConvexIdempotencyClient(): ConvexHttpClient | null {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return null
  _convexClient = new ConvexHttpClient(url)
  return _convexClient
}

/**
 * Standard API Response structure
 */
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  details?: Record<string, string[]>
  code?: string
  requestId?: string
}

function isApiResponseLike(value: unknown): value is ApiResponse {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  if (typeof record.success !== 'boolean') return false
  // Reduce the odds of colliding with business payloads that happen to contain `success`.
  return 'data' in record || 'error' in record || 'code' in record || 'details' in record
}

/**
 * Context provided to the API handler
 */
export type ApiHandlerContext<TBody = unknown, TQuery = unknown> = {
  auth: AuthResult
  workspace?: WorkspaceContext
  body: TBody
  query: TQuery
  params: Record<string, string | string[]>
}

/**
 * Options for creating an API handler
 */
export type ApiHandlerOptions<TBody extends z.ZodTypeAny, TQuery extends z.ZodTypeAny> = {
  auth?: 'required' | 'optional' | 'none'
  workspace?: 'required' | 'optional' | 'none'
  adminOnly?: boolean
  bodySchema?: TBody
  querySchema?: TQuery
  /**
   * Rate limiting configuration
   * - Use a preset name: 'standard', 'sensitive', 'critical', 'bulk'
   * - Or provide custom config: { maxRequests: number, windowMs: number }
   */
  rateLimit?: RateLimitPreset | { maxRequests: number; windowMs: number }
  /**
   * Custom error message for generic 500 errors
   */
  errorMessage?: string
  /**
   * Whether to require an idempotency key for POST/PATCH requests.
   * If true, requests without x-idempotency-key will be rejected.
   * If false (default), automatic deduplication via body hashing will be attempted.
   */
  requireIdempotency?: boolean
  /**
   * Whether to skip idempotency checks entirely for this endpoint.
   * Useful for session management and other non-idempotent-safe operations.
   */
  skipIdempotency?: boolean
}

/**
 * Recursively sanitizes all string values in an object.
 */
function sanitizeBody<T>(data: T): T {
  if (typeof data === 'string') {
    return sanitizeInput(data) as unknown as T
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeBody) as unknown as T
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeBody(value)
    }
    return sanitized as unknown as T
  }
  return data
}

/**
 * Creates a standardized API handler with built-in authentication, 
 * workspace resolution, and validation.
 */
export function createApiHandler<
  TBody extends z.ZodTypeAny = z.ZodTypeAny, 
  TQuery extends z.ZodTypeAny = z.ZodTypeAny
>(
  options: ApiHandlerOptions<TBody, TQuery>,
  handler: (req: NextRequest, context: ApiHandlerContext<z.infer<TBody>, z.infer<TQuery>>) => Promise<ApiResponse | Response | unknown>
) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string | string[]>> }) => {
    const requestId = req.headers.get('x-request-id') || uuidv4()
    const startTime = Date.now()
    let idempotencyKey: string | null = null
    let auth: AuthResult = { uid: null, email: null, name: null, claims: {}, isCron: false }
    let workspace: WorkspaceContext | undefined
    
    try {
      const params = await (context?.params || Promise.resolve({}))
      const authOption = options.auth ?? 'required'
      const workspaceOption = options.workspace ?? 'none'

      logger.info(`API Request: ${req.method} ${req.nextUrl.pathname}`, {
        type: 'request_start',
        requestId,
        method: req.method,
        path: req.nextUrl.pathname,
      })
      
      // 0. Rate Limiting (before auth to prevent brute force)
      if (options.rateLimit) {
        const config = typeof options.rateLimit === 'string'
          ? RATE_LIMITS[options.rateLimit]
          : options.rateLimit
        
        const identifier = getClientIdentifier(req)
        const rateLimitKey = createRateLimitKey(req.nextUrl.pathname, identifier)

        // Prefer Convex-backed rate limiting (falls back to in-memory if Convex unavailable)
        const result = await checkConvexRateLimit(rateLimitKey, options.rateLimit)
        
        if (!result.allowed) {
          return NextResponse.json(
            {
              success: false,
              error: 'Too many requests. Please try again later.',
              code: 'RATE_LIMIT_EXCEEDED',
              requestId,
            },
            {
              status: 429,
              headers: {
                ...Object.fromEntries(buildRateLimitHeaders(result).entries()),
                'X-Request-ID': requestId,
              },
            }
          )
        }
      }
      
      // 1. Authentication
      if (authOption !== 'none') {
        try {
          auth = await authenticateRequest(req)
        } catch (error) {
          if (authOption === 'required') throw error
        }
      }

      // 2. Admin Check
      if (options.adminOnly) {
        assertAdmin(auth)
      }

      // 3. Workspace Resolution
      if (workspaceOption !== 'none') {
        if (!auth.uid && !auth.isCron && workspaceOption === 'required') {
          throw new AuthenticationError('Authentication required for workspace access', 401)
        }
        
        try {
          workspace = await resolveWorkspaceContext(auth)
        } catch (error) {
          if (workspaceOption === 'required') throw error
        }
      }

      // 3. Body Validation
      let body: z.infer<TBody> = {} as z.infer<TBody>
      let rawBody: string | null = null
      if (options.bodySchema) {
        let json: unknown
        try {
          json = await req.json()
          rawBody = JSON.stringify(json)
        } catch {
          return NextResponse.json({ 
            success: false,
            error: 'Invalid JSON body' 
          }, { status: 400 })
        }
        
        const result = options.bodySchema.safeParse(json)
        if (!result.success) {
          return NextResponse.json({ 
            success: false,
            error: 'Validation failed', 
            details: result.error.flatten().fieldErrors 
          }, { status: 400 })
        }
        body = sanitizeBody(result.data)
      }

      // 3.5 Idempotency Check (Enforced/Automatic)
      const isWriteMethod = ['POST', 'PATCH'].includes(req.method)
      if (isWriteMethod && !options.skipIdempotency) {
        const headerIdempotencyKey = req.headers.get('x-idempotency-key')
        
        if (options.requireIdempotency && !headerIdempotencyKey) {
          return NextResponse.json({
            success: false,
            error: 'Idempotency key required for this operation',
            code: 'IDEMPOTENCY_KEY_REQUIRED',
            requestId,
          }, { status: 400 })
        }

        let effectiveKey: string | null = null
        if (headerIdempotencyKey) {
          // Sanitize key (replace special chars)
          const safeKey = headerIdempotencyKey.replace(/[^a-zA-Z0-9_-]/g, '_')
          effectiveKey = `key_${auth.uid || 'anon'}_${safeKey}`
        } else if (rawBody) {
          const bodyHash = createHash('sha256').update(rawBody).digest('hex')
          const safePath = req.nextUrl.pathname.replace(/[^a-zA-Z0-9_-]/g, '_')
          // Use path + method + body hash for automatic deduplication
          effectiveKey = `auto_${auth.uid || 'anon'}_${req.method}_${safePath}_${bodyHash}`
        }

        if (effectiveKey) {
          const convex = getConvexIdempotencyClient()
          if (convex) {
            try {
              const result = await convex.mutation(api.apiIdempotency.checkAndClaim, {
                key: effectiveKey,
                requestId,
                method: req.method,
                path: req.nextUrl.pathname,
              })

              if (result.type === 'completed') {
                return NextResponse.json(result.response, { 
                  status: result.httpStatus || 200,
                  headers: { 
                    'X-Idempotency-Hit': 'true', 
                    'X-Idempotency-Key': effectiveKey,
                    'X-Request-ID': requestId 
                  }
                })
              }
              
              if (result.type === 'pending') {
                return NextResponse.json({
                  success: false,
                  error: 'Request already in progress',
                  code: 'IDEMPOTENCY_CONFLICT',
                  requestId,
                }, { 
                  status: 409,
                  headers: { 
                    'X-Request-ID': requestId,
                    'Retry-After': '1'
                  }
                })
              }

              // result.type === 'new' - proceed with handling, store key for later
              idempotencyKey = effectiveKey
            } catch (err) {
              // If Convex is unavailable, log and continue without idempotency
              logger.warn('Idempotency check failed, proceeding without', { error: err })
            }
          }
        }
      }

      // 4. Query Validation
      let query: z.infer<TQuery> = {} as z.infer<TQuery>
      if (options.querySchema) {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
        const result = options.querySchema.safeParse(searchParams)
        if (!result.success) {
          return NextResponse.json({ 
            success: false,
            error: 'Invalid query parameters', 
            details: result.error.flatten().fieldErrors 
          }, { status: 400 })
        }
        query = sanitizeBody(result.data)
      }

      // 5. Execute Handler
      const sanitizedParams = sanitizeBody(params || {})
      const result = await handler(req, { 
        auth, 
        workspace, 
        body, 
        query, 
        params: sanitizedParams as Record<string, string | string[]>
      })

      // 6. Standardize Response
      if (result instanceof Response) {
        result.headers.set('X-Request-ID', requestId)
        return result
      }

      if (isApiResponseLike(result)) {
        const payload: ApiResponse = {
          ...result,
          requestId,
        }

        const status = payload.success ? 200 : 400

        const duration = Date.now() - startTime
        logger.info(`API ${payload.success ? 'Success' : 'Handled Error'}: ${req.method} ${req.nextUrl.pathname}`, {
          type: 'request_end',
          requestId,
          duration,
          status,
          userId: auth.uid,
          workspaceId: workspace?.workspaceId,
        })

        if (!payload.success && idempotencyKey) {
          const convex = getConvexIdempotencyClient()
          if (convex) {
            await convex.mutation(api.apiIdempotency.release, { key: idempotencyKey }).catch(() => {})
          }
        }

        if (payload.success && idempotencyKey) {
          const convex = getConvexIdempotencyClient()
          if (convex) {
            await convex.mutation(api.apiIdempotency.complete, {
              key: idempotencyKey,
              response: payload,
              httpStatus: status,
            }).catch(() => {})
          }
        }

        return NextResponse.json(payload, {
          status,
          headers: { 'X-Request-ID': requestId },
        })
      }

      // Return a standardized success envelope
      const successResponse = {
        ...apiSuccess(result),
        requestId,
      }
      
      const duration = Date.now() - startTime
      logger.info(`API Success: ${req.method} ${req.nextUrl.pathname}`, {
        type: 'request_end',
        requestId,
        duration,
        status: 200,
        userId: auth.uid,
        workspaceId: workspace?.workspaceId,
      })

      if (idempotencyKey) {
        const convex = getConvexIdempotencyClient()
        if (convex) {
          await convex.mutation(api.apiIdempotency.complete, {
            key: idempotencyKey,
            response: successResponse,
            httpStatus: 200,
          }).catch(() => {})
        }
      }

      return NextResponse.json(successResponse, {
        headers: { 'X-Request-ID': requestId }
      })
    } catch (error) {
      const duration = Date.now() - startTime
      const logContext = {
        requestId,
        duration,
        userId: auth.uid,
        workspaceId: workspace?.workspaceId,
      }

      // Handle known API errors
      if (error instanceof UnifiedError) {
        logApiError(error, req, { ...logContext })

        if (idempotencyKey) {
          const convex = getConvexIdempotencyClient()
          if (convex) {
            await convex.mutation(api.apiIdempotency.release, { key: idempotencyKey }).catch(() => {})
          }
        }

        const status = typeof error.status === 'number' ? error.status : 500
        const payload = {
          success: false,
          ...(error.toJSON() as Record<string, unknown>),
          requestId,
        }

        return NextResponse.json(payload, {
          status,
          headers: { 'X-Request-ID': requestId },
        })
      }

      if (error instanceof ApiError) {
        logApiError(error, req, { ...logContext })
        
        if (idempotencyKey) {
          const convex = getConvexIdempotencyClient()
          if (convex) {
            await convex.mutation(api.apiIdempotency.release, { key: idempotencyKey }).catch(() => {})
          }
        }

        return NextResponse.json({ 
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          requestId,
        }, { 
          status: error.status,
          headers: { 'X-Request-ID': requestId }
        })
      }

      if (error instanceof z.ZodError) {
        logApiError(error, req, { ...logContext })

        if (idempotencyKey) {
          const convex = getConvexIdempotencyClient()
          if (convex) {
            await convex.mutation(api.apiIdempotency.release, { key: idempotencyKey }).catch(() => {})
          }
        }

        return NextResponse.json({ 
          success: false,
          error: 'Validation failed', 
          details: error.flatten().fieldErrors,
          code: 'VALIDATION_ERROR',
          requestId,
        }, { 
          status: 400,
          headers: { 'X-Request-ID': requestId }
        })
      }

      // Log and handle unknown errors
      const isDev = process.env.NODE_ENV === 'development'
      
      // CRITICAL: Ensure we see the error in the terminal
      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, error)
      
      logApiError(error, req, { ...logContext, includeStack: isDev })

      if (idempotencyKey) {
        const convex = getConvexIdempotencyClient()
        if (convex) {
          await convex.mutation(api.apiIdempotency.release, { key: idempotencyKey }).catch(() => {})
        }
      }

      return NextResponse.json({ 
        success: false,
        error: options.errorMessage || (isDev && error instanceof Error ? error.message : 'Internal server error'),
        code: 'INTERNAL_ERROR',
        requestId,
      }, { 
        status: 500,
        headers: { 'X-Request-ID': requestId }
      })
    }
  }
}

/**
 * Helper to create a success response
 */
export function apiSuccess<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  }
}

/**
 * Helper to create an error response
 */
export function apiError(message: string, code?: string, details?: Record<string, string[]>): ApiResponse {
  return {
    success: false,
    error: message,
    code,
    details
  }
}

function logApiError(error: unknown, req: NextRequest, opts?: { includeStack?: boolean, requestId?: string, duration?: number, userId?: string | null, workspaceId?: string }) {
  try {
    const requestId = opts?.requestId || req.headers.get('x-request-id') || undefined
    const asApiError = error instanceof ApiError ? error : undefined
    
    const context = {
      type: 'api_error',
      path: req.nextUrl.pathname,
      method: req.method,
      status: asApiError?.status || (error instanceof z.ZodError ? 400 : 500),
      code: asApiError?.code || (error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'),
      requestId,
      duration: opts?.duration,
      userId: opts?.userId,
      workspaceId: opts?.workspaceId,
    }

    const message = error instanceof Error ? error.message : String(error)
    
    if (asApiError && asApiError.status < 500) {
      logger.warn(`API Error: ${message}`, context)
    } else {
      logger.error(`API Error: ${message}`, error, context)
    }
  } catch (loggingError) {
    console.error('[api-handler] failed to log error', loggingError)
  }
}
