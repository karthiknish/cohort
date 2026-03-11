'use client'

import {
  Building2,
  CircleAlert,
  CircleCheck,
  Facebook,
  Factory,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  Twitter,
  Users2,
  Youtube,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { GAMMA_PRESENTATION_THEMES } from '@/lib/gamma-themes'
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

const animatedStepClassName = 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500'
const interactiveCardClassName =
  'transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none hover:shadow-sm active:scale-[0.98]'

function InlineValidationMessage({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-destructive">
      <CircleAlert className="h-3 w-3" />
      {message}
    </p>
  )
}

function SelectionIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-5 w-5 items-center justify-center rounded-md border transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter]',
        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 bg-background/80',
      )}
    >
      {selected ? <CircleCheck className="h-3.5 w-3.5" /> : null}
    </span>
  )
}

function socialHandleIcon(handle: (typeof socialHandles)[number]) {
  if (handle === 'Facebook') return Facebook
  if (handle === 'Instagram') return Instagram
  if (handle === 'LinkedIn') return Linkedin
  if (handle === 'X / Twitter') return Twitter
  if (handle === 'YouTube') return Youtube
  return Globe
}

export function ProposalCompanyStepSection({ formState, validationErrors, onUpdateField }: ProposalStepSectionProps) {
  return (
    <div className={animatedStepClassName}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary/70" />
            <Label htmlFor="companyName" className="text-sm font-semibold">Company Name</Label>
          </div>
          <Input
            id="companyName"
            name="companyName"
            placeholder="Acme Corporation"
            value={formState.company.name}
            onChange={(event) => onUpdateField(['company', 'name'], event.target.value)}
            className={cn(
              'h-10 border-muted/60 bg-background/50 focus:bg-background transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter]',
              validationErrors['company.name'] && 'border-destructive/50 ring-destructive/20',
            )}
          />
          {validationErrors['company.name'] ? <InlineValidationMessage message={validationErrors['company.name']} /> : null}
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary/70" />
            <Label htmlFor="website" className="text-sm font-semibold">Website URL</Label>
          </div>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://acme.com"
            value={formState.company.website}
            onChange={(event) => onUpdateField(['company', 'website'], event.target.value)}
            className="h-10 border-muted/60 bg-background/50 focus:bg-background transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter]"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Factory className="h-4 w-4 text-primary/70" />
            <Label htmlFor="industry" className="text-sm font-semibold">Industry / Sector</Label>
          </div>
          <Input
            id="industry"
            name="industry"
            placeholder="e.g. SaaS, Retail, Healthcare"
            value={formState.company.industry}
            onChange={(event) => onUpdateField(['company', 'industry'], event.target.value)}
            className={cn(
              'h-10 border-muted/60 bg-background/50 focus:bg-background transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter]',
              validationErrors['company.industry'] && 'border-destructive/50 ring-destructive/20',
            )}
          />
          {validationErrors['company.industry'] ? <InlineValidationMessage message={validationErrors['company.industry']} /> : null}
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-primary/70" />
            <Label htmlFor="companySize" className="text-sm font-semibold">Company Size</Label>
          </div>
          <Input
            id="companySize"
            name="companySize"
            placeholder="e.g. 25 employees"
            value={formState.company.size}
            onChange={(event) => onUpdateField(['company', 'size'], event.target.value)}
            className="h-10 border-muted/60 bg-background/50 focus:bg-background transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter]"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary/70" />
          <Label htmlFor="locations" className="text-sm font-semibold">Target Locations</Label>
        </div>
        <Textarea
          id="locations"
          name="locations"
          placeholder="List primary offices or regions served"
          value={formState.company.locations}
          onChange={(event) => onUpdateField(['company', 'locations'], event.target.value)}
          className="min-h-[100px] resize-none border-muted/60 bg-background/50 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] focus:bg-background"
        />
      </div>
    </div>
  )
}

