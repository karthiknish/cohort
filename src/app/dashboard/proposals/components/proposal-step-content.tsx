'use client'

import { memo } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Globe, Factory, Users2, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube, CircleAlert, CircleCheck, Sparkles } from 'lucide-react'

import type { ProposalFormData } from '@/lib/proposals'
import { GAMMA_PRESENTATION_THEMES } from '@/lib/gamma-themes'
import { cn } from '@/lib/utils'

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

export type ProposalStepId = 'company' | 'marketing' | 'goals' | 'scope' | 'timelines' | 'value'

interface ProposalStepContentProps {
  stepId: ProposalStepId
  formState: ProposalFormData
  summary: ProposalFormData
  validationErrors: Record<string, string>
  onUpdateField: (path: string[], value: string) => void
  onToggleArrayValue: (path: string[], value: string) => void
  onChangeSocialHandle: (handle: string, value: string) => void
}

function ProposalStepContentComponent({
  stepId,
  formState,
  summary,
  validationErrors,
  onUpdateField,
  onToggleArrayValue,
  onChangeSocialHandle,
}: ProposalStepContentProps) {
  switch (stepId) {
    case 'company':
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary/70" />
                <Label htmlFor="companyName" className="font-semibold text-sm">Company Name</Label>
              </div>
              <Input
                id="companyName"
                placeholder="Acme Corporation"
                value={formState.company.name}
                onChange={(event) => onUpdateField(['company', 'name'], event.target.value)}
                className={cn(
                   "h-11 border-muted/60 bg-background/50 focus:bg-background transition-all",
                   validationErrors['company.name'] && "border-destructive/50 ring-destructive/20"
                )}
              />
              {validationErrors['company.name'] && (
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive px-1">
                  <CircleAlert className="h-3 w-3" />
                  {validationErrors['company.name']}
                </p>
              )}
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary/70" />
                <Label htmlFor="website" className="font-semibold text-sm">Website URL</Label>
              </div>
              <Input
                id="website"
                type="url"
                placeholder="https://acme.com"
                value={formState.company.website}
                onChange={(event) => onUpdateField(['company', 'website'], event.target.value)}
                className="h-11 border-muted/60 bg-background/50 focus:bg-background transition-all"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-primary/70" />
                <Label htmlFor="industry" className="font-semibold text-sm">Industry / Sector</Label>
              </div>
              <Input
                id="industry"
                placeholder="e.g. SaaS, Retail, Healthcare"
                value={formState.company.industry}
                onChange={(event) => onUpdateField(['company', 'industry'], event.target.value)}
                className={cn(
                   "h-11 border-muted/60 bg-background/50 focus:bg-background transition-all",
                   validationErrors['company.industry'] && "border-destructive/50 ring-destructive/20"
                )}
              />
              {validationErrors['company.industry'] && (
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive px-1">
                  <CircleAlert className="h-3 w-3" />
                  {validationErrors['company.industry']}
                </p>
              )}
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-primary/70" />
                <Label htmlFor="companySize" className="font-semibold text-sm">Company Size</Label>
              </div>
              <Input
                id="companySize"
                placeholder="e.g. 25 employees"
                value={formState.company.size}
                onChange={(event) => onUpdateField(['company', 'size'], event.target.value)}
                className="h-11 border-muted/60 bg-background/50 focus:bg-background transition-all"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary/70" />
              <Label htmlFor="locations" className="font-semibold text-sm">Target Locations</Label>
            </div>
            <Textarea
              id="locations"
              placeholder="List primary offices or regions served"
              value={formState.company.locations}
              onChange={(event) => onUpdateField(['company', 'locations'], event.target.value)}
              className="min-h-[100px] border-muted/60 bg-background/50 focus:bg-background transition-all resize-none"
            />
          </div>
        </div>
      )

    case 'marketing':
      return (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget">Monthly marketing budget</Label>
              <Input
                id="budget"
                placeholder="e.g. £7,500"
                value={formState.marketing.budget}
                onChange={(event) => onUpdateField(['marketing', 'budget'], event.target.value)}
              />
              {validationErrors['marketing.budget'] && (
                <p className="mt-1 text-xs text-destructive">{validationErrors['marketing.budget']}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="adAccounts">Existing ad accounts?</Label>
              <Select
                value={formState.marketing.adAccounts}
                onValueChange={(value) => onUpdateField(['marketing', 'adAccounts'], value)}
              >
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
                  <label
                    key={platform}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
                      isSelected 
                        ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm" 
                        : "border-muted/60 bg-background/50 hover:bg-muted/10 hover:border-muted-foreground/30"
                    )}
                  >
                    <span className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground")}>{platform}</span>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggleArrayValue(['marketing', 'platforms'], platform)}
                      className={cn("h-5 w-5 rounded-md transition-all", isSelected && "ring-2 ring-primary ring-offset-2")}
                    />
                  </label>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Social handles</Label>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {socialHandles.map((handle) => {
                 let Icon = Globe
                 if (handle === 'Facebook') Icon = Facebook
                 if (handle === 'Instagram') Icon = Instagram
                 if (handle === 'LinkedIn') Icon = Linkedin
                 if (handle === 'TikTok') Icon = Globe // No TikTok icon in basic Lucide usually, or might be branded
                 if (handle === 'X / Twitter') Icon = Twitter
                 if (handle === 'YouTube') Icon = Youtube

                 return (
                  <div key={handle} className="space-y-2 p-3 rounded-xl border border-muted/50 bg-background/40 hover:bg-background/80 transition-all group">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">{handle}</Label>
                    </div>
                    <Input
                      placeholder={`@company`}
                      value={formState.marketing.socialHandles[handle] ?? ''}
                      onChange={(event) => onChangeSocialHandle(handle, event.target.value)}
                      className="h-8 text-xs border-muted/40 bg-transparent focus:bg-background transition-all"
                    />
                  </div>
                 )
              })}
            </div>
          </div>
        </div>
      )

    case 'goals':
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label className="text-base font-semibold">Primary Business Goals</Label>
              <p className="text-xs text-muted-foreground">What are you hoping to achieve in the next 6-12 months?</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {goalOptions.map((goal) => {
                const isSelected = formState.goals.objectives.includes(goal)
                return (
                  <label
                    key={goal}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
                      isSelected 
                        ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm" 
                        : "border-muted/60 bg-background/50 hover:bg-muted/10 hover:border-muted-foreground/30"
                    )}
                  >
                    <span className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground")}>{goal}</span>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggleArrayValue(['goals', 'objectives'], goal)}
                      className={cn("h-5 w-5 rounded-md transition-all", isSelected && "ring-2 ring-primary ring-offset-2")}
                    />
                  </label>
                )
              })}
              {validationErrors['goals.objectives'] && (
                <p className="col-span-full mt-1 flex items-center gap-1.5 text-[11px] font-medium text-destructive px-1">
                  <CircleAlert className="h-3 w-3" />
                  {validationErrors['goals.objectives']}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="audience" className="text-base font-semibold">Target Audience</Label>
            <p className="text-xs text-muted-foreground mb-2">Describe your ideal customer persona.</p>
            <Textarea
              id="audience"
              placeholder="e.g. Marketing Managers at B2B SaaS companies with 50-200 employees"
              value={formState.goals.audience}
              onChange={(event) => onUpdateField(['goals', 'audience'], event.target.value)}
              className="min-h-[100px] border-muted/60 bg-background/50 focus:bg-background transition-all resize-none shadow-inner"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label className="text-base font-semibold">Key Challenges</Label>
              <p className="text-xs text-muted-foreground">What's currently standing in your way?</p>
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
                      "px-4 py-2 rounded-full text-xs font-semibold transition-all border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                        : "bg-background text-muted-foreground border-muted hover:border-muted-foreground/30 hover:bg-muted/5"
                    )}
                  >
                    {challenge}
                  </button>
                )
              })}
            </div>
            <div className="pt-2">
              <Input
                placeholder="Other specific challenge..."
                value={formState.goals.customChallenge}
                onChange={(event) => onUpdateField(['goals', 'customChallenge'], event.target.value)}
                className="h-10 text-sm border-muted/60 bg-background/50 focus:bg-background transition-all"
              />
            </div>
          </div>
        </div>
      )

    case 'scope':
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label className="text-base font-semibold">Scope of Engagement</Label>
              <p className="text-xs text-muted-foreground">Select the services where you need our expertise.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {scopeOptions.map((service) => {
                const isSelected = formState.scope.services.includes(service)
                return (
                  <label
                    key={service}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
                      isSelected 
                        ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm" 
                        : "border-muted/60 bg-background/50 hover:bg-muted/10 hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="space-y-0.5">
                      <span className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground")}>{service}</span>
                    </div>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggleArrayValue(['scope', 'services'], service)}
                      className={cn("h-5 w-5 rounded-md transition-all", isSelected && "ring-2 ring-primary ring-offset-2")}
                    />
                  </label>
                )
              })}
            </div>
            {validationErrors['scope.services'] && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-destructive px-1">
                <CircleAlert className="h-3 w-3" />
                {validationErrors['scope.services']}
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="otherService" className="text-sm font-semibold">Specific Requirements</Label>
            <p className="text-xs text-muted-foreground mb-2">Any other service or specific deliverable you need?</p>
            <Textarea
              id="otherService"
              placeholder="e.g. CRO Audit, Landing Page Design, etc."
              value={formState.scope.otherService}
              onChange={(event) => onUpdateField(['scope', 'otherService'], event.target.value)}
              className="min-h-[100px] border-muted/60 bg-background/50 focus:bg-background transition-all resize-none shadow-inner"
            />
          </div>
        </div>
      )

    case 'timelines':
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                      "flex items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
                      isSelected 
                        ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm" 
                        : "border-muted/60 bg-background/50 hover:bg-muted/10"
                    )}
                  >
                    <span className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground")}>{option}</span>
                    {isSelected && <CircleCheck className="h-5 w-5 text-primary" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="upcomingEvents" className="text-sm font-semibold">Upcoming Campaigns or Events</Label>
            <p className="text-xs text-muted-foreground mb-2">Share launches or milestones we should plan for.</p>
            <Textarea
              id="upcomingEvents"
              placeholder="e.g. Q1 Product Launch, Black Friday Sales, etc."
              value={formState.timelines.upcomingEvents}
              onChange={(event) => onUpdateField(['timelines', 'upcomingEvents'], event.target.value)}
              className="min-h-[100px] border-muted/60 bg-background/50 focus:bg-background transition-all resize-none shadow-inner"
            />
          </div>
        </div>
      )

    case 'value':
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Estimated Project Value</Label>
            <p className="text-xs text-muted-foreground mb-4">Choose the budget range that best fits the project.</p>
            <div className="grid gap-4 md:grid-cols-3">
              {proposalValueOptions.map((option) => {
                const isSelected = formState.value.proposalSize === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onUpdateField(['value', 'proposalSize'], option)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-2xl border p-6 transition-all duration-300",
                      isSelected
                        ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-lg scale-[1.05]"
                        : "border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/5"
                    )}
                  >
                    <span className={cn("text-lg font-bold", isSelected ? "text-primary" : "text-foreground")}>{option}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Per Month</span>
                  </button>
                )
              })}
            </div>
            {validationErrors['value.proposalSize'] && (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-destructive px-1">
                <CircleAlert className="h-3 w-3" />
                {validationErrors['value.proposalSize']}
              </p>
            )}
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
                      "flex items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
                      isSelected
                        ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-sm"
                        : "border-muted/60 bg-background/50 hover:bg-muted/10"
                    )}
                  >
                    <span className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground")}>{option}</span>
                    {isSelected && <CircleCheck className="h-5 w-5 text-primary" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-muted/20">
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
                      "group relative flex flex-col gap-2 rounded-xl border p-4 transition-all duration-300",
                      isSelected
                        ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-md"
                        : "border-muted/60 bg-background hover:border-muted-foreground/30 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={cn("text-sm font-bold", isSelected ? "text-primary" : "text-foreground")}>{theme.name}</span>
                      {isSelected && <CircleCheck className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-left">{theme.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <Card className="border-dashed border-primary/20 bg-primary/5">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Proposal summary</CardTitle>
              </div>
              <CardDescription>Review the information before submitting.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Company</h4>
                <p className="text-muted-foreground">
                  {summary.company.name || '—'} · {summary.company.industry || '—'}
                </p>
                <p className="text-muted-foreground text-xs">{summary.company.website}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Marketing</h4>
                <p className="text-muted-foreground">Budget: {summary.marketing.budget || '—'}</p>
                <p className="text-muted-foreground">
                  {summary.marketing.platforms.length ? summary.marketing.platforms.join(', ') : 'No platforms'}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Goals</h4>
                <p className="text-muted-foreground">
                  {summary.goals.objectives.length ? summary.goals.objectives.join(', ') : 'Not specified'}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Scope</h4>
                <p className="text-muted-foreground">
                  {summary.scope.services.length ? summary.scope.services.join(', ') : 'Not selected'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    default:
      return null
  }
}

export const ProposalStepContent = memo(ProposalStepContentComponent)