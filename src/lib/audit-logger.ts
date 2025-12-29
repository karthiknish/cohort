import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from './firebase-admin'
import { logger } from './logger'

export type AuditAction = 
  | 'USER_PASSWORD_CHANGE'
  | 'USER_ACCOUNT_DELETE'
  | 'WORKSPACE_CREATE'
  | 'WORKSPACE_DELETE'
  | 'ADMIN_ROLE_CHANGE'
  | 'FINANCIAL_SETTINGS_UPDATE'
  | 'INTEGRATION_CONNECT'
  | 'INTEGRATION_DISCONNECT'

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

/**
 * Logs a sensitive action to the audit_logs collection in Firestore
 */
export async function logAuditAction(entry: Omit<AuditLogEntry, 'timestamp'>) {
  try {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    }

    // 1. Log to Firestore for permanent record
    await adminDb.collection('audit_logs').add({
      ...logEntry,
      timestamp: Timestamp.fromDate(logEntry.timestamp)
    })

    // 2. Also log to structured logger for real-time monitoring
    logger.info(`Audit Log: ${entry.action}`, {
      type: 'audit',
      ...entry
    })
  } catch (error) {
    // Don't let audit logging failure crash the main operation, but log it
    logger.error('Failed to write audit log', error, { action: entry.action })
  }
}
