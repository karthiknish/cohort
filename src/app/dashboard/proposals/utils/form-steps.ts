import { createDefaultProposalForm, type ProposalFormData } from '@/lib/proposals'
import type { ProposalStep } from '../components/proposal-step-indicator'
import type { ProposalStepId } from '../components/proposal-step-content'

export const proposalSteps: ProposalStep[] = [
  {
    id: 'company',
    title: 'Company Information',
    description: 'Tell us who you are and where you operate.',
  },
  {
    id: 'marketing',
    title: 'Marketing & Advertising',
    description: 'Share how you currently market and advertise.',
  },
  {
    id: 'goals',
    title: 'Business Goals',
    description: 'Help us understand what success looks like.',
  },
  {
    id: 'scope',
    title: 'Scope of Work',
    description: 'Choose the services you need support with.',
  },
  {
    id: 'timelines',
    title: 'Timelines & Priorities',
    description: 'Let us know when you want to get started.',
  },
  {
    id: 'value',
    title: 'Proposal Value',
    description: 'Set expectations around budget and engagement.',
  },
]

export function createInitialProposalFormState(): ProposalFormData {
  return createDefaultProposalForm()
}

export const stepErrorPaths: Record<ProposalStepId, string[]> = {
  company: ['company.name', 'company.industry'],
  marketing: ['marketing.budget'],
  goals: ['goals.objectives'],
  scope: ['scope.services'],
  timelines: ['timelines.startTime'],
  value: ['value.proposalSize', 'value.engagementType'],
}

export function validateProposalStep(stepId: ProposalStepId, form: ProposalFormData): boolean {
  switch (stepId) {
    case 'company':
      return form.company.name.trim().length > 0 && form.company.industry.trim().length > 0
    case 'marketing':
      return form.marketing.budget.trim().length > 0
    case 'goals':
      return form.goals.objectives.length > 0
    case 'scope':
      return form.scope.services.length > 0
    case 'timelines':
      return form.timelines.startTime.trim().length > 0
    case 'value':
      return form.value.proposalSize.trim().length > 0 && form.value.engagementType.trim().length > 0
    default:
      return true
  }
}

export function collectStepValidationErrors(stepId: ProposalStepId, form: ProposalFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  switch (stepId) {
    case 'company':
      if (!form.company.name.trim()) {
        errors['company.name'] = 'Company name is required.'
      }
      if (!form.company.industry.trim()) {
        errors['company.industry'] = 'Industry is required.'
      }
      break
    case 'marketing':
      if (!form.marketing.budget.trim()) {
        errors['marketing.budget'] = 'Please provide your monthly marketing budget.'
      }
      break
    case 'goals':
      if (form.goals.objectives.length === 0) {
        errors['goals.objectives'] = 'Select at least one primary goal.'
      }
      break
    case 'scope':
      if (form.scope.services.length === 0) {
        errors['scope.services'] = 'Select at least one service.'
      }
      break
    case 'timelines':
      if (!form.timelines.startTime.trim()) {
        errors['timelines.startTime'] = 'Choose a preferred start timeline.'
      }
      break
    case 'value':
      if (!form.value.proposalSize.trim()) {
        errors['value.proposalSize'] = 'Select an expected proposal value.'
      }
      if (!form.value.engagementType.trim()) {
        errors['value.engagementType'] = 'Select an engagement preference.'
      }
      break
    default:
      break
  }

  return errors
}

export function hasCompletedAnyStepData(form: ProposalFormData): boolean {
  if (form.company.name.trim() && form.company.industry.trim()) {
    return true
  }

  if (form.marketing.budget.trim().length > 0) {
    return true
  }

  if (form.goals.objectives.length > 0) {
    return true
  }

  if (form.scope.services.length > 0) {
    return true
  }

  if (form.timelines.startTime.trim().length > 0) {
    return true
  }

  if (form.value.proposalSize.trim().length > 0 && form.value.engagementType.trim().length > 0) {
    return true
  }

  return false
}
