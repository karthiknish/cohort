import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest, AuthenticationError, AuthResult, assertAdmin } from './server-auth'
import { resolveWorkspaceContext, WorkspaceContext } from './workspace'
import { ApiError, RateLimitError } from './api-errors'
import { checkRateLimit, createRateLimitKey, RATE_LIMITS, RateLimitPreset } from './rate-limiter'

/**
 * Standard API Response structure
 */
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  details?: Record<string, string[]>
  code?: string
}

/**
 * Context provided to the API handler
 */
export type ApiHandlerContext<TBody = any, TQuery = any> = {
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
  handler: (req: NextRequest, context: ApiHandlerContext<z.infer<TBody>, z.infer<TQuery>>) => Promise<ApiResponse | Response | any>
) {
  return async (req: NextRequest, context: { params: Promise<any> }) => {
    try {
      const params = await (context?.params || Promise.resolve({}))
      const authOption = options.auth ?? 'required'
      const workspaceOption = options.workspace ?? 'none'
      
      // 0. Rate Limiting (before auth to prevent brute force)
      if (options.rateLimit) {
        const config = typeof options.rateLimit === 'string'
          ? RATE_LIMITS[options.rateLimit]
          : options.rateLimit
        
        // Use IP address for anonymous rate limiting
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
          || req.headers.get('x-real-ip') 
          || 'unknown'
        const rateLimitKey = createRateLimitKey(req.nextUrl.pathname, ip)
        const { allowed, remaining, resetMs } = checkRateLimit(rateLimitKey, config)
        
        if (!allowed) {
          const retryAfter = Math.ceil(resetMs / 1000)
          return NextResponse.json(
            {
              success: false,
              error: 'Too many requests. Please try again later.',
              code: 'RATE_LIMIT_EXCEEDED',
            },
            {
              status: 429,
              headers: {
                'Retry-After': String(retryAfter),
                'X-RateLimit-Limit': String(config.maxRequests),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + retryAfter),
              },
            }
          )
        }
      }
      
      let auth: AuthResult = { uid: null, email: null, name: null, claims: {}, isCron: false }
      
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
      let workspace: WorkspaceContext | undefined
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
      let body: any = {}
      if (options.bodySchema) {
        let json: any
        try {
          json = await req.json()
        } catch (e) {
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
        body = result.data
      }

      // 4. Query Validation
      let query: any = {}
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
        query = result.data
      }

      // 5. Execute Handler
      const result = await handler(req, { 
        auth, 
        workspace, 
        body, 
        query, 
        params: params || {} 
      })

      // 6. Standardize Response
      if (result instanceof Response) {
        return result
      }

      // Return a standardized success envelope
      return NextResponse.json(apiSuccess(result))
    } catch (error) {
      // Handle known API errors
      if (error instanceof ApiError) {
        logApiError(error, req)
        return NextResponse.json({ 
          success: false,
          error: error.message,
          code: error.code,
          details: error.details
        }, { status: error.status })
      }

      if (error instanceof z.ZodError) {
        logApiError(error, req)
        return NextResponse.json({ 
          success: false,
          error: 'Validation failed', 
          details: error.flatten().fieldErrors,
          code: 'VALIDATION_ERROR'
        }, { status: 400 })
      }

      // Log and handle unknown errors
      const isDev = process.env.NODE_ENV === 'development'
      logApiError(error, req, { includeStack: isDev })
      return NextResponse.json({ 
        success: false,
        error: options.errorMessage || (isDev && error instanceof Error ? error.message : 'Internal server error'),
        code: 'INTERNAL_ERROR'
      }, { status: 500 })
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

function logApiError(error: unknown, req: NextRequest, opts?: { includeStack?: boolean }) {
  try {
    const requestId = req.headers.get('x-request-id') || undefined
    const asApiError = error instanceof ApiError ? error : undefined
    const payload = {
      level: 'error',
      type: 'api_error',
      path: req.nextUrl.pathname,
      method: req.method,
      status: asApiError?.status,
      code: asApiError?.code,
      message: error instanceof Error ? error.message : String(error),
      stack: opts?.includeStack && error instanceof Error ? error.stack : undefined,
      requestId,
      timestamp: new Date().toISOString(),
    }
    console.error(JSON.stringify(payload))
  } catch (loggingError) {
    console.error('[api-handler] failed to log error', loggingError)
  }
}
