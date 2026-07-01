/**
 * Shared deck structure logic — used by both PPTX and PDF generators.
 *
 * Extracts the duplicated section-building, topic-list-building, service
 * descriptions, and sidebar stats that were previously copy-pasted between
 * `src/services/pptx/index.ts` and `src/services/pdf/proposal-pdf.ts`.
 */

import type { ProposalFormData } from '@/lib/proposals';
import type { PptxSlideContent, SidebarStat } from './pptx/types';
import { parseSlideInstructions, parseBudgetAmount, sidebarKeyword } from './pptx/parsing';
import { topicFromTitle } from './pexels-images';

// ─── Service descriptions (single source of truth) ───────────────

export function getServiceDescriptions(formData: ProposalFormData): Record<string, string> {
    return {
        'PPC (Google Ads)': 'Search & display campaigns, keyword strategy, bid management, landing page optimisation',
        'Paid Social (Meta/TikTok/LinkedIn)': 'Audience targeting, creative testing, retargeting funnels, lookalike audiences',
        'SEO & Content Marketing': 'Technical SEO, content calendar, organic growth strategy, link building',
        'Email Marketing': 'Automation flows, segmentation, lifecycle campaigns, A/B testing',
        'Creative & Design': 'Ad creative, landing pages, brand assets, motion graphics',
        'Strategy & Consulting': 'Marketing audits, growth planning, quarterly reviews, competitive analysis',
        'Other': formData.scope?.otherService || 'Custom deliverables tailored to your requirements',
    };
}

// ─── Sidebar stats (single source of truth) ──────────────────────

export function getSidebarStatsForTitle(title: string, formData: ProposalFormData, maxLen = 80): SidebarStat[] {
    return getSidebarStatsForKeyword(sidebarKeyword(title), formData, maxLen);
}

export function getSidebarStatsForKeyword(keyword: string, formData: ProposalFormData, maxLen = 80): SidebarStat[] {
    const truncate = (s: string | undefined) => s ? s.substring(0, maxLen) : '';
    const allStats: SidebarStat[] = [];
    switch (keyword) {
        case 'company':
            allStats.push(
                { label: 'Industry', value: formData.company?.industry || '' },
                { label: 'Company Size', value: formData.company?.size || '' },
                { label: 'Locations', value: formData.company?.locations?.split('\n')[0] || '' },
            );
            break;
        case 'marketing':
            allStats.push(
                { label: 'Monthly Budget', value: formData.marketing?.budget || '' },
                { label: 'Ad Accounts', value: formData.marketing?.adAccounts || '' },
                { label: 'Platforms', value: formData.marketing?.platforms?.join(', ') || '' },
            );
            break;
        case 'goals':
            allStats.push(
                { label: 'Objectives', value: formData.goals?.objectives?.join(', ') || '' },
                { label: 'Audience', value: truncate(formData.goals?.audience) },
            );
            break;
        case 'scope':
            allStats.push(
                { label: 'Services', value: formData.scope?.services?.join(', ') || '' },
                { label: 'Custom Needs', value: truncate(formData.scope?.otherService) },
            );
            break;
        case 'timeline':
            allStats.push(
                { label: 'Start', value: formData.timelines?.startTime || '' },
                { label: 'Events', value: truncate(formData.timelines?.upcomingEvents) },
            );
            break;
        case 'budget':
        case 'roi':
            allStats.push(
                { label: 'Budget', value: formData.marketing?.budget || '' },
                { label: 'Engagement', value: formData.value?.engagementType || '' },
            );
            break;
        case 'audience':
            allStats.push(
                { label: 'Target', value: truncate(formData.goals?.audience) },
                { label: 'Goals', value: formData.goals?.objectives?.join(', ') || '' },
            );
            break;
        case 'challenges':
            allStats.push(
                { label: 'Barriers', value: formData.goals?.challenges?.join(', ') || '' },
                { label: 'Custom', value: formData.goals?.customChallenge || '' },
            );
            break;
        default:
            break;
    }
    // Filter out stats with no data — empty values create blank cards
    return allStats.filter((stat) => stat.value && stat.value.trim().length > 0);
}

// ─── Budget allocation weights (derived from selected services) ──

/**
 * Compute budget allocation weights based on the selected services.
 * Falls back to a balanced multi-channel split when no services are specified.
 */
