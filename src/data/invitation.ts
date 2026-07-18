export const invitationData = {
  seo: {
    title: '민준 ♡ 서연 | 모바일 청첩장',
    description:
      '김민준과 이서연의 결혼식에 소중한 분들을 초대합니다. 2026년 10월 17일 토요일 오후 12시 30분, 춘천 미래컨벤션웨딩홀.',
  },
  hero: {
    eyebrow: 'A Winter Wedding',
    savedate: 'OUR WINTER PROMISE',
    dateStamp: '2026.10.17 SAT',
    names: ['김민준', '이서연'],
    summary: ['2026년 10월 17일 토요일 오후 12시 30분', '춘천 미래컨벤션웨딩홀'],
    image: {
      src: '/images/photos/hero.jpg',
      alt: '정원 길을 함께 걷는 신랑 신부 웨딩 사진',
    },
    actions: [
      { label: '길찾기', href: '#location', kind: 'primary' },
      { label: '마음 전하기', href: '#gift', kind: 'secondary' },
    ],
  },
  invitation: {
    kicker: 'Invitation',
    title: '초대합니다',
    lines: [
      '고요한 겨울빛이 머무는 날',
      '저희 두 사람이 하나가 되려 합니다.',
      '',
      '포근한 온기 속에서 맞이하는',
      '저희의 새로운 시작을',
      '따뜻한 마음으로 함께 축복해 주세요.',
    ],
    script: 'A warm promise in the winter light.',
  },
  couple: {
    title: '신랑 신부',
    groom: {
      role: '신랑',
      name: '김민준',
      englishName: 'Minjun Kim',
      parents: '김재현 · 손수진 의 장남',
      message: '차분한 온기로 오래 곁을 밝히는 사람입니다.',
    },
    bride: {
      role: '신부',
      name: '이서연',
      englishName: 'Seoyeon Lee',
      parents: '이성호 · 정미영 의 장녀',
      message: '환한 미소로 계절을 포근하게 바꾸는 사람입니다.',
    },
  },
  weddingInfo: {
    title: '예식일',
    dateValue: '2026년 10월 17일 토요일 오후 12시 30분',
    eventDateTime: '2026-10-17T12:30:00+09:00',
    calendarMonthLabel: 'October 2026',
    venueName: '미래컨벤션웨딩홀',
    venueHall: '웨딩홀 단독층',
    address: '강원 춘천시 퇴계로 118',
  },
  gallery: {
    title: '우리의 순간',
    message: ['겨울빛처럼 반짝였던 순간들을', '조용히 나누고 싶습니다.'],
    items: [
      {
        src: '/images/photos/gallery-1.jpg',
        alt: '신랑 신부가 서로를 바라보는 웨딩 사진',
      },
      {
        src: '/images/photos/gallery-2.jpg',
        alt: '자연광 아래에서 함께 걷는 신랑 신부 웨딩 사진',
      },
      {
        src: '/images/photos/gallery-3.jpg',
        alt: '환하게 웃는 신랑 신부 웨딩 사진',
      },
      {
        src: '/images/photos/gallery-4.jpg',
        alt: '나란히 서 있는 신랑 신부 웨딩 사진',
      },
    ],
  },
  venue: {
    title: '오시는 길',
    name: '미래컨벤션웨딩홀',
    hall: '춘천 미래컨벤션웨딩홀',
    address: '강원 춘천시 퇴계로 118',
    latitude: 37.861,
    longitude: 127.7323,
    mapPreviewSrc: '/images/naver-map-preview.png',
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
        href: 'https://www.tmap.co.kr/tmap2/mobile/route.jsp?name=%EB%AF%B8%EB%9E%98%EC%BB%A8%EB%B2%A4%EC%85%98%EC%9B%A8%EB%94%A9%ED%99%80',
        appHref:
          'tmap://route?rGoName=%EB%AF%B8%EB%9E%98%EC%BB%A8%EB%B2%A4%EC%85%98%EC%9B%A8%EB%94%A9%ED%99%80&rGoX=127.7323&rGoY=37.861',
      },
    ],
    directions: [
      {
        title: '자가용 / 주차',
        details: [
          '예식장 주차장을 이용하실 수 있습니다.',
          '주차 및 현장 동선은 도착 후 안내 표지를 함께 확인해 주세요.',
        ],
      },
      {
        title: '대중교통',
        details: [
          '춘천 시내 방향 버스에서 하차 후 도보 이동이 가능합니다.',
          '가장 편한 지도 앱으로 길찾기를 열어 이동해 주세요.',
        ],
      },
    ],
  },
  gift: {
    title: '마음 전하실 곳',
    description: '멀리서도 전해주시는 따뜻한 마음을 감사히 간직하겠습니다.',
    accounts: [
      {
        id: 'groom',
        side: 'groom',
        label: '신랑',
        name: '김민준',
        bank: '토스뱅크',
        accountNumber: '1000-0000-0000',
        holder: '김민준',
        copyValue: '토스뱅크 1000-0000-0000 김민준',
      },
      {
        id: 'bride',
        side: 'bride',
        label: '신부',
        name: '이서연',
        bank: '카카오뱅크',
        accountNumber: '3333-00-0000000',
        holder: '이서연',
        copyValue: '카카오뱅크 3333-00-0000000 이서연',
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
    title: '청첩장 공유',
    description: '카카오톡으로 소중한 분들께 청첩장을 전해 주세요.',
    kakaoLabel: '카카오톡으로 공유하기',
    fallbackLabel: '공유 링크 복사',
  },
  footer: {
    note: '겨울빛을 닮은 따뜻한 축복과 소중한 걸음에 깊이 감사드립니다.',
    signature: 'MINJUN & SEOYEON · 2026',
  },
} as const
