import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest, AuthenticationError, AuthResult, assertAdmin } from './server-auth'
import { resolveWorkspaceContext, WorkspaceContext } from './workspace'
import { ApiError } from './api-errors'

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
        return NextResponse.json({ 
          success: false,
          error: error.message,
          code: error.code,
          details: error.details
        }, { status: error.status })
      }

      if (error instanceof z.ZodError) {
        return NextResponse.json({ 
          success: false,
          error: 'Validation failed', 
          details: error.flatten().fieldErrors,
          code: 'VALIDATION_ERROR'
        }, { status: 400 })
      }

      // Log and handle unknown errors
      console.error(`[API Error] ${req.nextUrl.pathname}:`, error)
      
      const isDev = process.env.NODE_ENV === 'development'
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
