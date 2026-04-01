import type { ProjectRecord, TaskRecord } from './types'
import type { ProposalDraft, ProposalPresentationDeck } from '@/types/proposals'
import type { MilestoneRecord } from '@/types/milestones'
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

export function getPreviewProjectMilestones(
    clientId: string | null,
    projectIds?: string[],
): Record<string, MilestoneRecord[]> {
    const visibleProjectIds = new Set(getPreviewProjects(clientId).map((project) => project.id))
    const scopedProjectIds = Array.isArray(projectIds) && projectIds.length > 0
        ? new Set(projectIds.filter((projectId) => visibleProjectIds.has(projectId)))
        : visibleProjectIds

    const milestones: MilestoneRecord[] = [
        {
            id: 'preview-milestone-1',
            projectId: 'preview-project-1',
            title: 'Discovery workshop complete',
            description: 'Stakeholder interviews, positioning review, and existing asset audit are wrapped.',
            status: 'completed',
            startDate: isoDaysAgo(28),
            endDate: isoDaysAgo(24),
            ownerId: null,
            order: 1,
            createdAt: isoDaysAgo(30),
            updatedAt: isoDaysAgo(24),
        },
        {
            id: 'preview-milestone-2',
            projectId: 'preview-project-1',
            title: 'Visual system approval',
            description: 'Palette, typography, and layout system are queued for final client sign-off.',
            status: 'in_progress',
            startDate: isoDaysAgo(12),
            endDate: isoDaysAgo(-2),
            ownerId: null,
            order: 2,
            createdAt: isoDaysAgo(15),
            updatedAt: isoDaysAgo(1),
        },
        {
            id: 'preview-milestone-3',
            projectId: 'preview-project-1',
            title: 'Launch kit rollout',
            description: 'Delivery pack for paid, lifecycle, and sales enablement assets.',
            status: 'planned',
            startDate: isoDaysAgo(-4),
            endDate: isoDaysAgo(-18),
            ownerId: null,
            order: 3,
            createdAt: isoDaysAgo(8),
            updatedAt: isoDaysAgo(2),
        },
        {
            id: 'preview-milestone-4',
            projectId: 'preview-project-2',
            title: 'Launch brief signed off',
            description: 'Final campaign brief, audience angles, and success metrics are approved.',
            status: 'completed',
            startDate: isoDaysAgo(10),
            endDate: isoDaysAgo(7),
            ownerId: null,
            order: 1,
            createdAt: isoDaysAgo(12),
            updatedAt: isoDaysAgo(7),
        },
        {
            id: 'preview-milestone-5',
            projectId: 'preview-project-2',
            title: 'Creator shortlist finalization',
            description: 'Shortlist, rate cards, and draft outreach notes are in review.',
            status: 'in_progress',
            startDate: isoDaysAgo(3),
            endDate: isoDaysAgo(-5),
            ownerId: null,
            order: 2,
            createdAt: isoDaysAgo(4),
            updatedAt: isoDaysAgo(1),
        },
        {
            id: 'preview-milestone-6',
            projectId: 'preview-project-3',
            title: 'Holiday recap delivered',
            description: 'Final revenue recap, annotated learnings, and creative archive shared with the client.',
            status: 'completed',
            startDate: isoDaysAgo(40),
            endDate: isoDaysAgo(30),
            ownerId: null,
            order: 1,
            createdAt: isoDaysAgo(42),
            updatedAt: isoDaysAgo(30),
        },
        {
            id: 'preview-milestone-7',
            projectId: 'preview-project-4',
            title: 'Monthly content sprint',
            description: 'April content calendar, edit queue, and approval stack are being assembled.',
            status: 'in_progress',
            startDate: isoDaysAgo(2),
            endDate: isoDaysAgo(-12),
            ownerId: null,
            order: 1,
            createdAt: isoDaysAgo(5),
            updatedAt: isoDaysAgo(0),
        },
        {
            id: 'preview-milestone-8',
            projectId: 'preview-project-4',
            title: 'Executive reporting template',
            description: 'Board-facing summary with channel pacing and experiment notes.',
            status: 'planned',
            startDate: isoDaysAgo(-7),
            endDate: isoDaysAgo(-21),
            ownerId: null,
            order: 2,
            createdAt: isoDaysAgo(1),
            updatedAt: isoDaysAgo(0),
        },
        {
            id: 'preview-milestone-9',
            projectId: 'preview-project-5',
            title: 'Technical SEO audit',
            description: 'Crawl, template review, and indexation diagnosis delivered to the client.',
            status: 'completed',
            startDate: isoDaysAgo(38),
            endDate: isoDaysAgo(32),
            ownerId: null,
            order: 1,
            createdAt: isoDaysAgo(40),
            updatedAt: isoDaysAgo(32),
        },
        {
            id: 'preview-milestone-10',
            projectId: 'preview-project-5',
            title: 'Redirect cleanup batch',
            description: 'Remaining redirect and canonical fixes are waiting on engineering bandwidth.',
            status: 'blocked',
            startDate: isoDaysAgo(15),
            endDate: isoDaysAgo(-4),
            ownerId: null,
            order: 2,
            createdAt: isoDaysAgo(18),
            updatedAt: isoDaysAgo(6),
        },
    ]

    return milestones.reduce<Record<string, MilestoneRecord[]>>((acc, milestone) => {
        if (!scopedProjectIds.has(milestone.projectId)) {
            return acc
        }

        const existing = acc[milestone.projectId] ?? []
        acc[milestone.projectId] = [...existing, milestone].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        return acc
    }, {})
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
            assignedTo: ['Alex Morgan', 'Jordan Lee'],
            clientId: 'preview-tech-corp',
            client: clientNameFromId.get('preview-tech-corp') ?? 'Tech Corp',
            projectId: 'preview-project-4',
            projectName: 'Social Media Management',
            dueDate: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
            attachments: [
                { name: 'q3-performance-recap.pdf', url: '#', type: 'application/pdf', size: '1.8 MB' },
            ],
            createdAt: isoDaysAgo(3),
            updatedAt: isoDaysAgo(1),
            deletedAt: null,
            subtaskCount: 2,
            commentCount: 4,
            timeSpentMinutes: 95,
            estimatedMinutes: 180,
            dependencies: [{ taskId: 'preview-task-4', type: 'blocked-by' }],
            activities: [
                {
                    id: 'preview-task-1-activity-1',
                    taskId: 'preview-task-1',
                    userId: 'preview-user-1',
                    userName: 'Alex Morgan',
                    userRole: 'Account Manager',
                    action: 'updated',
                    field: 'description',
                    oldValue: 'Summarize report',
                    newValue: 'Summarize key wins, risks, and next actions.',
                    timestamp: isoDaysAgo(1),
                },
            ],
            timeEntries: [
                {
                    id: 'preview-task-1-entry-1',
                    userId: 'preview-user-2',
                    userName: 'Jordan Lee',
                    startTime: isoDaysAgo(1),
                    endTime: isoDaysAgo(1),
                    duration: 55,
                    note: 'Reviewed pacing anomalies and narrative summary.',
                },
            ],
        },
        {
            id: 'preview-task-2',
            title: 'Create proposal for new client',
            description: 'Draft scope, timeline, and success metrics.',
            status: 'review',
            priority: 'medium',
            assignedTo: ['Priya Patel', 'Lena Ortiz'],
            clientId: 'preview-startupxyz',
            client: clientNameFromId.get('preview-startupxyz') ?? 'StartupXYZ',
            projectId: 'preview-project-2',
            projectName: 'Product Launch Marketing',
            dueDate: new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString(),
            commentCount: 6,
            subtaskCount: 3,
            timeSpentMinutes: 140,
            estimatedMinutes: 240,
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
            projectId: 'preview-project-3',
            projectName: 'Holiday Sales Campaign',
            dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: isoDaysAgo(1),
            updatedAt: isoDaysAgo(1),
            deletedAt: null,
            commentCount: 1,
            estimatedMinutes: 90,
        },
        {
            id: 'preview-task-4',
            title: 'Finalize board-ready KPI narrative',
            description: 'Condense channel-level results into an executive summary with one clear action plan.',
            status: 'completed',
            priority: 'urgent',
            assignedTo: ['Alex Morgan'],
            clientId: 'preview-tech-corp',
            client: clientNameFromId.get('preview-tech-corp') ?? 'Tech Corp',
            projectId: 'preview-project-1',
            projectName: 'Q1 Brand Refresh Campaign',
            dueDate: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
            attachments: [
                { name: 'executive-narrative-v4.docx', url: '#', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: '640 KB' },
            ],
            createdAt: isoDaysAgo(6),
            updatedAt: isoDaysAgo(0),
            deletedAt: null,
            commentCount: 8,
            timeSpentMinutes: 210,
            estimatedMinutes: 180,
            activities: [
                {
                    id: 'preview-task-4-activity-1',
                    taskId: 'preview-task-4',
                    userId: 'preview-user-1',
                    userName: 'Alex Morgan',
                    userRole: 'Account Manager',
                    action: 'status_changed',
                    oldValue: 'review',
                    newValue: 'completed',
                    timestamp: isoDaysAgo(0),
                },
            ],
        },
        {
            id: 'preview-task-5',
            title: 'Lock creator shortlist for launch week',
            description: 'Confirm final shortlist, rate cards, and fallback options before approvals close.',
            status: 'in-progress',
            priority: 'high',
            assignedTo: ['Priya Patel', 'Sam Chen'],
            clientId: 'preview-startupxyz',
            client: clientNameFromId.get('preview-startupxyz') ?? 'StartupXYZ',
            projectId: 'preview-project-2',
            projectName: 'Product Launch Marketing',
            dueDate: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
            createdAt: isoDaysAgo(4),
            updatedAt: isoDaysAgo(0),
            deletedAt: null,
            subtaskCount: 4,
            commentCount: 5,
            timeSpentMinutes: 125,
            estimatedMinutes: 240,
            sharedWith: ['launch@startupxyz.example'],
        },
        {
            id: 'preview-task-6',
            title: 'QA lifecycle email segmentation',
            description: 'Validate spring promo segmentation rules and suppressions before send day.',
            status: 'review',
            priority: 'medium',
            assignedTo: ['Taylor Kim', 'Noah Bennett'],
            clientId: 'preview-retail-store',
            client: clientNameFromId.get('preview-retail-store') ?? 'Retail Store',
            projectId: 'preview-project-3',
            projectName: 'Holiday Sales Campaign',
            dueDate: new Date(now.getTime() + 28 * 60 * 60 * 1000).toISOString(),
            createdAt: isoDaysAgo(5),
            updatedAt: isoDaysAgo(1),
            deletedAt: null,
            commentCount: 2,
            timeSpentMinutes: 70,
            estimatedMinutes: 120,
        },
        {
            id: 'preview-task-7',
            title: 'Refresh paid social motion cutdowns',
            description: 'Ship three revised motion variants for retargeting and prospecting audiences.',
            status: 'todo',
            priority: 'medium',
            assignedTo: ['Mia Thompson'],
            clientId: 'preview-tech-corp',
            client: clientNameFromId.get('preview-tech-corp') ?? 'Tech Corp',
            projectId: 'preview-project-4',
            projectName: 'Social Media Management',
            dueDate: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
            createdAt: isoDaysAgo(1),
            updatedAt: isoDaysAgo(0),
            deletedAt: null,
            subtaskCount: 3,
            estimatedMinutes: 150,
        },
        {
            id: 'preview-task-8',
            title: 'Prepare post-campaign revenue recap',
            description: 'Compile blended channel performance and summarize the revenue contribution by audience cohort.',
            status: 'archived',
            priority: 'low',
            assignedTo: ['Taylor Kim'],
            clientId: 'preview-retail-store',
            client: clientNameFromId.get('preview-retail-store') ?? 'Retail Store',
            projectId: 'preview-project-3',
            projectName: 'Holiday Sales Campaign',
            dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: isoDaysAgo(18),
            updatedAt: isoDaysAgo(12),
            deletedAt: null,
            commentCount: 3,
            timeSpentMinutes: 160,
            estimatedMinutes: 150,
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
