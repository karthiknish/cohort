import type { ProjectRecord, TaskRecord } from './types'
import type { PreviewProposalDraft } from './types'
import { getPreviewClients } from './clients'
import { isoDaysAgo } from './utils'

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
            tags: ['report'],
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
            tags: ['proposal'],
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
            tags: ['ads'],
            createdAt: isoDaysAgo(1),
            updatedAt: isoDaysAgo(1),
            deletedAt: null,
        },
    ]

    if (!clientId) return tasks
    return tasks.filter((t) => t.clientId === clientId)
}

export function getPreviewProposals(clientId: string | null): PreviewProposalDraft[] {
    const clients = getPreviewClients()
    const clientNameFromId = new Map(clients.map((c) => [c.id, c.name]))

    const proposals: PreviewProposalDraft[] = [
        {
            id: 'preview-proposal-1',
            clientId: 'preview-tech-corp',
            clientName: clientNameFromId.get('preview-tech-corp') ?? 'Tech Corp',
            status: 'ready',
            stepProgress: 4,
            formData: {
                goals: { objectives: ['brand_awareness', 'lead_generation'] },
                scope: { services: ['paid_media', 'content_marketing'] },
                budget: { monthly: 15000 },
            },
            aiSuggestions: 'Based on your goals, we recommend focusing on LinkedIn and Google Ads for B2B lead generation, combined with thought leadership content to build brand authority.',
            presentationDeck: { storageUrl: null, pptxUrl: null, shareUrl: null },
            pptUrl: null,
            createdAt: isoDaysAgo(7),
            updatedAt: isoDaysAgo(5),
        },
        {
            id: 'preview-proposal-2',
            clientId: 'preview-startupxyz',
            clientName: clientNameFromId.get('preview-startupxyz') ?? 'StartupXYZ',
            status: 'draft',
            stepProgress: 2,
            formData: {
                goals: { objectives: ['product_launch'] },
                scope: { services: ['social_media', 'influencer_marketing'] },
            },
            aiSuggestions: null,
            presentationDeck: null,
            pptUrl: null,
            createdAt: isoDaysAgo(3),
            updatedAt: isoDaysAgo(1),
        },
        {
            id: 'preview-proposal-3',
            clientId: 'preview-retail-store',
            clientName: clientNameFromId.get('preview-retail-store') ?? 'Retail Store',
            status: 'ready',
            stepProgress: 4,
            formData: {
                goals: { objectives: ['sales_growth', 'customer_retention'] },
                scope: { services: ['email_marketing', 'paid_media', 'loyalty_program'] },
                budget: { monthly: 8000 },
            },
            aiSuggestions: 'For retail, we suggest a multi-touch approach combining retargeting ads, personalized email sequences, and a referral program to maximize customer lifetime value.',
            presentationDeck: { storageUrl: null, pptxUrl: null, shareUrl: null },
            pptUrl: null,
            createdAt: isoDaysAgo(14),
            updatedAt: isoDaysAgo(10),
        },
    ]

    if (!clientId) return proposals
    return proposals.filter((p) => p.clientId === clientId)
}