export function computeBudgetWeights(services: string[]): number[] {
    if (services.length === 0) {
        return [0.35, 0.25, 0.20, 0.12, 0.08];
    }
    // Even distribution across selected services, with a small testing reserve
    if (services.length === 1) {
        return [0.90, 0.10];
    }
    if (services.length === 2) {
        return [0.50, 0.40, 0.10];
    }
    // 3+ services: distribute evenly with 10% testing reserve
    const reserve = 0.10;
    const remaining = 1 - reserve;
    const perService = remaining / services.length;
    return [...services.map(() => perService), reserve];
}

// ─── Section structure ───────────────────────────────────────────

export interface DeckSection {
    title: string;
    description: string;
    slideIndices: number[];
}

export interface DeckStructure {
    sections: DeckSection[];
    aiSlides: PptxSlideContent[];
    hasBudget: boolean;
    hasServices: boolean;
    totalSlides: number;
    dividerCount: number;
    dataSlideCount: number;
}

/**
 * Build the deck section structure from AI instructions and form data.
 * Uses content-aware section assignment based on slide titles rather than
 * purely positional splitting.
 */
export function buildDeckStructure(formData: ProposalFormData, instructions: string): DeckStructure {
    const aiSlides = parseSlideInstructions(instructions);
    const hasBudget = parseBudgetAmount(formData.marketing?.budget || '') !== null;
    const hasServices = (formData.scope?.services || []).length > 0;

    const sections: DeckSection[] = [];

    if (aiSlides.length > 0) {
        // Content-aware section assignment: classify each slide as overview or strategy
        const overviewIndices: number[] = [];
        const strategyIndices: number[] = [];

        for (let i = 0; i < aiSlides.length; i++) {
            const keyword = sidebarKeyword(aiSlides[i]!.title);
            // Overview-type slides: company, market, audience, challenges, goals
            const isOverview = ['company', 'marketing', 'audience', 'challenges', 'goals'].includes(keyword)
                || i < 2; // First 2 slides are always overview (executive summary + current state)
            if (isOverview) {
                overviewIndices.push(i);
            } else {
                strategyIndices.push(i);
            }
        }

        // Fallback: if all slides ended up in one bucket, split positionally
        if (overviewIndices.length === 0) {
            const overviewCount = Math.min(3, Math.ceil(aiSlides.length / 2));
            for (let i = 0; i < overviewCount; i++) overviewIndices.push(i);
            for (let i = overviewCount; i < aiSlides.length; i++) strategyIndices.push(i);
        }
        if (strategyIndices.length === 0 && aiSlides.length > overviewIndices.length) {
            for (let i = overviewIndices.length; i < aiSlides.length; i++) strategyIndices.push(i);
        }

        if (overviewIndices.length > 0) {
            sections.push({
                title: 'Company & Market Overview',
                description: 'Executive summary, company background, and market analysis',
                slideIndices: overviewIndices,
            });
        }
        if (strategyIndices.length > 0) {
            sections.push({
                title: 'Strategy & Approach',
                description: 'Proposed marketing strategy, target audience, and campaign structure',
                slideIndices: strategyIndices,
            });
        }
    }

    if (hasServices) {
        sections.push({
            title: 'Scope of Services',
            description: 'Detailed breakdown of services and deliverables',
            slideIndices: [],
        });
    }
    if (hasBudget) {
        sections.push({
            title: 'Budget & ROI Projections',
            description: 'Investment breakdown and projected return on investment',
            slideIndices: [],
        });
    }

    const dividerCount = sections.length;
    const dataSlideCount = (hasServices ? 1 : 0) + (hasBudget ? 2 : 0);
    const totalSlides = 1 + 1 + aiSlides.length + dividerCount + dataSlideCount + 1;

    return { sections, aiSlides, hasBudget, hasServices, totalSlides, dividerCount, dataSlideCount };
}

/**
 * Build the image topic list in the same order as slides are created.
 * Uses AI-suggested image topics when available, falling back to title-based guessing.
 */
export function buildSlideTopics(structure: DeckStructure): string[] {
    const { sections, aiSlides } = structure;
    const topics: string[] = [
        'company',  // title slide
        // TOC slide has no image
        ...sections.flatMap((section) => {
            const dividerTopic = topicFromTitle(section.title);
            if (section.slideIndices.length > 0) {
                return [
                    dividerTopic,
                    ...section.slideIndices.map((idx) => {
                        const slide = aiSlides[idx]!;
                        // Use AI-suggested image topic if available, otherwise fall back to title
                        if (slide.imageTopic) {
                            return slide.imageTopic.toLowerCase().replace(/[^a-z\s]/g, '').trim() || topicFromTitle(slide.title);
                        }
                        return topicFromTitle(slide.title);
                    }),
                ];
            }
            return [dividerTopic];
        }),
        'next',  // closing slide
    ];
    return topics;
}
