'use client';
import { useEffect, useEffectEvent, useState } from 'react';
import { useAction } from 'convex/react';
import { Loader2, Sparkles, Trash2, Users } from 'lucide-react';
import { adsAudiencesApi } from '@/lib/convex-api';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { META_LOOKALIKE_COUNTRIES, META_LOOKALIKE_RATIO_PRESETS, } from '@/lib/meta-lookalike-spec';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/shared/ui/alert-dialog';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { toast } from '@/shared/ui/use-toast';
type MetaAudienceRow = {
    id: string;
    name: string;
    description?: string;
    approximateCount?: number;
    status?: string;
    subtype?: string | null;
};
type MetaAudiencesPanelProps = {
    workspaceId: string;
    clientId?: string | null;
};
function isLookalikeSubtype(subtype?: string | null): boolean {
    return (subtype ?? '').toUpperCase() === 'LOOKALIKE';
}
function AudienceDeleteButton({ audience, deletingId, onRequestDelete, }: {
    audience: MetaAudienceRow;
    deletingId: string | null;
    onRequestDelete: (audience: MetaAudienceRow) => void;
}) {
    const handleRequestDelete = () => {
        onRequestDelete(audience);
    };
    return (<Button type="button" variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" disabled={deletingId === audience.id} onClick={handleRequestDelete} aria-label={`Delete ${audience.name}`}>
      {deletingId === audience.id ? (<Loader2 className="size-3.5 animate-spin" aria-hidden/>) : (<Trash2 className="size-3.5" aria-hidden/>)}
    </Button>);
}
export function MetaAudiencesPanel({ workspaceId, clientId }: MetaAudiencesPanelProps) {
    const listAudiences = useAction(adsAudiencesApi.listAudiences);
    const createLookalikeAudience = useAction(adsAudiencesApi.createLookalikeAudience);
    const deleteAudience = useAction(adsAudiencesApi.deleteAudience);
    const [audiences, setAudiences] = useState<MetaAudienceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<MetaAudienceRow | null>(null);
    const [lookalikeName, setLookalikeName] = useState('');
    const [originAudienceId, setOriginAudienceId] = useState('');
    const [lookalikeCountry, setLookalikeCountry] = useState<string>(META_LOOKALIKE_COUNTRIES[0].code);
    const [lookalikeRatio, setLookalikeRatio] = useState(String(META_LOOKALIKE_RATIO_PRESETS[0].ratio));
    const [creatingLookalike, setCreatingLookalike] = useState(false);
    const loadAudiences = useEffectEvent(() => {
        setLoading(true);
        return listAudiences({
            workspaceId,
            providerId: 'facebook',
            clientId: clientId ?? null,
        })
            .then((rows) => {
            setAudiences(Array.isArray(rows) ? (rows as MetaAudienceRow[]) : []);
        })
            .catch((error) => {
            reportConvexFailure({
                error,
                context: 'MetaAudiencesPanel:listAudiences',
                title: 'Could not load audiences',
                fallbackMessage: 'Could not load audiences',
            });
        })
            .finally(() => {
            setLoading(false);
        });
    });
    useEffect(() => {
        void loadAudiences();
    }, [clientId, workspaceId]);
    const sourceAudiences = audiences.filter((row) => !isLookalikeSubtype(row.subtype));
    const handleRefresh = () => {
        void loadAudiences();
    };
    const handleConfirmDelete = async () => {
        if (!pendingDelete)
            return;
        setDeletingId(pendingDelete.id);
        try {
            await deleteAudience({
                workspaceId,
                providerId: 'facebook',
                clientId: clientId ?? null,
                audienceId: pendingDelete.id,
            });
            setAudiences((current) => current.filter((row) => row.id !== pendingDelete.id));
            toast({
                title: 'Audience deleted',
                description: `"${pendingDelete.name}" was removed from Meta.`,
            });
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'MetaAudiencesPanel:deleteAudience',
                title: 'Could not delete audience',
                fallbackMessage: 'Check Meta permissions and try again.',
            });
        }
        finally {
            setDeletingId(null);
            setPendingDelete(null);
        }
    };
    const handleDeleteDialogOpenChange = (open: boolean) => {
        if (!open)
            setPendingDelete(null);
    };
    const handleLookalikeNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLookalikeName(event.target.value);
    };
    const handleRequestDelete = (audience: MetaAudienceRow) => {
        setPendingDelete(audience);
    };
    const handleConfirmDeleteClick = () => {
        void handleConfirmDelete();
    };
    const handleCreateLookalike = () => {
        const name = lookalikeName.trim();
        if (!name || !originAudienceId) {
            toast({
                title: 'Missing fields',
                description: 'Enter a name and select a source custom audience.',
                variant: 'destructive',
            });
            return;
        }
        const ratio = Number(lookalikeRatio);
        setCreatingLookalike(true);
        void createLookalikeAudience({
            workspaceId,
            providerId: 'facebook',
            clientId: clientId ?? null,
            name,
            originAudienceId,
            country: lookalikeCountry,
            ratio,
        })
            .then((result) => {
            toast({
                title: 'Lookalike created',
                description: `Meta is building "${name}". It may take a few hours before targeting is available.`,
            });
            setLookalikeName('');
            setOriginAudienceId('');
            if (result.id) {
                setAudiences((current) => [
                    ...current,
                    { id: result.id, name, subtype: 'LOOKALIKE' },
                ]);
            }
            void loadAudiences();
        })
            .catch((error) => {
            reportConvexFailure({
                error,
                context: 'MetaAudiencesPanel:createLookalike',
                title: 'Could not create lookalike',
                fallbackMessage: 'Meta requires a populated source audience (often 100+ people in the selected country).',
            });
        })
            .finally(() => {
            setCreatingLookalike(false);
        });
    };
    if (loading) {
        return (<div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden/>
        Loading Meta custom audiences…
      </div>);
    }
    return (<>
      <div className="space-y-3 rounded-lg border border-dashed border-border/60 p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-muted-foreground" aria-hidden/>
          <p className="text-xs font-medium text-foreground">Create lookalike audience</p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Build a similar audience from an existing custom audience. Upload customer emails first if the source list is empty.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="meta-lookalike-name" className="text-xs">
              Name
            </Label>
            <Input id="meta-lookalike-name" value={lookalikeName} onChange={handleLookalikeNameChange} placeholder="Lookalike — VIP customers" className="h-9" disabled={creatingLookalike}/>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="meta-lookalike-source" className="text-xs">
              Source audience
            </Label>
            <Select value={originAudienceId} onValueChange={setOriginAudienceId} disabled={creatingLookalike || sourceAudiences.length === 0}>
              <SelectTrigger id="meta-lookalike-source" className="h-9">
                <SelectValue placeholder="Select custom audience…"/>
              </SelectTrigger>
              <SelectContent>
                {sourceAudiences.map((row) => (<SelectItem key={row.id} value={row.id}>
                    {row.name}
                  </SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="meta-lookalike-country" className="text-xs">
              Country
            </Label>
            <Select value={lookalikeCountry} onValueChange={setLookalikeCountry} disabled={creatingLookalike}>
              <SelectTrigger id="meta-lookalike-country" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {META_LOOKALIKE_COUNTRIES.map((country) => (<SelectItem key={country.code} value={country.code}>
                    {country.label}
                  </SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="meta-lookalike-ratio" className="text-xs">
              Audience size
            </Label>
            <Select value={lookalikeRatio} onValueChange={setLookalikeRatio} disabled={creatingLookalike}>
              <SelectTrigger id="meta-lookalike-ratio" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {META_LOOKALIKE_RATIO_PRESETS.map((preset) => (<SelectItem key={preset.ratio} value={String(preset.ratio)}>
                    {preset.label}
                  </SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="button" size="sm" disabled={creatingLookalike || sourceAudiences.length === 0} onClick={handleCreateLookalike}>
          {creatingLookalike ? (<>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden/>
              Creating…
            </>) : ('Create lookalike')}
        </Button>
      </div>

      {audiences.length === 0 ? (<p className="py-2 text-xs text-muted-foreground">
          No audiences yet. Create an empty custom audience with the form below, upload emails on a campaign ad set, then build a lookalike here.
        </p>) : (<div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Existing audiences</p>
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
          <ul className="max-h-40 space-y-1.5 overflow-auto">
            {audiences.map((audience) => (<li key={audience.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/10 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden/>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{audience.name}</p>
                    {audience.approximateCount != null ? (<p className="text-[10px] text-muted-foreground">
                        ~{audience.approximateCount.toLocaleString()} people
                      </p>) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {isLookalikeSubtype(audience.subtype) ? (<Badge variant="secondary" className="text-[10px]">
                      Lookalike
                    </Badge>) : (<Badge variant="outline" className="text-[10px]">
                      Custom
                    </Badge>)}
                  {audience.status ? (<Badge variant="outline" className="text-[10px]">
                      {audience.status}
                    </Badge>) : null}
                  <AudienceDeleteButton audience={audience} deletingId={deletingId} onRequestDelete={handleRequestDelete}/>
                </div>
              </li>))}
          </ul>
        </div>)}

      <AlertDialog open={pendingDelete !== null} onOpenChange={handleDeleteDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete custom audience?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
            ? `"${pendingDelete.name}" will be removed from Meta. Ads using this audience may stop delivering.`
            : 'This audience will be removed from Meta.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirmDeleteClick}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>);
}
