'use client'

import type { KeyboardEvent } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Plus, Tag, X } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/lib/utils'
import { PROJECT_STATUSES, type ProjectStatus } from '@/types/projects'

import type { ProjectFormState } from './create-project-dialog'

type CreateProjectFormFieldsProps = {
  loading: boolean
  clients: Array<{ id: string; name: string }>
  state: ProjectFormState
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onStatusChange: (value: ProjectStatus) => void
  onClientChange: (value: string) => void
  onStartDateChange: (value: Date | undefined) => void
  onEndDateChange: (value: Date | undefined) => void
  onTagInputChange: (value: string) => void
  onTagKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  formatStatusLabel: (value: ProjectStatus) => string
}

function ProjectDateField({
  disabled,
  label,
  onSelect,
  selected,
  disabledDate,
}: {
  disabled: boolean
  label: string
  onSelect: (value: Date | undefined) => void
  selected: Date | undefined
  disabledDate: (date: Date) => boolean
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn('w-full justify-start text-left font-normal', !selected && 'text-muted-foreground')}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? format(selected, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={onSelect}
            initialFocus
            disabled={disabledDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function CreateProjectFormFields({
  loading,
  clients,
  state,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
  onClientChange,
  onStartDateChange,
  onEndDateChange,
  onTagInputChange,
  onTagKeyDown,
  onAddTag,
  onRemoveTag,
  formatStatusLabel,
}: CreateProjectFormFieldsProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="project-name">
          Project name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="project-name"
          placeholder="e.g., Q1 Marketing Campaign"
          value={state.name}
          onChange={(event) => onNameChange(event.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description">Description</Label>
        <Textarea
          id="project-description"
          placeholder="Brief overview of the project goals and scope…"
          value={state.description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project-status">Status</Label>
          <Select value={state.status} onValueChange={(value: ProjectStatus) => onStatusChange(value)} disabled={loading}>
            <SelectTrigger id="project-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((statusValue) => (
                <SelectItem key={statusValue} value={statusValue}>
                  {formatStatusLabel(statusValue)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-client">Client / Workspace</Label>
          <Select value={state.clientId} onValueChange={onClientChange} disabled={loading}>
            <SelectTrigger id="project-client">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No client</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ProjectDateField
          disabled={loading}
          label="Start date"
          onSelect={onStartDateChange}
          selected={state.startDate}
          disabledDate={(date) => date < new Date('1900-01-01')}
        />

        <ProjectDateField
          disabled={loading}
          label="End date"
          onSelect={onEndDateChange}
          selected={state.endDate}
          disabledDate={(date) => (state.startDate ? date < state.startDate : false) || date < new Date('1900-01-01')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="project-tags"
            placeholder="Add a tag…"
            value={state.tagInput}
            onChange={(event) => onTagInputChange(event.target.value)}
            onKeyDown={onTagKeyDown}
            disabled={loading || state.tags.length >= 10}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddTag}
            disabled={loading || !state.tagInput.trim() || state.tags.length >= 10}
            aria-label="Add tag"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {state.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {state.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                <Tag className="h-3 w-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  disabled={loading}
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">{state.tags.length}/10 tags added. Press Enter or click + to add.</p>
      </div>
    </div>
  )
}