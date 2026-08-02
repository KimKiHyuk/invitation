export type InvitationTheme = 'winter' | 'white'
export type InvitationAudience = 'standard' | 'senior'

export type InvitationViewMode = {
  theme: InvitationTheme
  audience: InvitationAudience
}

export const parseInvitationViewMode = (search: string): InvitationViewMode => {
  const params = new URLSearchParams(search)
  const theme = params.get('theme') === 'white' ? 'white' : 'winter'
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
  const isSenior = mode.audience === 'senior'
  const themeLabel = isWhite ? '화이트 윈터' : '겨울빛'
  const audienceLabel = isSenior ? '큰글씨 청첩장' : '청첩장'

  return {
    title: `민준 ♥ 서연 | ${themeLabel} ${audienceLabel}`,
    description: isSenior
      ? '큰 글씨로 편안하게 준비한 민준과 서연의 겨울 결혼식 초대장입니다.'
      : '민준과 서연의 겨울 결혼식에 소중한 분들을 초대합니다.',
    heroImagePath: isWhite ? '/images/winter-white-transition.jpg' : '/images/winter-forest-transition.webp',
    shareImagePath: isWhite ? 'images/og-winter-white.jpg' : 'images/og-couple-placeholder.jpg',
    themeColor: isWhite ? '#f5f6f2' : '#18352d',
  }
}
