import { describe, expect, it } from 'vitest'

import {
  buildInvitationViewUrl,
  getInvitationModePresentation,
  parseInvitationViewMode,
} from '../src/lib/view-mode'

describe('invitation view modes', () => {
  it.each([
    ['', { theme: 'winter', audience: 'standard' }],
    ['?theme=winter&audience=standard', { theme: 'winter', audience: 'standard' }],
    ['?theme=white&audience=standard', { theme: 'white', audience: 'standard' }],
    ['?theme=winter&audience=senior', { theme: 'winter', audience: 'senior' }],
    ['?theme=white&audience=senior', { theme: 'white', audience: 'senior' }],
    ['?theme=winter-v2', { theme: 'winter-v2', audience: 'standard' }],
    ['?large=1', { theme: 'winter', audience: 'senior' }],
  ])('parses %s', (search, expected) => {
    expect(parseInvitationViewMode(search)).toEqual(expected)
  })

  it('builds a canonical query URL without unrelated parameters or fragments', () => {
    expect(
      buildInvitationViewUrl('https://kimkihyuk.github.io/invitation/?debug=1#location', {
        theme: 'white',
        audience: 'senior',
      }),
    ).toBe('https://kimkihyuk.github.io/invitation/?theme=white&audience=senior')
  })

  it('uses distinct sharing presentations for white and senior modes', () => {
    const standard = getInvitationModePresentation({ theme: 'winter', audience: 'standard' })
    const winterV2 = getInvitationModePresentation({ theme: 'winter-v2', audience: 'standard' })
    const whiteSenior = getInvitationModePresentation({ theme: 'white', audience: 'senior' })

    expect(standard.shareImagePath).toBe('images/og-winter-white.jpg')
    expect(whiteSenior.shareImagePath).toBe('images/og-winter-white.jpg')
    expect(whiteSenior.title).toContain('화이트 윈터')
    expect(whiteSenior.title).toContain('큰글씨')
    expect(winterV2.title).toContain('포근한 겨울')
    expect(winterV2.themeColor).toBe('#e8e0d2')
  })
})
