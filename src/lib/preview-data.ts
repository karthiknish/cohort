import type { ClientRecord } from '@/types/clients'
import type { FinanceSummaryResponse } from '@/types/finance'
import type { MetricRecord } from '@/types/dashboard'
import type { TaskRecord } from '@/types/tasks'
import type { ProjectRecord } from '@/types/projects'
import type { CollaborationMessage } from '@/types/collaboration'
import type { WorkspaceNotification } from '@/types/notifications'
import type { Activity } from '@/types/activity'

export const PREVIEW_MODE_STORAGE_KEY = 'cohorts.previewMode'
export const PREVIEW_MODE_EVENT = 'cohorts:previewModeChanged'

export function isPreviewModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(PREVIEW_MODE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setPreviewModeEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PREVIEW_MODE_STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(new CustomEvent(PREVIEW_MODE_EVENT, { detail: { enabled } }))
  } catch {
    // ignore
  }
}

function isoDaysAgo(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

export function getPreviewClients(): ClientRecord[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'preview-tech-corp',
      name: 'Tech Corp',
      accountManager: 'Alex Morgan',
      teamMembers: [
        { name: 'Alex Morgan', role: 'Account Manager' },
        { name: 'Jordan Lee', role: 'Strategist' },
      ],
      billingEmail: 'billing@techcorp.example',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'preview-startupxyz',
      name: 'StartupXYZ',
      accountManager: 'Priya Patel',
      teamMembers: [
        { name: 'Priya Patel', role: 'Account Manager' },
        { name: 'Sam Chen', role: 'Performance Marketer' },
      ],
      billingEmail: 'finance@startupxyz.example',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'preview-retail-store',
      name: 'Retail Store',
      accountManager: 'Taylor Kim',
      teamMembers: [
        { name: 'Taylor Kim', role: 'Account Manager' },
        { name: 'Casey Rivera', role: 'Creative' },
      ],
      billingEmail: 'accounts@retailstore.example',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function getPreviewMetrics(clientId: string | null): MetricRecord[] {
  const clients = getPreviewClients()
  const activeIds = clientId ? [clientId] : clients.map((c) => c.id)

  const base: Array<{ spend: number; impressions: number; clicks: number; conversions: number; revenue: number }>= [
    { spend: 220, impressions: 42000, clicks: 820, conversions: 34, revenue: 3400 },
    { spend: 260, impressions: 47000, clicks: 880, conversions: 39, revenue: 3800 },
    { spend: 240, impressions: 45000, clicks: 860, conversions: 36, revenue: 3600 },
    { spend: 310, impressions: 52000, clicks: 990, conversions: 44, revenue: 4300 },
    { spend: 280, impressions: 50000, clicks: 940, conversions: 41, revenue: 4000 },
    { spend: 330, impressions: 56000, clicks: 1040, conversions: 48, revenue: 4700 },
    { spend: 300, impressions: 54000, clicks: 1010, conversions: 46, revenue: 4550 },
  ]

  const records: MetricRecord[] = []
  activeIds.forEach((id, clientIndex) => {
    base.forEach((day, idx) => {
      const multiplier = 1 + clientIndex * 0.12
      records.push({
        id: `preview-metric-${id}-${idx}`,
        providerId: 'preview',
        clientId: id,
        date: isoDaysAgo(6 - idx),
        createdAt: isoDaysAgo(6 - idx),
        spend: Math.round(day.spend * multiplier),
        impressions: Math.round(day.impressions * multiplier),
        clicks: Math.round(day.clicks * multiplier),
        conversions: Math.round(day.conversions * multiplier),
        revenue: Math.round(day.revenue * multiplier),
      })
    })
  })

  return records
}

/**
 * Analytics-specific preview metrics with real provider IDs for platform filtering
 */
export interface PreviewAnalyticsMetric {
  id: string
  providerId: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number | null
  creatives?: Array<{
    id: string
    name: string
    type: string
    url?: string
    spend?: number
    impressions?: number
    clicks?: number
    conversions?: number
    revenue?: number
  }>
}

export function getPreviewAnalyticsMetrics(clientId: string | null): PreviewAnalyticsMetric[] {
  const providers = ['google', 'facebook', 'linkedin']
  
  const baseData: Record<string, Array<{ spend: number; impressions: number; clicks: number; conversions: number; revenue: number }>> = {
    google: [
      { spend: 850, impressions: 125000, clicks: 2800, conversions: 95, revenue: 9500 },
      { spend: 920, impressions: 132000, clicks: 3100, conversions: 108, revenue: 10800 },
      { spend: 780, impressions: 118000, clicks: 2650, conversions: 88, revenue: 8800 },
      { spend: 1050, impressions: 145000, clicks: 3400, conversions: 125, revenue: 12500 },
      { spend: 940, impressions: 138000, clicks: 3200, conversions: 112, revenue: 11200 },
      { spend: 1100, impressions: 152000, clicks: 3600, conversions: 135, revenue: 13500 },
      { spend: 980, impressions: 142000, clicks: 3300, conversions: 118, revenue: 11800 },
    ],
    facebook: [
      { spend: 620, impressions: 185000, clicks: 4200, conversions: 72, revenue: 7200 },
      { spend: 680, impressions: 198000, clicks: 4600, conversions: 82, revenue: 8200 },
      { spend: 590, impressions: 175000, clicks: 3900, conversions: 65, revenue: 6500 },
      { spend: 750, impressions: 215000, clicks: 5100, conversions: 95, revenue: 9500 },
      { spend: 710, impressions: 205000, clicks: 4800, conversions: 88, revenue: 8800 },
      { spend: 820, impressions: 228000, clicks: 5400, conversions: 105, revenue: 10500 },
      { spend: 760, impressions: 218000, clicks: 5200, conversions: 98, revenue: 9800 },
    ],
    linkedin: [
      { spend: 420, impressions: 32000, clicks: 680, conversions: 28, revenue: 5600 },
      { spend: 480, impressions: 36000, clicks: 780, conversions: 35, revenue: 7000 },
      { spend: 380, impressions: 28000, clicks: 590, conversions: 22, revenue: 4400 },
      { spend: 520, impressions: 42000, clicks: 890, conversions: 42, revenue: 8400 },
      { spend: 460, impressions: 38000, clicks: 820, conversions: 38, revenue: 7600 },
      { spend: 550, impressions: 45000, clicks: 950, conversions: 48, revenue: 9600 },
      { spend: 500, impressions: 40000, clicks: 860, conversions: 42, revenue: 8400 },
    ],
  }
  
  const records: PreviewAnalyticsMetric[] = []
  
  providers.forEach((provider) => {
    const providerData = baseData[provider]
    providerData.forEach((day, idx) => {
      const metric: PreviewAnalyticsMetric = {
        id: `preview-analytics-${provider}-${idx}`,
        providerId: provider,
        date: isoDaysAgo(6 - idx).split('T')[0],
        spend: day.spend,
        impressions: day.impressions,
        clicks: day.clicks,
        conversions: day.conversions,
        revenue: day.revenue,
      }
      
      // Add creatives for Facebook metrics
      if (provider === 'facebook') {
        metric.creatives = [
          {
            id: `creative-${provider}-${idx}-1`,
            name: 'Summer Sale Banner',
            type: 'image',
            spend: Math.round(day.spend * 0.4),
            impressions: Math.round(day.impressions * 0.4),
            clicks: Math.round(day.clicks * 0.4),
            conversions: Math.round(day.conversions * 0.4),
            revenue: Math.round(day.revenue * 0.4),
          },
          {
            id: `creative-${provider}-${idx}-2`,
            name: 'Product Showcase Video',
            type: 'video',
            spend: Math.round(day.spend * 0.35),
            impressions: Math.round(day.impressions * 0.35),
            clicks: Math.round(day.clicks * 0.35),
            conversions: Math.round(day.conversions * 0.35),
            revenue: Math.round(day.revenue * 0.35),
          },
          {
            id: `creative-${provider}-${idx}-3`,
            name: 'Carousel Collection',
            type: 'carousel',
            spend: Math.round(day.spend * 0.25),
            impressions: Math.round(day.impressions * 0.25),
            clicks: Math.round(day.clicks * 0.25),
            conversions: Math.round(day.conversions * 0.25),
            revenue: Math.round(day.revenue * 0.25),
          },
        ]
      }
      
      records.push(metric)
    })
  })
  
  return records
}

export interface PreviewProviderInsight {
  providerId: string
  summary: string
}

export interface PreviewAlgorithmicSuggestion {
  type: 'efficiency' | 'budget' | 'creative' | 'audience'
  level: 'success' | 'warning' | 'info' | 'critical'
  title: string
  message: string
  suggestion: string
  score?: number
}

export interface PreviewAlgorithmicInsight {
  providerId: string
  suggestions: PreviewAlgorithmicSuggestion[]
}

export function getPreviewAnalyticsInsights(): {
  insights: PreviewProviderInsight[]
  algorithmic: PreviewAlgorithmicInsight[]
} {
  const insights: PreviewProviderInsight[] = [
    {
      providerId: 'google',
      summary: 'Google Ads is performing exceptionally well with a 12.5x ROAS. Your search campaigns are driving high-intent traffic with a 3.5% conversion rate. Consider increasing budget allocation to capture more market share during peak hours.',
    },
    {
      providerId: 'facebook',
      summary: 'Meta Ads shows strong engagement metrics with video content outperforming static images by 45%. Your retargeting audiences are converting at 2.8x the rate of cold traffic. Lookalike audiences based on recent converters could expand reach efficiently.',
    },
    {
      providerId: 'linkedin',
      summary: 'LinkedIn Ads delivers the highest quality leads with a $185 average deal value. B2B targeting is precise, though CPCs remain elevated. Consider testing Sponsored InMail for decision-maker outreach.',
    },
  ]

  const algorithmic: PreviewAlgorithmicInsight[] = [
    {
      providerId: 'google',
      suggestions: [
        {
          type: 'efficiency',
          level: 'success',
          title: 'Strong ROAS Performance',
          message: 'Your Google Ads campaigns are generating $12.50 for every $1 spent, well above the industry benchmark of $4.',
          suggestion: 'Increase daily budget by 20% to capture additional high-converting traffic.',
          score: 92,
        },
        {
          type: 'audience',
          level: 'info',
          title: 'Audience Expansion Opportunity',
          message: 'Similar audiences to your top converters show 85% match rate.',
          suggestion: 'Test expanding to in-market audiences for related product categories.',
        },
      ],
    },
    {
      providerId: 'facebook',
      suggestions: [
        {
          type: 'creative',
          level: 'warning',
          title: 'Creative Fatigue Detected',
          message: 'Top performing creatives have been running for 14+ days with declining CTR.',
          suggestion: 'Refresh ad creative with new variants to maintain engagement rates.',
          score: 68,
        },
        {
          type: 'budget',
          level: 'success',
          title: 'Efficient Spend Allocation',
          message: 'Your CPA of $8.43 is 32% below your target of $12.50.',
          suggestion: 'Reallocate budget from underperforming ad sets to top performers.',
          score: 85,
        },
      ],
    },
    {
      providerId: 'global',
      suggestions: [
        {
          type: 'budget',
          level: 'info',
          title: 'Cross-Platform Optimization',
          message: 'Google drives 48% of conversions with 35% of spend, while LinkedIn has highest CPL.',
          suggestion: 'Shift 10% of LinkedIn budget to Google for better overall efficiency.',
          score: 78,
        },
      ],
    },
  ]

  return { insights, algorithmic }
}

export function getPreviewTasks(clientId: string | null): TaskRecord[] {
  const clientNameFromId = new Map(getPreviewClients().map((c) => [c.id, c.name]))
  const now = new Date()

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

export function getPreviewFinanceSummary(clientId: string | null): FinanceSummaryResponse {
  const clientNameFromId = new Map(getPreviewClients().map((c) => [c.id, c.name]))
  const now = new Date()
  const month = now.toISOString().slice(0, 7)

  const revenue = [
    {
      id: 'preview-rev-1',
      clientId,
      period: month,
      label: clientId ? clientNameFromId.get(clientId) ?? 'Client' : 'All clients',
      revenue: 24500,
      operatingExpenses: 8200,
      currency: 'USD',
      createdAt: isoDaysAgo(12),
      updatedAt: isoDaysAgo(2),
    },
    {
      id: 'preview-rev-2',
      clientId,
      period: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7),
      label: clientId ? clientNameFromId.get(clientId) ?? 'Client' : 'All clients',
      revenue: 21700,
      operatingExpenses: 7900,
      currency: 'USD',
      createdAt: isoDaysAgo(45),
      updatedAt: isoDaysAgo(40),
    },
  ]

  const invoices = [
    {
      id: 'preview-inv-1',
      clientId,
      clientName: clientId ? clientNameFromId.get(clientId) ?? 'Client' : 'Tech Corp',
      amount: 8000,
      status: 'sent' as const,
      stripeStatus: null,
      issuedDate: isoDaysAgo(10),
      dueDate: isoDaysAgo(-5),
      paidDate: null,
      amountPaid: null,
      amountRemaining: 8000,
      amountRefunded: null,
      currency: 'USD',
      description: 'Monthly retainer',
      hostedInvoiceUrl: null,
      number: 'INV-1001',
      createdAt: isoDaysAgo(10),
      updatedAt: isoDaysAgo(10),
    },
    {
      id: 'preview-inv-1-overdue',
      clientId,
      clientName: clientId ? clientNameFromId.get(clientId) ?? 'Client' : 'Retail Store',
      amount: 3100,
      status: 'overdue' as const,
      stripeStatus: null,
      issuedDate: isoDaysAgo(40),
      dueDate: isoDaysAgo(10),
      paidDate: null,
      amountPaid: 0,
      amountRemaining: 3100,
      amountRefunded: 0,
      currency: 'USD',
      description: 'Campaign support (overdue)',
      hostedInvoiceUrl: null,
      number: 'INV-0966',
      createdAt: isoDaysAgo(40),
      updatedAt: isoDaysAgo(10),
    },
    {
      id: 'preview-inv-2',
      clientId,
      clientName: clientId ? clientNameFromId.get(clientId) ?? 'Client' : 'StartupXYZ',
      amount: 5200,
      status: 'paid' as const,
      stripeStatus: null,
      issuedDate: isoDaysAgo(28),
      dueDate: isoDaysAgo(14),
      paidDate: isoDaysAgo(15),
      amountPaid: 5200,
      amountRemaining: 0,
      amountRefunded: 0,
      currency: 'USD',
      description: 'Implementation sprint',
      hostedInvoiceUrl: null,
      number: 'INV-0992',
      createdAt: isoDaysAgo(28),
      updatedAt: isoDaysAgo(15),
    },
  ]

  const costs = [
    {
      id: 'preview-cost-1',
      category: 'saas',
      amount: 499,
      cadence: 'monthly' as const,
      clientId,
      currency: 'USD',
      createdAt: isoDaysAgo(20),
      updatedAt: isoDaysAgo(10),
    },
    {
      id: 'preview-cost-2',
      category: 'people',
      amount: 4200,
      cadence: 'monthly' as const,
      clientId,
      currency: 'USD',
      createdAt: isoDaysAgo(20),
      updatedAt: isoDaysAgo(10),
    },
  ]

  return {
    revenue,
    invoices,
    costs,
    payments: {
      totals: [
        {
          currency: 'USD',
          totalInvoiced: invoices.reduce((sum, inv) => sum + inv.amount, 0),
          totalPaid: invoices.reduce((sum, inv) => sum + (inv.amountPaid ?? 0), 0),
          totalOutstanding: invoices.reduce((sum, inv) => sum + (inv.amountRemaining ?? 0), 0),
          refundTotal: invoices.reduce((sum, inv) => sum + (inv.amountRefunded ?? 0), 0),
        },
      ],
      overdueCount: invoices.filter((i) => i.status === 'overdue').length,
      paidCount: invoices.filter((i) => i.status === 'paid').length,
      openCount: invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length,
      nextDueAt: isoDaysAgo(-5),
      lastPaymentAt: isoDaysAgo(15),
    },
    invoiceNextCursor: null,
    costNextCursor: null,
    budget: {
      totalMonthlyBudget: 12000,
      categoryBudgets: {
        people: 7000,
        saas: 1500,
        marketing: 1200,
        operations: 800,
        travel: 500,
        training: 300,
        other: 700,
      },
    },
  }
}

export function getPreviewProjects(clientId: string | null): ProjectRecord[] {
  const clients = getPreviewClients()
  const clientNameFromId = new Map(clients.map((c) => [c.id, c.name]))
  const targetClientIds = clientId ? [clientId] : clients.map((c) => c.id)

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

export type PreviewProposalDraft = {
  id: string
  clientId: string | null
  clientName: string | null
  status: 'draft' | 'ready'
  stepProgress: number
  formData: Record<string, unknown>
  aiSuggestions: string | null
  presentationDeck: { storageUrl: string | null; pptxUrl: string | null; shareUrl: string | null } | null
  pptUrl: string | null
  createdAt: string
  updatedAt: string
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

export function getPreviewActivity(clientId: string | null): Activity[] {
  const clients = getPreviewClients()
  const targetClientIds = clientId ? [clientId] : clients.map((c) => c.id)

  const activities: Activity[] = [
    {
      id: 'preview-activity-1',
      type: 'task_completed',
      timestamp: isoDaysAgo(0),
      clientId: 'preview-tech-corp',
      entityId: 'preview-task-1',
      entityName: 'Review Q3 performance report',
      description: 'Task marked as completed by Alex Morgan',
      navigationUrl: '/dashboard/tasks?taskId=preview-task-1',
    },
    {
      id: 'preview-activity-2',
      type: 'message_posted',
      timestamp: isoDaysAgo(0),
      clientId: 'preview-tech-corp',
      entityId: 'preview-message-1',
      entityName: 'Q1 Brand Refresh Campaign',
      description: 'New comment on project discussion',
      navigationUrl: '/dashboard/collaboration?projectId=preview-project-1',
    },
    {
      id: 'preview-activity-3',
      type: 'project_updated',
      timestamp: isoDaysAgo(1),
      clientId: 'preview-startupxyz',
      entityId: 'preview-project-2',
      entityName: 'Product Launch Marketing',
      description: 'Project status changed to Planning',
      navigationUrl: '/dashboard/projects?projectId=preview-project-2',
    },
    {
      id: 'preview-activity-4',
      type: 'task_completed',
      timestamp: isoDaysAgo(1),
      clientId: 'preview-retail-store',
      entityId: 'preview-task-4',
      entityName: 'Finalize holiday creative assets',
      description: 'Task completed ahead of schedule',
      navigationUrl: '/dashboard/tasks?taskId=preview-task-4',
    },
    {
      id: 'preview-activity-5',
      type: 'message_posted',
      timestamp: isoDaysAgo(2),
      clientId: 'preview-startupxyz',
      entityId: 'preview-message-2',
      entityName: 'SEO Optimization Sprint',
      description: 'Priya Patel shared the technical audit results',
      navigationUrl: '/dashboard/collaboration?projectId=preview-project-5',
    },
    {
      id: 'preview-activity-6',
      type: 'project_updated',
      timestamp: isoDaysAgo(3),
      clientId: 'preview-tech-corp',
      entityId: 'preview-project-4',
      entityName: 'Social Media Management',
      description: 'New milestone added: Q2 Content Calendar',
      navigationUrl: '/dashboard/projects?projectId=preview-project-4',
    },
    {
      id: 'preview-activity-7',
      type: 'task_completed',
      timestamp: isoDaysAgo(4),
      clientId: 'preview-tech-corp',
      entityId: 'preview-task-5',
      entityName: 'Set up analytics tracking',
      description: 'Conversion tracking now live across all campaigns',
      navigationUrl: '/dashboard/tasks?taskId=preview-task-5',
    },
    {
      id: 'preview-activity-8',
      type: 'message_posted',
      timestamp: isoDaysAgo(5),
      clientId: 'preview-retail-store',
      entityId: 'preview-message-3',
      entityName: 'Holiday Sales Campaign',
      description: 'Final performance report shared with stakeholders',
      navigationUrl: '/dashboard/collaboration?projectId=preview-project-3',
    },
  ]

  if (!clientId) return activities
  return activities.filter((a) => a.clientId === clientId)
}

export function getPreviewNotifications(): WorkspaceNotification[] {
  const notifications: WorkspaceNotification[] = [
    {
      id: 'preview-notif-1',
      kind: 'task.updated',
      title: 'Task assigned to you',
      body: 'You have been assigned to "Review Q3 performance report"',
      actor: { id: 'preview-user-1', name: 'Alex Morgan' },
      resource: { type: 'task', id: 'preview-task-1' },
      recipients: { roles: ['team'], clientIds: ['preview-tech-corp'] },
      createdAt: isoDaysAgo(0),
      updatedAt: isoDaysAgo(0),
      read: false,
      acknowledged: false,
    },
    {
      id: 'preview-notif-2',
      kind: 'collaboration.mention',
      title: 'You were mentioned',
      body: 'Priya Patel mentioned you in "Product Launch Marketing"',
      actor: { id: 'preview-user-2', name: 'Priya Patel' },
      resource: { type: 'collaboration', id: 'preview-message-1' },
      recipients: { roles: ['team'], clientIds: ['preview-startupxyz'] },
      createdAt: isoDaysAgo(1),
      updatedAt: isoDaysAgo(1),
      read: false,
      acknowledged: false,
    },
    {
      id: 'preview-notif-3',
      kind: 'proposal.deck.ready',
      title: 'Proposal deck ready',
      body: 'Your presentation for Tech Corp is ready to download',
      actor: { id: null, name: 'System' },
      resource: { type: 'proposal', id: 'preview-proposal-1' },
      recipients: { roles: ['team'], clientIds: ['preview-tech-corp'] },
      createdAt: isoDaysAgo(2),
      updatedAt: isoDaysAgo(2),
      read: true,
      acknowledged: false,
    },
    {
      id: 'preview-notif-4',
      kind: 'invoice.paid',
      title: 'Invoice paid',
      body: 'StartupXYZ paid invoice INV-0992 ($5,200)',
      actor: { id: null, name: 'System' },
      resource: { type: 'invoice', id: 'preview-inv-2' },
      recipients: { roles: ['admin', 'team'], clientIds: ['preview-startupxyz'] },
      createdAt: isoDaysAgo(3),
      updatedAt: isoDaysAgo(3),
      read: true,
      acknowledged: true,
    },
    {
      id: 'preview-notif-5',
      kind: 'project.created',
      title: 'New project created',
      body: 'Social Media Management project has been set up for Tech Corp',
      actor: { id: 'preview-user-1', name: 'Alex Morgan' },
      resource: { type: 'project', id: 'preview-project-4' },
      recipients: { roles: ['team'], clientIds: ['preview-tech-corp'] },
      createdAt: isoDaysAgo(5),
      updatedAt: isoDaysAgo(5),
      read: true,
      acknowledged: true,
    },
  ]

  return notifications
}

export function getPreviewCollaborationMessages(clientId: string | null, projectId: string | null): CollaborationMessage[] {
  const clients = getPreviewClients()

  const messages: CollaborationMessage[] = [
    {
      id: 'preview-collab-1',
      channelType: 'project',
      clientId: 'preview-tech-corp',
      projectId: 'preview-project-1',
      content: 'Just uploaded the revised brand guidelines. Let me know if the color palette works for the digital assets.',
      senderId: 'preview-user-1',
      senderName: 'Alex Morgan',
      senderRole: 'Account Manager',
      createdAt: isoDaysAgo(0),
      updatedAt: isoDaysAgo(0),
      isEdited: false,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
      attachments: [{ name: 'brand-guidelines-v2.pdf', url: '#', type: 'application/pdf', size: '2.4 MB' }],
      format: 'markdown',
      reactions: [{ emoji: '👍', count: 2, userIds: ['preview-user-2', 'preview-user-3'] }],
    },
    {
      id: 'preview-collab-2',
      channelType: 'project',
      clientId: 'preview-tech-corp',
      projectId: 'preview-project-1',
      content: 'Looks great! The primary blue is perfect. Quick question - should we use the gradient version for social headers?',
      senderId: 'preview-user-2',
      senderName: 'Jordan Lee',
      senderRole: 'Strategist',
      createdAt: isoDaysAgo(0),
      updatedAt: isoDaysAgo(0),
      isEdited: false,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
      format: 'markdown',
    },
    {
      id: 'preview-collab-3',
      channelType: 'client',
      clientId: 'preview-startupxyz',
      projectId: null,
      content: 'Team sync: Product launch is confirmed for March 15th. We need to finalize the influencer list by EOW.',
      senderId: 'preview-user-3',
      senderName: 'Priya Patel',
      senderRole: 'Account Manager',
      createdAt: isoDaysAgo(1),
      updatedAt: isoDaysAgo(1),
      isEdited: false,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
      format: 'markdown',
      mentions: [{ slug: 'sam-chen', name: 'Sam Chen', role: 'Performance Marketer' }],
    },
    {
      id: 'preview-collab-4',
      channelType: 'project',
      clientId: 'preview-startupxyz',
      projectId: 'preview-project-5',
      content: 'SEO audit complete! Found 23 high-priority issues. Top 3:\n\n1. Missing meta descriptions on 40% of pages\n2. Slow page load times (avg 4.2s)\n3. Duplicate content on product pages\n\nFull report attached.',
      senderId: 'preview-user-4',
      senderName: 'Sam Chen',
      senderRole: 'Performance Marketer',
      createdAt: isoDaysAgo(2),
      updatedAt: isoDaysAgo(2),
      isEdited: false,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
      attachments: [{ name: 'seo-audit-report.xlsx', url: '#', type: 'application/vnd.ms-excel', size: '1.1 MB' }],
      format: 'markdown',
      reactions: [{ emoji: '🔥', count: 1, userIds: ['preview-user-3'] }],
    },
    {
      id: 'preview-collab-5',
      channelType: 'client',
      clientId: 'preview-retail-store',
      projectId: null,
      content: 'Holiday campaign wrap-up: 127% of revenue target achieved! Great work everyone. Client is thrilled with the results.',
      senderId: 'preview-user-5',
      senderName: 'Taylor Kim',
      senderRole: 'Account Manager',
      createdAt: isoDaysAgo(5),
      updatedAt: isoDaysAgo(5),
      isEdited: false,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
      format: 'markdown',
      reactions: [
        { emoji: '🎉', count: 3, userIds: ['preview-user-1', 'preview-user-2', 'preview-user-6'] },
        { emoji: '💪', count: 2, userIds: ['preview-user-3', 'preview-user-4'] },
      ],
    },
  ]

  let filtered = messages
  if (clientId) {
    filtered = filtered.filter((m) => m.clientId === clientId)
  }
  if (projectId) {
    filtered = filtered.filter((m) => m.projectId === projectId)
  }
  return filtered
}

// Ads preview data types
export type PreviewAdsMetricRecord = {
  id: string
  providerId: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number | null
  createdAt: string | null
}

export type PreviewAdsIntegrationStatus = {
  providerId: string
  status: string
  lastSyncedAt: string | null
  lastSyncRequestedAt: string | null
  message: string | null
  linkedAt: string | null
  accountId: string | null
  autoSyncEnabled: boolean
  syncFrequencyMinutes: number
  scheduledTimeframeDays: number
}

export function getPreviewAdsMetrics(): PreviewAdsMetricRecord[] {
  const providers = ['google', 'facebook', 'linkedin', 'tiktok']
  const metrics: PreviewAdsMetricRecord[] = []

  // Base metrics for different providers with varying performance
  const providerData: Record<string, { spendMultiplier: number; ctr: number; convRate: number; roasMultiplier: number }> = {
    google: { spendMultiplier: 1.0, ctr: 0.032, convRate: 0.045, roasMultiplier: 3.2 },
    facebook: { spendMultiplier: 0.8, ctr: 0.018, convRate: 0.028, roasMultiplier: 2.8 },
    linkedin: { spendMultiplier: 0.5, ctr: 0.008, convRate: 0.015, roasMultiplier: 4.1 },
    tiktok: { spendMultiplier: 0.6, ctr: 0.022, convRate: 0.022, roasMultiplier: 2.4 },
  }

  // Generate 30 days of data for each provider
  for (let day = 0; day < 30; day++) {
    providers.forEach((providerId) => {
      const data = providerData[providerId]
      const baseSpend = (150 + Math.random() * 100) * data.spendMultiplier
      const impressions = Math.round((baseSpend / 0.005) * (0.8 + Math.random() * 0.4))
      const clicks = Math.round(impressions * data.ctr * (0.8 + Math.random() * 0.4))
      const conversions = Math.round(clicks * data.convRate * (0.7 + Math.random() * 0.6))
      const revenue = Math.round(baseSpend * data.roasMultiplier * (0.8 + Math.random() * 0.4))

      metrics.push({
        id: `preview-ads-${providerId}-${day}`,
        providerId,
        date: isoDaysAgo(day),
        spend: Math.round(baseSpend * 100) / 100,
        impressions,
        clicks,
        conversions,
        revenue,
        createdAt: isoDaysAgo(day),
      })
    })
  }

  return metrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPreviewAdsIntegrationStatuses(): PreviewAdsIntegrationStatus[] {
  return [
    {
      providerId: 'google',
      status: 'success',
      lastSyncedAt: isoDaysAgo(0),
      lastSyncRequestedAt: isoDaysAgo(0),
      message: null,
      linkedAt: isoDaysAgo(45),
      accountId: 'preview-google-123',
      autoSyncEnabled: true,
      syncFrequencyMinutes: 360,
      scheduledTimeframeDays: 30,
    },
    {
      providerId: 'facebook',
      status: 'success',
      lastSyncedAt: isoDaysAgo(0),
      lastSyncRequestedAt: isoDaysAgo(0),
      message: null,
      linkedAt: isoDaysAgo(30),
      accountId: 'preview-meta-456',
      autoSyncEnabled: true,
      syncFrequencyMinutes: 360,
      scheduledTimeframeDays: 30,
    },
    {
      providerId: 'linkedin',
      status: 'success',
      lastSyncedAt: isoDaysAgo(1),
      lastSyncRequestedAt: isoDaysAgo(1),
      message: null,
      linkedAt: isoDaysAgo(20),
      accountId: 'preview-linkedin-789',
      autoSyncEnabled: true,
      syncFrequencyMinutes: 720,
      scheduledTimeframeDays: 30,
    },
    {
      providerId: 'tiktok',
      status: 'success',
      lastSyncedAt: isoDaysAgo(0),
      lastSyncRequestedAt: isoDaysAgo(0),
      message: null,
      linkedAt: isoDaysAgo(15),
      accountId: 'preview-tiktok-012',
      autoSyncEnabled: true,
      syncFrequencyMinutes: 360,
      scheduledTimeframeDays: 30,
    },
  ]
}
