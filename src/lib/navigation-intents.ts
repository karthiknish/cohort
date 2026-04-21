/**
 * Navigation Intent Parser
 * 
 * Maps natural language input to dashboard routes using keyword matching.
 * This is a comprehensive mapping of all dashboard features and sub-pages.
 */

export interface NavigationIntent {
  route: string
  name: string
  description: string
  confidence: number
}

interface RouteMapping {
  route: string
  name: string
  description: string
  keywords: string[]
  aliases: string[]
  actions?: string[] // Things users can do here
}

const ROUTE_MAPPINGS: RouteMapping[] = [
  // Main Dashboard
  {
    route: '/dashboard',
    name: 'Dashboard',
    description: 'Overview with key metrics, recent activity, and quick actions',
    keywords: ['home', 'dashboard', 'overview', 'main', 'start', 'summary'],
    aliases: ['home page', 'main page', 'overview page', 'landing'],
    actions: ['see overview', 'check summary', 'view metrics'],
  },
  
  // Clients
  {
    route: '/admin/clients',
    name: 'Clients',
    description: 'Manage client workspaces, contacts, and account settings from the admin area',
    keywords: ['clients', 'client', 'workspaces', 'workspace', 'accounts', 'account', 'customers', 'customer'],
    aliases: ['client list', 'manage clients', 'client management', 'customer list', 'client directory'],
    actions: ['add client', 'create client', 'view clients', 'manage accounts'],
  },
  
  // Activity
  {
    route: '/dashboard/activity',
    name: 'Activity',
    description: 'Recent activity feed with team updates, changes, and events',
    keywords: ['activity', 'activities', 'recent', 'feed', 'updates', 'log', 'history', 'timeline', 'events'],
    aliases: ['activity feed', 'recent activity', 'activity log', 'event history', 'what happened'],
    actions: ['check activity', 'see updates', 'view history'],
  },
  
  // Analytics
  {
    route: '/dashboard/analytics',
    name: 'Analytics',
    description: 'Performance insights, charts, trends, and AI-powered analysis',
    keywords: ['analytics', 'analysis', 'insights', 'metrics', 'performance', 'stats', 'statistics', 'reports', 'reporting', 'data', 'charts', 'graphs', 'trends', 'kpi', 'roi'],
    aliases: ['performance insights', 'data analytics', 'view analytics', 'see charts', 'performance data', 'analytics dashboard'],
    actions: ['analyze performance', 'view charts', 'check metrics', 'see trends'],
  },
  
  // Ads Hub
  {
    route: '/dashboard/ads',
    name: 'Ads Hub',
    description: 'Manage ad platform integrations, sync campaigns, and view cross-channel metrics',
    keywords: ['ads', 'ad', 'advertising', 'campaigns', 'campaign', 'marketing', 'paid', 'media', 'google', 'meta', 'facebook', 'tiktok', 'linkedin', 'ppc', 'sem', 'social', 'spend', 'roas'],
    aliases: ['ad hub', 'ads hub', 'ad integrations', 'paid media', 'ad platforms', 'campaign management', 'ad dashboard', 'advertising hub'],
    actions: ['connect ads', 'sync campaigns', 'check ad spend', 'view roas', 'manage campaigns'],
  },

  // Socials
  {
    route: '/dashboard/socials',
    name: 'Socials',
    description: 'Connect Meta, review Facebook and Instagram performance, and track AI suggestions',
    keywords: ['socials', 'social', 'instagram', 'facebook', 'meta social', 'paid social', 'social ads', 'instagram ads', 'facebook ads'],
    aliases: ['social dashboard', 'meta insights', 'instagram insights', 'facebook insights', 'social media insights'],
    actions: ['connect facebook', 'connect instagram', 'check social insights', 'view social suggestions'],
  },

  // Meetings
  {
    route: '/dashboard/meetings',
    name: 'Meetings',
    description: 'Schedule native meeting rooms, manage Calendar invites, and review AI meeting notes',
    keywords: ['meetings', 'meeting', 'calendar', 'google meet', 'invite', 'invites', 'transcript', 'notes', 'call', 'calls'],
    aliases: ['meeting scheduler', 'schedule call', 'meeting notes', 'meeting hub', 'google workspace meetings'],
    actions: ['schedule meeting', 'start meeting', 'join call', 'review transcript', 'read meeting notes'],
  },
  
  // Tasks
  {
    route: '/dashboard/tasks',
    name: 'Tasks',
    description: 'Task management with assignments, due dates, and project tracking',
    keywords: ['tasks', 'task', 'todo', 'todos', 'to-do', 'checklist', 'assignments', 'work', 'items', 'backlog', 'sprint'],
    aliases: ['task list', 'my tasks', 'task management', 'to-do list', 'work items', 'task board'],
    actions: ['add task', 'create task', 'check tasks', 'manage assignments', 'see what to do'],
  },
  
  // Proposals
  {
    route: '/dashboard/proposals',
    name: 'Proposals',
    description: 'Create and manage client proposals, quotes, and pitch decks',
    keywords: ['proposals', 'proposal', 'quotes', 'quote', 'estimates', 'estimate', 'pitch', 'decks', 'deck', 'offers', 'bids'],
    aliases: ['create proposal', 'proposal builder', 'pitch deck', 'new proposal', 'proposal list', 'quote builder'],
    actions: ['create proposal', 'build pitch deck', 'send quote', 'make estimate'],
  },

  {
    route: '/dashboard/proposals/analytics',
    name: 'Proposal analytics',
    description: 'Proposal funnel metrics, win rates, and submission trends',
    keywords: ['proposal analytics', 'proposal metrics', 'proposal performance', 'win rate', 'proposal stats', 'proposal funnel'],
    aliases: ['proposal insights', 'how proposals perform', 'proposal reporting'],
    actions: ['review proposal outcomes', 'check win rate', 'see proposal trends'],
  },
  
  // For You (personalized workspace)
  {
    route: '/for-you',
    name: 'For You',
    description: 'Personalized recommendations, digest, and workspace highlights',
    keywords: ['for you', 'personalized', 'digest', 'highlights', 'recommendations', 'my feed', 'whats new', 'what is new'],
    aliases: ['for you page', 'personal feed', 'workspace digest', 'cohorts for you'],
    actions: ['see what matters', 'check recommendations', 'open my digest'],
  },

  // Time off
  {
    route: '/dashboard/time-off',
    name: 'Time off',
    description: 'Request, review, and approve PTO and leave',
    keywords: ['time off', 'pto', 'vacation', 'leave request', 'sick leave', 'out of office', 'ooo', 'holiday leave'],
    aliases: ['request pto', 'time off requests', 'leave approvals', 'vacation days'],
    actions: ['request leave', 'approve pto', 'check time off balance'],
  },

  // Time tracking (tasks operations tab)
  {
    route: '/dashboard/tasks?operations=time',
    name: 'Time tracking',
    description: 'Log and review time entries against tasks',
    keywords: ['timesheet', 'time tracking', 'log time', 'track time', 'billable', 'hours logged', 'time entry', 'time entries'],
    aliases: ['log my hours', 'submit timesheet', 'track billable time'],
    actions: ['log hours', 'review time entries', 'export timesheet'],
  },

  // Forms (intake — redirects into Projects)
  {
    route: '/dashboard/forms',
    name: 'Forms',
    description: 'Client intake forms and structured submissions',
    keywords: ['forms', 'intake', 'questionnaire', 'survey', 'form submissions', 'lead form'],
    aliases: ['intake forms', 'client forms', 'submission forms'],
    actions: ['open forms', 'review submissions', 'configure intake'],
  },

  // Scheduling (projects operations tab)
  {
    route: '/dashboard/scheduling',
    name: 'Scheduling',
    description: 'Resource scheduling and calendar blocks tied to projects',
    keywords: ['scheduling', 'scheduler', 'availability', 'resource schedule', 'capacity planning', 'booking grid'],
    aliases: ['team scheduling', 'project scheduling', 'schedule resources'],
    actions: ['book resources', 'check availability', 'plan capacity'],
  },

  // Collaboration
  {
    route: '/dashboard/collaboration',
    name: 'Collaboration',
    description: 'Team chat, messaging, and communication hub',
    keywords: ['collaboration', 'chat', 'messages', 'message', 'team', 'communication', 'discuss', 'conversation', 'talk', 'threads', 'dm', 'direct message', 'channel'],
    aliases: ['team chat', 'collaboration hub', 'messaging', 'communicate', 'discussions', 'chat room', 'project discussion', 'client thread', 'team channel'],
    actions: ['send message', 'chat with team', 'check messages', 'start conversation'],
  },
  
  // Projects
  {
    route: '/dashboard/projects',
    name: 'Projects',
    description: 'Project management with timelines, milestones, and deliverables',
    keywords: ['projects', 'project', 'work', 'deliverables', 'milestones', 'timeline', 'scope'],
    aliases: ['project list', 'project management', 'my projects', 'active projects', 'project board'],
    actions: ['create project', 'view projects', 'check milestones', 'manage deliverables'],
  },
  
  // Notifications
  {
    route: '/dashboard/notifications',
    name: 'Notifications',
    description: 'View all notifications and alerts',
    keywords: ['notifications', 'notification', 'alerts', 'alert', 'bell', 'inbox'],
    aliases: ['all notifications', 'notification center', 'alert inbox'],
    actions: ['check notifications', 'see alerts', 'view inbox'],
  },
  
  // Settings
  {
    route: '/settings',
    name: 'Settings',
    description: 'Account settings, preferences, and configuration',
    keywords: ['settings', 'setting', 'preferences', 'config', 'configuration', 'options', 'account', 'profile'],
    aliases: ['account settings', 'my settings', 'preferences', 'user settings', 'profile settings'],
    actions: ['change settings', 'update profile', 'configure account'],
  },
  
  // Admin
  {
    route: '/admin',
    name: 'Admin Panel',
    description: 'System administration, user management, and platform settings',
    keywords: ['admin', 'administration', 'manage', 'users', 'system', 'platform'],
    aliases: ['admin panel', 'admin dashboard', 'user management', 'system settings', 'admin area'],
    actions: ['manage users', 'system config', 'admin tools'],
  },

  {
    route: '/admin/team',
    name: 'Team management',
    description: 'Invite workspace staff, roles, and internal client allocation',
    keywords: ['team management', 'internal team', 'workspace team', 'invite teammate', 'staff roles', 'teammates', 'admin team'],
    aliases: ['manage team', 'team directory', 'invite staff', 'workspace members admin'],
    actions: ['invite user', 'change roles', 'review allocations'],
  },
]

