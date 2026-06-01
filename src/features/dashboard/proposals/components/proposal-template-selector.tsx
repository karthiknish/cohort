'use client';
import { notifyFailure } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useMemo, useReducer } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import type { ProposalFormData } from '@/lib/proposals';
import type { ProposalTemplate } from '@/types/proposal-templates';
import { useAuth } from '@/shared/contexts/auth-context';
import { useMutation, useQuery } from 'convex/react';
import { proposalTemplatesApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { ProposalTemplateDropdownContent, ProposalTemplateSaveDialog, } from './proposal-template-selector-sections';
interface ProposalTemplateSelectorProps {
    currentFormData: ProposalFormData;
    onApplyTemplate: (formData: ProposalFormData) => void;
    disabled?: boolean;
}
type TemplateRow = {
    legacyId: string;
    name?: string;
    description?: string | null;
    formData?: unknown;
    industry?: string | null;
    tags?: unknown;
    isDefault?: boolean;
    createdAtMs?: number;
    updatedAtMs?: number;
};
type ProposalTemplateSelectorState = {
    open: boolean;
    saveDialogOpen: boolean;
    saving: boolean;
    deleting: string | null;
    templateName: string;
    templateDescription: string;
    templateIndustry: string;
    isDefault: boolean;
};
type ProposalTemplateSelectorAction = {
    type: 'setOpen';
    value: boolean;
} | {
    type: 'setSaveDialogOpen';
    value: boolean;
} | {
    type: 'openSaveDialog';
} | {
    type: 'setSaving';
    value: boolean;
} | {
    type: 'setDeleting';
    value: string | null;
} | {
    type: 'setTemplateName';
    value: string;
} | {
    type: 'setTemplateDescription';
    value: string;
} | {
    type: 'setTemplateIndustry';
    value: string;
} | {
    type: 'setIsDefault';
    value: boolean;
} | {
    type: 'resetSaveForm';
} | {
    type: 'applyTemplate';
};
function createInitialSelectorState(): ProposalTemplateSelectorState {
    return {
        open: false,
        saveDialogOpen: false,
        saving: false,
        deleting: null,
        templateName: '',
        templateDescription: '',
        templateIndustry: '',
        isDefault: false,
    };
}
function proposalTemplateSelectorReducer(state: ProposalTemplateSelectorState, action: ProposalTemplateSelectorAction): ProposalTemplateSelectorState {
    switch (action.type) {
        case 'setOpen':
            return { ...state, open: action.value };
        case 'setSaveDialogOpen':
            return { ...state, saveDialogOpen: action.value };
        case 'openSaveDialog':
            return { ...state, open: false, saveDialogOpen: true };
        case 'setSaving':
            return { ...state, saving: action.value };
        case 'setDeleting':
            return { ...state, deleting: action.value };
        case 'setTemplateName':
            return { ...state, templateName: action.value };
        case 'setTemplateDescription':
            return { ...state, templateDescription: action.value };
        case 'setTemplateIndustry':
            return { ...state, templateIndustry: action.value };
        case 'setIsDefault':
            return { ...state, isDefault: action.value };
        case 'resetSaveForm':
            return {
                ...state,
                saveDialogOpen: false,
                templateName: '',
                templateDescription: '',
                templateIndustry: '',
                isDefault: false,
            };
        case 'applyTemplate':
            return { ...state, open: false };
        default:
            return state;
    }
}
export function ProposalTemplateSelector({ currentFormData, onApplyTemplate, disabled = false, }: ProposalTemplateSelectorProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const workspaceId = user?.agencyId ?? null;
    const templatesRows = useQuery(proposalTemplatesApi.list, workspaceId ? { workspaceId, limit: 50 } : 'skip');
    const createTemplate = useMutation(proposalTemplatesApi.create);
    const deleteTemplate = useMutation(proposalTemplatesApi.remove);
    const templates: ProposalTemplate[] = (() => {
        if (!Array.isArray(templatesRows))
            return [];
        return templatesRows.map((row) => {
            const typedRow = row as TemplateRow;
            return {
                id: String(row.legacyId),
                name: typeof typedRow.name === 'string' ? typedRow.name : 'Untitled Template',
                description: typeof typedRow.description === 'string' ? typedRow.description : null,
                formData: typedRow.formData as ProposalFormData,
                industry: typeof typedRow.industry === 'string' ? typedRow.industry : null,
                tags: Array.isArray(typedRow.tags) ? typedRow.tags.filter((t): t is string => typeof t === 'string') : [],
                isDefault: typedRow.isDefault === true,
                createdAt: typeof typedRow.createdAtMs === 'number' ? new Date(typedRow.createdAtMs).toISOString() : null,
                updatedAt: typeof typedRow.updatedAtMs === 'number' ? new Date(typedRow.updatedAtMs).toISOString() : null,
            };
        });
    })();
    const [selectorState, dispatch] = useReducer(proposalTemplateSelectorReducer, undefined, createInitialSelectorState);
    const { open, saveDialogOpen, saving, deleting, templateName, templateDescription, templateIndustry, isDefault, } = selectorState;
    const loading = templatesRows === undefined;
    const canManageTemplates = Boolean(workspaceId);
    const handleApplyTemplate = (template: ProposalTemplate) => {
        onApplyTemplate(template.formData);
        dispatch({ type: 'applyTemplate' });
        toast({
            title: 'Template applied',
            description: `"${template.name}" has been applied to your proposal.`,
        });
    };
    const handleSaveAsTemplate = async () => {
        if (!templateName.trim()) {
            notifyFailure({
                title: 'Name required',
                message: 'Please enter a name for the template.',
            });
            return;
        }
        dispatch({ type: 'setSaving', value: true });
        if (!workspaceId) {
            notifyFailure({
                title: 'Error',
                message: 'Workspace context missing',
            });
            dispatch({ type: 'setSaving', value: false });
            return;
        }
        await createTemplate({
            workspaceId,
            name: templateName.trim(),
            description: templateDescription.trim() || null,
            formData: currentFormData,
            industry: templateIndustry.trim() || null,
            tags: [],
            isDefault,
            createdBy: user?.id ?? null,
        })
            .then(() => {
            dispatch({ type: 'resetSaveForm' });
            toast({
                title: 'Template saved',
                description: `"${templateName.trim()}" has been saved.`,
            });
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'ProposalTemplateSelector:save',
                title: 'Could not save template',
                fallbackMessage: 'Could not save template',
            });
        })
            .finally(() => {
            dispatch({ type: 'setSaving', value: false });
        });
    };
    const handleDeleteTemplate = async (templateId: string, templateName: string) => {
        dispatch({ type: 'setDeleting', value: templateId });
        if (!workspaceId) {
            notifyFailure({
                title: 'Error',
                message: 'Workspace context missing',
            });
            dispatch({ type: 'setDeleting', value: null });
            return;
        }
        await deleteTemplate({ workspaceId, legacyId: templateId })
            .then(() => {
            toast({
                title: 'Template deleted',
                description: `"${templateName}" has been deleted.`,
            });
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'ProposalTemplateSelector:delete',
                title: 'Could not delete template',
                fallbackMessage: 'Could not delete template',
            });
        })
            .finally(() => {
            dispatch({ type: 'setDeleting', value: null });
        });
    };
    const handleOpenSaveDialog = () => {
        dispatch({ type: 'openSaveDialog' });
    };
    const handleOpenChange = (value: boolean) => {
        dispatch({ type: 'setOpen', value });
    };
    const handleSaveDialogOpenChange = (value: boolean) => {
        dispatch({ type: 'setSaveDialogOpen', value });
    };
    const handleTemplateNameChange = (value: string) => {
        dispatch({ type: 'setTemplateName', value });
    };
    const handleTemplateDescriptionChange = (value: string) => {
        dispatch({ type: 'setTemplateDescription', value });
    };
    const handleTemplateIndustryChange = (value: string) => {
        dispatch({ type: 'setTemplateIndustry', value });
    };
    const handleDefaultChange = (value: boolean) => {
        dispatch({ type: 'setIsDefault', value });
    };
    return (<>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled} className="gap-2">
            <FileText className="size-4"/>
            Templates
            <ChevronDown className="size-3 opacity-50"/>
          </Button>
        </DropdownMenuTrigger>
        <ProposalTemplateDropdownContent templates={templates} loading={loading} deletingTemplateId={deleting} canManageTemplates={canManageTemplates} onApplyTemplate={handleApplyTemplate} onDeleteTemplate={handleDeleteTemplate} onOpenSaveDialog={handleOpenSaveDialog}/>
      </DropdownMenu>

      <ProposalTemplateSaveDialog open={saveDialogOpen} saving={saving} templateName={templateName} templateDescription={templateDescription} templateIndustry={templateIndustry} isDefault={isDefault} onOpenChange={handleSaveDialogOpenChange} onTemplateNameChange={handleTemplateNameChange} onTemplateDescriptionChange={handleTemplateDescriptionChange} onTemplateIndustryChange={handleTemplateIndustryChange} onDefaultChange={handleDefaultChange} onSave={handleSaveAsTemplate}/>
    </>);
}
