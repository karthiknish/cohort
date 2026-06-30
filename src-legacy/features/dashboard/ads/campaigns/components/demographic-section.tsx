'use client';
import { useCallback } from 'react';
import { Edit2, Users } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/shared/ui/tooltip';
import type { AggregatedTargetingData } from './audience-control-types';
import { TargetingCollapsiblePanel } from './targeting-collapsible-panel';
export type DraftDemographics = {
    ageMin: number;
    ageMax: number;
    genders: string[];
};
type DemographicSectionProps = {
    aggregatedData: AggregatedTargetingData;
    expandedSections: Set<string>;
    toggleSection: (section: string) => void;
    editingSection?: string | null;
    onToggleEditing?: (section: string) => void;
    canEdit?: boolean;
    draftDemographics?: DraftDemographics | null;
    onDraftChange?: (updater: (prev: DraftDemographics) => DraftDemographics) => void;
    onSaveDemographics?: () => void | Promise<void>;
    savingTargeting?: boolean;
};
function formatAgeRange(range: string) {
    return range.replace(/_/g, '-').replace('AGE', '').replace('RANGE', '').trim();
}
const GENDER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'male', label: 'Men' },
    { value: 'female', label: 'Women' },
] as const;
function GenderOptionButton({ label, selected, value, onSelect, }: {
    label: string;
    selected: boolean;
    value: string;
    onSelect: (value: string) => void;
}) {
    const handleSelect = () => {
        onSelect(value);
    };
    return (<Button type="button" size="sm" variant={selected ? 'default' : 'outline'} className="h-8" onClick={handleSelect}>
      {label}
    </Button>);
}
export function DemographicSection({ aggregatedData, expandedSections, toggleSection, editingSection, onToggleEditing, canEdit, draftDemographics, onDraftChange, onSaveDemographics, savingTargeting, }: DemographicSectionProps) {
    const isEditing = editingSection === 'demographics';
    const ageCount = aggregatedData.demographics.ageRanges.length;
    const genderCount = aggregatedData.demographics.genders.length;
    const langCount = aggregatedData.demographics.languages.length;
    const totalCount = ageCount + genderCount + langCount;
    const showPanel = totalCount > 0 || Boolean(canEdit);
    const handleToggleDemographics = () => {
        toggleSection('demographics');
    };
    const handleEditDemographics = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onToggleEditing?.('demographics');
    };
    const handleSaveClick = () => {
        void onSaveDemographics?.();
    };
    const handleAgeMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        if (!onDraftChange || !draftDemographics)
            return;
        onDraftChange((prev) => ({ ...prev, ageMin: Number.isFinite(value) ? value : prev.ageMin }));
    };
    const handleAgeMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        if (!onDraftChange || !draftDemographics)
            return;
        onDraftChange((prev) => ({ ...prev, ageMax: Number.isFinite(value) ? value : prev.ageMax }));
    };
    const handleGenderSelect = (value: string) => {
        if (!onDraftChange || !draftDemographics)
            return;
        onDraftChange((prev) => ({
            ...prev,
            genders: value === 'all' ? [] : [value],
        }));
    };
    if (!showPanel) {
        return null;
    }
    const selectedGender = draftDemographics && draftDemographics.genders.length === 1
        ? draftDemographics.genders[0]!
        : 'all';
    const editButton = canEdit && onToggleEditing ? (<TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={isEditing ? 'default' : 'ghost'} size="icon" className="size-8" onClick={handleEditDemographics} aria-pressed={isEditing} aria-label="Edit demographics">
              <Edit2 className="size-3.5" aria-hidden/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isEditing ? 'Exit demographic editing' : 'Edit demographics'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>) : null;
    return (<TargetingCollapsiblePanel sectionId="demographics" icon={Users} title="Demographics" count={isEditing ? undefined : totalCount} expanded={expandedSections.has('demographics')} onToggle={handleToggleDemographics} headerActions={editButton}>
      <div className="space-y-3">
        {isEditing && draftDemographics && onDraftChange ? (<>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="meta-age-min" className="text-xs">
                  Min age
                </Label>
                <Input id="meta-age-min" type="number" min={13} max={65} value={draftDemographics.ageMin} onChange={handleAgeMinChange} className="h-9"/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meta-age-max" className="text-xs">
                  Max age
                </Label>
                <Input id="meta-age-max" type="number" min={13} max={65} value={draftDemographics.ageMax} onChange={handleAgeMaxChange} className="h-9"/>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Gender</p>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((option) => (<GenderOptionButton key={option.value} label={option.label} value={option.value} selected={selectedGender === option.value} onSelect={handleGenderSelect}/>))}
              </div>
            </div>
            {onSaveDemographics ? (<Button size="sm" className="w-full sm:w-auto" disabled={savingTargeting} onClick={handleSaveClick}>
                {savingTargeting ? 'Saving…' : 'Save to ad set'}
              </Button>) : null}
          </>) : (<>
            {ageCount > 0 ? (<div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Age ranges</p>
                <div className="flex flex-wrap gap-1.5">
                  {aggregatedData.demographics.ageRanges.map((age) => (<Badge key={`age-${age}`} variant="secondary" className="text-xs tabular-nums">
                      {formatAgeRange(age)}
                    </Badge>))}
                </div>
              </div>) : null}
            {genderCount > 0 ? (<div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Gender</p>
                <div className="flex flex-wrap gap-1.5">
                  {aggregatedData.demographics.genders.map((gender) => (<Badge key={`gender-${gender}`} variant="outline" className="text-xs capitalize">
                      {gender.toLowerCase()}
                    </Badge>))}
                </div>
              </div>) : null}
            {langCount > 0 ? (<div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {aggregatedData.demographics.languages.map((lang) => (<Badge key={`lang-${lang}`} variant="outline" className="text-xs">
                      {lang}
                    </Badge>))}
                </div>
              </div>) : null}
            {totalCount === 0 && canEdit ? (<p className="text-center text-xs text-muted-foreground">
                No age or gender set. Use Edit to configure Meta demographics.
              </p>) : null}
          </>)}
      </div>
    </TargetingCollapsiblePanel>);
}
