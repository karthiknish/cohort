import type { ConvexHttpClient } from 'convex/browser'

import { createConvexAdminClient, isConvexAdsEnabled } from '@/lib/convex-admin'
import type { AuthResult } from '@/lib/server-auth'
import { resolveWorkspaceIdForUser } from '@/lib/workspace'
import { logger } from '@/lib/logger'

import type { AdIntegration, NormalizedMetric, SyncJob } from '@/types/integrations'

type TimestampInput = Date | string | number | unknown | null | undefined

function toMillis(value: TimestampInput): number | null {
    if (value === null || value === undefined) return null
    if (value instanceof Date) {
        const ms = value.getTime()
        return Number.isNaN(ms) ? null : ms
    }
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) return null
        return value
    }
    if (typeof value === 'string') {
        const parsed = Date.parse(value)
        return Number.isNaN(parsed) ? null : parsed
    }
    const maybeToMillis = value as { toMillis?: () => number }
    if (typeof maybeToMillis.toMillis === 'function') {
        try {
            const ms = maybeToMillis.toMillis()
            return Number.isFinite(ms) ? ms : null
        } catch {
            return null
        }
    }
    const maybeToDate = value as { toDate?: () => Date }
    if (typeof maybeToDate.toDate === 'function') {
        try {
            const date = maybeToDate.toDate()
            const ms = date instanceof Date ? date.getTime() : NaN
            return Number.isNaN(ms) ? null : ms
        } catch {
            return null
        }
    }
    return null
}

function getConvexClientForUser(userId: string): ConvexHttpClient | null {
    const auth: AuthResult = {
        uid: userId,
        email: null,
        name: null,
        claims: { provider: 'convex' },
        isCron: false,
    }
    return createConvexAdminClient({ auth })
}

function normalizeClientId(value: unknown): string | null {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

function shouldUseConvexAds(): boolean {
    return Boolean(process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL)
}

/**
 * Executes a Convex mutation with error handling and logging.
 */
async function executeMutation(convex: ConvexHttpClient, name: string, args: any, context: any = {}): Promise<any> {
    try {
        return await convex.mutation(name as any, args)
    } catch (error) {
        logger.error(`Convex Mutation Error: ${name}`, error, {
            type: 'convex_error',
            method: 'mutation',
            name,
            ...context
        })
        throw error
    }
}

/**
 * Executes a Convex query with error handling and logging.
 */
async function executeQuery(convex: ConvexHttpClient, name: string, args: any, context: any = {}): Promise<any> {
    try {
        return await convex.query(name as any, args)
    } catch (error) {
        logger.error(`Convex Query Error: ${name}`, error, {
            type: 'convex_error',
            method: 'query',
            name,
            ...context
        })
        throw error
    }
}

export async function persistIntegrationTokens(options: {
    userId: string
    providerId: string
    clientId?: string | null
    accessToken: string | null
    refreshToken?: string | null
    idToken?: string | null
    scopes?: string[]
    status?: 'pending' | 'success' | 'error' | 'never'
    accessTokenExpiresAt?: TimestampInput
    refreshTokenExpiresAt?: TimestampInput
    developerToken?: string | null
    loginCustomerId?: string | null
    managerCustomerId?: string | null
    accountId?: string | null
    accountName?: string | null
}): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    await executeMutation(convex, 'adsIntegrations:persistIntegrationTokens', {
        workspaceId,
        providerId: options.providerId,
        clientId: normalizeClientId(options.clientId),
        accessToken: options.accessToken,
        refreshToken: options.refreshToken,
        idToken: options.idToken,
        scopes: options.scopes,
        status: options.status,
        accessTokenExpiresAtMs:
            options.accessTokenExpiresAt === undefined ? undefined : toMillis(options.accessTokenExpiresAt),
        refreshTokenExpiresAtMs:
            options.refreshTokenExpiresAt === undefined ? undefined : toMillis(options.refreshTokenExpiresAt),
        developerToken: options.developerToken,
        loginCustomerId: options.loginCustomerId,
        managerCustomerId: options.managerCustomerId,
        accountId: options.accountId,
        accountName: options.accountName,
    }, { userId: options.userId, providerId: options.providerId })
}


export async function updateIntegrationCredentials(options: {
    userId: string
    providerId: string
    clientId?: string | null
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: TimestampInput
    refreshTokenExpiresAt?: TimestampInput
    developerToken?: string | null
    loginCustomerId?: string | null
    managerCustomerId?: string | null
    accountId?: string | null
    accountName?: string | null
}): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    await executeMutation(convex, 'adsIntegrations:updateIntegrationCredentials', {
        workspaceId,
        providerId: options.providerId,
        clientId: normalizeClientId(options.clientId),
        accessToken: options.accessToken,
        refreshToken: options.refreshToken,
        idToken: options.idToken,
        accessTokenExpiresAtMs:
            options.accessTokenExpiresAt === undefined ? undefined : toMillis(options.accessTokenExpiresAt),
        refreshTokenExpiresAtMs:
            options.refreshTokenExpiresAt === undefined ? undefined : toMillis(options.refreshTokenExpiresAt),
        developerToken: options.developerToken,
        loginCustomerId: options.loginCustomerId,
        managerCustomerId: options.managerCustomerId,
        accountId: options.accountId,
        accountName: options.accountName,
    }, { userId: options.userId, providerId: options.providerId })
}

