import { invitationData } from '../data/invitation'

export type InvitationTheme = 'winter' | 'white' | 'winter-v2'
export type InvitationAudience = 'standard' | 'senior'

export type InvitationViewMode = {
  theme: InvitationTheme
  audience: InvitationAudience
}

export const parseInvitationViewMode = (search: string): InvitationViewMode => {
  const params = new URLSearchParams(search)
  const themeParam = params.get('theme')
  const theme = themeParam === 'white' || themeParam === 'winter-v2' ? themeParam : 'winter'
  const legacyLargeText = ['1', 'true', 'on'].includes(params.get('large') ?? '')
  const audience = params.get('audience') === 'senior' || legacyLargeText ? 'senior' : 'standard'

  return { theme, audience }
}

export const buildInvitationViewUrl = (baseUrl: string, mode: InvitationViewMode) => {
  const url = new URL(baseUrl)
  url.search = ''
  url.hash = ''
  url.searchParams.set('theme', mode.theme)
  url.searchParams.set('audience', mode.audience)
  return url.toString()
}

export const getInvitationModePresentation = (mode: InvitationViewMode) => {
  const isWhite = mode.theme === 'white'
  const isWinterV2 = mode.theme === 'winter-v2'
  return {
    title: invitationData.share.title,
    description: invitationData.seo.description,
    heroImagePath: isWhite ? '/images/winter-white-transition.jpg' : '/images/winter-forest-transition.webp',
    shareImagePath: 'images/og-winter-white.jpg',
    themeColor: isWhite ? '#f5f6f2' : isWinterV2 ? '#e8e0d2' : '#18352d',
  }
}
