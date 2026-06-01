'use client';
import { useAction } from 'convex/react';
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ObjectiveRenderer } from '@/features/dashboard/ads/components/campaign-objectives/objective-renderer';
import type { CampaignFormData, CampaignObjective } from '@/features/dashboard/ads/components/campaign-objectives/types';
import type { MetaPageActorOption } from '@/features/dashboard/ads/campaigns/components/create-creative-dialog-sections';
import { adsAdSetsApi, adsCreativesApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { normalizeMetaCampaignObjective, requiresMetaPageForAdSet, validateMetaAdSetObjective, } from '@/lib/meta-ad-set-objective';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { toast } from '@/shared/ui/use-toast';
type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaignId: string;
    campaignObjective?: string | null;
    onCreated?: () => void;
};
function createInitialObjectiveForm(campaignObjective?: string | null): CampaignFormData {
    const normalized = normalizeMetaCampaignObjective(campaignObjective);
    return {
        name: '',
        objective: (normalized ?? 'OUTCOME_TRAFFIC') as CampaignObjective,
        status: 'PAUSED',
        providerId: 'facebook',
        engagementType: 'PAGE_ENGAGEMENT',
        instantFormEnabled: true,
        conversionEvent: normalized === 'OUTCOME_SALES' ? 'PURCHASE' : undefined,
        salesOptimizationMode: 'pixel',
    };
}
export function CreateMetaAdSetDialog({ open, onOpenChange, campaignId, campaignObjective, onCreated, }: Props) {
    const { user } = useAuth();
    const { selectedClientId } = useClientContext();
    const createAdSet = useAction(adsAdSetsApi.createAdSet);
    const listMetaPageActors = useAction(adsCreativesApi.listMetaPageActors);
    const [name, setName] = useState('');
    const [dailyBudget, setDailyBudget] = useState('');
    const [pageId, setPageId] = useState('');
    const [objectiveForm, setObjectiveForm] = useState<CampaignFormData>(() => createInitialObjectiveForm(campaignObjective));
    const [metaPageActors, setMetaPageActors] = useState<MetaPageActorOption[]>([]);
    const [loadingPageActors, setLoadingPageActors] = useState(false);
    const [loading, setLoading] = useState(false);
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const normalizedObjective = normalizeMetaCampaignObjective(campaignObjective);
    const showObjectiveFlow = normalizedObjective === 'OUTCOME_LEADS'
        || normalizedObjective === 'OUTCOME_ENGAGEMENT'
        || normalizedObjective === 'OUTCOME_SALES';
    const needsPage = requiresMetaPageForAdSet(campaignObjective);
    const metaContext = workspaceId
        ? {
            workspaceId,
            clientId: selectedClientId ?? null,
            pageId: pageId || undefined,
        }
        : undefined;
    useEffect(() => {
        if (!open)
            return;
        setObjectiveForm(createInitialObjectiveForm(campaignObjective));
        setPageId('');
        setName('');
        setDailyBudget('');
    }, [campaignObjective, open]);
    useEffect(() => {
        setObjectiveForm((prev) => ({ ...prev, postId: undefined, eventId: undefined }));
    }, [pageId]);
    useEffect(() => {
        if (!open || !workspaceId)
            return;
        let cancelled = false;
        setLoadingPageActors(true);
        void listMetaPageActors({
            workspaceId,
            providerId: 'facebook',
            clientId: selectedClientId ?? null,
        })
            .then((actors) => {
            if (cancelled)
                return;
            setMetaPageActors(Array.isArray(actors) ? (actors as MetaPageActorOption[]) : []);
        })
            .catch((error) => {
            if (cancelled)
                return;
            logError(error, 'CreateMetaAdSetDialog:loadMetaPageActors');
            setMetaPageActors([]);
            reportConvexFailure({
                error,
                context: 'CreateMetaAdSetDialog:loadMetaPageActors',
                title: 'Failed to load Meta pages',
                fallbackMessage: 'Failed to load Meta pages',
            });
        })
            .finally(() => {
            if (!cancelled)
                setLoadingPageActors(false);
        });
        return () => {
            cancelled = true;
        };
    }, [listMetaPageActors, open, selectedClientId, workspaceId]);
    const handleObjectiveChange = (updates: Partial<CampaignFormData>) => {
        setObjectiveForm((prev) => ({ ...prev, ...updates }));
    };
    const handleSubmit = async () => {
        if (!workspaceId || !name.trim())
            return;
        const validationErrors = validateMetaAdSetObjective(campaignObjective, {
            pageId: pageId || undefined,
            engagementType: objectiveForm.engagementType,
            postId: objectiveForm.postId,
            eventId: objectiveForm.eventId,
            pixelId: objectiveForm.pixelId,
            conversionEvent: objectiveForm.conversionEvent,
            salesOptimizationMode: objectiveForm.salesOptimizationMode,
            productCatalogId: objectiveForm.productCatalogId,
            productSetId: objectiveForm.productSetId,
        });
        if (validationErrors.length > 0) {
            toast({
                title: 'Missing campaign settings',
                description: validationErrors.join(' '),
                variant: 'destructive',
            });
            return;
        }
        setLoading(true);
        try {
            await createAdSet({
                workspaceId,
                providerId: 'facebook',
                clientId: selectedClientId,
                campaignId,
                campaignObjective: campaignObjective ?? null,
                name: name.trim(),
                status: 'PAUSED',
                dailyBudget: dailyBudget ? Number(dailyBudget) : undefined,
                pageId: pageId || undefined,
                engagementType: objectiveForm.engagementType,
                postId: objectiveForm.postId,
                eventId: objectiveForm.eventId,
                leadFormId: objectiveForm.leadFormId,
                pixelId: objectiveForm.pixelId,
                conversionEvent: objectiveForm.conversionEvent,
                salesOptimizationMode: objectiveForm.salesOptimizationMode,
                productCatalogId: objectiveForm.productCatalogId,
                productSetId: objectiveForm.productSetId,
            });
            toast({ title: 'Ad set created', description: `"${name.trim()}" is ready for ads.` });
            onOpenChange(false);
            onCreated?.();
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'CreateMetaAdSetDialog',
                title: 'Could not create ad set',
                fallbackMessage: asErrorMessage(error),
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };
    const handleDailyBudgetChange = (event: ChangeEvent<HTMLInputElement>) => {
        setDailyBudget(event.target.value);
    };
    const handleCancel = () => {
        onOpenChange(false);
    };
    const handleSubmitClick = () => {
        void handleSubmit();
    };
    const submitDisabled = loading
        || !name.trim()
        || (needsPage && !pageId)
        || (normalizedObjective === 'OUTCOME_SALES'
            && (objectiveForm.salesOptimizationMode ?? 'pixel') === 'pixel'
            && (!objectiveForm.pixelId || !objectiveForm.conversionEvent))
        || (normalizedObjective === 'OUTCOME_SALES'
            && objectiveForm.salesOptimizationMode === 'catalog'
            && !objectiveForm.productCatalogId);
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create ad set</DialogTitle>
          <DialogDescription>
            Adds a paused ad set to this campaign. Refine targeting on the Audience tab after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FormField id="meta-adset-name" label="Ad set name">
            <Input id="meta-adset-name" value={name} onChange={handleNameChange} placeholder="US — Broad"/>
          </FormField>
          <FormField id="meta-adset-budget" label="Daily budget (optional)">
            <Input id="meta-adset-budget" type="number" min={1} value={dailyBudget} onChange={handleDailyBudgetChange}/>
          </FormField>

          {needsPage ? (<FormField id="meta-adset-page" label="Facebook Page" description={!loadingPageActors && metaPageActors.length === 0
                ? 'No Facebook Pages found for this integration token.'
                : undefined}>
              <Select value={pageId || undefined} onValueChange={setPageId} disabled={loading || loadingPageActors}>
                <SelectTrigger id="meta-adset-page">
                  <SelectValue placeholder={loadingPageActors ? 'Loading pages…' : 'Select a Facebook Page'}/>
                </SelectTrigger>
                <SelectContent>
                  {metaPageActors.map((actor) => (<SelectItem key={actor.id} value={actor.id}>
                      {actor.name}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>) : null}

          {showObjectiveFlow && normalizedObjective ? (<ObjectiveRenderer objective={normalizedObjective as CampaignObjective} formData={objectiveForm} onChange={handleObjectiveChange} disabled={loading} providerId="facebook" metaContext={metaContext}/>) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmitClick} disabled={submitDisabled}>
            {loading ? 'Creating…' : 'Create ad set'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
