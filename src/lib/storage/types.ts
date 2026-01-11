// =============================================================================
// STORAGE LAYER - Type Definitions
// =============================================================================

export type FieldValue = unknown
export type Timestamp = { toMillis?: () => number; toDate?: () => Date } | Date | string | number

// =============================================================================
// DERIVED METRICS TYPES
// =============================================================================

/**
 * Type of derived metric
 */
export type DerivedMetricType =
    | 'moving_average'
    | 'growth_rate'
    | 'custom_kpi'
    | 'benchmark'
    | 'weighted_average'
    | 'platform_insight'

/**
 * Stored derived metric record
 */
export interface DerivedMetricRecord {
    /** User who owns this metric */
    userId: string
    /** Workspace ID */
    workspaceId: string
    /** Ad platform provider ID */
    providerId: string
    /** Date of the metric (YYYY-MM-DD) */
    date: string
    /** Unique metric identifier */
    metricId: string
    /** Type of derived metric */
    metricType: DerivedMetricType
    /** The calculated value */
    value: number
    /** Formula used to calculate (for reference) */
    formula?: string
    /** Input values used in calculation */
    inputs?: Record<string, number>
    /** Campaign ID if campaign-specific */
    campaignId?: string
    /** Additional metadata */
    metadata?: Record<string, unknown>
    /** Creation timestamp */
    createdAt: Timestamp | FieldValue
}

/**
 * Input for writing derived metrics
 */
export interface DerivedMetricInput {
    userId: string
    workspaceId: string
    providerId: string
    date: string
    metricId: string
    metricType: DerivedMetricType
    value: number
    formula?: string
    inputs?: Record<string, number>
    campaignId?: string
    metadata?: Record<string, unknown>
}

/**
 * Query options for derived metrics
 */
export interface DerivedMetricsQueryOptions {
    workspaceId: string
    providerId?: string
    startDate?: string
    endDate?: string
    metricType?: DerivedMetricType
    metricId?: string
    campaignId?: string
    limit?: number
}

// =============================================================================
// CUSTOM FORMULA TYPES
// =============================================================================

/**
 * Stored custom formula record
 */
export interface CustomFormulaRecord {
    /** Workspace ID */
    workspaceId: string
    /** Unique formula identifier */
    formulaId: string
    /** User-friendly name */
    name: string
    /** Description of what the formula calculates */
    description?: string
    /** The formula expression (e.g., "revenue / spend") */
    formula: string
    /** Input metric names required */
    inputs: string[]
    /** Output metric name */
    outputMetric: string
    /** Whether the formula is active */
    isActive: boolean
    /** User who created the formula */
    createdBy: string
    /** Creation timestamp */
    createdAt: Timestamp | FieldValue
    /** Last updated timestamp */
    updatedAt: Timestamp | FieldValue
}

/**
 * Input for creating a custom formula
 */
export interface CreateCustomFormulaInput {
    workspaceId: string
    name: string
    description?: string
    formula: string
    inputs: string[]
    outputMetric: string
    createdBy: string
}

/**
 * Input for updating a custom formula
 */
export interface UpdateCustomFormulaInput {
    workspaceId: string
    formulaId: string
    name?: string
    description?: string
    formula?: string
    inputs?: string[]
    outputMetric?: string
    isActive?: boolean
}

// =============================================================================
// QUERY RESULTS
// =============================================================================

/**
 * Result of querying derived metrics
 */
export interface DerivedMetricsQueryResult {
    metrics: DerivedMetricRecord[]
    count: number
}

/**
 * Result of listing custom formulas
 */
export interface CustomFormulasListResult {
    formulas: CustomFormulaRecord[]
    count: number
}
