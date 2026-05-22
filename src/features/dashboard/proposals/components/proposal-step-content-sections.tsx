'use client'

import { useCallback } from 'react'
import { Building2, CircleCheck, Factory, Globe, MapPin, Users2 } from 'lucide-react'

import { SvglBrandLogo, type SvglBrandSlug } from '@/shared/components/svgl-brand-logo'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { FormField, FieldSection } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { usePresentationThemes } from '../hooks/use-presentation-themes'
import { listItemEnterClass } from '@/lib/motion'
import { cn } from '@/lib/utils'

import type { ProposalStepSectionProps } from './proposal-step-types'

const marketingPlatforms = ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads', 'Other'] as const
const socialHandles = ['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'X / Twitter', 'YouTube'] as const
const goalOptions = ['Lead generation', 'Sales', 'Brand awareness', 'Recruitment', 'Other'] as const
const challenges = ['Low leads', 'High cost per lead', 'Lack of brand awareness', 'Scaling issues', 'Other'] as const
const scopeOptions = [
  'PPC (Google Ads)',
  'Paid Social (Meta/TikTok/LinkedIn)',
  'SEO & Content Marketing',
  'Email Marketing',
  'Creative & Design',
  'Strategy & Consulting',
  'Other',
] as const
const startTimelineOptions = ['ASAP', 'Within 1 month', 'Within 3 months', 'Flexible'] as const
const proposalValueOptions = ['£2,000 – £5,000', '£5,000 – £10,000', '£10,000+'] as const
const engagementOptions = ['One-off project', 'Ongoing monthly support'] as const

const animatedStepClassName = ['space-y-6', listItemEnterClass].join(' ')
const interactiveCardClassName =
  'motion-chromatic hover:shadow-sm active:scale-[0.98]'

const LABEL_ICON_CLASS = 'size-4 text-primary/70'

const companyNameLabelPrefix = <Building2 className={LABEL_ICON_CLASS} aria-hidden />
const websiteLabelPrefix = <Globe className={LABEL_ICON_CLASS} aria-hidden />
const industryLabelPrefix = <Factory className={LABEL_ICON_CLASS} aria-hidden />
const companySizeLabelPrefix = <Users2 className={LABEL_ICON_CLASS} aria-hidden />
const locationsLabelPrefix = <MapPin className={LABEL_ICON_CLASS} aria-hidden />

function SelectionIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-5 items-center justify-center rounded-md border motion-chromatic',
        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 bg-background/80',
      )}
    >
      {selected ? <CircleCheck className="size-3.5" /> : null}
    </span>
  )
}

const SOCIAL_HANDLE_SVGL: Partial<Record<(typeof socialHandles)[number], SvglBrandSlug>> = {
  Facebook: 'facebook',
  Instagram: 'instagram',
  LinkedIn: 'linkedin',
  'X / Twitter': 'x',
  YouTube: 'youtube',
}

function socialHandleIcon(handle: (typeof socialHandles)[number]) {
  const brand = SOCIAL_HANDLE_SVGL[handle]
  if (brand) {
    return <SvglBrandLogo brand={brand} className="size-4 opacity-70 transition-opacity group-hover:opacity-100" labeled={false} />
  }
  return <Globe className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
}

