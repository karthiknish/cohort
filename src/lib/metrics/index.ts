// =============================================================================
// METRICS MODULE - Barrel Exports
// =============================================================================

// Types
export * from './types'

// Formula Engine
export {
    calculateWeightedRoas,
    calculateWeightedAverage,
    calculateMovingAverage,
    calculateRoasMovingAverage,
    calculateGrowthRates,
    calculateCrossplatformBenchmarks,
    calculateCustomKpis,
} from './formula-engine'

// Pipeline
export {
    runDerivedMetricsPipeline,
    runLightweightPipeline,
} from './derived-metrics-pipeline'
