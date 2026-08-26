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
  const isSenior = mode.audience === 'senior'
  const themeLabel = isWhite ? '화이트 윈터' : isWinterV2 ? '포근한 겨울' : '겨울빛'
  const audienceLabel = isSenior ? '큰글씨 청첩장' : '청첩장'

  return {
    title: `기혁 ♥ 은경 | ${themeLabel} ${audienceLabel}`,
    description: isSenior
      ? '큰 글씨로 편안하게 준비한 기혁과 은경의 겨울 결혼식 초대장입니다.'
      : '기혁과 은경의 겨울 결혼식에 소중한 분들을 초대합니다.',
    heroImagePath: isWhite ? '/images/winter-white-transition.jpg' : '/images/winter-forest-transition.webp',
    shareImagePath: 'images/og-winter-white.jpg',
    themeColor: isWhite ? '#f5f6f2' : isWinterV2 ? '#e8e0d2' : '#18352d',
  }
}
