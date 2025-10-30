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
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
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
            <div>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
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
            <div>
              <Label htmlFor="companySize">Company Size</Label>
              <Input
                id="companySize"
                placeholder="e.g. 25 employees"
                value={formState.company.size}
                onChange={(event) => onUpdateField(['company', 'size'], event.target.value)}
              />
            </div>
          </div>

          <div>
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
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
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
            <div>
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

          <div>
            <Label>Current advertising platforms</Label>
            <p className="mt-1 text-xs text-muted-foreground">Select all that apply.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {marketingPlatforms.map((platform) => (
                <label
                  key={platform}
                  className="flex items-center space-x-2 rounded-md border border-muted bg-background px-3 py-2"
                >
                  <Checkbox
                    checked={formState.marketing.platforms.includes(platform)}
                    onChange={() => onToggleArrayValue(['marketing', 'platforms'], platform)}
                  />
                  <span className="text-sm">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Social handles</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {socialHandles.map((handle) => (
                <div key={handle}>
                  <Label className="text-xs font-medium text-muted-foreground">{handle}</Label>
                  <Input
                    placeholder={`https://.../${handle.toLowerCase().split(' ')[0]}`}
                    value={formState.marketing.socialHandles[handle] ?? ''}
                    onChange={(event) => onChangeSocialHandle(handle, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'goals':
      return (
        <div className="space-y-5">
          <div>
            <Label>Primary goals</Label>
            <p className="mt-1 text-sm text-muted-foreground">Select all that apply.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {goalOptions.map((goal) => (
                <label
                  key={goal}
                  className="flex items-center space-x-2 rounded-md border border-muted bg-background px-3 py-2"
                >
                  <Checkbox
                    checked={formState.goals.objectives.includes(goal)}
                    onChange={() => onToggleArrayValue(['goals', 'objectives'], goal)}
                  />
                  <span className="text-sm">{goal}</span>
                </label>
              ))}
            </div>
            {validationErrors['goals.objectives'] && (
              <p className="mt-2 text-xs text-destructive">{validationErrors['goals.objectives']}</p>
            )}
          </div>

          <div>
            <Label htmlFor="audience">Target audience</Label>
            <Textarea
              id="audience"
              placeholder="Describe the demographics, regions, or personas you want to reach."
              value={formState.goals.audience}
              onChange={(event) => onUpdateField(['goals', 'audience'], event.target.value)}
            />
          </div>

          <div>
            <Label>Current challenges</Label>
            <p className="mt-1 text-sm text-muted-foreground">Select the obstacles you are facing.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {challenges.map((challenge) => (
                <label
                  key={challenge}
                  className="flex items-center space-x-2 rounded-md border border-muted bg-background px-3 py-2"
                >
                  <Checkbox
                    checked={formState.goals.challenges.includes(challenge)}
                    onChange={() => onToggleArrayValue(['goals', 'challenges'], challenge)}
                  />
                  <span className="text-sm">{challenge}</span>
                </label>
              ))}
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
        <div className="space-y-5">
          <div>
            <Label>Services required</Label>
            <p className="mt-1 text-sm text-muted-foreground">Pick the specific areas where you need support.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {scopeOptions.map((service) => (
                <label
                  key={service}
                  className="flex items-center space-x-2 rounded-md border border-muted bg-background px-3 py-2"
                >
                  <Checkbox
                    checked={formState.scope.services.includes(service)}
                    onChange={() => onToggleArrayValue(['scope', 'services'], service)}
                  />
                  <span className="text-sm">{service}</span>
                </label>
              ))}
            </div>
            {validationErrors['scope.services'] && (
              <p className="mt-2 text-xs text-destructive">{validationErrors['scope.services']}</p>
            )}
          </div>
          {formState.scope.services.includes('Other') && (
            <div>
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
        <div className="space-y-5">
          <div>
            <Label>Preferred start timeline</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {startTimelineOptions.map((option) => {
                const isActive = formState.timelines.startTime === option
                return (
                  <Button
                    key={option}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => onUpdateField(['timelines', 'startTime'], option)}
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

          <div>
            <Label htmlFor="upcomingEvents">Upcoming campaigns or events</Label>
            <Textarea
              id="upcomingEvents"
              placeholder="Share launches, seasonality, or milestones we should plan for."
              value={formState.timelines.upcomingEvents}
              onChange={(event) => onUpdateField(['timelines', 'upcomingEvents'], event.target.value)}
            />
          </div>
        </div>
      )

    case 'value':
      return (
        <div className="space-y-6">
          <div>
            <Label>Expected proposal value</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {proposalValueOptions.map((option) => {
                const isActive = formState.value.proposalSize === option
                return (
                  <Button
                    key={option}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => onUpdateField(['value', 'proposalSize'], option)}
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

          <div>
            <Label>Engagement preference</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {engagementOptions.map((option) => {
                const isActive = formState.value.engagementType === option
                return (
                  <Button
                    key={option}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => onUpdateField(['value', 'engagementType'], option)}
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

          <div>
            <Label htmlFor="additionalNotes">Additional notes</Label>
            <Textarea
              id="additionalNotes"
              placeholder="Anything else we should know before drafting your proposal?"
              value={formState.value.additionalNotes}
              onChange={(event) => onUpdateField(['value', 'additionalNotes'], event.target.value)}
            />
          </div>

          <Card className="border-dashed border-muted-foreground/40">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Proposal summary</CardTitle>
              <CardDescription>Review the information before submitting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground">Company</h4>
                <p className="text-muted-foreground">
                  {summary.company.name || '—'} · {summary.company.industry || '—'} · {summary.company.size || 'Size not provided'}
                </p>
                <p className="text-muted-foreground">Website: {summary.company.website || '—'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Marketing</h4>
                <p className="text-muted-foreground">Budget: {summary.marketing.budget || '—'}</p>
                <p className="text-muted-foreground">
                  Platforms: {summary.marketing.platforms.length ? summary.marketing.platforms.join(', ') : 'None selected'}
                </p>
                <p className="text-muted-foreground">Ad accounts: {summary.marketing.adAccounts}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Goals & Challenges</h4>
                <p className="text-muted-foreground">
                  Goals: {summary.goals.objectives.length ? summary.goals.objectives.join(', ') : 'Not specified'}
                </p>
                <p className="text-muted-foreground">
                  Challenges: {summary.goals.challenges.length ? summary.goals.challenges.join(', ') : 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Scope & Timeline</h4>
                <p className="text-muted-foreground">
                  Services: {summary.scope.services.length ? summary.scope.services.join(', ') : 'Not selected'}
                </p>
                <p className="text-muted-foreground">Start: {summary.timelines.startTime || 'No preference'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Value & Engagement</h4>
                <p className="text-muted-foreground">Expected value: {summary.value.proposalSize || 'Not specified'}</p>
                <p className="text-muted-foreground">Engagement: {summary.value.engagementType || 'Not specified'}</p>
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