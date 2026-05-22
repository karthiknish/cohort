'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'

import {
  bootstrapAndSyncSessionOnce,
  resetBootstrapSessionCache,
  type BootstrapProfile,
} from '@/features/auth/auth-utils'
import { authClient } from '@/lib/auth-client'
import { decodeJwtSubject } from '@/lib/jwt-utils'
import {
  deriveAuthPhase,
  isLoadingPhase,
  mergeConvexProfile,
  type AuthPhase,
  type AuthSyncState,
} from '@/lib/auth-phase'
import { authService } from '@/services/auth'
import type { AuthUser } from '@/services/auth'
import { api } from '@convex/_generated/api'

export type AuthErrorCode =
  | 'SESSION_SYNC_FAILED'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'UNKNOWN'

export interface AuthError {
  code: AuthErrorCode
  message: string
  details?: Record<string, unknown>
  retryable: boolean
}

function createAuthError(
  code: AuthErrorCode,
  message: string,
  details?: Record<string, unknown>,
  retryable = false
): AuthError {
  return { code, message, details, retryable }
}

class StaleSyncError extends Error {
  constructor() {
    super('Auth sync superseded by a newer run')
    this.name = 'StaleSyncError'
  }
}

const SYNC_TIMEOUT_MS = 8_000
const TOKEN_RETRY_DELAYS_MS = [0, 400, 900, 1800]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function extractConvexToken(result: unknown): string | null {
  if (typeof result === 'string') {
    const trimmed = result.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (typeof result !== 'object' || result === null) {
    return null
  }

  if ('token' in result) {
    const direct = (result as { token?: unknown }).token
    if (typeof direct === 'string' && direct.trim().length > 0) {
      return direct.trim()
    }
  }

  if ('data' in result) {
    return extractConvexToken((result as { data?: unknown }).data)
  }

  return null
}

async function fetchConvexTokenOnce(): Promise<string | null> {
  const result = await authClient.convex.token({ fetchOptions: { throw: false } }).catch(() => null)
  return extractConvexToken(result)
}

async function fetchConvexTokenWithRetry(assertActive: () => void): Promise<string | null> {
  const token = await fetchConvexTokenOnce()
  if (token) {
    return token
  }

  const retryWithDelays = async (delayIndex: number): Promise<string | null> => {
    const delay = TOKEN_RETRY_DELAYS_MS[delayIndex]
    if (delay === undefined) return null

    if (delay > 0) {
      await sleep(delay)
    }
    assertActive()
    const nextToken = await fetchConvexTokenOnce()
    if (nextToken) {
      return nextToken
    }

    return retryWithDelays(delayIndex + 1)
  }

  return retryWithDelays(0)
}

async function runAuthSyncPipeline(assertActive: () => void): Promise<{
  subject: string
  profile: BootstrapProfile
}> {
  assertActive()

  const profile = await Promise.race([
    bootstrapAndSyncSessionOnce(),
    sleep(SYNC_TIMEOUT_MS).then(() => {
      throw new Error('Timed out while setting up your workspace. Please retry.')
    }),
  ])

  assertActive()

  let resolvedToken = await fetchConvexTokenWithRetry(assertActive)
  if (!resolvedToken) {
    resolvedToken = await fetchConvexTokenOnce()
  }

  const subject =
    (resolvedToken ? decodeJwtSubject(resolvedToken) : null)
    ?? profile.legacyId

  if (!subject) {
    throw new Error('We could not finish securing your session. Try again or sign in once more.')
  }

  return { subject, profile }
}

function applyBootstrapProfile(baseUser: AuthUser, profile: BootstrapProfile | null): AuthUser {
  if (!profile) {
    return baseUser
  }

  return {
    ...baseUser,
    role: profile.role,
    status: profile.status,
    agencyId: profile.agencyId,
  }
}

export function useAuthSync() {
  const [syncGeneration, setSyncGeneration] = useState(0)
  const syncGenerationRef = useRef(syncGeneration)
  syncGenerationRef.current = syncGeneration

  const [sessionSync, setSessionSync] = useState({
    syncState: 'idle' as AuthSyncState,
    authError: null as AuthError | null,
    sessionUser: null as AuthUser | null,
    convexLegacyId: null as string | null,
    bootstrapProfile: null as BootstrapProfile | null,
  })
  const { syncState, authError, sessionUser, convexLegacyId, bootstrapProfile } = sessionSync

  const { data: betterAuthSession, isPending: sessionPending } = authClient.useSession()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()

  const profileLegacyId = convexLegacyId ?? sessionUser?.id ?? null
  const convexUser = useQuery(
    api.users.getByLegacyIdSafe,
    profileLegacyId && isAuthenticated ? { legacyId: profileLegacyId } : 'skip'
  )

  const profilePending = false

  const profileMissing =
    Boolean(profileLegacyId)
    && isAuthenticated
    && !convexAuthLoading
    && convexUser === null
    && syncState === 'success'
    && !bootstrapProfile

  const user = useMemo(() => {
    if (!sessionUser) {
      return null
    }

    let merged = applyBootstrapProfile(sessionUser, bootstrapProfile)

    if (convexUser) {
      merged = mergeConvexProfile(merged, convexUser)
    }

    if (convexLegacyId && merged.id !== convexLegacyId) {
      merged = { ...merged, id: convexLegacyId }
    }

    return merged
  }, [bootstrapProfile, convexLegacyId, convexUser, sessionUser])

  const hasSession = Boolean(betterAuthSession?.user ?? sessionUser)
  const awaitingSession = sessionPending && !betterAuthSession?.user && !sessionUser

  if (profileMissing && syncState === 'success') {
    setSessionSync((prev) => ({
      ...prev,
      syncState: 'failed',
      authError: createAuthError(
        'SESSION_SYNC_FAILED',
        'Workspace profile not found. Your sign-in succeeded but the profile could not be loaded.',
        undefined,
        true,
      ),
    }))
  }

  const mappedBetterAuthUser = useMemo(() => {
    const rawUser = betterAuthSession?.user
    if (!rawUser) return null
    return authService.mapBetterAuthUser(rawUser as Record<string, unknown>)
  }, [betterAuthSession?.user])

  if (mappedBetterAuthUser) {
    if (sessionUser?.id !== mappedBetterAuthUser.id) {
      setSessionSync((prev) => ({
        ...prev,
        sessionUser: mappedBetterAuthUser,
      }))
    }
  } else if (
    !awaitingSession &&
    (sessionUser !== null ||
      syncState !== 'idle' ||
      authError !== null ||
      convexLegacyId !== null ||
      bootstrapProfile !== null)
  ) {
    setSessionSync({
      syncState: 'idle',
      authError: null,
      sessionUser: null,
      convexLegacyId: null,
      bootstrapProfile: null,
    })
  }

  const initialAuthHydratedRef = useRef(false)
  if (hasSession && !initialAuthHydratedRef.current) {
    initialAuthHydratedRef.current = true
    void authService.waitForInitialAuth().then(() => {
      const cachedUser = authService.getCurrentUser()
      if (cachedUser) {
        setSessionSync((prev) => ({
          ...prev,
          sessionUser: prev.sessionUser ?? cachedUser,
        }))
      }
    })
  }

  const runSessionSync = useCallback(async (runId: number) => {
    setSessionSync((prev) => ({ ...prev, syncState: 'running', authError: null }))

    const assertActive = () => {
      if (syncGenerationRef.current !== runId) {
        throw new StaleSyncError()
      }
    }

    try {
      if (syncGenerationRef.current !== runId) {
        return
      }

      const result = await runAuthSyncPipeline(assertActive)

      if (syncGenerationRef.current !== runId) {
        return
      }

      setSessionSync((prev) => ({
        ...prev,
        convexLegacyId: result.subject,
        bootstrapProfile: result.profile,
        syncState: 'success',
      }))
    } catch (error) {
      if (error instanceof StaleSyncError) {
        return
      }

      if (syncGenerationRef.current !== runId) {
        return
      }

      const message = error instanceof Error ? error.message : 'Failed to sync your session'
      setSessionSync((prev) => ({
        ...prev,
        syncState: 'failed',
        authError: createAuthError('SESSION_SYNC_FAILED', message, undefined, true),
      }))
    }
  }, [])

  useEffect(() => {
    if (awaitingSession || !hasSession) {
      return
    }

    if (syncState === 'failed') {
      return
    }

    if (syncState === 'running') {
      return
    }

    if (syncState === 'success' && bootstrapProfile && convexLegacyId) {
      return
    }

    void runSessionSync(syncGeneration)
  }, [awaitingSession, bootstrapProfile, convexLegacyId, hasSession, runSessionSync, syncGeneration, syncState])

  const phase = useMemo<AuthPhase>(() => deriveAuthPhase({
    sessionPending: awaitingSession,
    hasSession,
    syncState,
    convexAuthLoading,
    isAuthenticated,
    profilePending,
    user,
  }), [
    awaitingSession,
    convexAuthLoading,
    hasSession,
    isAuthenticated,
    profilePending,
    syncState,
    user,
  ])

  const retrySync = useCallback(async () => {
    setSessionSync((prev) => ({ ...prev, authError: null, syncState: 'idle' }))
    setSyncGeneration((value) => value + 1)
  }, [])

  const clearAuthError = useCallback(() => {
    setSessionSync((prev) => ({ ...prev, authError: null }))
  }, [])

  const resetSession = useCallback(() => {
    resetBootstrapSessionCache()
    setSessionSync({
      syncState: 'idle',
      authError: null,
      sessionUser: null,
      convexLegacyId: null,
      bootstrapProfile: null,
    })
  }, [])

  const applySessionUser = useCallback((nextUser: AuthUser | null) => {
    if (nextUser) {
      if (nextUser.agencyId && nextUser.role && nextUser.status) {
        setSessionSync({
          syncState: 'success',
          authError: null,
          sessionUser: nextUser,
          convexLegacyId: nextUser.id,
          bootstrapProfile: {
            legacyId: nextUser.id,
            role: nextUser.role,
            status: nextUser.status,
            agencyId: nextUser.agencyId,
          },
        })
        return
      }

      setSessionSync((prev) => ({ ...prev, sessionUser: nextUser }))
      setSyncGeneration((value) => value + 1)
    } else {
      resetSession()
    }
  }, [resetSession])

  return {
    phase,
    user,
    authError,
    clearAuthError,
    retrySync,
    resetSession,
    applySessionUser,
    loading: isLoadingPhase(phase),
    isSyncing: syncState === 'running',
  }
}
