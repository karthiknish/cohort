'use client';
import { useAction } from 'convex/react';
import { useCallback, useReducer, type ChangeEvent } from 'react';
import { adsCampaignsApi } from '@/lib/convex-api';
import { asErrorMessage } from '@/lib/convex-errors';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { notifyFailure } from '@/lib/notifications';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { metaDatetimeLocalToIso } from '@/lib/meta-datetime';
import { META_SPECIAL_AD_CATEGORIES, normalizeMetaSpecialAdCategoriesForApi, type MetaSpecialAdCategory, } from '@/lib/meta-special-ad-categories';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { toast } from '@/shared/ui/use-toast';
const META_OBJECTIVES = [
    { value: 'OUTCOME_TRAFFIC', label: 'Traffic' },
    { value: 'OUTCOME_LEADS', label: 'Leads' },
    { value: 'OUTCOME_SALES', label: 'Sales' },
    { value: 'OUTCOME_AWARENESS', label: 'Awareness' },
    { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement' },
] as const;
type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: () => void;
};
type CreateMetaCampaignState = {
    name: string;
    objective: string;
    dailyBudget: string;
    startTime: string;
    stopTime: string;
    specialAdCategories: MetaSpecialAdCategory[];
    loading: boolean;
};
type CreateMetaCampaignAction = {
    type: 'setName';
    value: string;
} | {
    type: 'setObjective';
    value: string;
} | {
    type: 'setDailyBudget';
    value: string;
} | {
    type: 'setStartTime';
    value: string;
} | {
    type: 'setStopTime';
    value: string;
} | {
    type: 'toggleSpecialAdCategory';
    value: MetaSpecialAdCategory;
} | {
    type: 'setLoading';
    value: boolean;
} | {
    type: 'resetAfterCreate';
};
function createInitialCreateMetaCampaignState(): CreateMetaCampaignState {
    return {
        name: '',
        objective: META_OBJECTIVES[0].value,
        dailyBudget: '',
        startTime: '',
        stopTime: '',
        specialAdCategories: ['NONE'],
        loading: false,
    };
}
function createMetaCampaignReducer(state: CreateMetaCampaignState, action: CreateMetaCampaignAction): CreateMetaCampaignState {
    switch (action.type) {
        case 'setName':
            return { ...state, name: action.value };
        case 'setObjective':
            return { ...state, objective: action.value };
        case 'setDailyBudget':
            return { ...state, dailyBudget: action.value };
        case 'setStartTime':
            return { ...state, startTime: action.value };
        case 'setStopTime':
            return { ...state, stopTime: action.value };
        case 'toggleSpecialAdCategory': {
            const value = action.value;
            if (value === 'NONE') {
                return { ...state, specialAdCategories: ['NONE'] };
            }
            const withoutNone = state.specialAdCategories.filter((item) => item !== 'NONE');
            const has = withoutNone.includes(value);
            const next = has ? withoutNone.filter((item) => item !== value) : [...withoutNone, value];
            return { ...state, specialAdCategories: next.length > 0 ? next : ['NONE'] };
        }
        case 'setLoading':
            return { ...state, loading: action.value };
        case 'resetAfterCreate':
            return { ...state, name: '', dailyBudget: '' };
        default:
            return state;
    }
}
export function CreateMetaCampaignDialog({ open, onOpenChange, onCreated }: Props) {
    const { user } = useAuth();
    const { selectedClientId } = useClientContext();
    const createMetaCampaign = useAction(adsCampaignsApi.createMetaCampaign) as (args: {
        workspaceId: string;
        providerId: 'facebook';
        clientId?: string | null;
        name: string;
        objective: string;
        status?: 'ACTIVE' | 'PAUSED';
        dailyBudget?: number;
        startTime?: string;
        stopTime?: string;
        specialAdCategories?: string[];
    }) => Promise<{
        success: boolean;
        campaignId?: string;
    }>;
    const [state, dispatch] = useReducer(createMetaCampaignReducer, undefined, createInitialCreateMetaCampaignState);
    const { name, objective, dailyBudget, startTime, stopTime, specialAdCategories, loading } = state;
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const handleSubmit = async () => {
        if (!workspaceId || !name.trim())
            return;
        dispatch({ type: 'setLoading', value: true });
        try {
            await createMetaCampaign({
                workspaceId,
                providerId: 'facebook',
                clientId: selectedClientId,
                name: name.trim(),
                objective,
                status: 'PAUSED',
                dailyBudget: dailyBudget ? Number(dailyBudget) : undefined,
                startTime: metaDatetimeLocalToIso(startTime),
                stopTime: metaDatetimeLocalToIso(stopTime),
                specialAdCategories: normalizeMetaSpecialAdCategoriesForApi(specialAdCategories),
            });
            toast({ title: 'Campaign created', description: `"${name.trim()}" is paused in Meta — add ad sets next.` });
            dispatch({ type: 'resetAfterCreate' });
            onOpenChange(false);
            onCreated?.();
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'CreateMetaCampaignDialog',
                title: 'Could not create campaign',
                fallbackMessage: asErrorMessage(error),
            });
        }
        dispatch({ type: 'setLoading', value: false });
    };
    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setName', value: event.target.value });
    };
    const handleDailyBudgetChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setDailyBudget', value: event.target.value });
    };
    const handleStartTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setStartTime', value: event.target.value });
    };
    const handleStopTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setStopTime', value: event.target.value });
    };
    const handleObjectiveChange = (value: string) => {
        dispatch({ type: 'setObjective', value });
    };
    const handleSpecialAdCategoryToggle = (value: MetaSpecialAdCategory) => {
        return () => {
            dispatch({ type: 'toggleSpecialAdCategory', value });
        };
    };
    const handleCancel = () => {
        onOpenChange(false);
    };
    const handleSubmitClick = () => {
        void handleSubmit();
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Meta campaign</DialogTitle>
          <DialogDescription>
            Creates a classic (non Advantage+) campaign in your connected ad account. Add ad sets on the campaign page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FormField id="meta-campaign-name" label="Campaign name">
            <Input id="meta-campaign-name" value={name} onChange={handleNameChange} placeholder="Spring promo"/>
          </FormField>
          <FormField id="meta-campaign-objective" label="Objective">
            <Select value={objective} onValueChange={handleObjectiveChange}>
              <SelectTrigger id="meta-campaign-objective">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {META_OBJECTIVES.map((item) => (<SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="meta-campaign-special-categories" label="Special ad categories" description="Required by Meta. Select only if this campaign promotes housing, employment, credit, or political content.">
            <div className="space-y-2 rounded-lg border border-border/60 p-3">
              {META_SPECIAL_AD_CATEGORIES.map((item) => {
            const checked = specialAdCategories.includes(item.value);
            return (<div key={item.value} className="flex items-start gap-2">
                    <Checkbox id={`meta-special-${item.value}`} checked={checked} onCheckedChange={handleSpecialAdCategoryToggle(item.value)}/>
                    <Label htmlFor={`meta-special-${item.value}`} className="text-sm font-normal leading-snug">
                      {item.label}
                    </Label>
                  </div>);
        })}
            </div>
          </FormField>
          <FormField id="meta-campaign-budget" label="Daily budget (optional)" description="Account currency">
            <Input id="meta-campaign-budget" type="number" min={1} value={dailyBudget} onChange={handleDailyBudgetChange} placeholder="50"/>
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="meta-campaign-start" label="Start (optional)" description="Local time — saved as UTC for Meta">
              <Input id="meta-campaign-start" type="datetime-local" value={startTime} onChange={handleStartTimeChange}/>
            </FormField>
            <FormField id="meta-campaign-stop" label="End (optional)" description="Local time — saved as UTC for Meta">
              <Input id="meta-campaign-stop" type="datetime-local" value={stopTime} onChange={handleStopTimeChange}/>
            </FormField>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmitClick} disabled={loading || !name.trim()}>
            {loading ? 'Creating…' : 'Create campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
