'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isFromUrl, setIsFromUrl] = useState(false)

  // Auto-populate project from URL params
  useEffect(() => {
    const urlProjectId = searchParams.get('projectId')
    const urlProjectName = searchParams.get('projectName')

    if (urlProjectId && selectedClient?.id) {
      setSelectedProjectId(urlProjectId)
      setIsFromUrl(true)
    } else {
      // Clear project context if not in URL
      setSelectedProjectId(null)
      setIsFromUrl(false)
    }
  }, [searchParams, selectedClient?.id])

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
    setSelectedProjectId(projectId)
    setIsFromUrl(false)

    // Update URL if not already set by URL
    if (projectId && !searchParams.get('projectId')) {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set('projectId', projectId)
      router.push(`${pathname}?${newParams.toString()}`)
    }
  }, [searchParams, router, pathname])

  const clearProject = useCallback(() => {
    setSelectedProjectId(null)
    setIsFromUrl(false)

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
