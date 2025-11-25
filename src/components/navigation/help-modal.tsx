'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  CheckSquare,
  CreditCard,
  FileText,
  MessageSquare,
  Home,
  Briefcase,
  Megaphone,
  Activity,
  Users,
  Keyboard,
  ArrowRight,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'

interface HelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  showWelcome?: boolean
}

const navigationGuide = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Your home base with key metrics, workspace comparison, quick actions, and recent activity.',
    tips: ['Use the client selector to filter by workspace', 'Compare multiple clients if you are an admin'],
  },
  {
    name: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
    description: 'Manage your client workspaces, add new clients, and configure workspace settings.',
    tips: ['Click a client to see detailed information', 'Use the search to quickly find clients'],
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Deep dive into performance data across all your connected ad platforms.',
    tips: ['Filter by platform and date range', 'Check AI-generated insights for quick recommendations'],
  },
  {
    name: 'Ads',
    href: '/dashboard/ads',
    icon: Megaphone,
    description: 'Connect and manage your ad platform integrations (Google, Meta, LinkedIn, TikTok).',
    tips: ['Connect platforms to sync metrics automatically', 'Monitor sync status and refresh data'],
  },
  {
    name: 'Tasks',
    href: '/dashboard/tasks',
    icon: CheckSquare,
    description: 'Track and manage tasks for you and your team across all client projects.',
    tips: ['Assign tasks to team members', 'Set priorities and due dates'],
  },
  {
    name: 'Finance',
    href: '/dashboard/finance',
    icon: CreditCard,
    description: 'Track invoices, costs, and revenue. Monitor cash flow and profitability.',
    tips: ['Log operating costs to track margins', 'Create and send invoices to clients'],
  },
  {
    name: 'Proposals',
    href: '/dashboard/proposals',
    icon: FileText,
    description: 'Create AI-powered proposals and pitch decks for new and existing clients.',
    tips: ['Use templates to speed up creation', 'Generate professional slide decks instantly'],
  },
  {
    name: 'Collaboration',
    href: '/dashboard/collaboration',
    icon: MessageSquare,
    description: 'Team chat with project channels, file sharing, and message threading.',
    tips: ['Use markdown and code blocks in messages', 'React to messages and create threads'],
  },
  {
    name: 'Projects',
    href: '/dashboard/projects',
    icon: Briefcase,
    description: 'Organize work into projects linked to clients for better tracking.',
    tips: ['Link tasks and messages to projects', 'Track project progress and deadlines'],
  },
]

const keyboardShortcuts = [
  { keys: ['⌘', 'K'], description: 'Open quick navigation' },
  { keys: ['?'], description: 'Show help & shortcuts' },
  { keys: ['Esc'], description: 'Close dialogs and modals' },
  { keys: ['⌘', '/'], description: 'Focus search' },
]

const gettingStartedSteps = [
  {
    title: 'Select or create a client workspace',
    description: 'Use the dropdown in the header to switch between client workspaces or create a new one.',
    action: { label: 'Go to Clients', href: '/dashboard/clients' },
  },
  {
    title: 'Connect your ad platforms',
    description: 'Link Google Ads, Meta, LinkedIn, or TikTok to automatically sync campaign performance.',
    action: { label: 'Setup Integrations', href: '/dashboard/ads' },
  },
  {
    title: 'Log your first invoice',
    description: 'Track revenue and costs in the Finance section to monitor profitability.',
    action: { label: 'Open Finance', href: '/dashboard/finance' },
  },
  {
    title: 'Create a proposal',
    description: 'Use AI to generate professional proposals and pitch decks in minutes.',
    action: { label: 'Create Proposal', href: '/dashboard/proposals' },
  },
]

