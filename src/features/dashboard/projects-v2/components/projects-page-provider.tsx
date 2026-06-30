'use client';

import { type ReactNode, createContext, use } from 'react';
import { useProjectsPageController, type ProjectsPageController } from '../hooks/use-projects-page-controller';

const ProjectsPageContext = createContext<ProjectsPageController | null>(null);

export function ProjectsPageProvider({ children }: { children: ReactNode }) {
  const controller = useProjectsPageController();
  return <ProjectsPageContext.Provider value={controller}>{children}</ProjectsPageContext.Provider>;
}

export function useProjectsPageContext(): ProjectsPageController {
  const context = use(ProjectsPageContext);
  if (!context) {
    throw new Error('useProjectsPageContext must be used within a ProjectsPageProvider');
  }
  return context;
}
