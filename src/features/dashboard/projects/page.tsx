'use client'

import { ProjectsPageProvider } from './components/projects-page-provider'
import { ProjectsPageShell } from './components/projects-page-shell'

export default function ProjectsPage() {
  return (
    <ProjectsPageProvider>
      <ProjectsPageShell />
    </ProjectsPageProvider>
  )
}