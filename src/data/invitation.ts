export const invitationData = {
  seo: {
    url: 'https://kimkihyuk.github.io/invitation/',
    title: '기혁 ♥ 은경',
    description:
      '김기혁과 이은경의 결혼식에 소중한 분들을 초대합니다. 2026년 12월 19일 토요일 오후 12시 30분, 춘천 미래웨딩홀 1층 빌라드엠홀.',
  },
  hero: {
    eyebrow: '결혼합니다',
    dateStamp: '2026.12.19 SAT',
    names: ['김기혁', '이은경'],
    summary: ['2026년 12월 19일 토요일 오후 12시 30분', '춘천 미래웨딩홀 · 1층 빌라드엠홀'],
    actions: [{ label: '길찾기', href: '#location', kind: 'primary' }],
  },
  invitation: {
    kicker: 'Invitation',
    title: '초대합니다',
    lines: [
      '늘 한결같은 사람과 평생을 함께 하고자 합니다.',
      '',
      '저희의 새로운 시작을 함께해 주시면 감사하겠습니다.',
    ],
  },
  couple: {
    title: '신랑 신부',
    groom: {
      role: '신랑',
      name: '김기혁',
      parents: '김안걸 · 남의숙의 아들',
    },
    bride: {
      role: '신부',
      name: '이은경',
      parents: '이성우 · 이순인의 딸',
    },
  },
  weddingInfo: {
    title: '예식일',
    dateValue: '2026년 12월 19일 토요일 오후 12시 30분',
    eventDateTime: '2026-12-19T12:30:00+09:00',
    calendarMonthLabel: 'December 2026',
    venueName: '미래웨딩홀',
    venueHall: '1층 빌라드엠홀',
    address: '강원특별자치도 춘천시 퇴계로 118 미래컨벤션웨딩홀',
  },
  gallery: {
    title: '우리의 순간',
    message: ['사진을 준비하고 있습니다.'],
    items: [] as Array<{ src: string; alt: string }>,
  },
  venue: {
    title: '오시는 길',
    name: '미래웨딩홀',
    hall: '1층 빌라드엠홀',
    address: '강원특별자치도 춘천시 퇴계로 118 미래컨벤션웨딩홀',
    latitude: 37.861,
    longitude: 127.7323,
    mapPreviewSrc: '/images/naver-map-preview.avif',
    links: [
      {
        label: '카카오맵',
        tone: 'kakao',
        description: '현재 위치 기준 길찾기',
        href: 'https://map.kakao.com/link/to/%EB%AF%B8%EB%9E%98%EC%BB%A8%EB%B2%A4%EC%85%98%EC%9B%A8%EB%94%A9%ED%99%80,37.861,127.7323',
      },
      {
        label: '네이버맵',
        tone: 'naver',
        description: '내비게이션 바로 실행',
        href: 'https://naver.me/xHgpQQ2i',
        appHref:
          'nmap://navigation?dlat=37.861&dlng=127.7323&dname=%EB%AF%B8%EB%9E%98%EC%BB%A8%EB%B2%A4%EC%85%98%EC%9B%A8%EB%94%A9%ED%99%80&appname={APP_URL}',
        androidIntentHref:
          'intent://navigation?dlat=37.861&dlng=127.7323&dname=%EB%AF%B8%EB%9E%98%EC%BB%A8%EB%B2%A4%EC%85%98%EC%9B%A8%EB%94%A9%ED%99%80&appname={APP_URL}#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end',
      },
      {
        label: '티맵',
        tone: 'tmap',
        description: '차량 길안내 바로 실행',
        href: 'https://www.tmap.co.kr/tmap2/mobile/route.jsp?name=%EB%AF%B8%EB%9E%98%EC%BB%A8%EB%B2%A4%EC%85%98%EC%9B%A8%EB%94%A9%ED%99%80&lon=127.7323&lat=37.861',
        appHref:
          'tmap://route?goalname=%EB%AF%B8%EB%9E%98%EC%BB%A8%EB%B2%A4%EC%85%98%EC%9B%A8%EB%94%A9%ED%99%80&goalx=127.7323&goaly=37.861',
        androidIntentHref:
          'intent://route?goalname=%EB%AF%B8%EB%9E%98%EC%BB%A8%EB%B2%A4%EC%85%98%EC%9B%A8%EB%94%A9%ED%99%80&goalx=127.7323&goaly=37.861#Intent;scheme=tmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.skt.tmap.ku;end',
      },
    ],
    directions: [
      {
        title: '주차',
        details: ['미래웨딩홀 주차장을 이용하실 수 있습니다.'],
      },
      {
        title: '지하철',
        details: [
          '경춘선',
          '남춘천역 2번 출구 · 도보 약 15분',
        ],
      },
    ],
  },
  gift: {
    title: '마음 전하실 곳',
    description: '멀리서도 전해주시는 따뜻한 마음을 감사히 간직하겠습니다.',
    accounts: [
      {
        id: 'groom-self',
        side: 'groom',
        label: '신랑',
        name: '김기혁',
        bank: '0000',
        accountNumber: '0000',
        holder: '김기혁',
        copyValue: '0000 0000 김기혁',
      },
      {
        id: 'groom-father',
        side: 'groom',
        label: '신랑 아버지',
        name: '김안걸',
        bank: '0000',
        accountNumber: '0000',
        holder: '김안걸',
        copyValue: '0000 0000 김안걸',
      },
      {
        id: 'groom-mother',
        side: 'groom',
        label: '신랑 어머니',
        name: '남의숙',
        bank: '0000',
        accountNumber: '0000',
        holder: '남의숙',
        copyValue: '0000 0000 남의숙',
      },
      {
        id: 'bride-self',
        side: 'bride',
        label: '신부',
        name: '이은경',
        bank: '0000',
        accountNumber: '0000',
        holder: '이은경',
        copyValue: '0000 0000 이은경',
      },
      {
        id: 'bride-father',
        side: 'bride',
        label: '신부 아버지',
        name: '이성우',
        bank: '0000',
        accountNumber: '0000',
        holder: '이성우',
        copyValue: '0000 0000 이성우',
      },
      {
        id: 'bride-mother',
        side: 'bride',
        label: '신부 어머니',
        name: '이순인',
        bank: '0000',
        accountNumber: '0000',
        holder: '이순인',
        copyValue: '0000 0000 이순인',
      },
    ],
  },
  rsvp: {
    title: '참석 의사 전달',
    description: '참석 의사 전달 링크는 곧 정리해 안내드리겠습니다.',
    ctaLabel: '추후 안내 예정',
    formHref: '',
    note: '궁금하신 사항은 신랑 신부에게 편하게 연락 부탁드립니다.',
  },
  share: {
    kakaoLabel: '카카오톡으로 공유하기',
  },
  footer: {
    signature: '김기혁 · 이은경 드림',
  },
} as const
