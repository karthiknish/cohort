import { describe, expect, it } from 'vitest';
import { cycleAgentPanelLayout, panelUsesModalFocusTrap, readAgentPanelLayout, shouldHideAgentFab, shouldKeepAgentOpenOnNavigate, } from './agent-panel-layout';
describe('agent panel layout', () => {
    it('cycles compact → docked → fullscreen', () => {
        expect(cycleAgentPanelLayout('compact')).toBe('docked');
        expect(cycleAgentPanelLayout('docked')).toBe('fullscreen');
        expect(cycleAgentPanelLayout('fullscreen')).toBe('compact');
    });
    it('keeps panel open on navigate for compact and docked', () => {
        expect(shouldKeepAgentOpenOnNavigate('compact')).toBe(true);
        expect(shouldKeepAgentOpenOnNavigate('docked')).toBe(true);
        expect(shouldKeepAgentOpenOnNavigate('fullscreen')).toBe(false);
    });
    it('uses modal focus trap only in fullscreen', () => {
        expect(panelUsesModalFocusTrap('compact')).toBe(false);
        expect(panelUsesModalFocusTrap('docked')).toBe(false);
        expect(panelUsesModalFocusTrap('fullscreen')).toBe(true);
    });
    it('defaults to fullscreen layout', () => {
        expect(readAgentPanelLayout()).toBe('fullscreen');
    });
    it('hides the FAB when open in docked or compact layout', () => {
        expect(shouldHideAgentFab(true, 'docked')).toBe(true);
        expect(shouldHideAgentFab(true, 'compact')).toBe(true);
        expect(shouldHideAgentFab(true, 'fullscreen')).toBe(false);
        expect(shouldHideAgentFab(false, 'docked')).toBe(false);
    });
});