export function ProposalCompanyStepSection({ formState, validationErrors, onUpdateField }: ProposalStepSectionProps) {
  const onChangeCompanyName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onUpdateField(['company', 'name'], event.target.value),
    [onUpdateField],
  )
  const onChangeCompanyWebsite = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onUpdateField(['company', 'website'], event.target.value),
    [onUpdateField],
  )
  const onChangeCompanyIndustry = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onUpdateField(['company', 'industry'], event.target.value),
    [onUpdateField],
  )
  const onChangeCompanySize = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onUpdateField(['company', 'size'], event.target.value),
    [onUpdateField],
  )
  const onChangeCompanyLocations = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateField(['company', 'locations'], event.target.value),
    [onUpdateField],
  )

  return (
    <div className={animatedStepClassName}>
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="companyName"
          label="Company Name"
          labelPrefix={companyNameLabelPrefix}
          error={validationErrors['company.name']}
        >
          <Input
            id="companyName"
            name="companyName"
            placeholder="Acme Corporation"
            value={formState.company.name}
            onChange={onChangeCompanyName}
            className={cn(
              'h-10 border-muted/60 bg-background/50 focus:bg-background motion-chromatic',
              validationErrors['company.name'] && 'border-destructive/50 ring-destructive/20',
            )}
          />
        </FormField>
        <FormField
          id="website"
          label="Website URL"
          labelPrefix={websiteLabelPrefix}
        >
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://acme.com"
            value={formState.company.website}
            onChange={onChangeCompanyWebsite}
            className="h-10 border-muted/60 bg-background/50 focus:bg-background motion-chromatic"
          />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="industry"
          label="Industry / Sector"
          labelPrefix={industryLabelPrefix}
          error={validationErrors['company.industry']}
        >
          <Input
            id="industry"
            name="industry"
            placeholder="e.g. SaaS, Retail, Healthcare"
            value={formState.company.industry}
            onChange={onChangeCompanyIndustry}
            className={cn(
              'h-10 border-muted/60 bg-background/50 focus:bg-background motion-chromatic',
              validationErrors['company.industry'] && 'border-destructive/50 ring-destructive/20',
            )}
          />
        </FormField>
        <FormField
          id="companySize"
          label="Company Size"
          labelPrefix={companySizeLabelPrefix}
        >
          <Input
            id="companySize"
            name="companySize"
            placeholder="e.g. 25 employees"
            value={formState.company.size}
            onChange={onChangeCompanySize}
            className="h-10 border-muted/60 bg-background/50 focus:bg-background motion-chromatic"
          />
        </FormField>
      </div>

      <FormField
        id="locations"
        label="Target Locations"
        labelPrefix={locationsLabelPrefix}
      >
        <Textarea
          id="locations"
          name="locations"
          placeholder="List primary offices or regions served"
          value={formState.company.locations}
          onChange={onChangeCompanyLocations}
          className="min-h-[100px] resize-none border-muted/60 bg-background/50 motion-chromatic focus:bg-background"
        />
      </FormField>
    </div>
  )
}

function MarketingPlatformButton({
  platform,
  isSelected,
  onToggleArrayValue,
}: {
  platform: string
  isSelected: boolean
  onToggleArrayValue: ProposalStepSectionProps['onToggleArrayValue']
}) {
  const onTogglePlatform = useCallback(
    () => onToggleArrayValue?.(['marketing', 'platforms'], platform),
    [onToggleArrayValue, platform],
  )
  return (
    <button
      type="button"
      onClick={onTogglePlatform}
      aria-pressed={isSelected}
      className={cn(
        `flex cursor-pointer items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`,
        isSelected
          ? 'border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-sm'
          : 'border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/10',
      )}
    >
      <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>{platform}</span>
      <SelectionIndicator selected={isSelected} />
    </button>
  )
}

function SocialHandleInput({
  handle,
  value,
  onChangeSocialHandle,
}: {
  handle: (typeof socialHandles)[number]
  value: string
  onChangeSocialHandle: ProposalStepSectionProps['onChangeSocialHandle']
}) {
  const onSocialHandleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onChangeSocialHandle?.(handle, event.target.value),
    [onChangeSocialHandle, handle],
  )
  return (
    <div className="rounded-xl border border-muted/50 bg-background/40 p-3 motion-chromatic hover:bg-background/80">
      <FormField
        label={handle}
        labelPrefix={socialHandleIcon(handle)}
        labelVariant="title"
        className="gap-2"
      >
        <Input
          name={`social-${handle}`}
          placeholder="@company"
          value={value}
          onChange={onSocialHandleChange}
          className="h-8 border-muted/40 bg-transparent text-xs motion-chromatic focus:bg-background"
        />
      </FormField>
    </div>
  )
}

export function ProposalMarketingStepSection({ formState, validationErrors, onUpdateField, onToggleArrayValue, onChangeSocialHandle }: ProposalStepSectionProps) {
  const onChangeBudget = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onUpdateField(['marketing', 'budget'], event.target.value),
    [onUpdateField],
  )
  const onChangeAdAccounts = useCallback(
    (value: string) => onUpdateField(['marketing', 'adAccounts'], value),
    [onUpdateField],
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField id="budget" label="Monthly marketing budget" error={validationErrors['marketing.budget']}>
          <Input
            id="budget"
            name="budget"
            placeholder="e.g. £7,500"
            value={formState.marketing.budget}
            onChange={onChangeBudget}
          />
        </FormField>
        <FormField id="adAccounts" label="Existing ad accounts?">
          <Select value={formState.marketing.adAccounts} onValueChange={onChangeAdAccounts}>
            <SelectTrigger id="adAccounts">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FieldSection
        title="Current advertising platforms"
        description="Which platforms are you already using for ads?"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {marketingPlatforms.map((platform) => (
            <MarketingPlatformButton
              key={platform}
              platform={platform}
              isSelected={formState.marketing.platforms.includes(platform)}
              onToggleArrayValue={onToggleArrayValue}
            />
          ))}
        </div>
      </FieldSection>

      <FieldSection title="Social handles">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {socialHandles.map((handle) => (
            <SocialHandleInput
              key={handle}
              handle={handle}
              value={formState.marketing.socialHandles[handle] ?? ''}
              onChangeSocialHandle={onChangeSocialHandle}
            />
          ))}
        </div>
      </FieldSection>
    </div>
  )
}

