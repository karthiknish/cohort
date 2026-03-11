'use client'

import { FileText, LoaderCircle, Save, Star, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { ProposalTemplate } from '@/types/proposal-templates'

export function ProposalTemplateDropdownContent(props: {
  templates: ProposalTemplate[]
  loading: boolean
  deletingTemplateId: string | null
  canManageTemplates: boolean
  onApplyTemplate: (template: ProposalTemplate) => void
  onDeleteTemplate: (templateId: string, templateName: string) => void
  onOpenSaveDialog: () => void
}) {
  const {
    templates,
    loading,
    deletingTemplateId,
    canManageTemplates,
    onApplyTemplate,
    onDeleteTemplate,
    onOpenSaveDialog,
  } = props

  return (
    <DropdownMenuContent align="end" className="w-72">
      <DropdownMenuLabel className="flex items-center justify-between gap-2">
        <span>Proposal Templates</span>
        {loading ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Badge variant="outline" className="text-[10px]">{templates.length} saved</Badge>}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      {loading ? (
        <div className="space-y-2 px-2 py-2">{[0, 1, 2].map((slot) => <Skeleton key={slot} className="h-16 w-full rounded-lg" />)}</div>
      ) : templates.length > 0 ? (
        templates.map((template) => (
          <DropdownMenuItem key={template.id} className="flex cursor-pointer items-start gap-3 p-3" onSelect={(event) => {
            event.preventDefault()
            onApplyTemplate(template)
          }}>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{template.name}</span>
                {template.isDefault ? <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> : null}
              </div>
              {template.description ? <p className="line-clamp-2 text-xs text-muted-foreground">{template.description}</p> : null}
              <div className="flex flex-wrap gap-1">
                {template.industry ? <Badge variant="secondary" className="text-[10px]">{template.industry}</Badge> : null}
                {template.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive" disabled={deletingTemplateId === template.id} aria-label={`Delete ${template.name} template`} onClick={(event) => {
              event.stopPropagation()
              onDeleteTemplate(template.id, template.name)
            }}>
              {deletingTemplateId === template.id ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            </Button>
          </DropdownMenuItem>
        ))
      ) : (
        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
          <FileText className="mx-auto mb-2 h-8 w-8 opacity-30" />
          <p>No templates yet</p>
          <p className="text-xs">Save this proposal once the basics look good so future proposals can start faster.</p>
        </div>
      )}

      {!canManageTemplates ? <p className="px-3 pb-2 text-[11px] text-muted-foreground">Open a workspace to load and save proposal templates.</p> : null}

      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer gap-2" disabled={!canManageTemplates} onSelect={(event) => {
        event.preventDefault()
        onOpenSaveDialog()
      }}>
        <Save className="h-4 w-4" />
        Save current as template
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

export function ProposalTemplateSaveDialog(props: {
  open: boolean
  saving: boolean
  templateName: string
  templateDescription: string
  templateIndustry: string
  isDefault: boolean
  onOpenChange: (open: boolean) => void
  onTemplateNameChange: (value: string) => void
  onTemplateDescriptionChange: (value: string) => void
  onTemplateIndustryChange: (value: string) => void
  onDefaultChange: (checked: boolean) => void
  onSave: () => void
}) {
  const {
    open,
    saving,
    templateName,
    templateDescription,
    templateIndustry,
    isDefault,
    onOpenChange,
    onTemplateNameChange,
    onTemplateDescriptionChange,
    onTemplateIndustryChange,
    onDefaultChange,
    onSave,
  } = props

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>Save your current proposal configuration as a reusable starting point.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-xl border border-muted/60 bg-muted/20 p-3 text-xs text-muted-foreground">
            This stores your current company, goals, scope, timelines, and proposal value so the next draft can start from a stronger baseline.
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input id="template-name" value={templateName} onChange={(event) => onTemplateNameChange(event.target.value)} placeholder="e.g., E-commerce Growth Package" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea id="template-description" value={templateDescription} onChange={(event) => onTemplateDescriptionChange(event.target.value)} placeholder="Brief description of when to use this template…" rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-industry">Industry</Label>
            <Input id="template-industry" value={templateIndustry} onChange={(event) => onTemplateIndustryChange(event.target.value)} placeholder="e.g., E-commerce, SaaS, Healthcare" />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is-default" checked={isDefault} onCheckedChange={(checked) => onDefaultChange(checked === true)} />
            <Label htmlFor="is-default" className="cursor-pointer text-sm font-normal">Set as the default starting template for new proposals</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={onSave} disabled={saving || !templateName.trim()}>
            {saving ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save Template</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}