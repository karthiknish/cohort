'use client';

import { useMutation } from 'convex/react';
import { useCallback, useState } from 'react';
import { projectsApi } from '@/lib/convex-api';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { emitDashboardRefresh } from '@/lib/refresh-bus';
import { notifyInfo, notifySuccess } from '@/lib/notifications';
import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import { formatStatusLabel } from '../utils/project-formatters';

export type UseProjectMutationsArgs = {
  workspaceId: string | null;
  userId: string | undefined;
  isPreviewMode: boolean;
  setProjects: React.Dispatch<React.SetStateAction<ProjectRecord[]>>;
};

export function useProjectMutations({
  workspaceId,
  userId,
  isPreviewMode,
  setProjects,
}: UseProjectMutationsArgs) {
  const softDeleteProject = useMutation(projectsApi.softDelete);
  const updateProject = useMutation(projectsApi.update);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectRecord | null>(null);
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState<Set<string>>(new Set());

  const handleProjectCreated = useCallback(
    (project: ProjectRecord) => {
      setProjects((previous) => [project, ...previous]);
    },
    [setProjects],
  );

  const handleProjectUpdated = useCallback(
    (updatedProject: ProjectRecord) => {
      setProjects((previous) =>
        previous.map((project) => (project.id === updatedProject.id ? updatedProject : project)),
      );
    },
    [setProjects],
  );

  const openEditDialog = useCallback((project: ProjectRecord) => {
    setProjectToEdit(project);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((project: ProjectRecord) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteProject = useCallback(async () => {
    if (!projectToDelete) return;
    if (isPreviewMode) {
      notifyInfo({
        title: 'Preview mode',
        message: 'Changes are not saved in preview mode. Exit preview to make real changes.',
      });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      return;
    }
    if (!userId || !workspaceId) return;
    setDeleting(true);
    try {
      await softDeleteProject({
        workspaceId,
        legacyId: projectToDelete.id,
        deletedAtMs: Date.now(),
      });
      setProjects((previous) => previous.filter((project) => project.id !== projectToDelete.id));
      emitDashboardRefresh({ reason: 'project-mutated', clientId: projectToDelete.clientId ?? null });
      notifySuccess({
        title: 'Project deleted',
        message: `"${projectToDelete.name}" has been permanently removed.`,
      });
    } catch (mutationError) {
      reportConvexFailure({
        error: mutationError,
        context: 'use-project-mutations:handleDeleteProject',
        title: 'Deletion failed',
        fallbackMessage: 'Deletion failed',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  }, [projectToDelete, isPreviewMode, userId, workspaceId, softDeleteProject, setProjects]);

  const handleUpdateStatus = useCallback(
    async (project: ProjectRecord, newStatus: ProjectStatus) => {
      if (isPreviewMode) {
        setProjects((previous) =>
          previous.map((current) =>
            current.id === project.id ? { ...current, status: newStatus } : current,
          ),
        );
        notifyInfo({
          title: 'Preview mode',
          message: `Status changed to ${formatStatusLabel(newStatus)} (not saved).`,
        });
        return;
      }
      if (!userId || !workspaceId) return;
      if (pendingStatusUpdates.has(project.id)) return;

      const previousStatus = project.status;
      setPendingStatusUpdates((previous) => new Set(previous).add(project.id));
      setProjects((previous) =>
        previous.map((current) =>
          current.id === project.id ? { ...current, status: newStatus } : current,
        ),
      );
      try {
        await updateProject({
          workspaceId,
          legacyId: project.id,
          status: newStatus,
          updatedAtMs: Date.now(),
        });
        emitDashboardRefresh({ reason: 'project-mutated', clientId: project.clientId ?? null });
        notifySuccess({
          title: 'Status updated',
          message: `"${project.name}" is now ${formatStatusLabel(newStatus)}.`,
        });
      } catch (mutationError) {
        setProjects((previous) =>
          previous.map((current) =>
            current.id === project.id ? { ...current, status: previousStatus } : current,
          ),
        );
        reportConvexFailure({
          error: mutationError,
          context: 'use-project-mutations:handleUpdateStatus',
          title: 'Status update failed',
          fallbackMessage: 'Status update failed',
        });
      } finally {
        setPendingStatusUpdates((previous) => {
          const next = new Set(previous);
          next.delete(project.id);
          return next;
        });
      }
    },
    [isPreviewMode, userId, workspaceId, pendingStatusUpdates, updateProject, setProjects],
  );

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    projectToDelete,
    deleting,
    editDialogOpen,
    setEditDialogOpen,
    projectToEdit,
    pendingStatusUpdates,
    handleProjectCreated,
    handleProjectUpdated,
    handleDeleteProject,
    handleUpdateStatus,
    openDeleteDialog,
    openEditDialog,
  };
}
