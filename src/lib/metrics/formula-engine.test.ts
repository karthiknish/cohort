import { describe, it, expect } from 'vitest'
import {
    calculateWeightedRoas,
    calculateWeightedAverage,
    calculateMovingAverage,
    calculateRoasMovingAverage,
    calculateGrowthRates,
    calculateCrossplatformBenchmarks,
    calculateCustomKpis,
} from './formula-engine'
import { runDerivedMetricsPipeline } from './derived-metrics-pipeline'
import type { NormalizedAdMetric } from './types'

// =============================================================================
// TEST DATA
// =============================================================================

const createMetric = (overrides: Partial<NormalizedAdMetric>): NormalizedAdMetric => ({
    providerId: 'google',
    adId: 'ad-1',
    campaignId: 'campaign-1',
    date: '2026-01-01',
    impressions: 1000,
    clicks: 50,
    spend: 100,
    conversions: 5,
    revenue: 300,
    ...overrides,
})

const sampleMetrics: NormalizedAdMetric[] = [
    createMetric({ providerId: 'google', date: '2026-01-01', spend: 100, revenue: 400, conversions: 10 }),
    createMetric({ providerId: 'google', date: '2026-01-02', spend: 150, revenue: 450, conversions: 12 }),
    createMetric({ providerId: 'tiktok', date: '2026-01-01', spend: 200, revenue: 600, conversions: 15 }),
    createMetric({ providerId: 'tiktok', date: '2026-01-02', spend: 180, revenue: 720, conversions: 18 }),
]

// =============================================================================
// WEIGHTED AVERAGES TESTS
// =============================================================================

describe('calculateWeightedRoas', () => {
    it('calculates spend-weighted ROAS correctly', () => {
        // Total spend: 100 + 150 + 200 + 180 = 630
        // Total revenue: 400 + 450 + 600 + 720 = 2170
        // Weighted ROAS: 2170 / 630 = 3.444...
        const result = calculateWeightedRoas(sampleMetrics)
        expect(result).toBeCloseTo(3.444, 2)
    })

    it('returns 0 for empty metrics', () => {
        expect(calculateWeightedRoas([])).toBe(0)
    })

    it('returns 0 when total spend is 0', () => {
        const zeroSpend = [createMetric({ spend: 0, revenue: 100 })]
        expect(calculateWeightedRoas(zeroSpend)).toBe(0)
    })
})

describe('calculateWeightedAverage', () => {
    it('calculates spend-weighted average for a field', () => {
        const metrics = [
            createMetric({ spend: 100, ctr: 2.0 }),
            createMetric({ spend: 200, ctr: 4.0 }),
        ]
        // Weighted avg: (100*2.0 + 200*4.0) / 300 = (200 + 800) / 300 = 3.333...
        const result = calculateWeightedAverage(metrics, 'ctr')
        expect(result).toBeCloseTo(3.333, 2)
    })
})

// =============================================================================
// MOVING AVERAGES TESTS
// =============================================================================

describe('calculateMovingAverage', () => {
    it('calculates 7-day moving average correctly', () => {
        const metrics = [
            createMetric({ date: '2026-01-01', spend: 100 }),
            createMetric({ date: '2026-01-02', spend: 200 }),
            createMetric({ date: '2026-01-03', spend: 150 }),
        ]

        const result = calculateMovingAverage(metrics, 'spend', 7)

        expect(result).toHaveLength(3)
        // Day 1: avg(100) = 100
        expect(result[0].value).toBe(100)
        // Day 2: avg(100, 200) = 150
        expect(result[1].value).toBe(150)
        // Day 3: avg(100, 200, 150) = 150
        expect(result[2].value).toBe(150)
    })

    it('returns empty array for empty metrics', () => {
        expect(calculateMovingAverage([], 'spend', 7)).toEqual([])
    })

    it('aggregates same-day metrics before calculating average', () => {
        const metrics = [
            createMetric({ date: '2026-01-01', spend: 100 }),
            createMetric({ date: '2026-01-01', spend: 50 }), // Same day
            createMetric({ date: '2026-01-02', spend: 200 }),
        ]

        const result = calculateMovingAverage(metrics, 'spend', 7)

        expect(result).toHaveLength(2)
        // Day 1: sum(100, 50) = 150, avg = 150
        expect(result[0].rawValue).toBe(150)
        // Day 2: avg(150, 200) = 175
        expect(result[1].value).toBe(175)
    })
})

describe('calculateRoasMovingAverage', () => {
    it('calculates ROAS moving average correctly', () => {
        const metrics = [
            createMetric({ date: '2026-01-01', spend: 100, revenue: 300 }), // ROAS 3.0
            createMetric({ date: '2026-01-02', spend: 100, revenue: 500 }), // ROAS 5.0
        ]

        const result = calculateRoasMovingAverage(metrics, 7)

        expect(result).toHaveLength(2)
        // Day 1: ROAS = 300/100 = 3.0
        expect(result[0].value).toBeCloseTo(3.0, 2)
        // Day 2: cumulative ROAS = 800/200 = 4.0
        expect(result[1].value).toBeCloseTo(4.0, 2)
    })
})

// =============================================================================
// GROWTH RATES TESTS
// =============================================================================

