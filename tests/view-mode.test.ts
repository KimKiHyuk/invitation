import { describe, expect, it } from 'vitest'
import {
  buildInvitationViewUrl,
  getInvitationModePresentation,
  parseInvitationViewMode,
} from '../src/lib/view-mode'

describe('invitation text modes', () => {
  it.each([
    ['', 'standard'],
    ['?theme=white&audience=standard', 'standard'],
    ['?theme=winter-v2', 'standard'],
    ['?theme=white&audience=senior', 'senior'],
    ['?audience=senior', 'senior'],
    ['?large=1', 'senior'],
    ['?audience=unknown', 'standard'],
  ])('keeps the main invitation and parses text size for %s', (search, audience) => {
    expect(parseInvitationViewMode(search)).toEqual({ audience })
  })

  it('shares the main URL without theme parameters and preserves large text when requested', () => {
    const base = 'https://kimkihyuk.github.io/invitation/?theme=white&debug=1#location'
    expect(buildInvitationViewUrl(base, { audience: 'standard' }))
      .toBe('https://kimkihyuk.github.io/invitation/')
    expect(buildInvitationViewUrl(base, { audience: 'senior' }))
      .toBe('https://kimkihyuk.github.io/invitation/?audience=senior')
  })

  it('keeps the main hero, theme color, and sharing metadata', () => {
    expect(getInvitationModePresentation()).toEqual({
      title: '기혁 ♥ 은경 결혼합니다',
      description: '2026년 12월 19일 토요일 오후 12시 30분, 춘천 미래웨딩홀 1층 빌라드엠홀.',
      heroImagePath: '/images/winter-forest-transition.webp',
      shareImagePath: 'images/og-winter-white.jpg',
      themeColor: '#18352d',
    })
  })
})
