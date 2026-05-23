'use client'

import { useCallback } from 'react'

import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { cn } from '@/lib/utils'

import { PROJECTS_THEME } from './components/projects-theme'
import type { ProposedImportProject } from './projects-document-import-types'
import {
  buildProjectImportReviewDescription,
  getProjectImportReviewBlocker,
} from './projects-document-import-review'
import { ImportReviewProjectRow } from './projects-document-import-review-sheet-sections'

type ProjectsDocumentImportReviewSheetProps = {
  open: boolean
  documentSummary: string | null
  proposedProjects: ProposedImportProject[]
  clients: Array<{ id: string; name: string }>
  preferredClientName: string | null
  onUpdateProject: (localId: string, patch: Partial<ProposedImportProject>) => void
  onConfirm: () => void
  onDiscard: () => void
}

export function ProjectsDocumentImportReviewSheet({
  open,
  documentSummary,
  proposedProjects,
  clients,
  preferredClientName,
  onUpdateProject,
  onConfirm,
  onDiscard,
}: ProjectsDocumentImportReviewSheetProps) {
  const selectedCount = proposedProjects.filter((project) => project.include).length
  const reviewBlocker = getProjectImportReviewBlocker(proposedProjects)
  const reviewDescription = buildProjectImportReviewDescription(
    documentSummary,
    proposedProjects,
    preferredClientName,
  )

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) onDiscard()
    },
    [onDiscard],
  )

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className={cn('overflow-y-auto sm:max-w-xl', PROJECTS_THEME.content)}>
        <SheetHeader className="border-b border-border/60 pb-4 text-left">
          <SheetTitle>Review imported projects</SheetTitle>
          <SheetDescription>{reviewDescription}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 py-4">
          {proposedProjects.map((project, index) => (
            <ImportReviewProjectRow
              key={project.localId}
              project={project}
              index={index}
              clients={clients}
              preferredClientName={preferredClientName}
              onUpdateProject={onUpdateProject}
            />
          ))}
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border/60 bg-background py-4">
          {reviewBlocker ? <p className="text-sm text-warning">{reviewBlocker}</p> : null}
          <Button type="button" onClick={onConfirm} disabled={selectedCount === 0 || Boolean(reviewBlocker)}>
            Create {selectedCount} project{selectedCount === 1 ? '' : 's'}
          </Button>
          <Button type="button" variant="outline" onClick={onDiscard}>
            Discard
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
