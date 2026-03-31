import type { ProjectRecord, TaskRecord } from './types'
import type { ProposalDraft, ProposalPresentationDeck } from '@/types/proposals'
import { mergeProposalForm } from '@/lib/proposals'
import { getPreviewClients } from './clients'
import { isoDaysAgo, withPreviewModeSearchParam } from './utils'

function buildPreviewDeck(proposalId: string, instructions: string): ProposalPresentationDeck {
    const previewRoute = withPreviewModeSearchParam(`/dashboard/proposals/${proposalId}/deck`)

    return {
        generationId: `preview-deck-${proposalId}`,
        status: 'ready',
        instructions,
        webUrl: previewRoute,
        shareUrl: previewRoute,
        pptxUrl: previewRoute,
        pdfUrl: null,
        generatedFiles: [],
        storageUrl: previewRoute,
        pdfStorageUrl: null,
        warnings: null,
        error: null,
    }
}

export function getPreviewProjects(clientId: string | null): ProjectRecord[] {
    const clients = getPreviewClients()
    const clientNameFromId = new Map(clients.map((c) => [c.id, c.name]))

    const projects: ProjectRecord[] = [
        {
            id: 'preview-project-1',
            name: 'Q1 Brand Refresh Campaign',
            description: 'Complete brand identity overhaul including new visual guidelines, messaging framework, and asset library.',
            status: 'active',
            clientId: 'preview-tech-corp',
            clientName: clientNameFromId.get('preview-tech-corp') ?? 'Tech Corp',
            startDate: isoDaysAgo(30),
            endDate: isoDaysAgo(-30),
            tags: ['branding', 'design', 'strategy'],
            ownerId: null,
            createdAt: isoDaysAgo(35),
            updatedAt: isoDaysAgo(1),
            taskCount: 12,
            openTaskCount: 4,
            recentActivityAt: isoDaysAgo(1),
        },
        {
            id: 'preview-project-2',
            name: 'Product Launch Marketing',
            description: 'Multi-channel marketing campaign for new product line launch including paid media, content, and PR.',
            status: 'planning',
            clientId: 'preview-startupxyz',
            clientName: clientNameFromId.get('preview-startupxyz') ?? 'StartupXYZ',
            startDate: isoDaysAgo(-7),
            endDate: isoDaysAgo(-60),
            tags: ['launch', 'paid-media', 'content'],
            ownerId: null,
            createdAt: isoDaysAgo(14),
            updatedAt: isoDaysAgo(2),
            taskCount: 8,
            openTaskCount: 8,
            recentActivityAt: isoDaysAgo(2),
        },
        {
            id: 'preview-project-3',
            name: 'Holiday Sales Campaign',
            description: 'Seasonal promotional campaign targeting key shopping periods with special offers and creative.',
            status: 'completed',
            clientId: 'preview-retail-store',
            clientName: clientNameFromId.get('preview-retail-store') ?? 'Retail Store',
            startDate: isoDaysAgo(90),
            endDate: isoDaysAgo(30),
            tags: ['seasonal', 'promotions', 'retail'],
            ownerId: null,
            createdAt: isoDaysAgo(95),
            updatedAt: isoDaysAgo(30),
            taskCount: 15,
            openTaskCount: 0,
            recentActivityAt: isoDaysAgo(30),
        },
        {
            id: 'preview-project-4',
            name: 'Social Media Management',
            description: 'Ongoing social media strategy, content creation, and community management across platforms.',
            status: 'active',
            clientId: 'preview-tech-corp',
            clientName: clientNameFromId.get('preview-tech-corp') ?? 'Tech Corp',
            startDate: isoDaysAgo(60),
            endDate: null,
            tags: ['social', 'content', 'ongoing'],
            ownerId: null,
            createdAt: isoDaysAgo(65),
            updatedAt: isoDaysAgo(0),
            taskCount: 20,
            openTaskCount: 6,
            recentActivityAt: isoDaysAgo(0),
        },
        {
            id: 'preview-project-5',
            name: 'SEO Optimization Sprint',
            description: 'Technical SEO audit and implementation of recommendations to improve organic search visibility.',
            status: 'on_hold',
            clientId: 'preview-startupxyz',
            clientName: clientNameFromId.get('preview-startupxyz') ?? 'StartupXYZ',
            startDate: isoDaysAgo(45),
            endDate: isoDaysAgo(-15),
            tags: ['seo', 'technical', 'optimization'],
            ownerId: null,
            createdAt: isoDaysAgo(50),
            updatedAt: isoDaysAgo(10),
            taskCount: 6,
            openTaskCount: 3,
            recentActivityAt: isoDaysAgo(10),
        },
    ]

    if (!clientId) return projects
    return projects.filter((p) => p.clientId === clientId)
}

