'use client'

import { useState, useCallback } from 'react'
import { FileText, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TaskTemplate, TaskStatus, TaskPriority } from '@/types/tasks'
import { DEFAULT_TASK_TEMPLATES, formatRecurrenceLabel } from './task-types'

type TaskTemplateProps = {
  onSelectTemplate: (template: TaskTemplate) => void
}

export function TaskTemplatesDialog({ onSelectTemplate }: TaskTemplateProps) {
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'development', label: 'Development' },
    { id: 'design', label: 'Design' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'management', label: 'Management' },
  ]

  const filteredTemplates = DEFAULT_TASK_TEMPLATES.filter(t =>
    selectedCategory === 'all' || t.tags.some(tag => tag.toLowerCase().includes(selectedCategory))
  )

  const handleSelectTemplate = useCallback((template: TaskTemplate) => {
    onSelectTemplate(template)
    setOpen(false)
  }, [onSelectTemplate])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Task Templates
          </DialogTitle>
          <DialogDescription>
            Choose a template to quickly create a new task with pre-filled information
          </DialogDescription>
        </DialogHeader>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="text-xs"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="grid gap-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="text-left group"
              >
                <div className="rounded-lg border border-muted/40 bg-background p-4 transition-all hover:border-primary/40 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {template.name}
                        </h4>
                        <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                          {template.estimatedHours}h
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground/80">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted/40">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Priority: <span className="font-medium capitalize">{template.priority}</span></span>
                        <span>•</span>
                        <span>Status: <span className="font-medium">{template.status === 'todo' ? 'To Do' : template.status}</span></span>
                      </div>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

// Hook to apply template to form state
export function useTaskTemplates() {
  const applyTemplate = useCallback((
    template: TaskTemplate,
    replacements?: Record<string, string>
  ): {
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    tags: string[]
    estimatedMinutes: number
  } => {
    let title = template.title
    let description = template.descriptionTemplate || ''

    // Apply replacements
    if (replacements) {
      Object.entries(replacements).forEach(([key, value]) => {
        const placeholder = `{${key}}`
        title = title.replace(new RegExp(placeholder, 'g'), value)
        description = description.replace(new RegExp(placeholder, 'g'), value)
      })
    }

    return {
      title,
      description,
      status: template.status,
      priority: template.priority,
      tags: template.tags,
      estimatedMinutes: (template.estimatedHours ?? 0) * 60,
    }
  }, [])

  return { applyTemplate, templates: DEFAULT_TASK_TEMPLATES }
}
