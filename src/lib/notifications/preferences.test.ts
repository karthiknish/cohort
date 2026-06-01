import { describe, expect, it } from 'vitest';
import { DEFAULT_NOTIFICATION_PREFERENCES_V2, applyPreferencesPatch, isChannelEnabled, isEmailPrefEnabled, isWithinQuietHours, kindToCategory, migrateLegacyPreferences, normalizePreferences, } from './preferences';
describe('normalizePreferences', () => {
    it('migrates legacy email fields to v2 categories', () => {
        const v2 = normalizePreferences({
            emailAdAlerts: false,
            emailPerformanceDigest: true,
            emailTaskActivity: false,
            emailCollaboration: true,
        });
        expect(v2.version).toBe(2);
        expect(v2.categories.ads.email).toBe(false);
        expect(v2.categories.digest.email).toBe(true);
        expect(v2.categories.tasks.email).toBe(false);
        expect(v2.categories.collaboration.email).toBe(true);
        expect(v2.categories.tasks.inApp).toBe(true);
    });
    it('returns v2 prefs unchanged when already normalized', () => {
        const input = {
            ...DEFAULT_NOTIFICATION_PREFERENCES_V2,
            pauseAll: true,
        };
        const result = normalizePreferences(input);
        expect(result.pauseAll).toBe(true);
        expect(result.version).toBe(2);
    });
});
describe('kindToCategory', () => {
    it('maps notification kinds to categories', () => {
        expect(kindToCategory('task.mention')).toBe('tasks');
        expect(kindToCategory('collaboration.message')).toBe('collaboration');
        expect(kindToCategory('project.created')).toBe('projects');
        expect(kindToCategory('proposal.deck.ready')).toBe('projects');
        expect(kindToCategory('report.generated')).toBe('ads');
    });
});
describe('isChannelEnabled', () => {
    it('blocks all channels when pauseAll is true', () => {
        const prefs = normalizePreferences({ version: 2, pauseAll: true, quietHours: { enabled: false, start: '22:00', end: '08:00' }, categories: DEFAULT_NOTIFICATION_PREFERENCES_V2.categories });
        expect(isChannelEnabled(prefs, 'tasks', 'inApp')).toBe(false);
        expect(isChannelEnabled(prefs, 'tasks', 'email')).toBe(false);
    });
    it('blocks email during quiet hours', () => {
        const prefs = normalizePreferences(DEFAULT_NOTIFICATION_PREFERENCES_V2);
        prefs.quietHours = { enabled: true, start: '00:00', end: '23:59' };
        const noon = new Date('2026-05-21T12:00:00');
        expect(isChannelEnabled(prefs, 'tasks', 'email', { now: noon })).toBe(false);
        expect(isChannelEnabled(prefs, 'tasks', 'inApp', { now: noon })).toBe(true);
    });
});
describe('isEmailPrefEnabled', () => {
    it('maps brevo keys to categories', () => {
        const legacy = { emailAdAlerts: false };
        expect(isEmailPrefEnabled(legacy, 'adAlerts')).toBe(false);
        expect(isEmailPrefEnabled(legacy, 'taskActivity')).toBe(true);
    });
});
describe('isWithinQuietHours', () => {
    it('handles overnight windows', () => {
        const quiet = { enabled: true, start: '22:00', end: '08:00' };
        expect(isWithinQuietHours(quiet, new Date('2026-05-21T23:00:00'))).toBe(true);
        expect(isWithinQuietHours(quiet, new Date('2026-05-21T10:00:00'))).toBe(false);
    });
});
describe('kindToCategory', () => {
    it('maps meeting notification kinds to meetings category', () => {
        expect(kindToCategory('meeting.reminder')).toBe('meetings');
        expect(kindToCategory('meeting.started')).toBe('meetings');
    });
});
describe('applyPreferencesPatch', () => {
    it('merges partial category updates', () => {
        const next = applyPreferencesPatch(migrateLegacyPreferences({}), {
            categories: { meetings: { email: false } },
        });
        expect(next.categories.meetings.email).toBe(false);
        expect(next.categories.tasks.inApp).toBe(true);
    });
});
