import { describe, expect, it } from 'vitest';
import { isDashboardPath, materializeTourSteps, stepHasVisibleTarget, type TourStepDefinition, } from './onboarding-tour';
describe('onboarding-tour', () => {
    it('detects dashboard paths', () => {
        expect(isDashboardPath('/dashboard')).toBe(true);
        expect(isDashboardPath('/dashboard/ads')).toBe(true);
        expect(isDashboardPath('/settings')).toBe(false);
    });
    it('keeps modal-only steps without required targets', () => {
        const steps: TourStepDefinition[] = [
            {
                popover: { title: 'Welcome', description: 'Intro' },
            },
            {
                popover: { title: 'Done', description: 'Finish' },
            },
        ];
        expect(stepHasVisibleTarget(steps[0]!)).toBe(true);
        expect(materializeTourSteps(steps)).toHaveLength(2);
    });
});
