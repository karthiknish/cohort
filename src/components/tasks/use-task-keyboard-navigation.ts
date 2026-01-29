'use client'

import { useEffect, useCallback, useRef } from 'react'
import { TaskRecord } from '@/types/tasks'

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

  const getSelectedTask = useCallback((): TaskRecord | null => {
    const index = selectedIndexRef.current
    if (index >= 0 && index < tasks.length) {
      return tasks[index] || null
    }
    return null
  }, [tasks])

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
    const task = getSelectedTask()
    if (task && onTaskEdit) {
      onTaskEdit(task)
    }
  }, [getSelectedTask, onTaskEdit])

  const deleteSelected = useCallback(() => {
    const task = getSelectedTask()
    if (task && onTaskDelete) {
      onTaskDelete(task)
    }
  }, [getSelectedTask, onTaskDelete])

  const cycleStatus = useCallback(() => {
    const task = getSelectedTask()
    if (task && onStatusChange) {
      const statuses: string[] = ['todo', 'in-progress', 'review', 'completed']
      const currentIndex = statuses.indexOf(task.status ?? 'todo')
      const nextStatus = statuses[(currentIndex + 1) % statuses.length] ?? 'todo'
      onStatusChange(task, nextStatus)
    }
  }, [getSelectedTask, onStatusChange])

  // Keyboard shortcuts definition
  const shortcuts: ShortcutAction[] = [
    { key: 'j', description: 'Move down', action: selectNext },
    { key: 'k', description: 'Move up', action: selectPrevious },
    { key: 'ArrowDown', description: 'Move down', action: selectNext },
    { key: 'ArrowUp', description: 'Move up', action: selectPrevious },
    { key: 'Home', description: 'First task', action: selectFirst },
    { key: 'End', description: 'Last task', action: selectLast },
    { key: 'Enter', description: 'Edit task', action: editSelected, condition: () => !!getSelectedTask() },
    { key: 'e', description: 'Edit task', action: editSelected, condition: () => !!getSelectedTask() },
    { key: 'Backspace', description: 'Delete task', action: deleteSelected, condition: () => !!getSelectedTask() },
    { key: 'Delete', description: 'Delete task', action: deleteSelected, condition: () => !!getSelectedTask() },
    { key: 's', description: 'Cycle status', action: cycleStatus, condition: () => !!getSelectedTask() },
    { key: 'n', description: 'New task', action: () => onQuickAdd?.(), condition: () => !!onQuickAdd },
    { key: 'c', description: 'Focus search', action: () => {
      const el = document.getElementById('task-search')
      if (el) el.focus()
    }},
  ]

  useEffect(() => {
    if (!enabled) return

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
  }, [enabled, shortcuts, selectNext, selectPrevious, selectFirst, selectLast, editSelected, deleteSelected, cycleStatus, onQuickAdd])

  return {
    selectedTask: getSelectedTask(),
    shortcuts: shortcuts.map(s => ({ key: s.key, description: s.description })),
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