export function HelpModal({ open, onOpenChange, showWelcome = false }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState(showWelcome ? 'welcome' : 'navigation')

  useEffect(() => {
    if (showWelcome) {
      setActiveTab('welcome')
    }
  }, [showWelcome])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {showWelcome ? 'Welcome to Cohorts' : 'Help & Navigation'}
          </DialogTitle>
          <DialogDescription>
            {showWelcome
              ? 'Get started with your agency workspace in a few simple steps.'
              : 'Learn how to navigate and make the most of your workspace.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              {showWelcome && <TabsTrigger value="welcome">Get Started</TabsTrigger>}
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              {!showWelcome && <TabsTrigger value="tips">Tips</TabsTrigger>}
            </TabsList>
          </div>

          <ScrollArea className="h-[400px] px-6 pb-6">
            {showWelcome && (
              <TabsContent value="welcome" className="mt-4 space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground">Quick tip</h4>
                      <p className="text-sm text-muted-foreground">
                        Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">⌘K</kbd> anytime to quickly navigate to any page.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {gettingStartedSteps.map((step, index) => (
                    <div
                      key={step.title}
                      className="group flex items-start gap-4 rounded-lg border border-muted/60 p-4 transition hover:border-primary/40 hover:bg-muted/30"
                    >
                      <Badge variant="secondary" className="shrink-0">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-foreground">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="shrink-0">
                        <Link href={step.action.href} onClick={() => onOpenChange(false)}>
                          {step.action.label}
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      localStorage.setItem('cohorts_welcome_seen', 'true')
                      onOpenChange(false)
                    }}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              </TabsContent>
            )}

            <TabsContent value="navigation" className="mt-4 space-y-3">
              {navigationGuide.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className="group flex items-start gap-3 rounded-lg border border-muted/60 p-3 transition hover:border-primary/40 hover:bg-muted/30"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground group-hover:text-primary">
                          {item.name}
                        </h4>
                        <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </Link>
                )
              })}
            </TabsContent>

            <TabsContent value="shortcuts" className="mt-4 space-y-4">
              <div className="rounded-lg border border-muted/60 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Keyboard className="h-4 w-4" />
                  Keyboard Shortcuts
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use these shortcuts to navigate faster.
                </p>
              </div>

              <div className="space-y-2">
                {keyboardShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between rounded-lg border border-muted/40 px-4 py-3"
                  >
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {!showWelcome && (
              <TabsContent value="tips" className="mt-4 space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h4 className="font-semibold text-foreground">Pro tips for power users</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get more done with these helpful features.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-muted/60 p-4">
                    <h5 className="font-medium text-foreground">Client Comparison</h5>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Admin users can compare multiple clients side-by-side on the dashboard.
                      Select multiple workspaces from the filter bar.
                    </p>
                  </div>

                  <div className="rounded-lg border border-muted/60 p-4">
                    <h5 className="font-medium text-foreground">AI-Powered Features</h5>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use AI to generate proposals, get performance insights, and create
                      professional pitch decks automatically.
                    </p>
                  </div>

                  <div className="rounded-lg border border-muted/60 p-4">
                    <h5 className="font-medium text-foreground">Markdown in Chat</h5>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use markdown formatting in collaboration messages including code blocks
                      with syntax highlighting.
                    </p>
                  </div>

                  <div className="rounded-lg border border-muted/60 p-4">
                    <h5 className="font-medium text-foreground">Quick Search</h5>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The search bar in the header searches across clients, tasks, and campaigns.
                      Use it to quickly find what you need.
                    </p>
                  </div>
                </div>
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export function useHelpModal() {
  const [open, setOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem('cohorts_welcome_seen')
    
    // Check if user is new (created within last 24 hours)
    const created = user.createdAt ? new Date(user.createdAt) : new Date()
    const now = new Date()
    const isNewUser = (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000

    if (!hasSeenWelcome && isNewUser) {
      setShowWelcome(true)
      setOpen(true)
    }
  }, [user])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setShowWelcome(false)
          setOpen(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { open, setOpen, showWelcome, setShowWelcome }
}
