import { describe, expect, it } from 'vitest'

import { invitationData } from '../src/data/invitation'

describe('invitation data', () => {
  it('matches the reference-inspired static wedding letter structure', () => {
    expect(invitationData.hero.names).toEqual(['김민준', '이서연'])
    expect(invitationData.hero.actions.map((action) => action.label)).toEqual(['길찾기', '마음 전하기'])
    expect(invitationData.invitation.lines.length).toBeGreaterThanOrEqual(4)
    expect(invitationData.couple.groom.parents.length).toBeGreaterThan(0)
    expect(invitationData.couple.bride.parents.length).toBeGreaterThan(0)
    expect(invitationData.weddingInfo.eventDateTime).toBe('2026-10-17T12:30:00+09:00')
    expect(invitationData.gallery.items.length).toBeGreaterThanOrEqual(4)
    expect(invitationData.venue.links.length).toBe(3)
    expect(invitationData.rsvp.formHref).toBe('')
  })

  it('keeps gift account copy values and static-hosting friendly asset paths', () => {
    invitationData.gift.accounts.forEach((account) => {
      expect(account.copyValue).toContain(account.bank)
      expect(account.copyValue).toContain(account.accountNumber)
      expect(account.copyValue).toContain(account.holder)
    })

    expect(invitationData.hero.image.src.startsWith('/images/')).toBe(true)
    expect(invitationData.gallery.items.every((item) => item.src.startsWith('/images/'))).toBe(true)
    expect(invitationData.venue.mapPreviewSrc.startsWith('/images/')).toBe(true)
  })
})
