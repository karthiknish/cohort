'use client'

import { type ReactNode, createContext, useContext } from 'react'

import { useProjectsPageController } from '../hooks/use-projects-page-controller'

type ProjectsPageContextValue = ReturnType<typeof useProjectsPageController>

const ProjectsPageContext = createContext<ProjectsPageContextValue | null>(null)

export function ProjectsPageProvider({ children }: { children: ReactNode }) {
  const controller = useProjectsPageController()

  return (
    <ProjectsPageContext.Provider value={controller}>
      {children}
    </ProjectsPageContext.Provider>
  )
}

export function useProjectsPageContext(): ProjectsPageContextValue {
  const context = useContext(ProjectsPageContext)

  if (!context) {
    throw new Error('useProjectsPageContext must be used within a ProjectsPageProvider')
  }

  return context
}