export function getPreviewTasks(clientId: string | null): TaskRecord[] {
    const clientNameFromId = new Map(getPreviewClients().map((c) => [c.id, c.name]))
    // During SSR, use a fixed date to prevent hydration mismatches
    const now = typeof window === 'undefined' ? new Date('2024-01-15T12:00:00.000Z') : new Date()

    const tasks: TaskRecord[] = [
        {
            id: 'preview-task-1',
            title: 'Review Q3 performance report',
            description: 'Summarize key wins, risks, and next actions.',
            status: 'in-progress',
            priority: 'high',
            assignedTo: ['Alex Morgan'],
            clientId: 'preview-tech-corp',
            client: clientNameFromId.get('preview-tech-corp') ?? 'Tech Corp',
            projectId: null,
            projectName: 'Growth Sprint',
            dueDate: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
            createdAt: isoDaysAgo(3),
            updatedAt: isoDaysAgo(1),
            deletedAt: null,
        },
        {
            id: 'preview-task-2',
            title: 'Create proposal for new client',
            description: 'Draft scope, timeline, and success metrics.',
            status: 'todo',
            priority: 'medium',
            assignedTo: ['Priya Patel'],
            clientId: 'preview-startupxyz',
            client: clientNameFromId.get('preview-startupxyz') ?? 'StartupXYZ',
            projectId: null,
            projectName: null,
            dueDate: new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString(),
            createdAt: isoDaysAgo(2),
            updatedAt: isoDaysAgo(2),
            deletedAt: null,
        },
        {
            id: 'preview-task-3',
            title: 'Optimize Google Ads campaigns',
            description: 'Improve ROAS by tightening targeting + creatives.',
            status: 'todo',
            priority: 'low',
            assignedTo: ['Sam Chen'],
            clientId: 'preview-retail-store',
            client: clientNameFromId.get('preview-retail-store') ?? 'Retail Store',
            projectId: null,
            projectName: 'Always-on',
            dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: isoDaysAgo(1),
            updatedAt: isoDaysAgo(1),
            deletedAt: null,
        },
    ]

    if (!clientId) return tasks
    return tasks.filter((t) => t.clientId === clientId)
}