// Action phrases that indicate navigation intent
const ACTION_PHRASES = [
  'go to',
  'take me to',
  'show me',
  'open',
  'navigate to',
  'switch to',
  'view',
  'see',
  'check',
  'look at',
  'bring up',
  'pull up',
  'find',
  'where is',
  'where can i',
  'i want to',
  'i need to',
  'how do i',
  'let me see',
  'can you show',
]

/**
 * Normalizes input text for matching
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculates a match score between input and a route mapping
 */
function calculateScore(input: string, mapping: RouteMapping): number {
  const normalizedInput = normalize(input)
  const words = normalizedInput.split(' ')
  
  let score = 0
  
  // Check for exact keyword matches
  for (const keyword of mapping.keywords) {
    if (words.includes(keyword)) {
      score += 10
    } else if (normalizedInput.includes(keyword)) {
      score += 5
    }
  }
  
  // Check for alias matches
  for (const alias of mapping.aliases) {
    if (normalizedInput.includes(alias)) {
      score += 15
    }
  }
  
  // Check for action matches
  if (mapping.actions) {
    for (const action of mapping.actions) {
      if (normalizedInput.includes(action)) {
        score += 12
      }
    }
  }
  
  // Boost if action phrase is present
  for (const phrase of ACTION_PHRASES) {
    if (normalizedInput.includes(phrase)) {
      score += 2
      break
    }
  }
  
  return score
}

