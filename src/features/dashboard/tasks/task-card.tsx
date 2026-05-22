'use client'

import { memo, ViewTransition } from 'react'

import type { TaskRecord, TaskStatus } from '@/types/tasks'
import { clickableCardClass, listItemEnterClass } from '@/lib/motion'
import { cn } from '@/lib/utils'
import {
  TaskCardCompactMeta,
  TaskCardHeaderSection,
  TaskCardOverdueBanner,
  TaskCardPriorityBadge,
  TaskCardStatusBadge,
} from './task-card-sections'
import { isDueSoon, isOverdue, priorityAccentColors } from './task-types'

const TASK_CARD_MENU_VISIBILITY = {
  title: false,
  menu: true,
  contextPills: true,
  indicators: true,
  compactIndicators: false,
} as const

const TASK_CARD_TITLE_VISIBILITY = {
  title: true,
  menu: false,
  contextPills: true,
  indicators: true,
  compactIndicators: false,
} as const

const TASK_CARD_BOARD_META_VISIBILITY = {
  title: false,
  menu: false,
  contextPills: true,
  indicators: true,
  compactIndicators: true,
} as const

export type TaskCardProps = {
  task: TaskRecord
  variant?: 'grid' | 'board'
  isPendingUpdate?: boolean
  onOpen?: (task: TaskRecord) => void
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  onClone?: (task: TaskRecord) => void
  onShare?: (task: TaskRecord) => void
  selected?: boolean
  onSelectToggle?: (taskId: string, checked: boolean) => void
  searchQuery?: string
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  let cursor = 0

  return parts.map((part) => {
    const key = `highlight-${cursor}`
    const isMatch = part !== '' && regex.test(part)
    regex.lastIndex = 0
    cursor += part.length

    if (isMatch) {
      return (
        <mark key={key} className="rounded bg-accent px-0.5 text-accent-foreground">
          {part}
        </mark>
      )
    }

    return part
  })
}

function TaskCardComponent({
  task,
  variant = 'grid',
  isPendingUpdate,
  onOpen,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onClone,
  onShare,
  selected = false,
  searchQuery = '',
}: TaskCardProps) {
  const overdue = isOverdue(task)
  const dueSoon = isDueSoon(task)
  const isBoard = variant === 'board'

  const headerProps = {
    task,
    isPendingUpdate,
    onOpen,
    searchQuery,
    highlightMatch,
    onEdit,
    onDelete,
    onQuickStatusChange,
    onClone,
    onShare,
  }

  return (
    <ViewTransition>
      <div
        className={cn(
          'group relative flex h-full flex-col overflow-hidden border border-border/70 bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-[var(--motion-duration-fast)] hover:border-primary/25 hover:shadow-md',
          listItemEnterClass,
          clickableCardClass,
          isBoard ? 'rounded-xl p-3.5' : 'rounded-2xl p-4 sm:p-5',
          isPendingUpdate && 'pointer-events-none opacity-75',
          selected && 'border-primary/30 ring-2 ring-primary/15',
          overdue && 'border-destructive/25',
          dueSoon && !overdue && 'border-warning/25',
          task.parentId && !isBoard && 'ml-4',
        )}
      >
        {!isBoard ? (
          <div
            className={cn(
              'absolute left-0 top-0 bottom-0 w-1 rounded-l-[1.25rem] opacity-80',
              priorityAccentColors[task.priority],
            )}
          />
        ) : null}

        {overdue ? <TaskCardOverdueBanner /> : null}

        <div className={cn('flex flex-1 flex-col', isBoard ? 'gap-2.5' : 'gap-3')}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {isBoard ? (
                <TaskCardPriorityBadge priority={task.priority} />
              ) : (
                <>
                  <TaskCardStatusBadge status={task.status} />
                  <TaskCardPriorityBadge priority={task.priority} />
                </>
              )}
            </div>
            <TaskCardHeaderSection
              {...headerProps}
              visibility={TASK_CARD_MENU_VISIBILITY}
            />
          </div>

          <TaskCardHeaderSection
            {...headerProps}
            visibility={{
              ...TASK_CARD_TITLE_VISIBILITY,
              contextPills: !isBoard,
              indicators: !isBoard,
            }}
            titleClassName={isBoard ? 'text-sm' : undefined}
          />

          {!isBoard && task.description ? (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {highlightMatch(task.description, searchQuery)}
            </p>
          ) : null}

          {isBoard ? (
            <TaskCardHeaderSection
              {...headerProps}
              visibility={TASK_CARD_BOARD_META_VISIBILITY}
            />
          ) : null}

          <TaskCardCompactMeta task={task} overdue={overdue} dueSoon={dueSoon} compact={isBoard} />
        </div>
      </div>
    </ViewTransition>
  )
}

export const TaskCard = memo(TaskCardComponent)
TaskCard.displayName = 'TaskCard'