export function getPreviewProposals(clientId: string | null): ProposalDraft[] {
    const clients = getPreviewClients()
    const clientNameFromId = new Map(clients.map((c) => [c.id, c.name]))

    const proposals: ProposalDraft[] = [
        {
            id: 'preview-proposal-1',
            clientId: 'preview-tech-corp',
            clientName: clientNameFromId.get('preview-tech-corp') ?? 'Tech Corp',
            status: 'ready',
            stepProgress: 5,
            formData: mergeProposalForm({
                company: {
                    name: 'Tech Corp',
                    website: 'https://techcorp.example',
                    industry: 'B2B SaaS',
                    size: '201-500',
                    locations: 'London, New York',
                },
                marketing: {
                    budget: '$15k - $25k',
                    platforms: ['linkedin', 'google_ads'],
                    adAccounts: 'Yes',
                    socialHandles: {
                        linkedin: 'techcorp',
                    },
                },
                goals: {
                    objectives: ['brand_awareness', 'lead_generation'],
                    audience: 'Revenue leaders and demand generation teams at mid-market SaaS companies.',
                    challenges: ['low_pipeline_quality', 'limited_brand_recall'],
                    customChallenge: 'Need a stronger thought-leadership engine for enterprise buyers.',
                },
                scope: {
                    services: ['paid_media', 'content_marketing', 'landing_pages'],
                    otherService: '',
                },
                timelines: {
                    startTime: 'Within 30 days',
                    upcomingEvents: 'Q2 product expansion and partner summit launch.',
                },
                value: {
                    proposalSize: '$25k - $50k',
                    engagementType: 'Retainer',
                    additionalNotes: 'Need executive-friendly reporting and strong creative testing cadence.',
                    presentationTheme: 'Executive growth board',
                },
            }),
            aiInsights: {
                summary: 'Prioritize LinkedIn demand capture with executive-proof creative themes and use Google Search to harvest high-intent demand already in market.',
            },
            aiSuggestions: 'Based on your goals, we recommend focusing on LinkedIn and Google Ads for B2B lead generation, combined with thought leadership content to build brand authority.',
            presentationDeck: buildPreviewDeck(
                'preview-proposal-1',
                'Slide 1: Executive Growth Snapshot * Position Cohorts as the paid growth partner for Tech Corp * Align around pipeline quality, brand recall, and faster sales cycles Slide 2: Market Opportunity * Capture high-intent demand on Google Search * Build category authority with LinkedIn thought leadership Slide 3: Campaign Architecture * Search for intent capture * LinkedIn for ICP education and retargeting * Landing pages tuned for demo conversion Slide 4: Creative Direction * Executive-proof messaging * Proof-led customer stories * Clear value framing by funnel stage Slide 5: Measurement Plan * Weekly pacing and creative diagnostics * Pipeline contribution dashboard * Monthly board-ready narrative recap'
            ),
            pptUrl: withPreviewModeSearchParam('/dashboard/proposals/preview-proposal-1/deck'),
            pdfUrl: null,
            createdAt: isoDaysAgo(7),
            updatedAt: isoDaysAgo(5),
            lastAutosaveAt: isoDaysAgo(5),
        },
        {
            id: 'preview-proposal-2',
            clientId: 'preview-startupxyz',
            clientName: clientNameFromId.get('preview-startupxyz') ?? 'StartupXYZ',
            status: 'draft',
            stepProgress: 2,
            formData: mergeProposalForm({
                company: {
                    name: 'StartupXYZ',
                    website: 'https://startupxyz.example',
                    industry: 'Consumer App',
                    size: '11-50',
                    locations: 'Berlin',
                },
                marketing: {
                    budget: '$8k - $12k',
                    platforms: ['tiktok', 'instagram'],
                    adAccounts: 'Yes',
                    socialHandles: {
                        instagram: 'startupxyz',
                        tiktok: '@startupxyz',
                    },
                },
                goals: {
                    objectives: ['product_launch'],
                    audience: 'Gen Z and millennial early adopters interested in productivity tools.',
                    challenges: ['low_awareness'],
                    customChallenge: 'Need launch buzz before App Store featuring window closes.',
                },
                scope: {
                    services: ['social_media', 'influencer_marketing'],
                    otherService: 'Launch landing page polish',
                },
                timelines: {
                    startTime: 'Immediately',
                    upcomingEvents: 'Public launch in three weeks.',
                },
                value: {
                    proposalSize: '$10k - $25k',
                    engagementType: 'Project',
                    additionalNotes: 'Need launch-ready content calendar and creator shortlist.',
                    presentationTheme: 'Launch sprint',
                },
            }),
            aiInsights: {
                summary: 'The strongest draft angle is a creator-led launch burst supported by short-form paid amplification and a tight conversion path to the app waitlist.',
            },
            aiSuggestions: null,
            presentationDeck: null,
            pptUrl: null,
            pdfUrl: null,
            createdAt: isoDaysAgo(3),
            updatedAt: isoDaysAgo(1),
            lastAutosaveAt: isoDaysAgo(1),
        },
        {
            id: 'preview-proposal-3',
            clientId: 'preview-retail-store',
            clientName: clientNameFromId.get('preview-retail-store') ?? 'Retail Store',
            status: 'ready',
            stepProgress: 5,
            formData: mergeProposalForm({
                company: {
                    name: 'Retail Store',
                    website: 'https://retailstore.example',
                    industry: 'Retail',
                    size: '51-200',
                    locations: 'Manchester, Leeds',
                },
                marketing: {
                    budget: '$8k - $15k',
                    platforms: ['meta_ads', 'email'],
                    adAccounts: 'Yes',
                    socialHandles: {
                        instagram: 'retailstore',
                    },
                },
                goals: {
                    objectives: ['sales_growth', 'customer_retention'],
                    audience: 'Existing high-value shoppers and lapsed holiday purchasers.',
                    challenges: ['repeat_purchase_rate'],
                    customChallenge: 'Need a post-holiday retention plan that keeps AOV high.',
                },
                scope: {
                    services: ['email_marketing', 'paid_media', 'loyalty_program'],
                    otherService: '',
                },
                timelines: {
                    startTime: 'Next month',
                    upcomingEvents: 'Spring promotion calendar and loyalty relaunch.',
                },
                value: {
                    proposalSize: '$10k - $25k',
                    engagementType: 'Retainer',
                    additionalNotes: 'Retention work should pair lifecycle email with dynamic remarketing.',
                    presentationTheme: 'Retail retention engine',
                },
            }),
            aiInsights: {
                summary: 'Retention gains will likely come from pairing dynamic remarketing with segmented lifecycle email flows for high-value customers and lapsed holiday buyers.',
            },
            aiSuggestions: 'For retail, we suggest a multi-touch approach combining retargeting ads, personalized email sequences, and a referral program to maximize customer lifetime value.',
            presentationDeck: buildPreviewDeck(
                'preview-proposal-3',
                'Slide 1: Retention Growth Plan * Focus on repeat purchase rate and AOV expansion * Align promotions to lifecycle triggers Slide 2: Audience Segments * VIP loyalists * Recent one-time buyers * Lapsed holiday purchasers Slide 3: Channel Mix * Meta dynamic remarketing for product recall * Email journeys for replenishment and loyalty nudges * Referral loop for advocacy Slide 4: Offer Strategy * Tiered loyalty perks * Bundled spring promotions * Margin-safe win-back offers Slide 5: Measurement Plan * Repeat purchase rate by segment * Revenue per recipient * Incremental ROAS from remarketing cohorts'
            ),
            pptUrl: withPreviewModeSearchParam('/dashboard/proposals/preview-proposal-3/deck'),
            pdfUrl: null,
            createdAt: isoDaysAgo(14),
            updatedAt: isoDaysAgo(10),
            lastAutosaveAt: isoDaysAgo(10),
        },
    ]

    if (!clientId) return proposals
    return proposals.filter((p) => p.clientId === clientId)
}