export function ProposalMarketingStepSection({ formState, validationErrors, onUpdateField, onToggleArrayValue, onChangeSocialHandle }: ProposalStepSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="budget">Monthly marketing budget</Label>
          <Input
            id="budget"
            name="budget"
            placeholder="e.g. £7,500"
            value={formState.marketing.budget}
            onChange={(event) => onUpdateField(['marketing', 'budget'], event.target.value)}
          />
          {validationErrors['marketing.budget'] ? <p className="mt-1 text-xs text-destructive">{validationErrors['marketing.budget']}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="adAccounts">Existing ad accounts?</Label>
          <Select value={formState.marketing.adAccounts} onValueChange={(value) => onUpdateField(['marketing', 'adAccounts'], value)}>
            <SelectTrigger id="adAccounts">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <Label className="text-base font-semibold">Current advertising platforms</Label>
          <p className="text-xs text-muted-foreground">Which platforms are you already using for ads?</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {marketingPlatforms.map((platform) => {
            const isSelected = formState.marketing.platforms.includes(platform)
            return (
              <button
                key={platform}
                type="button"
                onClick={() => onToggleArrayValue(['marketing', 'platforms'], platform)}
                aria-pressed={isSelected}
                className={cn(
                  `flex cursor-pointer items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`,
                  isSelected
                    ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm'
                    : 'border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/10',
                )}
              >
                <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>{platform}</span>
                <SelectionIndicator selected={isSelected} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Social handles</Label>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {socialHandles.map((handle) => {
            const Icon = socialHandleIcon(handle)

            return (
              <div key={handle} className="group space-y-2 rounded-xl border border-muted/50 bg-background/40 p-3 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:bg-background/80">
                <div className="mb-1 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">{handle}</Label>
                </div>
                <Input
                  name={`social-${handle}`}
                  placeholder="@company"
                  value={formState.marketing.socialHandles[handle] ?? ''}
                  onChange={(event) => onChangeSocialHandle(handle, event.target.value)}
                  className="h-8 border-muted/40 bg-transparent text-xs transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] focus:bg-background"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ProposalGoalsStepSection({ formState, validationErrors, onUpdateField, onToggleArrayValue }: ProposalStepSectionProps) {
  return (
    <div className={animatedStepClassName}>
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <Label className="text-base font-semibold">Primary Business Goals</Label>
          <p className="text-xs text-muted-foreground">What are you hoping to achieve in the next 6-12 months?</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {goalOptions.map((goal) => {
            const isSelected = formState.goals.objectives.includes(goal)
            return (
              <button
                key={goal}
                type="button"
                onClick={() => onToggleArrayValue(['goals', 'objectives'], goal)}
                aria-pressed={isSelected}
                className={cn(
                  `flex cursor-pointer items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`,
                  isSelected
                    ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm'
                    : 'border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/10',
                )}
              >
                <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>{goal}</span>
                <SelectionIndicator selected={isSelected} />
              </button>
            )
          })}
          {validationErrors['goals.objectives'] ? (
            <p className="col-span-full mt-1 flex items-center gap-1.5 px-1 text-[11px] font-medium text-destructive">
              <CircleAlert className="h-3 w-3" />
              {validationErrors['goals.objectives']}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="audience" className="text-base font-semibold">Target Audience</Label>
        <p className="mb-2 text-xs text-muted-foreground">Describe your ideal customer persona.</p>
        <Textarea
          id="audience"
          name="audience"
          placeholder="e.g. Marketing Managers at B2B SaaS companies with 50-200 employees"
          value={formState.goals.audience}
          onChange={(event) => onUpdateField(['goals', 'audience'], event.target.value)}
          className="min-h-[100px] resize-none border-muted/60 bg-background/50 shadow-inner transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] focus:bg-background"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <Label className="text-base font-semibold">Key Challenges</Label>
          <p className="text-xs text-muted-foreground">What&apos;s currently standing in your way?</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {challenges.map((challenge) => {
            const isSelected = formState.goals.challenges.includes(challenge)
            return (
              <button
                key={challenge}
                type="button"
                onClick={() => onToggleArrayValue(['goals', 'challenges'], challenge)}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-semibold transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter]',
                  isSelected
                    ? 'scale-[1.02] border-primary bg-primary text-primary-foreground shadow-md'
                    : 'border-muted bg-background text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/5',
                )}
              >
                {challenge}
              </button>
            )
          })}
        </div>
        <div className="pt-2">
          <Input
            name="customChallenge"
            placeholder="Other specific challenge…"
            value={formState.goals.customChallenge}
            onChange={(event) => onUpdateField(['goals', 'customChallenge'], event.target.value)}
            className="h-10 border-muted/60 bg-background/50 text-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] focus:bg-background"
          />
        </div>
      </div>
    </div>
  )
}

export function ProposalScopeStepSection({ formState, validationErrors, onUpdateField, onToggleArrayValue }: ProposalStepSectionProps) {
  return (
    <div className={animatedStepClassName}>
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <Label className="text-base font-semibold">Scope of Engagement</Label>
          <p className="text-xs text-muted-foreground">Select the services where you need our expertise.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {scopeOptions.map((service) => {
            const isSelected = formState.scope.services.includes(service)
            return (
              <button
                key={service}
                type="button"
                className={cn(
                  `flex cursor-pointer items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`,
                  isSelected
                    ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm'
                    : 'border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/10',
                )}
                onClick={() => onToggleArrayValue(['scope', 'services'], service)}
                aria-pressed={isSelected}
              >
                <div className="space-y-0.5">
                  <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>{service}</span>
                </div>
                <SelectionIndicator selected={isSelected} />
              </button>
            )
          })}
        </div>
        {validationErrors['scope.services'] ? <InlineValidationMessage message={validationErrors['scope.services']} /> : null}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="otherService" className="text-sm font-semibold">Specific Requirements</Label>
        <p className="mb-2 text-xs text-muted-foreground">Any other service or specific deliverable you need?</p>
        <Textarea
          id="otherService"
          name="otherService"
          placeholder="e.g. CRO Audit, Landing Page Design, etc."
          value={formState.scope.otherService}
          onChange={(event) => onUpdateField(['scope', 'otherService'], event.target.value)}
          className="min-h-[100px] resize-none border-muted/60 bg-background/50 shadow-inner transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] focus:bg-background"
        />
      </div>
    </div>
  )
}

export function ProposalTimelinesStepSection({ formState, onUpdateField }: ProposalStepSectionProps) {
  return (
    <div className={animatedStepClassName}>
      <div className="space-y-4">
        <Label className="text-base font-semibold">Project Timeline</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {startTimelineOptions.map((option) => {
            const isSelected = formState.timelines.startTime === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onUpdateField(['timelines', 'startTime'], option)}
                className={cn(
                  `flex items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`,
                  isSelected
                    ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm'
                    : 'border-muted/60 bg-background/50 hover:bg-muted/10',
                )}
              >
                <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>{option}</span>
                {isSelected ? <CircleCheck className="h-5 w-5 text-primary" /> : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="upcomingEvents" className="text-sm font-semibold">Upcoming Campaigns or Events</Label>
        <p className="mb-2 text-xs text-muted-foreground">Share launches or milestones we should plan for.</p>
        <Textarea
          id="upcomingEvents"
          name="upcomingEvents"
          placeholder="e.g. Q1 Product Launch, Black Friday Sales, etc."
          value={formState.timelines.upcomingEvents}
          onChange={(event) => onUpdateField(['timelines', 'upcomingEvents'], event.target.value)}
          className="min-h-[100px] resize-none border-muted/60 bg-background/50 shadow-inner transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] focus:bg-background"
        />
      </div>
    </div>
  )
}

export function ProposalValueStepSection({ formState, summary, validationErrors, onUpdateField }: ProposalStepSectionProps) {
  return (
    <div className={animatedStepClassName}>
      <div className="space-y-4">
        <Label className="text-base font-semibold">Estimated Project Value</Label>
        <p className="mb-4 text-xs text-muted-foreground">Choose the budget range that best fits the project.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {proposalValueOptions.map((option) => {
            const isSelected = formState.value.proposalSize === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onUpdateField(['value', 'proposalSize'], option)}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-2xl border p-6 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
                  isSelected
                    ? 'scale-[1.05] border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-lg'
                    : 'border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/5',
                )}
              >
                <span className={cn('text-lg font-bold', isSelected ? 'text-primary' : 'text-foreground')}>{option}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Per Month</span>
              </button>
            )
          })}
        </div>
        {validationErrors['value.proposalSize'] ? <InlineValidationMessage message={validationErrors['value.proposalSize']} /> : null}
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Engagement Type</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {engagementOptions.map((option) => {
            const isSelected = formState.value.engagementType === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onUpdateField(['value', 'engagementType'], option)}
                className={cn(
                  `flex items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`,
                  isSelected
                    ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm'
                    : 'border-muted/60 bg-background/50 hover:bg-muted/10',
                )}
              >
                <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>{option}</span>
                {isSelected ? <CircleCheck className="h-5 w-5 text-primary" /> : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4 border-t border-muted/20 pt-4">
        <div className="flex flex-col gap-1">
          <Label className="text-base font-semibold">Presentation Theme</Label>
          <p className="text-xs text-muted-foreground">Select a visual style for your generated proposal deck.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMMA_PRESENTATION_THEMES.map((theme) => {
            const isSelected = formState.value.presentationTheme === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onUpdateField(['value', 'presentationTheme'], theme.id)}
                className={cn(
                  'group relative flex flex-col gap-2 rounded-xl border p-4 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
                  isSelected
                    ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-md'
                    : 'border-muted/60 bg-background hover:border-muted-foreground/30 hover:shadow-sm',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className={cn('text-sm font-bold', isSelected ? 'text-primary' : 'text-foreground')}>{theme.name}</span>
                  {isSelected ? <CircleCheck className="h-4 w-4 text-primary" /> : null}
                </div>
                <p className="text-left text-[10px] text-muted-foreground">{theme.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      <Card className="border-dashed border-primary/20 bg-primary/5">
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