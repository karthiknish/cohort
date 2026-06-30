/**
 * Auth type + UI helper barrel.
 *
 * The legacy `AuthService` singleton and its error-class translators were
 * removed when auth moved to the official Convex + Better Auth structure.
 * What remains: the shared auth types and the user-facing message mapper.
 */
export type { AuthRole, AuthStatus, AuthUser, SignUpData } from './types';
export { getFriendlyAuthErrorMessage } from './error-utils';
export type { AuthErrorCode } from './error-utils';