export async function enqueueSyncJob(options: {
    userId: string
    providerId: string
    clientId?: string | null
    jobType?: 'initial-backfill' | 'scheduled-sync' | 'manual-sync'
    timeframeDays?: number
}): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    await executeMutation(convex, 'adsIntegrations:enqueueSyncJob', {
        workspaceId,
        providerId: options.providerId,
        clientId: normalizeClientId(options.clientId),
        jobType: options.jobType ?? 'initial-backfill',
        timeframeDays: options.timeframeDays ?? 90,
        cronKey: process.env.INTEGRATIONS_CRON_SECRET,
    }, { userId: options.userId, providerId: options.providerId })
}

export async function getAdIntegration(options: {
    userId: string
    providerId: string
    clientId?: string | null
}): Promise<AdIntegration | null> {
    if (!shouldUseConvexAds()) {
        return null
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        return null
    }

    const row = (await executeQuery(convex, 'adsIntegrations:getAdIntegration', {
        workspaceId,
        providerId: options.providerId,
        clientId: normalizeClientId(options.clientId),
    }, { userId: options.userId, providerId: options.providerId })) as
        | {
            providerId: string
            clientId: string | null
            accessToken: string | null
            idToken: string | null
            refreshToken: string | null
            scopes: string[]
            accountId: string | null
            accountName: string | null
            currency: string | null
            developerToken: string | null
            loginCustomerId: string | null
            managerCustomerId: string | null
            accessTokenExpiresAtMs: number | null
            refreshTokenExpiresAtMs: number | null
            lastSyncStatus: 'never' | 'pending' | 'success' | 'error'
            lastSyncMessage: string | null
            lastSyncedAtMs: number | null
            lastSyncRequestedAtMs: number | null
            linkedAtMs: number | null
            autoSyncEnabled: boolean | null
            syncFrequencyMinutes: number | null
            scheduledTimeframeDays: number | null
        }
        | null

    if (!row) {
        return null
    }

    return {
        id: options.providerId,
        providerId: row.providerId,
        accessToken: row.accessToken,
        idToken: row.idToken,
        refreshToken: row.refreshToken,
        scopes: row.scopes,
        accountId: row.accountId,
        accountName: row.accountName,
        currency: row.currency,
        developerToken: row.developerToken,
        loginCustomerId: row.loginCustomerId,
        managerCustomerId: row.managerCustomerId,
        accessTokenExpiresAt: (row.accessTokenExpiresAtMs as any) ?? null,
        refreshTokenExpiresAt: (row.refreshTokenExpiresAtMs as any) ?? null,
        lastSyncStatus: row.lastSyncStatus,
        lastSyncMessage: row.lastSyncMessage,
        lastSyncedAt: (row.lastSyncedAtMs as any) ?? null,
        lastSyncRequestedAt: (row.lastSyncRequestedAtMs as any) ?? null,
        linkedAt: (row.linkedAtMs as any) ?? null,
        autoSyncEnabled: row.autoSyncEnabled,
        syncFrequencyMinutes: row.syncFrequencyMinutes,
        scheduledTimeframeDays: row.scheduledTimeframeDays,
    }
}

export async function claimNextSyncJob(options: { userId: string }): Promise<SyncJob | null> {
    if (!shouldUseConvexAds()) {
        return null
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        return null
    }

    const job = (await executeMutation(convex, 'adsIntegrations:claimNextSyncJob', {
        workspaceId,
    }, { userId: options.userId })) as
        | {
            id: string
            providerId: string
            clientId: string | null
            jobType: SyncJob['jobType']
            timeframeDays: number
            status: 'running'
            createdAtMs: number
            startedAtMs: number | null
            processedAtMs: number | null
            errorMessage: string | null
        }
        | null

    if (!job) {
        return null
    }

    return {
        id: job.id,
        providerId: job.providerId,
        clientId: job.clientId ?? null,
        jobType: job.jobType,
        timeframeDays: job.timeframeDays,
        status: job.status,
        createdAt: (job.createdAtMs as any) ?? null,
        startedAt: (job.startedAtMs as any) ?? null,
        processedAt: (job.processedAtMs as any) ?? null,
        errorMessage: job.errorMessage,
    }
}

