'use client'

import type { Dispatch, KeyboardEvent } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Plus, Tag, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { PROJECT_STATUSES, type ProjectStatus } from '@/types/projects'

import type { EditProjectAction } from './edit-project-dialog'

type EditProjectFormFieldsProps = {
  loading: boolean
  name: string
  description: string
  status: ProjectStatus
  clientId: string
  startDate: Date | undefined
  endDate: Date | undefined
  tags: string[]
  tagInput: string
  validationErrors: Record<string, string>
  clients: Array<{ id: string; name: string }>
  onDispatch: Dispatch<EditProjectAction>
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  onTagKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  formatStatusLabel: (value: ProjectStatus) => string
}

function ProjectDateField({
  disabled,
  label,
  onSelect,
  selected,
  validationError,
  disabledDate,
}: {
  disabled: boolean
  label: string
  onSelect: (value: Date | undefined) => void
  selected: Date | undefined
  validationError?: string
  disabledDate: (date: Date) => boolean
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selected && 'text-muted-foreground',
              validationError && 'border-destructive text-destructive'
            )}
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
      {validationError ? <p className="text-xs text-destructive">{validationError}</p> : null}
    </div>
  )
}

export function EditProjectFormFields({
  loading,
  name,
  description,
  status,
  clientId,
  startDate,
  endDate,
  tags,
  tagInput,
  validationErrors,
  clients,
  onDispatch,
  onAddTag,
  onRemoveTag,
  onTagKeyDown,
  formatStatusLabel,
}: EditProjectFormFieldsProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-project-name">
          Project name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-project-name"
          placeholder="e.g., Q1 Marketing Campaign"
          value={name}
          onChange={(event) => onDispatch({ type: 'setName', value: event.target.value })}
          disabled={loading}
          aria-invalid={!!validationErrors.name}
          aria-describedby={validationErrors.name ? 'name-error' : undefined}
        />
        {validationErrors.name ? (
          <p id="name-error" className="text-xs text-destructive">{validationErrors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-project-description">
          Description
          <span className="ml-2 text-xs text-muted-foreground">({description.length}/2000)</span>
        </Label>
        <Textarea
          id="edit-project-description"
          placeholder="Brief overview of the project goals and scope…"
          value={description}
          onChange={(event) => onDispatch({ type: 'setDescription', value: event.target.value })}
          disabled={loading}
          rows={3}
          aria-invalid={!!validationErrors.description}
        />
        {validationErrors.description ? (
          <p className="text-xs text-destructive">{validationErrors.description}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-project-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value: ProjectStatus) => onDispatch({ type: 'setStatus', value })}
            disabled={loading}
          >
            <SelectTrigger id="edit-project-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((optionStatus) => (
                <SelectItem key={optionStatus} value={optionStatus}>
                  {formatStatusLabel(optionStatus)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-project-client">Client / Workspace</Label>
          <Select
            value={clientId}
            onValueChange={(value) => onDispatch({ type: 'setClientId', value })}
            disabled={loading}
          >
            <SelectTrigger id="edit-project-client">
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
          onSelect={(value) => onDispatch({ type: 'setStartDate', value })}
          selected={startDate}
          disabledDate={(date) => date < new Date('1900-01-01')}
        />

        <ProjectDateField
          disabled={loading}
          label="End date"
          onSelect={(value) => onDispatch({ type: 'setEndDate', value })}
          selected={endDate}
          validationError={validationErrors.endDate}
          disabledDate={(date) =>
            (startDate ? date < startDate : false) || date < new Date('1900-01-01')
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-project-tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="edit-project-tags"
            placeholder="Add a tag…"
            value={tagInput}
            onChange={(event) => onDispatch({ type: 'setTagInput', value: event.target.value })}
            onKeyDown={onTagKeyDown}
            disabled={loading || tags.length >= 10}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddTag}
            disabled={loading || !tagInput.trim() || tags.length >= 10}
            aria-label="Add tag"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {tags.map((tag) => (
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
        <p className="text-xs text-muted-foreground">{tags.length}/10 tags. Press Enter or click + to add.</p>
      </div>
    </div>
  )
}