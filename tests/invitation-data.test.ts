import { describe, expect, it } from 'vitest'

import { invitationData } from '../src/data/invitation'

describe('invitation data', () => {
  it('matches the reference-inspired static wedding letter structure', () => {
    expect(invitationData.hero.names).toEqual(['김기혁', '이은경'])
    expect(invitationData.hero.eyebrow).toBe("We're Getting Married")
    expect(invitationData.hero.actions.map((action) => action.label)).toEqual(['길찾기'])
    expect(invitationData.invitation.lines).toEqual([
      '늘 한결같은 사람과',
      '평생을 함께 하고자 합니다.',
      '저희의 새로운 시작을',
      '함께해 주시면 감사하겠습니다.',
    ])
    expect(invitationData.couple.groom.parents.length).toBeGreaterThan(0)
    expect(invitationData.couple.bride.parents.length).toBeGreaterThan(0)
    expect(invitationData.weddingInfo.eventDateTime).toBe('2026-12-19T12:30:00+09:00')
    expect(invitationData.gallery.items).toHaveLength(0)
    expect(invitationData.gallery.message).toEqual(['사진을 준비하고 있습니다.'])
    expect(invitationData.venue.links.length).toBe(3)
    expect(invitationData.venue.directions).toContainEqual({
      title: '지하철',
      details: [
        '경춘선',
        '남춘천역 2번 출구 · 도보 약 15분',
      ],
    })
    expect(invitationData.rsvp.formHref).toBe('')
    expect(invitationData.share.title).toBe('기혁 ♥ 은경 결혼합니다')
  })

  it('keeps gift account copy values and static-hosting friendly asset paths', () => {
    expect(invitationData.seo.url).toBe('https://kimkihyuk.github.io/invitation/')
    expect(invitationData.gift.enabled).toBe(true)
    expect(invitationData.gift.accounts.map(({ label, holder, bank, accountNumber }) => (
      [label, holder, bank, accountNumber]
    ))).toEqual([
      ['신랑', '김기혁', '토스뱅크', '1000-2578-6219'],
      ['신랑 아버지', '김안걸', '국민은행', '913501-01-221952'],
      ['신랑 어머니', '남의숙', '신한은행', '110 279 186113'],
      ['신부', '이은경', '신한은행', '110-455-761162'],
      ['신부 아버지', '이성우', '신한은행', '110 485 988347'],
      ['신부 어머니', '이순인', '농협', '301812-51-035871'],
    ])
    expect(invitationData.gift.accounts.filter((account) => account.side === 'groom')).toHaveLength(3)
    expect(invitationData.gift.accounts.filter((account) => account.side === 'bride')).toHaveLength(3)
    invitationData.gift.accounts.forEach((account) => {
      expect(account.copyValue).toContain(account.bank)
      expect(account.copyValue).toContain(account.accountNumber)
      expect(account.copyValue).toContain(account.holder)
    })

    expect(invitationData.venue.mapPreviewSrc.startsWith('/images/')).toBe(true)
  })
})
