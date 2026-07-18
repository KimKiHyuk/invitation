const SEOUL_TIME_ZONE = 'Asia/Seoul'
const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000

const getSeoulDateParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map((part) => [part.type, Number(part.value)]))
  return { year: values.year, month: values.month, day: values.day }
}

export const calculateDday = (eventDateTime: string, now = new Date()) => {
  const { year, month, day } = getSeoulDateParts(now)
  const [targetYear, targetMonth, targetDay] = eventDateTime.slice(0, 10).split('-').map(Number)
  const todayInSeoul = Date.UTC(year, month - 1, day)
  const targetInSeoul = Date.UTC(targetYear, targetMonth - 1, targetDay)

  return Math.round((targetInSeoul - todayInSeoul) / ONE_DAY_MS)
}

export const getDdayPresentation = (dday: number) => {
  if (dday < 0) {
    return {
      label: '예식 완료',
      accessibleLabel: '예식이 완료되었습니다',
      bannerText: null,
      bannerAccessibleLabel: null,
    }
  }

  if (dday === 0) {
    return {
      label: 'D-DAY',
      accessibleLabel: '오늘 결혼식이 있습니다',
      bannerText: '오늘 결혼식이 있습니다',
      bannerAccessibleLabel: '오늘 결혼식이 있습니다',
    }
  }

  return {
    label: `D-${dday}`,
    accessibleLabel: `결혼식까지 ${dday}일 남았습니다`,
    bannerText: dday <= 14 ? `결혼식까지 D-${dday}` : null,
    bannerAccessibleLabel: dday <= 14 ? `결혼식까지 ${dday}일 남았습니다` : null,
  }
}

export const getMillisecondsUntilNextSeoulMidnight = (now = new Date()) => {
  const { year, month, day } = getSeoulDateParts(now)
  const nextSeoulMidnight = Date.UTC(year, month - 1, day + 1) - SEOUL_OFFSET_MS
  return Math.max(1000, nextSeoulMidnight - now.getTime() + 1000)
}
