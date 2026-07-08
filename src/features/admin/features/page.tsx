'use client';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { AdminFeaturesLoadingShell, AdminFeaturesPageContent } from './admin-features-sections';
import { useAdminFeaturesPage } from './hooks/use-admin-features-page';
export default function AdminFeaturesPage() {
    const page = useAdminFeaturesPage();
    return (<PageSkeletonBoundary loading={page.loading} loadingContent={<AdminFeaturesLoadingShell />}>
    <AdminFeaturesPageContent isPreviewMode={page.isPreviewMode} features={page.features} featuresQueryError={page.featuresQueryError} actionError={page.actionError} clearActionError={page.clearActionError} refreshing={page.refreshing} formDialogOpen={page.formDialogOpen} editingFeature={page.editingFeature} defaultStatus={page.defaultStatus} deleteConfirmOpen={page.deleteConfirmOpen} featureToDelete={page.featureToDelete} isDeleting={page.isDeleting} onRefresh={page.handleRefresh} onAddFeature={page.handleAddFeature} onEditFeature={page.handleEditFeature} onDeleteFeature={page.handleDeleteFeature} onFormDialogOpenChange={page.handleFormDialogOpenChange} onDeleteConfirmOpenChange={page.handleDeleteConfirmOpenChange} onConfirmDelete={page.confirmDelete} onMoveFeature={page.handleMoveFeature} onSubmitFeature={page.handleSubmitFeature}/>
    </PageSkeletonBoundary>);
}
