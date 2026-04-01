'use client'

import { Suspense, type ReactNode } from 'react'

import { ClientProvider } from '@/shared/contexts/client-context'
import { PreviewProvider } from '@/shared/contexts/preview-context'
import { PreferencesProvider } from '@/shared/contexts/preferences-context'
import { ProjectProvider } from '@/shared/contexts/project-context'

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
  const shouldEnablePreview = enablePreview || enablePreferences

  if (enableProject) {
    content = (
      <Suspense fallback={null}>
        <ProjectProvider>{content}</ProjectProvider>
      </Suspense>
    )
  }

  if (shouldEnablePreview) {
    content = <PreviewProvider>{content}</PreviewProvider>
  }

  if (enablePreferences) {
    content = <PreferencesProvider>{content}</PreferencesProvider>
  }

  return <ClientProvider>{content}</ClientProvider>
}
