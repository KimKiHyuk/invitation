import { describe, expect, it } from 'vitest'

import { calculateDday, getDdayPresentation, getMillisecondsUntilNextSeoulMidnight } from '../src/lib/dday'

const eventDateTime = '2026-12-19T12:30:00+09:00'

describe('KST wedding D-day', () => {
  it.each([
    ['2026-08-09T00:00:00+09:00', 132],
    ['2026-12-05T23:59:59+09:00', 14],
    ['2026-12-18T12:00:00+09:00', 1],
    ['2026-12-19T23:59:59+09:00', 0],
    ['2026-12-20T00:00:00+09:00', -1],
  ])('calculates %s as D-day %i', (now, expected) => {
    expect(calculateDday(eventDateTime, new Date(now))).toBe(expected)
  })

  it('shows the top banner from D-365 through the wedding day', () => {
    expect(getDdayPresentation(366).bannerText).toBeNull()
    expect(getDdayPresentation(365).bannerText).toBe('결혼식까지 D-365')
    expect(getDdayPresentation(132).bannerText).toBe('결혼식까지 D-132')
    expect(getDdayPresentation(14).bannerText).toBe('결혼식까지 D-14')
    expect(getDdayPresentation(1).bannerText).toBe('결혼식까지 D-1')
    expect(getDdayPresentation(0).bannerText).toBe('오늘 결혼식이 있습니다')
    expect(getDdayPresentation(-1).bannerText).toBeNull()
    expect(getDdayPresentation(-1).label).toBe('예식 완료')
  })

  it('schedules the refresh just after the next KST midnight', () => {
    const now = new Date('2026-12-18T14:59:00.000Z')
    expect(getMillisecondsUntilNextSeoulMidnight(now)).toBe(61_000)
  })
})
