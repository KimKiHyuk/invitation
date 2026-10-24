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

  it.each([
    [366, 'D-366', '결혼식까지 366일 남았습니다'],
    [365, 'D-365', '결혼식까지 365일 남았습니다'],
    [56, 'D-56', '결혼식까지 56일 남았습니다'],
    [1, 'D-1', '결혼식까지 1일 남았습니다'],
    [0, 'D-DAY', '오늘 결혼식이 있습니다'],
    [-1, '예식 완료', '예식이 완료되었습니다'],
  ])('provides the same persistent and calendar status for %i days', (dday, label, accessibleLabel) => {
    expect(getDdayPresentation(dday)).toEqual({ label, accessibleLabel })
  })

  it('schedules the refresh just after the next KST midnight', () => {
    const now = new Date('2026-12-18T14:59:00.000Z')
    expect(getMillisecondsUntilNextSeoulMidnight(now)).toBe(61_000)
  })
})
