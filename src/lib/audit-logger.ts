import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../convex/_generated/api'
import { logger } from './logger'

export type AuditAction = 
  | 'USER_PASSWORD_CHANGE'
  | 'USER_ACCOUNT_DELETE'
  | 'WORKSPACE_CREATE'
  | 'WORKSPACE_DELETE'
  | 'ADMIN_ROLE_CHANGE'
  | 'USER_STATUS_CHANGE'
  | 'FINANCIAL_SETTINGS_UPDATE'
  | 'INTEGRATION_CONNECT'
  | 'INTEGRATION_DISCONNECT'
  | 'INTEGRATION_UPDATE'
  | 'CLIENT_CREATE'
  | 'CLIENT_DELETE'
  | 'PROJECT_CREATE'
  | 'PROJECT_DELETE'

export interface AuditLogEntry {
  action: AuditAction
  actorId: string
  actorEmail?: string
  targetId?: string
  workspaceId?: string
  metadata?: Record<string, unknown>
  ip?: string
  userAgent?: string
  requestId?: string
  timestamp: Date
}

// Lazy-init Convex client
let _convexClient: ConvexHttpClient | null = null
function getConvexClient(): ConvexHttpClient | null {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return null
  _convexClient = new ConvexHttpClient(url)
  return _convexClient
}

import { after } from 'next/server'

/**
 * Logs a sensitive action to the audit_logs collection in Convex
 */
export async function logAuditAction(entry: Omit<AuditLogEntry, 'timestamp'>) {
  after(async () => {
    try {
      const logEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date(),
      }

      // 1. Log to Convex for permanent record
      const convex = getConvexClient()
      if (convex) {
        await convex.mutation(api.auditLogs.log, {
          serverKey: process.env.INTEGRATIONS_CRON_SECRET || '',
          action: entry.action,
          actorId: entry.actorId,
          actorEmail: entry.actorEmail ?? null,
          targetId: entry.targetId ?? null,
          workspaceId: entry.workspaceId ?? null,
          metadata: entry.metadata as Record<string, string | number | boolean | null> | undefined,
          ip: entry.ip ?? null,
          userAgent: entry.userAgent ?? null,
          requestId: entry.requestId ?? null,
        })
      }

      // 2. Also log to structured logger for real-time monitoring
      logger.info(`Audit Log: ${entry.action}`, {
        type: 'audit',
        ...entry
      })
    } catch (error) {
      // Don't let audit logging failure crash the main operation, but log it
      logger.error('Failed to write audit log', error, { action: entry.action })
    }
  })
}
