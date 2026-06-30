import { describe, expect, it } from 'vitest';
import { buildMetaAdSetPromotedObject, resolveMetaAdSetObjectiveGoals, validateMetaAdSetObjective, } from './meta-ad-set-objective';
describe('meta-ad-set-objective', () => {
    it('requires page for leads', () => {
        expect(validateMetaAdSetObjective('OUTCOME_LEADS', {})).toEqual([
            'Select a Facebook Page for lead generation.',
        ]);
    });
    it('builds promoted object for leads with page', () => {
        expect(buildMetaAdSetPromotedObject('OUTCOME_LEADS', { pageId: '123' })).toEqual({ page_id: '123' });
    });
    it('uses lead generation optimization for leads', () => {
        expect(resolveMetaAdSetObjectiveGoals('OUTCOME_LEADS', { pageId: '123' })).toEqual({
            optimizationGoal: 'LEAD_GENERATION',
            billingEvent: 'IMPRESSIONS',
        });
    });
    it('uses engagement type for engagement campaigns', () => {
        expect(resolveMetaAdSetObjectiveGoals('OUTCOME_ENGAGEMENT', {
            pageId: '123',
            engagementType: 'POST_ENGAGEMENT',
        })).toEqual({
            optimizationGoal: 'POST_ENGAGEMENT',
            billingEvent: 'POST_ENGAGEMENT',
        });
    });
    it('includes event_id when provided', () => {
        expect(buildMetaAdSetPromotedObject('OUTCOME_ENGAGEMENT', {
            pageId: '123',
            engagementType: 'EVENT_RESPONSES',
            eventId: 'evt_1',
        })).toEqual({ page_id: '123', event_id: 'evt_1' });
    });
    it('includes object_id for post engagement', () => {
        expect(buildMetaAdSetPromotedObject('OUTCOME_ENGAGEMENT', {
            pageId: '123',
            engagementType: 'POST_ENGAGEMENT',
            postId: '123_456',
        })).toEqual({ page_id: '123', object_id: '123_456' });
    });
    it('requires post for post engagement', () => {
        expect(validateMetaAdSetObjective('OUTCOME_ENGAGEMENT', {
            pageId: '123',
            engagementType: 'POST_ENGAGEMENT',
        })).toContain('Select a Page post to promote.');
    });
    it('builds sales promoted object with pixel and event', () => {
        expect(buildMetaAdSetPromotedObject('OUTCOME_SALES', {
            pixelId: 'px_1',
            conversionEvent: 'PURCHASE',
        })).toEqual({ pixel_id: 'px_1', custom_event_type: 'PURCHASE' });
    });
    it('builds catalog sales promoted object and goals', () => {
        expect(buildMetaAdSetPromotedObject('OUTCOME_SALES', {
            salesOptimizationMode: 'catalog',
            productCatalogId: 'cat_1',
            productSetId: 'set_1',
        })).toEqual({ product_catalog_id: 'cat_1', product_set_id: 'set_1' });
        expect(resolveMetaAdSetObjectiveGoals('OUTCOME_SALES', {
            salesOptimizationMode: 'catalog',
            productCatalogId: 'cat_1',
        })).toEqual({
            optimizationGoal: 'PRODUCT_CATALOG_SALES',
            billingEvent: 'IMPRESSIONS',
        });
    });
    it('requires catalog when in catalog mode', () => {
        expect(validateMetaAdSetObjective('OUTCOME_SALES', { salesOptimizationMode: 'catalog' })).toContain('Select a product catalog for catalog sales.');
    });
});
