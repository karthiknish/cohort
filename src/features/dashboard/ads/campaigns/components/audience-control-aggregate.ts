import type { TargetingData } from './audience-control-types';
export type AggregatedAudienceData = {
    demographics: {
        ageRanges: string[];
        genders: string[];
        languages: string[];
    };
    audiences: {
        included: Array<{
            id: string;
            name: string;
            type: string;
        }>;
        excluded: Array<{
            id: string;
            name: string;
        }>;
    };
    locations: {
        included: Array<{
            id: string;
            name: string;
            type: string;
        }>;
        excluded: Array<{
            id: string;
            name: string;
        }>;
    };
    interests: Array<{
        id: string;
        name: string;
        category?: string;
    }>;
    keywords: Array<{
        text: string;
        matchType?: string;
    }>;
    devices: string[];
    placements: string[];
    metaPlacements: {
        facebook: string[];
        instagram: string[];
        audienceNetwork: string[];
        messenger: string[];
    };
    professional: {
        industries: Array<{
            id: string;
            name: string;
        }>;
        jobTitles: Array<{
            id: string;
            name: string;
        }>;
    };
};
export function aggregateAudienceTargetingData(visibleTargeting: TargetingData[]): AggregatedAudienceData {
    const demographics = { ageRanges: new Set<string>(), genders: new Set<string>(), languages: new Set<string>() };
    const audiences = {
        included: new Map<string, {
            id: string;
            name: string;
            type: string;
        }>(),
        excluded: new Map<string, {
            id: string;
            name: string;
        }>(),
    };
    const locations = {
        included: new Map<string, {
            id: string;
            name: string;
            type: string;
        }>(),
        excluded: new Map<string, {
            id: string;
            name: string;
        }>(),
    };
    const interests = new Map<string, {
        id: string;
        name: string;
        category?: string;
    }>();
    const keywords = new Map<string, {
        text: string;
        matchType?: string;
    }>();
    const devices = new Set<string>();
    const placements = new Set<string>();
    const metaPlacements = {
        facebook: new Set<string>(),
        instagram: new Set<string>(),
        audienceNetwork: new Set<string>(),
        messenger: new Set<string>(),
    };
    const professional = {
        industries: new Map<string, {
            id: string;
            name: string;
        }>(),
        jobTitles: new Map<string, {
            id: string;
            name: string;
        }>(),
    };
    visibleTargeting.forEach((t) => {
        t.demographics.ageRanges.forEach((a) => demographics.ageRanges.add(a));
        t.demographics.genders.forEach((g) => demographics.genders.add(g));
        t.demographics.languages.forEach((l) => demographics.languages.add(l));
        t.audiences.included.forEach((a) => audiences.included.set(a.id, a));
        t.audiences.excluded.forEach((a) => audiences.excluded.set(a.id, a));
        t.locations.included.forEach((l) => locations.included.set(l.id, l));
        t.locations.excluded.forEach((l) => locations.excluded.set(l.id, l));
        t.interests.forEach((i) => interests.set(i.id, i));
        t.keywords.forEach((k) => keywords.set(k.text, k));
        t.devices.forEach((d) => devices.add(d));
        t.placements.forEach((p) => placements.add(p));
        if (t.metaPlacements) {
            t.metaPlacements.facebook?.forEach((p) => metaPlacements.facebook.add(p));
            t.metaPlacements.instagram?.forEach((p) => metaPlacements.instagram.add(p));
            t.metaPlacements.audienceNetwork?.forEach((p) => metaPlacements.audienceNetwork.add(p));
            t.metaPlacements.messenger?.forEach((p) => metaPlacements.messenger.add(p));
        }
        if (t.professional) {
            t.professional.industries.forEach((i) => professional.industries.set(i.id, i));
            t.professional.jobTitles.forEach((j) => professional.jobTitles.set(j.id, j));
        }
    });
    return {
        demographics: {
            ageRanges: Array.from(demographics.ageRanges),
            genders: Array.from(demographics.genders),
            languages: Array.from(demographics.languages),
        },
        audiences: {
            included: Array.from(audiences.included.values()),
            excluded: Array.from(audiences.excluded.values()),
        },
        locations: {
            included: Array.from(locations.included.values()),
            excluded: Array.from(locations.excluded.values()),
        },
        interests: Array.from(interests.values()),
        keywords: Array.from(keywords.values()),
        devices: Array.from(devices),
        placements: Array.from(placements),
        metaPlacements: {
            facebook: Array.from(metaPlacements.facebook),
            instagram: Array.from(metaPlacements.instagram),
            audienceNetwork: Array.from(metaPlacements.audienceNetwork),
            messenger: Array.from(metaPlacements.messenger),
        },
        professional: {
            industries: Array.from(professional.industries.values()),
            jobTitles: Array.from(professional.jobTitles.values()),
        },
    };
}
