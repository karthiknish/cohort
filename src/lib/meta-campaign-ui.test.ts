import { describe, expect, it } from 'vitest';
import { getMetaCreativeObjectTypeOptions, hasAnyMetaCampaignTools, resolveMetaCampaignUiVisibility, } from './meta-campaign-ui';
describe('resolveMetaCampaignUiVisibility', () => {
    it('shows CAPI and offline for sales campaigns', () => {
        const v = resolveMetaCampaignUiVisibility({
            campaignObjective: 'OUTCOME_SALES',
            scope: 'campaign',
        });
        expect(v.showCapi).toBe(true);
        expect(v.showOfflineEvents).toBe(true);
        expect(v.showPlacementTargeting).toBe(true);
        expect(v.defaultCapiEventName).toBe('Purchase');
    });
    it('shows lead CAPI without offline for leads', () => {
        const v = resolveMetaCampaignUiVisibility({
            campaignObjective: 'OUTCOME_LEADS',
            scope: 'campaign',
        });
        expect(v.showCapi).toBe(true);
        expect(v.showOfflineEvents).toBe(false);
        expect(v.defaultCapiEventName).toBe('Lead');
    });
    it('hides conversion events at account scope', () => {
        const v = resolveMetaCampaignUiVisibility({ scope: 'account' });
        expect(v.showCapi).toBe(false);
        expect(v.showOfflineEvents).toBe(false);
        expect(v.showBatchApi).toBe(true);
    });
    it('hides placements for app promotion', () => {
        const v = resolveMetaCampaignUiVisibility({
            campaignObjective: 'OUTCOME_APP_PROMOTION',
            scope: 'campaign',
        });
        expect(v.showPlacementTargeting).toBe(false);
        expect(v.showCustomAudiences).toBe(false);
        expect(v.showCapi).toBe(false);
    });
    it('allows dynamic creative for catalog sales', () => {
        expect(getMetaCreativeObjectTypeOptions('OUTCOME_SALES', 'catalog')).toContain('DYNAMIC');
        expect(getMetaCreativeObjectTypeOptions('OUTCOME_SALES', 'pixel')).not.toContain('DYNAMIC');
    });
    it('shows ad library for awareness', () => {
        const v = resolveMetaCampaignUiVisibility({
            campaignObjective: 'OUTCOME_AWARENESS',
            scope: 'campaign',
        });
        expect(v.showAdLibrary).toBe(true);
        expect(v.showCapi).toBe(false);
        expect(hasAnyMetaCampaignTools(v)).toBe(true);
    });
});
