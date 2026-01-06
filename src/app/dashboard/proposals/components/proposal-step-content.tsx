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

import type { ProposalFormData } from '@/lib/proposals'
import { GAMMA_PRESENTATION_THEMES } from '@/lib/gamma-themes'

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
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Acme Corporation"
                value={formState.company.name}
                onChange={(event) => onUpdateField(['company', 'name'], event.target.value)}
              />
              {validationErrors['company.name'] && (
                <p className="mt-1 text-xs text-destructive">{validationErrors['company.name']}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://acme.com"
                value={formState.company.website}
                onChange={(event) => onUpdateField(['company', 'website'], event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry / Sector</Label>
              <Input
                id="industry"
                placeholder="e.g. SaaS, Retail, Healthcare"
                value={formState.company.industry}
                onChange={(event) => onUpdateField(['company', 'industry'], event.target.value)}
              />
              {validationErrors['company.industry'] && (
                <p className="mt-1 text-xs text-destructive">{validationErrors['company.industry']}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Input
                id="companySize"
                placeholder="e.g. 25 employees"
                value={formState.company.size}
                onChange={(event) => onUpdateField(['company', 'size'], event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locations">Locations</Label>
            <Textarea
              id="locations"
              placeholder="List primary offices or regions served"
              value={formState.company.locations}
              onChange={(event) => onUpdateField(['company', 'locations'], event.target.value)}
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

          <div className="space-y-3">
            <Label className="text-base">Current advertising platforms</Label>
            <p className="text-sm text-muted-foreground">Select all that apply.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {marketingPlatforms.map((platform) => {
                const isSelected = formState.marketing.platforms.includes(platform)
                return (
                  <label
                    key={platform}
                    className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all hover:bg-accent ${
                      isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggleArrayValue(['marketing', 'platforms'], platform)}
                    />
                    <span className="text-sm font-medium">{platform}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base">Social handles</Label>
            <div className="grid gap-4 md:grid-cols-2">
              {socialHandles.map((handle) => (
                <div key={handle} className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{handle}</Label>
                  <Input
                    placeholder={`https://.../${handle.toLowerCase().split(' ')[0]}`}
                    value={formState.marketing.socialHandles[handle] ?? ''}
                    onChange={(event) => onChangeSocialHandle(handle, event.target.value)}
                    className="h-9"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'goals':
      return (
        <div className="space-y-6">
          <div>
            <Label className="text-base">Primary goals</Label>
            <p className="mt-1 text-sm text-muted-foreground">Select all that apply to help us tailor the strategy.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {goalOptions.map((goal) => {
                const isSelected = formState.goals.objectives.includes(goal)
                return (
                  <label
                    key={goal}
                    className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all hover:bg-accent ${
                      isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggleArrayValue(['goals', 'objectives'], goal)}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <span className="font-medium leading-none">{goal}</span>
                    </div>
                  </label>
                )
              })}
            </div>
            {validationErrors['goals.objectives'] && (
              <p className="mt-2 text-xs text-destructive">{validationErrors['goals.objectives']}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience" className="text-base">Target audience</Label>
            <Textarea
              id="audience"
              className="min-h-[100px]"
              placeholder="Describe the demographics, regions, or personas you want to reach."
              value={formState.goals.audience}
              onChange={(event) => onUpdateField(['goals', 'audience'], event.target.value)}
            />
          </div>

          <div>
            <Label className="text-base">Current challenges</Label>
            <p className="mt-1 text-sm text-muted-foreground">Select the obstacles you are facing.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {challenges.map((challenge) => {
                const isSelected = formState.goals.challenges.includes(challenge)
                return (
                  <label
                    key={challenge}
                    className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all hover:bg-accent ${
                      isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggleArrayValue(['goals', 'challenges'], challenge)}
                      className="mt-0.5"
                    />
                    <span className="font-medium leading-none">{challenge}</span>
                  </label>
                )
              })}
            </div>
            {formState.goals.challenges.includes('Other') && (
              <Input
                className="mt-3"
                placeholder="Describe other challenges"
                value={formState.goals.customChallenge}
                onChange={(event) => onUpdateField(['goals', 'customChallenge'], event.target.value)}
              />
            )}
          </div>
        </div>
      )

    case 'scope':
      return (
        <div className="space-y-6">
          <div>
            <Label className="text-base">Services required</Label>
            <p className="mt-1 text-sm text-muted-foreground">Pick the specific areas where you need support.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {scopeOptions.map((service) => {
                const isSelected = formState.scope.services.includes(service)
                return (
                  <label
                    key={service}
                    className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all hover:bg-accent ${
                      isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggleArrayValue(['scope', 'services'], service)}
                      className="mt-0.5"
                    />
                    <span className="font-medium leading-none">{service}</span>
                  </label>
                )
              })}
            </div>
            {validationErrors['scope.services'] && (
              <p className="mt-2 text-xs text-destructive">{validationErrors['scope.services']}</p>
            )}
          </div>
          {formState.scope.services.includes('Other') && (
            <div className="space-y-2">
              <Label htmlFor="otherService">Other services</Label>
              <Input
                id="otherService"
                placeholder="Describe any other support you need"
                value={formState.scope.otherService}
                onChange={(event) => onUpdateField(['scope', 'otherService'], event.target.value)}
              />
            </div>
          )}
        </div>
      )

    case 'timelines':
      return (
        <div className="space-y-6">
          <div>
            <Label className="text-base">Preferred start timeline</Label>
            <div className="mt-4 flex flex-wrap gap-3">
              {startTimelineOptions.map((option) => {
                const isActive = formState.timelines.startTime === option
                return (
                  <Button
                    key={option}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => onUpdateField(['timelines', 'startTime'], option)}
                    className={`h-auto px-6 py-3 text-sm ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  >
                    {option}
                  </Button>
                )
              })}
            </div>
            {validationErrors['timelines.startTime'] && (
              <p className="mt-2 text-xs text-destructive">{validationErrors['timelines.startTime']}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="upcomingEvents" className="text-base">Upcoming campaigns or events</Label>
            <Textarea
              id="upcomingEvents"
              className="min-h-[120px]"
              placeholder="Share launches, seasonality, or milestones we should plan for."
              value={formState.timelines.upcomingEvents}
              onChange={(event) => onUpdateField(['timelines', 'upcomingEvents'], event.target.value)}
            />
          </div>
        </div>
      )

    case 'value':
      return (
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base">Expected proposal value</Label>
            <div className="flex flex-wrap gap-3">
              {proposalValueOptions.map((option) => {
                const isActive = formState.value.proposalSize === option
                return (
                  <Button
                    key={option}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => onUpdateField(['value', 'proposalSize'], option)}
                    className={`h-auto px-6 py-3 ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  >
                    {option}
                  </Button>
                )
              })}
            </div>
            {validationErrors['value.proposalSize'] && (
              <p className="mt-2 text-xs text-destructive">{validationErrors['value.proposalSize']}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base">Engagement preference</Label>
            <div className="flex flex-wrap gap-3">
              {engagementOptions.map((option) => {
                const isActive = formState.value.engagementType === option
                return (
                  <Button
                    key={option}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => onUpdateField(['value', 'engagementType'], option)}
                    className={`h-auto px-6 py-3 ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  >
                    {option}
                  </Button>
                )
              })}
            </div>
            {validationErrors['value.engagementType'] && (
              <p className="mt-2 text-xs text-destructive">{validationErrors['value.engagementType']}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes" className="text-base">Additional notes</Label>
            <Textarea
              id="additionalNotes"
              className="min-h-[100px]"
              placeholder="Anything else we should know before drafting your proposal?"
              value={formState.value.additionalNotes}
              onChange={(event) => onUpdateField(['value', 'additionalNotes'], event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="presentationTheme" className="text-base">Presentation theme</Label>
            <p className="text-sm text-muted-foreground">Choose a style for your AI-generated presentation deck.</p>
            <Select
              value={formState.value.presentationTheme || ''}
              onValueChange={(value) => onUpdateField(['value', 'presentationTheme'], value)}
            >
              <SelectTrigger id="presentationTheme" className="w-full max-w-xs">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {GAMMA_PRESENTATION_THEMES.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id || 'default'}>
                    <span className="font-medium">{theme.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{theme.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="border-dashed border-primary/20 bg-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Proposal summary</CardTitle>
              <CardDescription>Review the information before submitting.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Company</h4>
                <p className="text-muted-foreground">
                  {summary.company.name || '—'} · {summary.company.industry || '—'}
                </p>
                <p className="text-muted-foreground text-xs">{summary.company.website}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Marketing</h4>
                <p className="text-muted-foreground">Budget: {summary.marketing.budget || '—'}</p>
                <p className="text-muted-foreground">
                  {summary.marketing.platforms.length ? summary.marketing.platforms.join(', ') : 'No platforms'}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Goals</h4>
                <p className="text-muted-foreground">
                  {summary.goals.objectives.length ? summary.goals.objectives.join(', ') : 'Not specified'}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Scope</h4>
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