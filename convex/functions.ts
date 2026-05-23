/**
 * Convex function wrappers (auth, workspace scope, Zod, pagination, rate limits).
 * Implementation is split under ./lib/functions/ to stay under the 1k-line limit.
 */
export { wrappedResponseZ } from './lib/functions/response'
export type {
  AuthenticatedQueryCtx,
  AuthenticatedMutationCtx,
  AuthenticatedActionCtx,
  MutationHandler,
} from './lib/functions/types'
export { PaginationValidators, applyManualPagination, getPaginatedResponse } from './lib/functions/pagination'
export { requireWorkspaceAccess } from './lib/functions/auth'
export {
  authenticatedQuery,
  optionalAuthenticatedQuery,
  workspaceQuery,
  workspaceQueryActive,
  adminQuery,
  adminPaginatedQuery,
} from './lib/functions/queryWrappers'
export {
  authenticatedMutation,
  workspaceMutation,
  adminMutation,
} from './lib/functions/mutationWrappers'
export { authenticatedAction, adminAction } from './lib/functions/actionWrappers'
export {
  zAuthenticatedQuery,
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zAuthenticatedMutation,
  zWorkspaceMutation,
  zAuthenticatedAction,
  zWorkspaceAction,
  zWorkspacePaginatedQuery,
  zWorkspacePaginatedQueryActive,
  zAdminQuery,
  zAdminMutation,
  zAdminAction,
} from './lib/functions/zodWrappers'
export {
  RateLimitPresets,
  type RateLimitPreset,
  rateLimitedAuthenticatedMutation,
  rateLimitedWorkspaceMutation,
  rateLimitedAdminMutation,
  zRateLimitedAuthenticatedMutation,
  zRateLimitedIdentityMutation,
  zRateLimitedWorkspaceMutation,
} from './lib/functions/rateLimitedWrappers'
