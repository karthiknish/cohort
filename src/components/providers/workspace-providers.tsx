'use client'

import { Suspense, type ReactNode } from 'react'

import { ClientProvider } from '@/contexts/client-context'
import { PreviewProvider } from '@/contexts/preview-context'
import { PreferencesProvider } from '@/contexts/preferences-context'
import { ProjectProvider } from '@/contexts/project-context'

type WorkspaceProvidersProps = {
  children: ReactNode
  enablePreview?: boolean
  enableProject?: boolean
  enablePreferences?: boolean
}

export function WorkspaceProviders({
  children,
  enablePreview = false,
  enableProject = false,
  enablePreferences = false,
}: WorkspaceProvidersProps) {
  let content = children

  if (enableProject) {
    content = (
      <Suspense fallback={null}>
        <ProjectProvider>{content}</ProjectProvider>
      </Suspense>
    )
  }

  if (enablePreview) {
    content = <PreviewProvider>{content}</PreviewProvider>
  }

  if (enablePreferences) {
    content = <PreferencesProvider>{content}</PreferencesProvider>
  }

  return <ClientProvider>{content}</ClientProvider>
}