describe('calculateGrowthRates', () => {
    it('calculates week-over-week growth correctly', () => {
        // Create metrics for 2 weeks
        const metrics: NormalizedAdMetric[] = []

        // Last week (Jan 1-7): $100/day spend, $500/day revenue
        for (let i = 1; i <= 7; i++) {
            metrics.push(createMetric({
                date: `2026-01-0${i}`,
                spend: 100,
                revenue: 500,
                conversions: 10,
            }))
        }

        // This week (Jan 8-14): $150/day spend, $900/day revenue
        for (let i = 8; i <= 14; i++) {
            metrics.push(createMetric({
                date: `2026-01-${i}`,
                spend: 150,
                revenue: 900,
                conversions: 15,
            }))
        }

        const result = calculateGrowthRates(metrics)

        // Verify growth rates are calculated and positive (this week has higher values)
        expect(result.weekOverWeek.spend).not.toBeNull()
        expect(result.weekOverWeek.spend).toBeGreaterThan(0)
        expect(result.weekOverWeek.revenue).not.toBeNull()
        expect(result.weekOverWeek.revenue).toBeGreaterThan(0)
    })

    it('returns null for empty metrics', () => {
        const result = calculateGrowthRates([])

        expect(result.weekOverWeek.spend).toBeNull()
        expect(result.weekOverWeek.revenue).toBeNull()
        expect(result.monthOverMonth.spend).toBeNull()
    })
})

// =============================================================================
// BENCHMARKS TESTS
// =============================================================================

describe('calculateCrossplatformBenchmarks', () => {
    it('calculates platform benchmarks and differences', () => {
        const result = calculateCrossplatformBenchmarks(sampleMetrics)

        expect(result).toHaveLength(2) // google and tiktok

        const google = result.find((r) => r.providerId === 'google')
        const tiktok = result.find((r) => r.providerId === 'tiktok')

        expect(google).toBeDefined()
        expect(tiktok).toBeDefined()

        // Google ROAS: (400+450) / (100+150) = 850/250 = 3.4
        expect(google!.metrics.roas).toBeCloseTo(3.4, 1)

        // TikTok ROAS: (600+720) / (200+180) = 1320/380 = 3.47
        expect(tiktok!.metrics.roas).toBeCloseTo(3.47, 1)
    })

    it('returns empty array for empty metrics', () => {
        expect(calculateCrossplatformBenchmarks([])).toEqual([])
    })
})

// =============================================================================
// CUSTOM KPIs TESTS
// =============================================================================

describe('calculateCustomKpis', () => {
    it('calculates all KPIs correctly', () => {
        const result = calculateCustomKpis(sampleMetrics)

        // Total: spend=630, revenue=2170, conversions=55, clicks=200

        // CPA: 630 / 55 = 11.45
        expect(result.cpa).toBeCloseTo(11.45, 1)

        // AOV: 2170 / 55 = 39.45
        expect(result.aov).toBeCloseTo(39.45, 1)

        // ROI: (2170 - 630) / 630 * 100 = 244.4%
        expect(result.roi).toBeCloseTo(244.4, 0)

        // MER: 2170 / 630 = 3.44
        expect(result.mer).toBeCloseTo(3.44, 1)

        // Profit: 2170 - 630 = 1540
        expect(result.profit).toBe(1540)

        // LTV should be null without config
        expect(result.ltv).toBeNull()
    })

    it('returns LTV when provided in config', () => {
        const result = calculateCustomKpis(sampleMetrics, { averageLifetimeValue: 150 })
        expect(result.ltv).toBe(150)
    })

    it('calculates adjusted conversions with time decay', () => {
        const result = calculateCustomKpis(sampleMetrics, { attributionModel: 'timeDecay' })
        // 55 * 0.85 = 46.75
        expect(result.adjustedConversions).toBeCloseTo(46.75, 1)
    })

    it('handles zero values gracefully', () => {
        const zeroMetrics = [createMetric({ spend: 0, revenue: 0, conversions: 0, clicks: 0 })]
        const result = calculateCustomKpis(zeroMetrics)

        expect(result.cpa).toBe(0)
        expect(result.roi).toBe(0)
        expect(result.mer).toBe(0)
        expect(result.aov).toBe(0)
        expect(result.profit).toBe(0)
    })
})

// =============================================================================
// PIPELINE TESTS
// =============================================================================

describe('runDerivedMetricsPipeline', () => {
    it('returns complete derived metrics result', () => {
        const result = runDerivedMetricsPipeline(sampleMetrics)

        expect(result.weightedRoas).toBeCloseTo(3.44, 1)
        expect(result.movingAverages.ma7).toBeDefined()
        expect(result.movingAverages.ma30).toBeDefined()
        expect(result.growthRates).toBeDefined()
        expect(result.benchmarks).toHaveLength(2)
        expect(result.kpis).toBeDefined()
        expect(result.calculatedAt).toBeDefined()
    })

    it('respects pipeline options', () => {
        const result = runDerivedMetricsPipeline(sampleMetrics, {
            includeMovingAverages: false,
            includeGrowthRates: false,
            includeBenchmarks: false,
        })

        expect(result.movingAverages.ma7.spend).toEqual([])
        expect(result.growthRates.weekOverWeek.spend).toBeNull()
        expect(result.benchmarks).toEqual([])
        // KPIs should still be calculated
        expect(result.kpis.cpa).toBeGreaterThan(0)
    })

    it('handles empty metrics gracefully', () => {
        const result = runDerivedMetricsPipeline([])

        expect(result.weightedRoas).toBe(0)
        expect(result.movingAverages.ma7.spend).toEqual([])
        expect(result.benchmarks).toEqual([])
        expect(result.kpis.cpa).toBe(0)
    })
})
