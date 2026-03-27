'use client'

import { useCallback, useMemo, useState } from 'react'
import { ChevronDown, FileText } from 'lucide-react'

import { useToast } from '@/shared/ui/use-toast'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import type { ProposalFormData } from '@/lib/proposals'
import type { ProposalTemplate } from '@/types/proposal-templates'
import { useAuth } from '@/shared/contexts/auth-context'
import { useMutation, useQuery } from 'convex/react'
import { proposalTemplatesApi } from '@/lib/convex-api'

import {
  ProposalTemplateDropdownContent,
  ProposalTemplateSaveDialog,
} from './proposal-template-selector-sections'

interface ProposalTemplateSelectorProps {
  currentFormData: ProposalFormData
  onApplyTemplate: (formData: ProposalFormData) => void
  disabled?: boolean
}

type TemplateRow = {
  legacyId: string
  name?: string
  description?: string | null
  formData?: unknown
  industry?: string | null
  tags?: unknown
  isDefault?: boolean
  createdAtMs?: number
  updatedAtMs?: number
}

export function ProposalTemplateSelector({
  currentFormData,
  onApplyTemplate,
  disabled = false,
}: ProposalTemplateSelectorProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  const templatesRows = useQuery(
    proposalTemplatesApi.list,
    workspaceId ? { workspaceId, limit: 50 } : 'skip',
  )

  const createTemplate = useMutation(proposalTemplatesApi.create)
  const deleteTemplate = useMutation(proposalTemplatesApi.remove)

  const templates: ProposalTemplate[] = useMemo(() => {
    if (!Array.isArray(templatesRows)) return []

    return templatesRows.map((row) => {
      const typedRow = row as TemplateRow
      return {
      id: String(row.legacyId),
      name: typeof typedRow.name === 'string' ? typedRow.name : 'Untitled Template',
      description: typeof typedRow.description === 'string' ? typedRow.description : null,
      formData: typedRow.formData as ProposalFormData,
      industry: typeof typedRow.industry === 'string' ? typedRow.industry : null,
      tags: Array.isArray(typedRow.tags) ? typedRow.tags.filter((t): t is string => typeof t === 'string') : [],
      isDefault: typedRow.isDefault === true,
      createdAt: typeof typedRow.createdAtMs === 'number' ? new Date(typedRow.createdAtMs).toISOString() : null,
      updatedAt: typeof typedRow.updatedAtMs === 'number' ? new Date(typedRow.updatedAtMs).toISOString() : null,
    }})
  }, [templatesRows])

  const [open, setOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Save dialog state
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateIndustry, setTemplateIndustry] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const loading = templatesRows === undefined
  const canManageTemplates = Boolean(workspaceId)

  const handleApplyTemplate = useCallback((template: ProposalTemplate) => {
    onApplyTemplate(template.formData)
    setOpen(false)
    toast({
      title: 'Template applied',
      description: `"${template.name}" has been applied to your proposal.`,
    })
  }, [onApplyTemplate, toast])

  const handleSaveAsTemplate = useCallback(async () => {
    if (!templateName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for the template.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)

    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'Workspace context missing',
        variant: 'destructive',
      })
      setSaving(false)
      return
    }

    await createTemplate({
      workspaceId,
      name: templateName.trim(),
      description: templateDescription.trim() || null,
      formData: currentFormData,
      industry: templateIndustry.trim() || null,
      tags: [],
      isDefault,
      createdBy: user?.id ?? null,
    })
      .then(() => {
        setSaveDialogOpen(false)
        setTemplateName('')
        setTemplateDescription('')
        setTemplateIndustry('')
        setIsDefault(false)

        toast({
          title: 'Template saved',
          description: `"${templateName.trim()}" has been saved.`,
        })
      })
      .catch((error) => {
        console.error('Failed to save template:', error)
        toast({
          title: 'Error',
          description: 'Failed to save template',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setSaving(false)
      })
  }, [createTemplate, currentFormData, isDefault, templateDescription, templateIndustry, templateName, toast, user?.id, workspaceId])

  const handleDeleteTemplate = useCallback(async (templateId: string, templateName: string) => {
    setDeleting(templateId)

    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'Workspace context missing',
        variant: 'destructive',
      })
      setDeleting(null)
      return
    }

    await deleteTemplate({ workspaceId, legacyId: templateId })
      .then(() => {
        toast({
          title: 'Template deleted',
          description: `"${templateName}" has been deleted.`,
        })
      })
      .catch((error) => {
        console.error('Failed to delete template:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete template',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setDeleting(null)
      })
  }, [deleteTemplate, toast, workspaceId])

  const handleOpenSaveDialog = useCallback(() => {
    setOpen(false)
    setSaveDialogOpen(true)
  }, [])


  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Templates
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <ProposalTemplateDropdownContent
          templates={templates}
          loading={loading}
          deletingTemplateId={deleting}
          canManageTemplates={canManageTemplates}
          onApplyTemplate={handleApplyTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onOpenSaveDialog={handleOpenSaveDialog}
        />
      </DropdownMenu>

      <ProposalTemplateSaveDialog
        open={saveDialogOpen}
        saving={saving}
        templateName={templateName}
        templateDescription={templateDescription}
        templateIndustry={templateIndustry}
        isDefault={isDefault}
        onOpenChange={setSaveDialogOpen}
        onTemplateNameChange={setTemplateName}
        onTemplateDescriptionChange={setTemplateDescription}
        onTemplateIndustryChange={setTemplateIndustry}
        onDefaultChange={setIsDefault}
        onSave={handleSaveAsTemplate}
      />
    </>
  )
}
