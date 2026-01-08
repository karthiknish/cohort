// =============================================================================
// DERIVED METRICS STORAGE - Firestore CRUD operations
// =============================================================================

import {
    Timestamp,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    where,
    writeBatch,
    orderBy,
    limit as firestoreLimit,
    deleteDoc,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type {
    DerivedMetricRecord,
    DerivedMetricInput,
    DerivedMetricsQueryOptions,
    DerivedMetricsQueryResult,
} from './types'

// =============================================================================
// COLLECTION REFERENCE
// =============================================================================

/**
 * Get reference to derived metrics collection
 */
function getDerivedMetricsCollection(workspaceId: string) {
    return collection(db, 'workspaces', workspaceId, 'adMetricsDerived')
}

/**
 * Generate a compound document ID for derived metrics
 */
function generateMetricDocId(input: DerivedMetricInput): string {
    const parts = [input.providerId, input.date, input.metricId]
    if (input.campaignId) {
        parts.push(input.campaignId)
    }
    return parts.join('_')
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Write a batch of derived metrics to Firestore
 */
export async function writeDerivedMetrics(options: {
    workspaceId: string
    metrics: DerivedMetricInput[]
}): Promise<{ written: number }> {
    const { workspaceId, metrics } = options

    if (!metrics.length) {
        return { written: 0 }
    }

    const batch = writeBatch(db)
    const metricsCollection = getDerivedMetricsCollection(workspaceId)

    metrics.forEach((metric) => {
        const docId = generateMetricDocId(metric)
        const docRef = doc(metricsCollection, docId)

        const record: DerivedMetricRecord = {
            ...metric,
            createdAt: serverTimestamp(),
        }

        batch.set(docRef, record, { merge: true })
    })

    await batch.commit()

    return { written: metrics.length }
}

/**
 * Write a single derived metric
 */
export async function writeDerivedMetric(options: {
    workspaceId: string
    metric: DerivedMetricInput
}): Promise<void> {
    await writeDerivedMetrics({
        workspaceId: options.workspaceId,
        metrics: [options.metric],
    })
}

// =============================================================================
// QUERY OPERATIONS
// =============================================================================

/**
 * Query derived metrics with filters
 */
export async function queryDerivedMetrics(
    options: DerivedMetricsQueryOptions
): Promise<DerivedMetricsQueryResult> {
    const {
        workspaceId,
        providerId,
        startDate,
        endDate,
        metricType,
        metricId,
        campaignId,
        limit: queryLimit = 100,
    } = options

    const metricsCollection = getDerivedMetricsCollection(workspaceId)

    // Build query constraints
    const constraints: Parameters<typeof query>[1][] = []

    if (providerId) {
        constraints.push(where('providerId', '==', providerId))
    }

    if (metricType) {
        constraints.push(where('metricType', '==', metricType))
    }

    if (metricId) {
        constraints.push(where('metricId', '==', metricId))
    }

    if (campaignId) {
        constraints.push(where('campaignId', '==', campaignId))
    }

    if (startDate) {
        constraints.push(where('date', '>=', startDate))
    }

    if (endDate) {
        constraints.push(where('date', '<=', endDate))
    }

    constraints.push(orderBy('date', 'desc'))
    constraints.push(firestoreLimit(queryLimit))

    const q = query(metricsCollection, ...constraints)
    const snapshot = await getDocs(q)

    const metrics: DerivedMetricRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
            ...data,
            createdAt: data.createdAt as Timestamp,
        } as DerivedMetricRecord
    })

    return {
        metrics,
        count: metrics.length,
    }
}

/**
 * Get derived metrics for a specific date range
 */
export async function getDerivedMetricsByDateRange(options: {
    workspaceId: string
    providerId?: string
    startDate: string
    endDate: string
}): Promise<DerivedMetricRecord[]> {
    const result = await queryDerivedMetrics({
        workspaceId: options.workspaceId,
        providerId: options.providerId,
        startDate: options.startDate,
        endDate: options.endDate,
        limit: 1000,
    })
    return result.metrics
}

/**
 * Get latest derived metrics for each metric type
 */
export async function getLatestDerivedMetrics(options: {
    workspaceId: string
    providerId?: string
    limit?: number
}): Promise<DerivedMetricRecord[]> {
    const result = await queryDerivedMetrics({
        workspaceId: options.workspaceId,
        providerId: options.providerId,
        limit: options.limit ?? 50,
    })
    return result.metrics
}

// =============================================================================
// DELETE OPERATIONS
// =============================================================================

/**
 * Delete derived metrics older than a given date
 */
export async function deleteDerivedMetricsBeforeDate(options: {
    workspaceId: string
    beforeDate: string
    providerId?: string
}): Promise<{ deleted: number }> {
    const { workspaceId, beforeDate, providerId } = options

    const metricsCollection = getDerivedMetricsCollection(workspaceId)

    const constraints: Parameters<typeof query>[1][] = [
        where('date', '<', beforeDate),
    ]

    if (providerId) {
        constraints.push(where('providerId', '==', providerId))
    }

    const q = query(metricsCollection, ...constraints)
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
        return { deleted: 0 }
    }

    const batch = writeBatch(db)
    snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref)
    })

    await batch.commit()

    return { deleted: snapshot.size }
}

/**
 * Delete a specific derived metric
 */
export async function deleteDerivedMetric(options: {
    workspaceId: string
    metricDocId: string
}): Promise<void> {
    const { workspaceId, metricDocId } = options
    const docRef = doc(getDerivedMetricsCollection(workspaceId), metricDocId)
    await deleteDoc(docRef)
}
