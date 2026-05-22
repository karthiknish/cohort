'use client'

import { useAction, useConvex, useMutation } from 'convex/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { readFileAsBase64, getPdfUploadSizeError } from '@/lib/agent-attachments'
import { asErrorMessage } from '@/lib/convex-errors'
import { agentApi, filesApi, tasksDocumentImportApi } from '@/lib/convex-api'
import { notifyFailure, notifySuccess } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { isPreviewModeEnabled } from '@/lib/preview-data'
import { uploadTaskAttachment } from '@/services/task-attachments'
import type { TaskAttachment } from '@/types/tasks'

import type { CreateTaskPayload } from './hooks/use-tasks'
import {
  buildTaskImportFileName,
  combineExtractedDocumentText,
  filterTasksDocumentFiles,
  isFileDragEvent,
  prepareTaskImportDocument,
} from './lib/extract-document-text'
import { uploadTaskImportDocument } from './lib/upload-import-document'
import { parseMentionNames, type TaskParticipant } from './task-types'
import type {
  ProposedImportTask,
  ProposedImportTaskFromServer,
  TaskDocumentImportPhase,
} from './tasks-document-import-types'
import {
  getImportReviewBlocker,
  needsImportReview,
} from './tasks-document-import-review'

function formatDueDateInput(dueDateMs: number | null): string {
  if (dueDateMs == null) return ''
  const date = new Date(dueDateMs)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function formatAssigneeDraft(names: string[]): string {
  return names.map((name) => `@[${name}]`).join(' ')
}

function mapServerProposal(task: ProposedImportTaskFromServer, index: number): ProposedImportTask {
  return {
    localId: `import-${index}-${crypto.randomUUID()}`,
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    assignedTo: formatAssigneeDraft(task.assignedTo),
    dueDate: formatDueDateInput(task.dueDateMs),
    assignmentStatus: task.assignmentStatus,
    dueDateStatus: task.dueDateStatus,
    dueDateHint: task.dueDateHint,
    suggestions: task.suggestions,
    sourceExcerpt: task.sourceExcerpt,
    include: true,
  }
}

export type UseTasksDocumentImportArgs = {
  workspaceId: string | null
  userId: string | undefined
  clientId: string | undefined
  clientName: string | undefined
  projectId: string | null | undefined
  projectName: string | null | undefined
  disabledReason: string | null
  isPreviewMode: boolean
  onCreateTask: (payload: CreateTaskPayload) => Promise<unknown>
}

export function useTasksDocumentImport({
  workspaceId,
  userId,
  clientId,
  clientName,
  projectId,
  projectName,
  disabledReason,
  isPreviewMode,
  onCreateTask,
}: UseTasksDocumentImportArgs) {
  const convex = useConvex()
  const extractPdfTextAction = useAction(agentApi.extractPdfText)
  const extractTasksFromDocument = useAction(tasksDocumentImportApi.extractTasksFromDocument)
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const getPublicUrl = useCallback(
    (args: { storageId: string }) => convex.query(filesApi.getPublicUrl, args),
    [convex],
  )

  const [phase, setPhase] = useState<TaskDocumentImportPhase>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [proposedTasks, setProposedTasks] = useState<ProposedImportTask[]>([])
  const [documentSummary, setDocumentSummary] = useState<string | null>(null)
  const [sourceFiles, setSourceFiles] = useState<File[]>([])
  const [attachSourceDocuments, setAttachSourceDocuments] = useState(true)
  const dragDepthRef = useRef(0)
  const abortRef = useRef(false)

  const resetImport = useCallback(() => {
    abortRef.current = false
    dragDepthRef.current = 0
    setPhase('idle')
    setStatusMessage(null)
    setErrorMessage(null)
    setProposedTasks([])
    setDocumentSummary(null)
    setSourceFiles([])
    setAttachSourceDocuments(true)
  }, [])

  const extractPdfOnServer = useCallback(
    async (file: File) => {
      if (!workspaceId || isPreviewModeEnabled()) return null
      const sizeError = getPdfUploadSizeError(file)
      if (sizeError) {
        return { extractionStatus: 'failed' as const, errorMessage: sizeError }
      }
      try {
        const dataBase64 = await readFileAsBase64(file)
        return await extractPdfTextAction({
          workspaceId,
          fileName: file.name,
          dataBase64,
        })
      } catch {
        return null
      }
    },
    [extractPdfTextAction, workspaceId],
  )

  const uploadForVision = useCallback(
    async (file: File) => {
      return await uploadTaskImportDocument({
        file,
        generateUploadUrl: () => generateUploadUrl({}),
      })
    },
    [generateUploadUrl],
  )

  const uploadSourceAttachment = useCallback(
    async (file: File): Promise<TaskAttachment | null> => {
      if (!userId) return null
      try {
        return await uploadTaskAttachment({
          userId,
          file,
          generateUploadUrl: () => generateUploadUrl({}),
          getPublicUrl,
        })
      } catch {
        return null
      }
    },
    [generateUploadUrl, getPublicUrl, userId],
  )

  const createTasksFromProposals = useCallback(
    async (tasks: ProposedImportTask[]) => {
      if (!clientId) {
        throw new Error('Select a client before importing tasks from a document.')
      }

      const selected = tasks.filter((task) => task.include && task.title.trim())
      const reviewBlocker = getImportReviewBlocker(tasks)
      if (reviewBlocker) {
        throw new Error(reviewBlocker)
      }

      if (selected.length === 0) {
        throw new Error('Select at least one task to create.')
      }

      setPhase('creating')
      setStatusMessage(`Creating ${selected.length} task${selected.length === 1 ? '' : 's'}…`)

      if (abortRef.current) {
        resetImport()
        return
      }

      let attachment: TaskAttachment | undefined
      if (attachSourceDocuments && sourceFiles[0] && userId) {
        const uploaded = await uploadSourceAttachment(sourceFiles[0])
        if (uploaded) attachment = uploaded
      }

      if (abortRef.current) {
        resetImport()
        return
      }

      const creationResults = await Promise.all(
        selected.map(async (task) => {
          if (abortRef.current) return false

          const payload: CreateTaskPayload = {
            title: task.title.trim(),
            description: task.description.trim() || undefined,
            status: 'todo',
            priority: task.priority,
            assignedTo: parseMentionNames(task.assignedTo),
            clientId,
            client: clientName,
            projectId: projectId ?? undefined,
            projectName: projectName ?? undefined,
            dueDate: task.dueDate || undefined,
            attachments: attachment ? [attachment] : undefined,
          }

          const created = await onCreateTask(payload)
          return Boolean(created)
        }),
      )
      const createdCount = creationResults.filter(Boolean).length

      notifySuccess({
        title: 'Tasks imported',
        message:
          createdCount === selected.length
            ? `Created ${createdCount} task${createdCount === 1 ? '' : 's'} from your document.`
            : `Created ${createdCount} of ${selected.length} tasks.`,
      })
      resetImport()
    },
    [
      attachSourceDocuments,
      clientId,
      clientName,
      onCreateTask,
      projectId,
      projectName,
      resetImport,
      sourceFiles,
      uploadSourceAttachment,
      userId,
    ],
  )

  const runDocumentImport = useCallback(
    async (files: File[]) => {
      if (disabledReason) {
        notifyFailure({ title: 'Cannot import', message: disabledReason })
        return
      }

      if (isPreviewMode || isPreviewModeEnabled()) {
        notifyFailure({
          title: 'Preview mode',
          message: 'Document import is unavailable in preview mode.',
        })
        return
      }

      if (!workspaceId) {
        notifyFailure({ title: 'Cannot import', message: 'Sign in to import tasks from documents.' })
        return
      }

      const documentFiles = filterTasksDocumentFiles(files)
      if (documentFiles.length === 0) {
        notifyFailure({
          title: 'Unsupported file',
          message: 'Drop a PDF, Word file, or image (including photos of handwritten notes).',
        })
        return
      }

      abortRef.current = false
      setSourceFiles(documentFiles)
      setErrorMessage(null)
      setPhase('extracting')
      setStatusMessage('Reading document…')

      try {
        if (abortRef.current) return

        const preparedDocuments = await Promise.all(
          documentFiles.map((file) =>
            prepareTaskImportDocument(file, { extractPdfOnServer, uploadForVision }),
          ),
        )

        const textDocuments = preparedDocuments.flatMap((document) =>
          document.kind === 'text' ? [{ fileName: document.fileName, text: document.text }] : [],
        )
        const visualDocuments = preparedDocuments.flatMap((document) =>
          document.kind === 'vision'
            ? [{
                fileName: document.fileName,
                mimeType: document.mimeType,
                storageId: document.storageId,
              }]
            : [],
        )

        const combinedText =
          textDocuments.length > 0 ? combineExtractedDocumentText(textDocuments) : undefined
        const primaryFileName = buildTaskImportFileName(documentFiles)
        const usesVision = visualDocuments.length > 0

        setPhase('analyzing')
        setStatusMessage(
          usesVision ? 'Reading handwriting and finding action items…' : 'Finding action items and assignees…',
        )

        if (abortRef.current) return

        const result = await extractTasksFromDocument({
          workspaceId,
          fileName: primaryFileName,
          extractedText: combinedText,
          visualDocuments: visualDocuments.length > 0 ? visualDocuments : undefined,
          clientId: clientId ?? null,
          projectId: projectId ?? null,
        })

        const mapped = result.proposedTasks.map(mapServerProposal)
        setDocumentSummary(result.documentSummary ?? null)

        if (needsImportReview(mapped)) {
          setProposedTasks(mapped)
          setPhase('review')
          setStatusMessage(null)
          return
        }

        await createTasksFromProposals(mapped)
      } catch (error) {
        if (abortRef.current) return
        const message = asErrorMessage(error)
        setErrorMessage(message)
        setPhase('error')
        setStatusMessage(null)
        reportConvexFailure({
          error,
          context: 'useTasksDocumentImport:runDocumentImport',
          title: 'Import failed',
          fallbackMessage: message,
        })
      }
    },
    [
      clientId,
      createTasksFromProposals,
      disabledReason,
      extractPdfOnServer,
      extractTasksFromDocument,
      isPreviewMode,
      projectId,
      uploadForVision,
      workspaceId,
    ],
  )

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!isFileDragEvent(event) || disabledReason) return
      event.preventDefault()
      dragDepthRef.current += 1
      if (phase === 'idle' || phase === 'dragging') {
        setPhase('dragging')
      }
    },
    [disabledReason, phase],
  )

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!isFileDragEvent(event) || disabledReason) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    },
    [disabledReason],
  )

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDragEvent(event)) return
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0 && (phase === 'dragging' || phase === 'idle')) {
      setPhase('idle')
    }
  }, [phase])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!isFileDragEvent(event)) return
      event.preventDefault()
      dragDepthRef.current = 0
      const files = event.dataTransfer.files
      if (files.length === 0) return
      void runDocumentImport(Array.from(files))
    },
    [runDocumentImport],
  )

  const handleCancel = useCallback(() => {
    abortRef.current = true
    resetImport()
  }, [resetImport])

  const handleConfirmReview = useCallback(() => {
    void createTasksFromProposals(proposedTasks)
  }, [createTasksFromProposals, proposedTasks])

  const updateProposedTask = useCallback((localId: string, patch: Partial<ProposedImportTask>) => {
    setProposedTasks((current) =>
      current.map((task) => (task.localId === localId ? { ...task, ...patch } : task)),
    )
  }, [])

  useEffect(() => {
    if (phase !== 'extracting' && phase !== 'analyzing') return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancel()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleCancel, phase])

  const overlayVisible =
    phase === 'dragging' || phase === 'extracting' || phase === 'analyzing' || phase === 'creating' || phase === 'error'

  return {
    phase,
    statusMessage,
    errorMessage,
    proposedTasks,
    documentSummary,
    attachSourceDocuments,
    setAttachSourceDocuments,
    overlayVisible,
    reviewOpen: phase === 'review',
    importDragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
    handleCancel,
    handleConfirmReview,
    handleDismissReview: resetImport,
    updateProposedTask,
  }
}
