'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, ChevronDown, FileText, Loader2, Plus, Save, Star, Trash2 } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ProposalFormData } from '@/lib/proposals'
import type { ProposalTemplate } from '@/types/proposal-templates'
import {
  fetchProposalTemplates,
  createProposalTemplate,
  deleteProposalTemplate,
} from '@/services/proposal-templates'

interface ProposalTemplateSelectorProps {
  currentFormData: ProposalFormData
  onApplyTemplate: (formData: ProposalFormData) => void
  disabled?: boolean
}

export function ProposalTemplateSelector({
  currentFormData,
  onApplyTemplate,
  disabled = false,
}: ProposalTemplateSelectorProps) {
  const { getIdToken } = useAuth()
  const { toast } = useToast()

  const [templates, setTemplates] = useState<ProposalTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Save dialog state
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateIndustry, setTemplateIndustry] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getIdToken()
      const data = await fetchProposalTemplates(token)
      setTemplates(data)
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [getIdToken, toast])

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open, loadTemplates])

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

    try {
      setSaving(true)
      const token = await getIdToken()
      const newTemplate = await createProposalTemplate(token, {
        name: templateName.trim(),
        description: templateDescription.trim() || null,
        formData: currentFormData,
        industry: templateIndustry.trim() || null,
        isDefault,
      })

      setTemplates((prev) => {
        // If new template is default, unset others
        if (isDefault) {
          return [newTemplate, ...prev.map((t) => ({ ...t, isDefault: false }))]
        }
        return [newTemplate, ...prev]
      })

      setSaveDialogOpen(false)
      setTemplateName('')
      setTemplateDescription('')
      setTemplateIndustry('')
      setIsDefault(false)

      toast({
        title: 'Template saved',
        description: `"${newTemplate.name}" has been saved.`,
      })
    } catch (error) {
      console.error('Failed to save template:', error)
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }, [currentFormData, getIdToken, isDefault, templateDescription, templateIndustry, templateName, toast])

  const handleDeleteTemplate = useCallback(async (templateId: string, templateName: string) => {
    try {
      setDeleting(templateId)
      const token = await getIdToken()
      await deleteProposalTemplate(token, templateId)
      setTemplates((prev) => prev.filter((t) => t.id !== templateId))
      toast({
        title: 'Template deleted',
        description: `"${templateName}" has been deleted.`,
      })
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }, [getIdToken, toast])

  const defaultTemplate = templates.find((t) => t.isDefault)

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
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Proposal Templates</span>
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {templates.length === 0 && !loading && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              <FileText className="mx-auto mb-2 h-8 w-8 opacity-30" />
              <p>No templates yet</p>
              <p className="text-xs">Save your current proposal as a template</p>
            </div>
          )}

          {templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              className="flex items-start gap-3 p-3 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault()
                handleApplyTemplate(template)
              }}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{template.name}</span>
                  {template.isDefault && (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                {template.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {template.industry && (
                    <Badge variant="secondary" className="text-[10px]">
                      {template.industry}
                    </Badge>
                  )}
                  {template.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={deleting === template.id}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteTemplate(template.id, template.name)
                }}
              >
                {deleting === template.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault()
              setOpen(false)
              setSaveDialogOpen(true)
            }}
          >
            <Save className="h-4 w-4" />
            Save current as template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save your current proposal configuration as a reusable template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., E-commerce Growth Package"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description of when to use this template..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-industry">Industry</Label>
              <Input
                id="template-industry"
                value={templateIndustry}
                onChange={(e) => setTemplateIndustry(e.target.value)}
                placeholder="e.g., E-commerce, SaaS, Healthcare"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <Label htmlFor="is-default" className="text-sm font-normal cursor-pointer">
                Set as default template for new proposals
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAsTemplate} disabled={saving || !templateName.trim()}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