function GoalOptionButton({
  goal,
  isSelected,
  onToggleArrayValue,
}: {
  goal: string
  isSelected: boolean
  onToggleArrayValue: ProposalStepSectionProps['onToggleArrayValue']
}) {
  const onToggleGoal = useCallback(
    () => onToggleArrayValue?.(['goals', 'objectives'], goal),
    [onToggleArrayValue, goal],
  )
  return (
    <button
      type="button"
      onClick={onToggleGoal}
      aria-pressed={isSelected}
      className={cn(
        `flex cursor-pointer items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`,
        isSelected
          ? 'border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-sm'
          : 'border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/10',
      )}
    >
      <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>{goal}</span>
      <SelectionIndicator selected={isSelected} />
    </button>
  )
}

function ChallengeButton({
  challenge,
  isSelected,
  onToggleArrayValue,
}: {
  challenge: string
  isSelected: boolean
  onToggleArrayValue: ProposalStepSectionProps['onToggleArrayValue']
}) {
  const onToggleChallenge = useCallback(
    () => onToggleArrayValue?.(['goals', 'challenges'], challenge),
    [onToggleArrayValue, challenge],
  )
  return (
    <button
      type="button"
      onClick={onToggleChallenge}
      className={cn(
        'rounded-full border px-4 py-2 text-xs font-semibold motion-chromatic',
        isSelected
          ? 'scale-[1.02] border-primary bg-primary text-primary-foreground shadow-md'
          : 'border-muted bg-background text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/5',
      )}
    >
      {challenge}
    </button>
  )
}

export function ProposalGoalsStepSection({ formState, validationErrors, onUpdateField, onToggleArrayValue }: ProposalStepSectionProps) {
  const onChangeAudience = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateField(['goals', 'audience'], event.target.value),
    [onUpdateField],
  )
  const onChangeCustomChallenge = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onUpdateField(['goals', 'customChallenge'], event.target.value),
    [onUpdateField],
  )

  return (
    <div className={animatedStepClassName}>
      <FieldSection
        title="Primary Business Goals"
        description="What are you hoping to achieve in the next 6-12 months?"
        error={validationErrors['goals.objectives']}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {goalOptions.map((goal) => (
            <GoalOptionButton
              key={goal}
              goal={goal}
              isSelected={formState.goals.objectives.includes(goal)}
              onToggleArrayValue={onToggleArrayValue}
            />
          ))}
        </div>
      </FieldSection>

      <FormField
        id="audience"
        label="Target Audience"
        description="Describe your ideal customer persona."
        labelVariant="title"
      >
        <Textarea
          id="audience"
          name="audience"
          placeholder="e.g. Marketing Managers at B2B SaaS companies with 50-200 employees"
          value={formState.goals.audience}
          onChange={onChangeAudience}
          className="min-h-[100px] resize-none border-muted/60 bg-background/50 shadow-inner motion-chromatic focus:bg-background"
        />
      </FormField>

      <FieldSection
        title="Key Challenges"
        description="What&apos;s currently standing in your way?"
      >
        <div className="flex flex-wrap gap-2">
          {challenges.map((challenge) => (
            <ChallengeButton
              key={challenge}
              challenge={challenge}
              isSelected={formState.goals.challenges.includes(challenge)}
              onToggleArrayValue={onToggleArrayValue}
            />
          ))}
        </div>
        <Input
          name="customChallenge"
          placeholder="Other specific challenge…"
          value={formState.goals.customChallenge}
          onChange={onChangeCustomChallenge}
          className="mt-2 h-10 border-muted/60 bg-background/50 text-sm motion-chromatic focus:bg-background"
        />
      </FieldSection>
    </div>
  )
}

