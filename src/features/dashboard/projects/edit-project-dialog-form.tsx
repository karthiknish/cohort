'use client'

import { useCallback } from 'react'
import type { Dispatch, KeyboardEvent } from 'react'
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

import type { EditProjectAction } from './edit-project-dialog'

const MINIMUM_PROJECT_DATE = new Date('1900-01-01')

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

function ProjectTagBadge({
  loading,
  onRemove,
  tag,
}: {
  loading: boolean
  onRemove: (tag: string) => void
  tag: string
}) {
  const handleRemove = useCallback(() => onRemove(tag), [onRemove, tag])

  return (
    <Badge variant="secondary" className="gap-1 pr-1">
      <Tag className="h-3 w-3" />
      {tag}
      <button
        type="button"
        onClick={handleRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
        disabled={loading}
        aria-label={`Remove tag ${tag}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
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
  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onDispatch({ type: 'setName', value: event.target.value })
    },
    [onDispatch]
  )

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onDispatch({ type: 'setDescription', value: event.target.value })
    },
    [onDispatch]
  )

  const handleStatusChange = useCallback(
    (value: ProjectStatus) => {
      onDispatch({ type: 'setStatus', value })
    },
    [onDispatch]
  )

  const handleClientChange = useCallback(
    (value: string) => {
      onDispatch({ type: 'setClientId', value })
    },
    [onDispatch]
  )

  const handleStartDateSelect = useCallback(
    (value: Date | undefined) => {
      onDispatch({ type: 'setStartDate', value })
    },
    [onDispatch]
  )

  const handleEndDateSelect = useCallback(
    (value: Date | undefined) => {
      onDispatch({ type: 'setEndDate', value })
    },
    [onDispatch]
  )

  const handleTagInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onDispatch({ type: 'setTagInput', value: event.target.value })
    },
    [onDispatch]
  )

  const handleAddTagClick = useCallback(() => {
    onAddTag()
  }, [onAddTag])

  const handleStartDateDisabled = useCallback(
    (date: Date) => date < MINIMUM_PROJECT_DATE,
    []
  )

  const handleEndDateDisabled = useCallback(
    (date: Date) => (startDate ? date < startDate : false) || date < MINIMUM_PROJECT_DATE,
    [startDate]
  )

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
          onChange={handleNameChange}
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
          onChange={handleDescriptionChange}
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
            onValueChange={handleStatusChange}
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
            onValueChange={handleClientChange}
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
          onSelect={handleStartDateSelect}
          selected={startDate}
          disabledDate={handleStartDateDisabled}
        />

        <ProjectDateField
          disabled={loading}
          label="End date"
          onSelect={handleEndDateSelect}
          selected={endDate}
          validationError={validationErrors.endDate}
          disabledDate={handleEndDateDisabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-project-tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="edit-project-tags"
            placeholder="Add a tag…"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={onTagKeyDown}
            disabled={loading || tags.length >= 10}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddTagClick}
            disabled={loading || !tagInput.trim() || tags.length >= 10}
            aria-label="Add tag"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {tags.map((tag) => (
              <ProjectTagBadge key={tag} loading={loading} onRemove={onRemoveTag} tag={tag} />
            ))}
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">{tags.length}/10 tags. Press Enter or click + to add.</p>
      </div>
    </div>
  )
}