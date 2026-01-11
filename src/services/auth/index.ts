export type { AuthRole, AuthStatus, AuthUser, SignUpData } from './types'
export { AuthService, authService } from './auth-service'
export {
  getFriendlyAuthErrorMessage,
  parseAuthError,
  isNetworkError,
  isSessionExpiredError,
  isRetryableError,
  isAccountStatusError,
  isFirebaseError,
} from './error-utils'
export type { AuthErrorCode } from './error-utils'
