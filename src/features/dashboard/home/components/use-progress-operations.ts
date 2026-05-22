'use client'

import { useState, useCallback } from 'react'
import type { Operation } from './progress-indicators-types'

/**
 * Hook for managing progress operations
 */
export function useProgressOperations() {
  const [operations, setOperations] = useState<Operation[]>([])

  const addOperation = useCallback((operation: Omit<Operation, 'id' | 'startTime'>) => {
    const id = Math.random().toString(36).substring(7)
    setOperations((prev) => [
      ...prev,
      { ...operation, id, startTime: Date.now(), progress: operation.progress ?? 0 },
    ])
    return id
  }, [])

  const updateOperation = useCallback((id: string, updates: Partial<Operation>) => {
    setOperations((prev) =>
      prev.map((op) => (op.id === id ? { ...op, ...updates } : op))
    )
  }, [])

  const removeOperation = useCallback((id: string) => {
    setOperations((prev) => prev.filter((op) => op.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setOperations((prev) => prev.filter((op) => ['pending', 'running', 'paused'].includes(op.status)))
  }, [])

  return {
    operations,
    addOperation,
    updateOperation,
    removeOperation,
    dismissAll,
  }
}