function ScopeServiceButton({
  service,
  isSelected,
  onToggleArrayValue,
}: {
  service: string
  isSelected: boolean
  onToggleArrayValue: ProposalStepSectionProps['onToggleArrayValue']
}) {
  const onToggleService = useCallback(
    () => onToggleArrayValue?.(['scope', 'services'], service),
    [onToggleArrayValue, service],
  )
  return (
    <button
      type="button"
      className={cn(
        `flex cursor-pointer items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`,
        isSelected
          ? 'border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-sm'
          : 'border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/10',
      )}
      onClick={onToggleService}
      aria-pressed={isSelected}
    >
      <div className="space-y-0.5">
        <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>{service}</span>
      </div>
      <SelectionIndicator selected={isSelected} />
    </button>
  )
}

export function ProposalScopeStepSection({ formState, validationErrors, onUpdateField, onToggleArrayValue }: ProposalStepSectionProps) {
  const onChangeOtherService = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateField(['scope', 'otherService'], event.target.value),
    [onUpdateField],
  )

  return (
    <div className={animatedStepClassName}>
      <FieldSection
        title="Scope of Engagement"
        description="Select the services where you need our expertise."
        error={validationErrors['scope.services']}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {scopeOptions.map((service) => (
            <ScopeServiceButton
              key={service}
              service={service}
              isSelected={formState.scope.services.includes(service)}
              onToggleArrayValue={onToggleArrayValue}
            />
          ))}
        </div>
      </FieldSection>

      <FormField
        id="otherService"
        label="Specific Requirements"
        description="Any other service or specific deliverable you need?"
      >
        <Textarea
          id="otherService"
          name="otherService"
          placeholder="e.g. CRO Audit, Landing Page Design, etc."
          value={formState.scope.otherService}
          onChange={onChangeOtherService}
          className="min-h-[100px] resize-none border-muted/60 bg-background/50 shadow-inner motion-chromatic focus:bg-background"
        />
      </FormField>
    </div>
  )
}

function TimelineOptionButton({
  option,
  isSelected,
  onUpdateField,
}: {
  option: string
  isSelected: boolean
  onUpdateField: ProposalStepSectionProps['onUpdateField']
}) {
  const onSelectStartTime = useCallback(
    () => onUpdateField(['timelines', 'startTime'], option),
    [onUpdateField, option],
  )
  return (
    <button
      type="button"
      onClick={onSelectStartTime}
      className={cn(
        `flex items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`,
        isSelected
          ? 'border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-sm'
          : 'border-muted/60 bg-background/50 hover:bg-muted/10',
      )}
    >
      <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>{option}</span>
      {isSelected ? <CircleCheck className="size-5 text-primary" /> : null}
    </button>
  )
}

export function ProposalTimelinesStepSection({ formState, onUpdateField }: ProposalStepSectionProps) {
  const onChangeUpcomingEvents = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateField(['timelines', 'upcomingEvents'], event.target.value),
    [onUpdateField],
  )

  return (
    <div className={animatedStepClassName}>
      <FieldSection title="Project Timeline">
        <div className="grid gap-3 sm:grid-cols-2">
          {startTimelineOptions.map((option) => (
            <TimelineOptionButton
              key={option}
              option={option}
              isSelected={formState.timelines.startTime === option}
              onUpdateField={onUpdateField}
            />
          ))}
        </div>
      </FieldSection>

      <FormField
        id="upcomingEvents"
        label="Upcoming Campaigns or Events"
        description="Share launches or milestones we should plan for."
      >
        <Textarea
          id="upcomingEvents"
          name="upcomingEvents"
          placeholder="e.g. Q1 Product Launch, Black Friday Sales, etc."
          value={formState.timelines.upcomingEvents}
          onChange={onChangeUpcomingEvents}
          className="min-h-[100px] resize-none border-muted/60 bg-background/50 shadow-inner motion-chromatic focus:bg-background"
        />
      </FormField>
    </div>
  )
}

function ProposalValueButton({
  option,
  isSelected,
  onUpdateField,
}: {
  option: string
  isSelected: boolean
  onUpdateField: ProposalStepSectionProps['onUpdateField']
}) {
  const onSelectProposalSize = useCallback(
    () => onUpdateField(['value', 'proposalSize'], option),
    [onUpdateField, option],
  )
  return (
    <button
      type="button"
      onClick={onSelectProposalSize}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border p-6 motion-chromatic-lg',
        isSelected
          ? 'scale-[1.05] border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-lg'
          : 'border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/5',
      )}
    >
      <span className={cn('text-lg font-bold', isSelected ? 'text-primary' : 'text-foreground')}>{option}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Per Month</span>
    </button>
  )
}

