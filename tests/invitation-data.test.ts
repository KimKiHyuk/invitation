import { describe, expect, it } from 'vitest'

import { invitationData } from '../src/data/invitation'

describe('invitation data', () => {
  it('matches the reference-inspired static wedding letter structure', () => {
    expect(invitationData.hero.names).toEqual(['김기혁', '이은경'])
    expect(invitationData.hero.actions.map((action) => action.label)).toEqual(['길찾기'])
    expect(invitationData.invitation.lines.length).toBeGreaterThanOrEqual(4)
    expect(invitationData.couple.groom.parents.length).toBeGreaterThan(0)
    expect(invitationData.couple.bride.parents.length).toBeGreaterThan(0)
    expect(invitationData.weddingInfo.eventDateTime).toBe('2026-12-19T12:30:00+09:00')
    expect(invitationData.gallery.items).toHaveLength(0)
    expect(invitationData.venue.links.length).toBe(3)
    expect(invitationData.venue.directions).toContainEqual({
      title: '지하철',
      details: [
        '경춘선',
        '남춘천역 2번 출구 · 도보 약 15분',
      ],
    })
    expect(invitationData.rsvp.formHref).toBe('')
  })

  it('keeps gift account copy values and static-hosting friendly asset paths', () => {
    expect(invitationData.seo.url).toBe('https://kimkihyuk.github.io/invitation/')
    expect(invitationData.gift.accounts).toHaveLength(6)
    expect(invitationData.gift.accounts.filter((account) => account.side === 'groom')).toHaveLength(3)
    expect(invitationData.gift.accounts.filter((account) => account.side === 'bride')).toHaveLength(3)
    invitationData.gift.accounts.forEach((account) => {
      expect(account.bank).toBe('0000')
      expect(account.accountNumber).toBe('0000')
      expect(account.copyValue).toContain(account.bank)
      expect(account.copyValue).toContain(account.accountNumber)
      expect(account.copyValue).toContain(account.holder)
    })

    expect(invitationData.venue.mapPreviewSrc.startsWith('/images/')).toBe(true)
  })
})