/**
 * Parses natural language input and returns the best matching navigation intent.
 * Returns null if no confident match is found.
 */
export function parseNavigationIntent(input: string): NavigationIntent | null {
  if (!input || input.trim().length === 0) {
    return null
  }
  
  let bestMatch: { mapping: RouteMapping; score: number } | null = null
  
  for (const mapping of ROUTE_MAPPINGS) {
    const score = calculateScore(input, mapping)
    
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { mapping, score }
    }
  }
  
  if (!bestMatch || bestMatch.score < 5) {
    return null
  }
  
  // Convert score to confidence (0-1 range, capped at 1)
  const confidence = Math.min(bestMatch.score / 25, 1)
  
  return {
    route: bestMatch.mapping.route,
    name: bestMatch.mapping.name,
    description: bestMatch.mapping.description,
    confidence,
  }
}

/**
 * Returns all available navigation destinations for suggestions
 */
export function getNavigationSuggestions(): Array<{ route: string; name: string; description: string }> {
  return ROUTE_MAPPINGS.map((m) => ({ route: m.route, name: m.name, description: m.description }))
}

/**
 * Builds a formatted list of available routes for AI prompts
 */
export function buildRoutesForPrompt(): string {
  const mainRoutes = ROUTE_MAPPINGS

  return mainRoutes.map((r) => {
    const actions = r.actions ? ` (${r.actions.slice(0, 3).join(', ')})` : ''
    return `- **${r.name}** → \`${r.route}\`: ${r.description}${actions}`
  }).join('\n')
}
