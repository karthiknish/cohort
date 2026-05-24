import { parseNavigationIntent } from '@/domain/agent/navigation-intents'

import type { AgentRequestContextType } from '../../types'

import {
  buildCollaborationRoute,
  includesAnyPhrase,
  normalizeIntentText,
  wantsOrganicSocialIntent,
} from './parsing'

export function resolveDeterministicNavigationIntent(message: string, context?: AgentRequestContextType): { route: string; message: string } | null {
  const normalized = normalizeIntentText(message)

  if (includesAnyPhrase(normalized, ['for you', 'my feed', 'personalized digest', 'workspace digest', 'recommendations for me'])) {
    return { route: '/for-you', message: 'Opening For You with your personalized highlights.' }
  }

  if (includesAnyPhrase(normalized, ['proposal analytics', 'proposal metrics', 'proposal win rate', 'proposal funnel'])) {
    return { route: '/dashboard/proposals/analytics', message: 'Opening Proposal analytics.' }
  }

  if (includesAnyPhrase(normalized, ['intake forms', 'client forms', 'form submissions', 'workspace forms', 'lead form', 'open forms', 'checklist'])) {
    return { route: '/dashboard/projects', message: 'Opening Projects for delivery and checklists.' }
  }

  if (
    includesAnyPhrase(normalized, ['team management', 'invite teammate', 'workspace staff', 'internal team directory', 'admin team'])
    && includesAnyPhrase(normalized, ['team', 'staff', 'teammate', 'invite', 'workspace'])
  ) {
    return { route: '/admin/team', message: 'Opening Team management.' }
  }

  const meetingIntent = includesAnyPhrase(normalized, ['meeting', 'meet', 'google meet', 'call', 'calendar', 'invite'])
  const meetingTask = includesAnyPhrase(normalized, ['schedule', 'scedule', 'start', 'join', 'reschedule', 'cancel', 'book', 'set up', 'setup', 'quick meet'])
  if (meetingIntent && meetingTask) return { route: '/dashboard/meetings', message: 'Opening Meetings so you can schedule or start the call.' }

  const socialNavigation = includesAnyPhrase(normalized, [
    'open',
    'go to',
    'take me',
    'show',
    'view',
    'check',
    'connect',
    'setup',
    'set up',
    'configure',
  ])
  if (wantsOrganicSocialIntent(normalized) && socialNavigation) {
    return {
      route: '/dashboard/socials',
      message: includesAnyPhrase(normalized, ['connect', 'link', 'setup', 'set up'])
        ? 'Opening Socials so you can connect Meta and choose a Facebook Page.'
        : 'Opening Socials for organic Facebook and Instagram metrics.',
    }
  }

  const adsIntent = includesAnyPhrase(normalized, ['ads', 'ad campaign', 'campaign', 'ad spend', 'roas', 'creative', 'google ads', 'meta ads', 'facebook ads', 'tiktok ads', 'linkedin ads'])
  const adsNavigation = includesAnyPhrase(normalized, ['open', 'go to', 'take me', 'show', 'view', 'check', 'manage', 'sync', 'connect', 'setup', 'set up', 'configure', 'optimize'])
  if (adsIntent && adsNavigation) return { route: '/dashboard/ads', message: 'Opening Ads Hub so you can manage campaigns and ad tasks.' }

  const collaborationIntent = includesAnyPhrase(normalized, ['collaboration', 'chat', 'message', 'messages', 'team chat', 'team channel', 'direct message', 'dm', 'discussion', 'thread', 'conversation'])
  const collaborationNavigation = includesAnyPhrase(normalized, ['open', 'go to', 'take me', 'show', 'view', 'check', 'bring me', 'navigate', 'reply', 'send'])
  if (collaborationIntent && collaborationNavigation) {
    if (includesAnyPhrase(normalized, ['project chat', 'project collaboration', 'project discussion', 'this project']) && context?.activeProjectId) {
      return { route: buildCollaborationRoute({ activeProjectId: context.activeProjectId, channelType: 'project' }), message: 'Opening project collaboration.' }
    }
    if (includesAnyPhrase(normalized, ['client chat', 'client collaboration', 'client thread', 'this client']) && context?.activeClientId) {
      return { route: buildCollaborationRoute({ activeClientId: context.activeClientId, channelType: 'client' }), message: 'Opening the client collaboration space.' }
    }
    if (includesAnyPhrase(normalized, ['team chat', 'team channel', 'team collaboration', 'internal chat'])) {
      return { route: buildCollaborationRoute({ channelType: 'team' }), message: 'Opening team collaboration.' }
    }
    return { route: '/dashboard/collaboration', message: 'Opening Collaboration for you.' }
  }

  const parsedNavigationIntent = parseNavigationIntent(message)
  const hasExplicitNavVerb = includesAnyPhrase(normalized, ['go to', 'take me', 'open', 'show', 'view', 'navigate', 'check', 'bring me'])
  if (parsedNavigationIntent && (parsedNavigationIntent.confidence >= 0.75 || hasExplicitNavVerb)) {
    if (parsedNavigationIntent.route === '/dashboard/meetings') {
      return { route: '/dashboard/meetings', message: 'Opening Meetings so you can handle scheduling and call actions.' }
    }
    return { route: parsedNavigationIntent.route, message: `Opening ${parsedNavigationIntent.name} for you.` }
  }

  return null
}
