'use client'

import type { MouseEvent } from 'react'
import { useCallback } from 'react'
import {
  Award,
  BellRing,
  BookOpen,
  CalendarClock,
  Globe2,
  GraduationCap,
  LifeBuoy,
  Megaphone,
  Network,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import type { TrainingModule } from '@/types/workforce'

import {
  getPreviewDirectoryContacts,
  getPreviewHelpDeskRequests,
  getPreviewKnowledgeArticles,
  getPreviewKnowledgeCollections,
  getPreviewRecognitionEntries,
  getPreviewTeamTree,
  getPreviewTrainingModules,
  getPreviewUpdates,
} from '@/lib/preview-data'
import { useUrlDrivenDialog } from '@/shared/hooks/use-url-driven-dialog'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

import { PeopleDirectory } from '@/features/dashboard/directory/people-directory'
import { OrgChart } from '@/features/dashboard/directory/org-chart'
import { TeamTree } from '@/features/dashboard/directory/team-tree'
import { RequestDetailDrawer } from '@/features/dashboard/help-desk/request-detail-drawer'
import { RequestInbox } from '@/features/dashboard/help-desk/request-inbox'
import { RequestRoutingControls } from '@/features/dashboard/help-desk/request-routing-controls'
import { ArticleEditor } from '@/features/dashboard/knowledge-base/article-editor'
import { ArticleList } from '@/features/dashboard/knowledge-base/article-list'
import { CollectionBrowser } from '@/features/dashboard/knowledge-base/collection-browser'
import { KnowledgeSearch } from '@/features/dashboard/knowledge-base/knowledge-search'
import { RecognitionFeed } from '@/features/dashboard/recognition/recognition-feed'
import { RecognitionScoreboard } from '@/features/dashboard/recognition/recognition-scoreboard'
import { CourseProgressCard } from '@/features/dashboard/training/course-progress-card'
import { LessonPlayer } from '@/features/dashboard/training/lesson-player'
import { TrainingCatalog } from '@/features/dashboard/training/training-catalog'
import { AnnouncementComposer } from '@/features/dashboard/updates/announcement-composer'
import { ReadReceiptsPanel } from '@/features/dashboard/updates/read-receipts-panel'
import { UpdatesFeed } from '@/features/dashboard/updates/updates-feed'

const COLLABORATION_PANELS = [
  'updates',
  'directory',
  'knowledge-base',
  'help-desk',
  'training',
  'recognition',
] as const

const COLLABORATION_PANEL_BUTTONS: { value: CollaborationPanel; label: string }[] = [
  { value: 'updates', label: 'Updates hub' },
  { value: 'directory', label: 'People directory' },
  { value: 'knowledge-base', label: 'Knowledge base' },
  { value: 'help-desk', label: 'Help desk' },
  { value: 'training', label: 'Training' },
  { value: 'recognition', label: 'Recognition' },
]

const FALLBACK_TRAINING_MODULE: TrainingModule = {
  id: 'fallback-training',
  title: 'Training module preview',
  audience: 'Operations',
  progressLabel: '0 assigned',
  completionRate: '0%',
  lessons: [],
} as const

type CollaborationPanel = (typeof COLLABORATION_PANELS)[number]

function SummaryPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

export function CollaborationOperationsDialogs() {
  const { activeValue: activePanel, isOpen, openValue, onOpenChange } = useUrlDrivenDialog<CollaborationPanel>({
    paramName: 'panel',
    allowedValues: COLLABORATION_PANELS,
  })
  const handlePanelTriggerClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const panel = event.currentTarget.dataset.panel as CollaborationPanel | undefined
    if (panel) {
      openValue(panel)
    }
  }, [openValue])

  const posts = getPreviewUpdates()
  const contacts = getPreviewDirectoryContacts()
  const teams = getPreviewTeamTree()
  const collections = getPreviewKnowledgeCollections()
  const articles = getPreviewKnowledgeArticles()
  const requests = getPreviewHelpDeskRequests()
  const trainingModules = getPreviewTrainingModules()
  const highlightedTrainingModule = trainingModules[0] ?? FALLBACK_TRAINING_MODULE
  const recognitionEntries = getPreviewRecognitionEntries()

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {COLLABORATION_PANEL_BUTTONS.map((button) => (
          <Button
            key={button.value}
            variant="outline"
            data-panel={button.value}
            onClick={handlePanelTriggerClick}
          >
            {button.label}
          </Button>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl">
          {activePanel === 'updates' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Updates inside collaboration
                </DialogTitle>
                <DialogDescription>
                  Broadcast updates now live next to channels and direct messages instead of behind a separate route.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-4">
                <SummaryPill icon={Megaphone} label="Announcements" value={String(posts.length)} />
                <SummaryPill icon={BellRing} label="Read rate" value="78%" />
                <SummaryPill icon={CalendarClock} label="Next send" value="09:00" />
                <SummaryPill icon={Users} label="Audiences" value="4" />
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <UpdatesFeed posts={posts} />
                <AnnouncementComposer />
              </div>
              <ReadReceiptsPanel posts={posts} />
            </>
          ) : null}

          {activePanel === 'directory' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Directory inside collaboration
                </DialogTitle>
                <DialogDescription>
                  Team lookup now sits beside conversation workflows so routing and context stay in one surface.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-4">
                <SummaryPill icon={Users} label="People indexed" value={String(contacts.length)} />
                <SummaryPill icon={Network} label="Teams mapped" value={String(teams.length)} />
                <SummaryPill icon={Globe2} label="Timezones" value="4" />
                <SummaryPill icon={Users} label="Profiles ready" value="86%" />
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <PeopleDirectory contacts={contacts} />
                <TeamTree teams={teams} />
              </div>
              <OrgChart teams={teams} />
            </>
          ) : null}

          {activePanel === 'knowledge-base' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Knowledge base inside collaboration
                </DialogTitle>
                <DialogDescription>
                  SOP lookup now sits beside channel context so questions can resolve before they become threads or tickets.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-4">
                <SummaryPill icon={BookOpen} label="Collections" value={String(collections.length)} />
                <SummaryPill icon={Search} label="Indexed articles" value={String(articles.length)} />
                <SummaryPill icon={BellRing} label="Deflection" value="62%" />
                <SummaryPill icon={Users} label="Teams covered" value={String(teams.length)} />
              </div>
              <KnowledgeSearch />
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <CollectionBrowser collections={collections} />
                <ArticleEditor />
              </div>
              <ArticleList articles={articles} />
            </>
          ) : null}

          {activePanel === 'help-desk' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <LifeBuoy className="h-5 w-5 text-primary" />
                  Help desk inside collaboration
                </DialogTitle>
                <DialogDescription>
                  Escalations now stay in the communications layer so support routing follows directly from messages and people context.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-4">
                <SummaryPill
                  icon={LifeBuoy}
                  label="Open requests"
                  value={String(requests.filter((request) => request.status !== 'resolved').length)}
                />
                <SummaryPill
                  icon={ShieldCheck}
                  label="Resolved today"
                  value={String(requests.filter((request) => request.status === 'resolved').length)}
                />
                <SummaryPill icon={Users} label="Queues active" value="3" />
                <SummaryPill icon={CalendarClock} label="Fastest SLA" value="6h" />
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <RequestInbox requests={requests} />
                <div className="space-y-6">
                  <RequestRoutingControls />
                  <RequestDetailDrawer />
                </div>
              </div>
            </>
          ) : null}

          {activePanel === 'training' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Training inside collaboration
                </DialogTitle>
                <DialogDescription>
                  Onboarding and enablement now sit next to channel context so answers, lessons, and handoffs stay in one workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-4">
                <SummaryPill icon={GraduationCap} label="Learning paths" value={String(trainingModules.length)} />
                <SummaryPill
                  icon={BookOpen}
                  label="Lessons ready"
                  value={String(trainingModules.flatMap((module) => module.lessons).length)}
                />
                <SummaryPill icon={ShieldCheck} label="Completion trend" value="74%" />
                <SummaryPill icon={PlayCircle} label="Formats covered" value="3" />
              </div>
              <TrainingCatalog modules={trainingModules} />
              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <CourseProgressCard module={highlightedTrainingModule} />
                <LessonPlayer module={highlightedTrainingModule} />
              </div>
            </>
          ) : null}

          {activePanel === 'recognition' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Recognition inside collaboration
                </DialogTitle>
                <DialogDescription>
                  Recognition now travels through the same communication layer as team updates, so praise can become visible operating context instead of a separate tab.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-4">
                <SummaryPill icon={Award} label="Recognitions" value={String(recognitionEntries.length)} />
                <SummaryPill icon={Users} label="Teams involved" value="3" />
                <SummaryPill icon={Sparkles} label="Top signal" value="Handoffs" />
                <SummaryPill icon={BellRing} label="Publish path" value="Updates" />
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <RecognitionFeed entries={recognitionEntries} />
                <RecognitionScoreboard />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
