'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { useClientContext } from '@/shared/contexts/client-context'
import { useAuth } from '@/shared/contexts/auth-context'
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params'
import type { ProjectRecord } from '@/types/projects'

type ProjectContextValue = {
  selectedProjectId: string | null
  selectedProject: ProjectRecord | null
  selectProject: (projectId: string | null) => void
  clearProject: () => void
  isFromUrl: boolean
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { selectedClient } = useClientContext()
  const { user } = useAuth()
  const searchParams = useUrlSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [manualProjectId, setManualProjectId] = useState<string | null>(null)

  const urlProjectId = selectedClient?.id ? searchParams.get('projectId') : null
  const selectedProjectId = urlProjectId ?? manualProjectId
  const isFromUrl = urlProjectId !== null

  // Get project details (this would typically fetch from API)
  // For now, we'll create a minimal project object from URL params
  const selectedProject = useMemo(() => {
    if (!selectedProjectId || !selectedClient?.id) {
      return null
    }

    const projectName = searchParams.get('projectName')
    const now = new Date().toISOString()
    
    return {
      id: selectedProjectId,
      name: projectName || 'Unknown Project',
      description: null,
      status: 'active' as const,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      startDate: null,
      endDate: null,
      tags: [],
      ownerId: user?.id || null,
      createdAt: now,
      updatedAt: now,
      taskCount: 0,
      openTaskCount: 0,
      recentActivityAt: now,
    } as ProjectRecord
  }, [selectedProjectId, selectedClient, searchParams, user?.id])

  const selectProject = useCallback((projectId: string | null) => {
    setManualProjectId(projectId)

    // Update URL if not already set by URL
    if (projectId && !searchParams.get('projectId')) {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set('projectId', projectId)
      router.push(`${pathname}?${newParams.toString()}`)
    }
  }, [searchParams, router, pathname])

  const clearProject = useCallback(() => {
    setManualProjectId(null)

    // Remove projectId from URL
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('projectId')
    newParams.delete('projectName')
    router.push(`${pathname}?${newParams.toString()}`)
  }, [searchParams, router, pathname])

  const value: ProjectContextValue = {
    selectedProjectId,
    selectedProject,
    selectProject,
    clearProject,
    isFromUrl,
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjectContext() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider')
  }
  return context
}
