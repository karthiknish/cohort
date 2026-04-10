'use client'

import { useCallback, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ClipboardCheck, FileCheck2, ListChecks, Sparkles } from 'lucide-react'

import {
  getPreviewChecklistSubmissions,
  getPreviewChecklistTemplates,
  getPreviewFormFields,
} from '@/lib/preview-data'
import { workforceApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { WORKFORCE_ROUTE_MAP } from '@/lib/workforce-routes'
import { WorkforcePageShell } from '@/features/dashboard/workforce/workforce-page-shell'
import { EmptyState, ModulePageLoadingPlaceholder } from '@/features/dashboard/home/components/dashboard-page-header'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'

import { ChecklistTemplateLibrary } from './checklist-template-library'
import { FormBuilder } from './form-builder'
import { FormEntryDetail } from './form-entry-detail'
import { SubmissionTable } from './submission-table'

export default function FormsPage() {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const workspaceId = user?.agencyId ?? null
  const route = WORKFORCE_ROUTE_MAP.forms
  const formsDashboard = useQuery(
    workforceApi.getFormsDashboard,
    !isPreviewMode && workspaceId ? { workspaceId } : 'skip',
  )
  const seedFormsModule = useMutation(workforceApi.seedFormsModule)
  const createChecklistTemplate = useMutation(workforceApi.createChecklistTemplate)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)

  const templates = isPreviewMode ? getPreviewChecklistTemplates() : (formsDashboard?.templates ?? [])
  const fields = isPreviewMode ? getPreviewFormFields() : (formsDashboard?.fields ?? [])
  const submissions = isPreviewMode ? getPreviewChecklistSubmissions() : (formsDashboard?.submissions ?? [])
  const summary = isPreviewMode
    ? {
        activeTemplates: String(getPreviewChecklistTemplates().length),
        submissionQuality: '91%',
        followUpsNeeded: '1',
        automationReady: '4',
      }
    : formsDashboard?.summary
  const isLoading = !isPreviewMode && workspaceId !== null && formsDashboard === undefined
  const hasLiveData = Boolean(summary && templates.length > 0)

  const handleSeed = useCallback(async () => {
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to seed form templates.', variant: 'destructive' })
      return
    }

    setIsSeeding(true)
    try {
      const result = await seedFormsModule({ workspaceId })
      toast({
        title: result.inserted > 0 ? 'Forms module seeded' : 'Forms module already seeded',
        description: result.inserted > 0 ? 'Templates and submissions were written to Convex.' : 'This workspace already has checklist templates.',
      })
    } catch (error) {
      logError(error, 'forms-page:seed')
      toast({ title: 'Unable to seed forms module', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setIsSeeding(false)
    }
  }, [seedFormsModule, toast, workspaceId])

  const handleCreateTemplate = useCallback(async () => {
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to create a checklist template.', variant: 'destructive' })
      return
    }

    setIsCreatingTemplate(true)
    try {
      const result = await createChecklistTemplate({
        workspaceId,
        title: 'Launch review checklist',
        category: 'Operations',
        frequency: 'Weekly',
      })
      toast({ title: 'Checklist template created', description: `Template ${result.legacyId} was saved to Convex.` })
    } catch (error) {
      logError(error, 'forms-page:create-template')
      toast({ title: 'Unable to create template', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setIsCreatingTemplate(false)
    }
  }, [createChecklistTemplate, toast, workspaceId])

  const handleCreateTemplateClick = useCallback(() => {
    void handleCreateTemplate()
  }, [handleCreateTemplate])

  return (
    <WorkforcePageShell
      routeId={route.id}
      title={route.title}
      description={route.description}
      icon={route.icon}
      badgeLabel="P0 module"
      stats={[
        { label: 'Active templates', value: summary?.activeTemplates ?? '0', description: 'Workflows standardized into reusable forms', icon: ListChecks },
        { label: 'Submission quality', value: summary?.submissionQuality ?? '0%', description: isPreviewMode ? 'Preview completion benchmark across active templates' : 'Live completion benchmark across current submissions', icon: FileCheck2, variant: 'success' },
        { label: 'Follow-ups needed', value: summary?.followUpsNeeded ?? '0', description: 'Submissions blocked on missing evidence', icon: ClipboardCheck, variant: 'warning' },
        { label: 'Automation ready', value: summary?.automationReady ?? '0', description: 'Fields prepared for conditional logic and attachments', icon: Sparkles },
      ]}
      ctaHref="/dashboard/projects"
      ctaLabel="Tie checklists to projects"
    >
      {!isPreviewMode && !workspaceId ? (
        <EmptyState
          icon={route.icon}
          title="Workspace sign-in required"
          description="Forms now load from Convex and need an authenticated workspace before querying templates."
        />
      ) : null}

      {isLoading ? (
        <ModulePageLoadingPlaceholder message="Loading checklist templates, form fields, and submission history from your workspace." />
      ) : null}

      {!isPreviewMode && workspaceId && !isLoading && !hasLiveData ? (
        <EmptyState
          icon={route.icon}
          title="No live forms yet"
          description="Seed the forms module to create starter checklists and submission history."
          onAction={handleSeed}
          actionLabel={isSeeding ? 'Seeding...' : 'Seed forms module'}
          actionDisabled={isSeeding}
        />
      ) : null}

      {(isPreviewMode || hasLiveData) ? (
        <>
          <ChecklistTemplateLibrary templates={templates} />
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <FormBuilder fields={fields} pending={isCreatingTemplate} onCreateTemplate={handleCreateTemplateClick} />
            <FormEntryDetail />
          </div>
          <SubmissionTable submissions={submissions} />
        </>
      ) : null}
    </WorkforcePageShell>
  )
}
