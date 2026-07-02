'use client';
import { useCallback, useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '/_generated/api';
import { notifyInfo, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { isPreviewModeEnabled } from '@/lib/preview-data/utils';

export type AiGenerateEntity = 'task' | 'project';
export type AiGenerateField = 'title' | 'description';

export type AiGenerateContext = {
    currentTitle?: string;
    currentDescription?: string;
    priority?: string;
    status?: string;
    assignee?: string;
};

export type AiGenerateResult =
    | { title: string }
    | { description: string };

type UseAiGenerateResult = {
    generate: (field: AiGenerateField, context: AiGenerateContext) => Promise<AiGenerateResult | null>;
    isGenerating: boolean;
};

const PREVIEW_SAMPLES: Record<AiGenerateEntity, Record<AiGenerateField, string>> = {
    task: {
        title: 'Review and finalize quarterly deliverables',
        description:
            'Audit the current task backlog, confirm priorities with stakeholders, and update due dates so the next sprint stays on track.',
    },
    project: {
        title: 'Q3 Brand Refresh Initiative',
        description:
            'Coordinate design, copy, and web teams to deliver a refreshed brand identity across all customer-facing surfaces by end of quarter.',
    },
};

export function useAiGenerate(entity: AiGenerateEntity): UseAiGenerateResult {
    const [isGenerating, setIsGenerating] = useState(false);
    const generateAction = useAction(api.workspaceAi.generate);

    const generate = useCallback(
        async (field: AiGenerateField, context: AiGenerateContext): Promise<AiGenerateResult | null> => {
            setIsGenerating(true);
            try {
                if (isPreviewModeEnabled()) {
                    const sample = PREVIEW_SAMPLES[entity][field];
                    notifyInfo({
                        title: 'Preview mode',
                        message: `Sample ${field} generated locally for this ${entity}.`,
                    });
                    return field === 'title' ? { title: sample } : { description: sample };
                }

                const data = await generateAction({ entity, field, context });
                if (field === 'title' && data.title) {
                    notifySuccess({
                        title: 'Title generated',
                        message: `AI has suggested a ${entity === 'task' ? 'task' : 'project'} title.`,
                    });
                    return { title: data.title };
                }
                if (field === 'description' && data.description) {
                    notifySuccess({
                        title: 'Description generated',
                        message: `AI has suggested a ${entity === 'task' ? 'task' : 'project'} description.`,
                    });
                    return { description: data.description };
                }
                return null;
            } catch (error) {
                reportConvexFailure({
                    error,
                    context: 'useAiGenerate:generate',
                    title: 'Generation failed',
                    fallbackMessage: 'Generation failed',
                });
                return null;
            } finally {
                setIsGenerating(false);
            }
        },
        [entity, generateAction],
    );

    return { generate, isGenerating };
}
