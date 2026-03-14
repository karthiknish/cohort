'use client'

import { useCallback, useEffect, useRef } from 'react'

import type { TaskRecord } from '@/types/tasks'

type KeyboardNavigationOptions = {
  tasks: TaskRecord[]
  selectedTaskId: string | null
  onTaskSelect: (taskId: string) => void
  onTaskEdit?: (task: TaskRecord) => void
  onTaskDelete?: (task: TaskRecord) => void
  onStatusChange?: (task: TaskRecord, status: string) => void
  onQuickAdd?: () => void
  enabled?: boolean
}

type ShortcutAction = {
  key: string
  description: string
  action: () => void
  condition?: () => boolean
}

export function useTaskKeyboardNavigation({
  tasks,
  selectedTaskId,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onStatusChange,
  onQuickAdd,
  enabled = true,
}: KeyboardNavigationOptions) {
  const selectedIndexRef = useRef(0)

  // Update selected index when tasks change or selection changes externally
  useEffect(() => {
    const currentIndex = tasks.findIndex((t) => t.id === selectedTaskId)
    if (currentIndex !== -1) {
      selectedIndexRef.current = currentIndex
    }
  }, [tasks, selectedTaskId])

  const getSelectedTaskById = useCallback((): TaskRecord | null => {
    if (!selectedTaskId) return null
    return tasks.find((task) => task.id === selectedTaskId) ?? null
  }, [selectedTaskId, tasks])

  const selectNext = useCallback(() => {
    const newIndex = Math.min(selectedIndexRef.current + 1, tasks.length - 1)
    const task = tasks[newIndex]
    if (newIndex >= 0 && task) {
      selectedIndexRef.current = newIndex
      onTaskSelect(task.id)
    }
  }, [tasks, onTaskSelect])

  const selectPrevious = useCallback(() => {
    const newIndex = Math.max(selectedIndexRef.current - 1, 0)
    const task = tasks[newIndex]
    if (newIndex >= 0 && task) {
      selectedIndexRef.current = newIndex
      onTaskSelect(task.id)
    }
  }, [tasks, onTaskSelect])

  const selectFirst = useCallback(() => {
    const task = tasks[0]
    if (task) {
      selectedIndexRef.current = 0
      onTaskSelect(task.id)
    }
  }, [tasks, onTaskSelect])

  const selectLast = useCallback(() => {
    const task = tasks[tasks.length - 1]
    if (task) {
      selectedIndexRef.current = tasks.length - 1
      onTaskSelect(task.id)
    }
  }, [tasks, onTaskSelect])

  const editSelected = useCallback(() => {
    const task = getSelectedTaskById()
    if (task && onTaskEdit) {
      onTaskEdit(task)
    }
  }, [getSelectedTaskById, onTaskEdit])

  const deleteSelected = useCallback(() => {
    const task = getSelectedTaskById()
    if (task && onTaskDelete) {
      onTaskDelete(task)
    }
  }, [getSelectedTaskById, onTaskDelete])

  const cycleStatus = useCallback(() => {
    const task = getSelectedTaskById()
    if (task && onStatusChange) {
      const statuses: string[] = ['todo', 'in-progress', 'review', 'completed']
      const currentIndex = statuses.indexOf(task.status ?? 'todo')
      const nextStatus = statuses[(currentIndex + 1) % statuses.length] ?? 'todo'
      onStatusChange(task, nextStatus)
    }
  }, [getSelectedTaskById, onStatusChange])

  useEffect(() => {
    if (!enabled) return

    const shortcuts: ShortcutAction[] = [
      { key: 'j', description: 'Move down', action: selectNext },
      { key: 'k', description: 'Move up', action: selectPrevious },
      { key: 'ArrowDown', description: 'Move down', action: selectNext },
      { key: 'ArrowUp', description: 'Move up', action: selectPrevious },
      { key: 'Home', description: 'First task', action: selectFirst },
      { key: 'End', description: 'Last task', action: selectLast },
      { key: 'Enter', description: 'Edit task', action: editSelected, condition: () => !!selectedTaskId },
      { key: 'e', description: 'Edit task', action: editSelected, condition: () => !!selectedTaskId },
      { key: 'Backspace', description: 'Delete task', action: deleteSelected, condition: () => !!selectedTaskId },
      { key: 'Delete', description: 'Delete task', action: deleteSelected, condition: () => !!selectedTaskId },
      { key: 's', description: 'Cycle status', action: cycleStatus, condition: () => !!selectedTaskId },
      { key: 'n', description: 'New task', action: () => onQuickAdd?.(), condition: () => !!onQuickAdd },
      {
        key: 'c',
        description: 'Focus search',
        action: () => {
          const el = document.getElementById('task-search')
          if (el) el.focus()
        },
      },
    ]

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]')
      ) {
        return
      }

      // Find matching shortcut
      const shortcut = shortcuts.find(
        (s) => s.key === e.key || s.key.toLowerCase() === e.key.toLowerCase()
      )

      if (shortcut) {
        // Check condition if present
        if (shortcut.condition && !shortcut.condition()) {
          return
        }

        e.preventDefault()
        shortcut.action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, selectNext, selectPrevious, selectFirst, selectLast, editSelected, deleteSelected, cycleStatus, selectedTaskId, onQuickAdd])

  return {
    selectedTask: getSelectedTaskById(),
    shortcuts: KEYBOARD_SHORTCUTS,
  }
}

// Export shortcuts array for use in components
export const KEYBOARD_SHORTCUTS = [
  { key: '↑ / k', description: 'Move up' },
  { key: '↓ / j', description: 'Move down' },
  { key: 'Enter / e', description: 'Edit task' },
  { key: 's', description: 'Cycle status' },
  { key: 'n', description: 'New task' },
  { key: 'c', description: 'Focus search' },
]