function EngagementTypeButton({
  option,
  isSelected,
  onUpdateField,
}: {
  option: string
  isSelected: boolean
  onUpdateField: ProposalStepSectionProps['onUpdateField']
}) {
  const onSelectEngagementType = useCallback(
    () => onUpdateField(['value', 'engagementType'], option),
    [onUpdateField, option],
  )
  return (
    <button
      type="button"
      onClick={onSelectEngagementType}
      className={cn(
        `flex items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`,
        isSelected
          ? 'border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-sm'
          : 'border-muted/60 bg-background/50 hover:bg-muted/10',
      )}
    >
      <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>{option}</span>
      {isSelected ? <CircleCheck className="size-5 text-primary" /> : null}
    </button>
  )
}

function PresentationThemeButton({
  theme,
  isSelected,
  onUpdateField,
}: {
  theme: { id: string; name: string; description: string }
  isSelected: boolean
  onUpdateField: ProposalStepSectionProps['onUpdateField']
}) {
  const onSelectPresentationTheme = useCallback(
    () => onUpdateField(['value', 'presentationTheme'], theme.id),
    [onUpdateField, theme.id],
  )
  return (
    <button
      type="button"
      onClick={onSelectPresentationTheme}
      className={cn(
        'group relative flex flex-col gap-2 rounded-xl border p-4 motion-chromatic-lg',
        isSelected
          ? 'border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-md'
          : 'border-muted/60 bg-background hover:border-muted-foreground/30 hover:shadow-sm',
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={cn('text-sm font-bold', isSelected ? 'text-primary' : 'text-foreground')}>{theme.name}</span>
        {isSelected ? <CircleCheck className="size-4 text-primary" /> : null}
      </div>
      <p className="text-left text-[10px] text-muted-foreground">{theme.description}</p>
    </button>
  )
}

export function ProposalValueStepSection({ formState, summary, validationErrors, onUpdateField }: ProposalStepSectionProps) {
  const { themes, isLoading: themesLoading, loadError: themesLoadError } = usePresentationThemes()

  return (
    <div className={animatedStepClassName}>
      <FieldSection
        title="Estimated Project Value"
        description="Choose the budget range that best fits the project."
        error={validationErrors['value.proposalSize']}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {proposalValueOptions.map((option) => (
            <ProposalValueButton
              key={option}
              option={option}
              isSelected={formState.value.proposalSize === option}
              onUpdateField={onUpdateField}
            />
          ))}
        </div>
      </FieldSection>

      <FieldSection title="Engagement Type">
        <div className="grid gap-3 sm:grid-cols-2">
          {engagementOptions.map((option) => (
            <EngagementTypeButton
              key={option}
              option={option}
              isSelected={formState.value.engagementType === option}
              onUpdateField={onUpdateField}
            />
          ))}
        </div>
      </FieldSection>

      <FieldSection
        title="Deck style"
        description="Choose how your strategy deck should look when we generate it."
        className="border-t border-muted/20 pt-4"
      >
        {themesLoadError ? (
          <p className="mb-3 text-xs text-muted-foreground">{themesLoadError}</p>
        ) : null}
        {themesLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {['theme-skeleton-1', 'theme-skeleton-2', 'theme-skeleton-3'].map((key) => (
              <div key={key} className="h-24 animate-pulse rounded-xl border border-muted/40 bg-muted/30" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme) => (
              <PresentationThemeButton
                key={theme.id}
                theme={theme}
                isSelected={formState.value.presentationTheme === theme.id}
                onUpdateField={onUpdateField}
              />
            ))}
          </div>
        )}
      </FieldSection>

      <Card className="border-dashed border-accent/20 bg-accent/5">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Proposal summary</CardTitle>
          <CardDescription>Review the information before submitting.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Company</h4>
            <p className="text-muted-foreground">
              {summary.company.name || '—'} · {summary.company.industry || '—'}
            </p>
            <p className="text-xs text-muted-foreground">{summary.company.website}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Marketing</h4>
            <p className="text-muted-foreground">Budget: {summary.marketing.budget || '—'}</p>
            <p className="text-muted-foreground">{summary.marketing.platforms.length ? summary.marketing.platforms.join(', ') : 'No platforms'}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Goals</h4>
            <p className="text-muted-foreground">{summary.goals.objectives.length ? summary.goals.objectives.join(', ') : 'Not specified'}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Scope</h4>
            <p className="text-muted-foreground">{summary.scope.services.length ? summary.scope.services.join(', ') : 'Not selected'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