export async function completeSyncJob(options: { userId: string; jobId: string }): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    await executeMutation(convex, 'adsIntegrations:completeSyncJob', {
        jobId: options.jobId as any,
    }, { userId: options.userId, jobId: options.jobId })
}

export async function failSyncJob(options: { userId: string; jobId: string; message: string }): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    await executeMutation(convex, 'adsIntegrations:failSyncJob', {
        jobId: options.jobId as any,
        message: options.message,
    }, { userId: options.userId, jobId: options.jobId })
}

export async function updateIntegrationStatus(options: {
    userId: string
    providerId: string
    clientId?: string | null
    status: 'pending' | 'success' | 'error'
    message?: string | null
}): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    await executeMutation(convex, 'adsIntegrations:updateIntegrationStatus', {
        workspaceId,
        providerId: options.providerId,
        clientId: normalizeClientId(options.clientId),
        status: options.status,
        message: options.message ?? null,
    }, { userId: options.userId, providerId: options.providerId })
}

export async function writeMetricsBatch(options: {
    userId: string
    clientId?: string | null
    metrics: NormalizedMetric[]
}): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    const metrics = options.metrics as NormalizedMetric[]
    if (!metrics.length) return

    // Avoid oversized payloads.
    const chunkSize = 100
    for (let i = 0; i < metrics.length; i += chunkSize) {
        const chunk = metrics.slice(i, i + chunkSize)
        await executeMutation(convex, 'adsIntegrations:writeMetricsBatch', {
            workspaceId,
            metrics: chunk.map((metric) => ({
                providerId: metric.providerId,
                clientId: normalizeClientId(metric.clientId ?? null),
                accountId: normalizeClientId(metric.accountId ?? null),
                date: metric.date,
                spend: metric.spend,
                impressions: metric.impressions,
                clicks: metric.clicks,
                conversions: metric.conversions,
                revenue: metric.revenue ?? null,
                campaignId: metric.campaignId,
                campaignName: metric.campaignName,
                creatives: metric.creatives,
                rawPayload: metric.rawPayload,
            })),
        }, { userId: options.userId, metricsCount: chunk.length })
    }
}

export async function hasPendingSyncJob(options: {
    userId: string
    providerId: string
    clientId?: string | null
}): Promise<boolean> {
    if (!shouldUseConvexAds()) {
        return false
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        return false
    }

    const result = (await executeQuery(convex, 'adsIntegrations:hasPendingSyncJob', {
        workspaceId,
        providerId: options.providerId,
        clientId: normalizeClientId(options.clientId),
    }, { userId: options.userId, providerId: options.providerId })) as boolean

    return result
}

export async function markIntegrationSyncRequested(
    options: {
        userId: string
        providerId: string
        clientId?: string | null
        status?: 'pending' | 'never' | 'error' | 'success'
    }
): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    await executeMutation(convex, 'adsIntegrations:markIntegrationSyncRequested', {
        workspaceId,
        providerId: options.providerId,
        clientId: normalizeClientId(options.clientId),
        status: options.status ?? 'pending',
    }, { userId: options.userId, providerId: options.providerId })
}

export async function updateIntegrationPreferences(options: {
    userId: string
    providerId: string
    clientId?: string | null
    autoSyncEnabled?: boolean | null
    syncFrequencyMinutes?: number | null
    scheduledTimeframeDays?: number | null
}): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    await executeMutation(convex, 'adsIntegrations:updateIntegrationPreferences', {
        workspaceId,
        providerId: options.providerId,
        clientId: normalizeClientId(options.clientId),
        autoSyncEnabled: options.autoSyncEnabled ?? null,
        syncFrequencyMinutes: options.syncFrequencyMinutes ?? null,
        scheduledTimeframeDays: options.scheduledTimeframeDays ?? null,
    }, { userId: options.userId, providerId: options.providerId })
}

export async function deleteAdIntegration(options: {
    userId: string
    providerId: string
    clientId?: string | null
}): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    await executeMutation(convex, 'adsIntegrations:deleteAdIntegration', {
        workspaceId,
        providerId: options.providerId,
        clientId: normalizeClientId(options.clientId),
    }, { userId: options.userId, providerId: options.providerId })
}

export async function deleteSyncJobs(options: {
    userId: string
    providerId: string
    clientId?: string | null
}): Promise<void> {
    if (!shouldUseConvexAds()) {
        throw new Error('Convex ads are not enabled')
    }

    const workspaceId = await resolveWorkspaceIdForUser(options.userId)
    const convex = getConvexClientForUser(options.userId)
    if (!convex) {
        throw new Error('Convex admin client is not configured')
    }

    await executeMutation(convex, 'adsIntegrations:deleteSyncJobs', {
        workspaceId,
        providerId: options.providerId,
        clientId: normalizeClientId(options.clientId),
    }, { userId: options.userId, providerId: options.providerId })
}
