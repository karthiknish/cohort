// =============================================================================
// AD ALGORITHMS - Modular Analytics Engine
// =============================================================================

// Core types
export * from './types'

// Algorithm modules
export * from './efficiency'
export * from './trends'
export * from './funnel'
export * from './benchmarks'
// Budgeting
export {
    calculateOptimalAllocation,
    generateBudgetInsights,
    projectBudgetImpact,
    getGlobalBudgetSuggestions, // Legacy compatibility
} from './budget'

// Insights
export {
    generateEfficiencyInsights,
    generateCreativeInsights,
    generateAudienceInsights,
    generateTrendInsights,
    generateFunnelInsights,
    generateBenchmarkInsights,
    combineInsights,
    calculateAlgorithmicInsights, // Legacy compatibility
} from './insights'

// Main orchestrator
export { analyzeAdPerformance, type PerformanceAnalysis } from './analyzer'
