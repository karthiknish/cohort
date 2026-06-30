import { CHART_COLORS } from '@/lib/colors';
import type { FunnelStep } from './funnel-chart-types';
export function createAdSpendFunnel(impressions: number, clicks: number, conversions: number): FunnelStep[] {
    return [
        { id: 'impressions', name: 'Impressions', count: impressions || 0, color: CHART_COLORS.funnel.impressions },
        { id: 'clicks', name: 'Clicks', count: clicks || 0, color: CHART_COLORS.funnel.clicks },
        { id: 'conversions', name: 'Conversions', count: conversions || 0, color: CHART_COLORS.funnel.conversions },
    ];
}
export function createEcommerceFunnel(visitors: number, productViews: number, addToCart: number, checkout: number, purchase: number): FunnelStep[] {
    return [
        { id: 'visitors', name: 'Visitors', count: visitors || 0, color: CHART_COLORS.funnel.visitors },
        { id: 'views', name: 'Product Views', count: productViews || 0, color: CHART_COLORS.funnel.views },
        { id: 'cart', name: 'Add to Cart', count: addToCart || 0, color: CHART_COLORS.funnel.cart },
        { id: 'checkout', name: 'Checkout', count: checkout || 0, color: CHART_COLORS.funnel.checkout },
        { id: 'purchase', name: 'Purchase', count: purchase || 0, color: CHART_COLORS.funnel.purchase },
    ];
}
