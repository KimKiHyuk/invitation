import { invitationData } from '../data/invitation'

export type InvitationAudience = 'standard' | 'senior'

export type InvitationViewMode = {
  audience: InvitationAudience
}

export const parseInvitationViewMode = (search: string): InvitationViewMode => {
  const params = new URLSearchParams(search)
  const legacyLargeText = ['1', 'true', 'on'].includes(params.get('large') ?? '')
  const audience = params.get('audience') === 'senior' || legacyLargeText ? 'senior' : 'standard'
  return { audience }
}

export const buildInvitationViewUrl = (baseUrl: string, mode: InvitationViewMode) => {
  const url = new URL(baseUrl)
  url.search = ''
  url.hash = ''
  if (mode.audience === 'senior') url.searchParams.set('audience', 'senior')
  return url.toString()
}

export const getInvitationModePresentation = () => ({
  title: invitationData.share.title,
  description: invitationData.seo.description,
  heroImagePath: '/images/winter-forest-transition.webp',
  shareImagePath: 'images/og-winter-white.jpg',
  themeColor: '#18352d',
})
