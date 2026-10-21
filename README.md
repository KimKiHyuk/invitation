# invitation

레퍼런스 프로젝트를 바탕으로 다시 구성한 **정적 모바일 청첩장** 프로젝트입니다.

## References
- [`revfactory/wedding-letter`](https://github.com/revfactory/wedding-letter)
- [`juhonamnam/wedding-invitation`](https://github.com/juhonamnam/wedding-invitation)

## 현재 구성
- Vite + TypeScript
- 단일 페이지 정적 청첩장
- 중앙 카드형 레이아웃
- Hero → 초대문 → 신랑/신부 → 예식일 → 갤러리 → 오시는 길 → 계좌 → RSVP → 공유 구조
- 지도 앱 딥링크: 카카오맵 / 네이버맵 / 티맵
- 계좌 복사 / 카카오톡 공유
- GitHub Pages 배포 전제

## 보기 모드

기본 URL에서는 겨울빛 메인 테마를 표시합니다. 테마별 쿼리 분기는 제거했으며, 이전 테마 링크로 접근해도 같은 메인 청첩장이 표시됩니다.

우측 상단 `큰글씨` 버튼으로 일반/큰글씨 보기를 전환할 수 있습니다. 큰글씨 직접 링크는 `?audience=senior`입니다. 카카오톡 공유도 일반 보기에서는 기본 URL, 큰글씨 보기에서는 큰글씨 URL을 전달합니다.

## 청첩장 QR

기본 겨울빛 일반 모드인 `https://kimkihyuk.github.io/invitation/`을 연결합니다.

- 인쇄용 벡터: `public/invitation-qr.svg`
- 고해상도 PNG: `public/invitation-qr.png` (1600×1600)
- 오류정정 H, 흑백, 8모듈 quiet zone

## 실행
```bash
npm install
npm run dev
```

## 검증
```bash
npm run lint
npm run test
npm run build
```

## 수정 포인트
주요 내용은 `src/data/invitation.ts`에서 바꿉니다.

- 이름 / 양가 정보 / 예식 정보
- 대표 문구
- 갤러리 이미지 경로
- 지도 링크 / 주소
- 계좌 정보
- RSVP 외부 폼 링크

## RSVP 처리
GitHub Pages는 정적 호스팅이라 저장형 RSVP API를 직접 운영하지 않습니다.

`src/data/invitation.ts`의 아래 값을 채우면 외부 폼으로 연결됩니다.

```ts
rsvp: {
  title: '참석 의사 전달',
  description: '정적 배포에서는 외부 폼 링크를 연결해 참석 의사를 받을 수 있습니다.',
  ctaLabel: '참석 링크 열기',
  formHref: 'https://forms.gle/...',
  note: '외부 RSVP 폼 링크를 입력하면 버튼이 즉시 활성화됩니다.',
}
```

비어 있으면 버튼은 `링크 준비 중` 상태로 렌더링됩니다.

## GitHub Pages 배포
이 저장소는 `base: './'` 설정을 써서 GitHub Pages project site에 맞게 빌드됩니다.

1. GitHub repo 생성
2. 이 프로젝트 푸시
3. GitHub Settings → Pages → Source를 `GitHub Actions`로 설정
4. `.github/workflows/deploy-pages.yml`이 자동 배포

## 주의
- 이미지 경로는 `/images/...` 형식으로 유지하고, 실제 렌더링 시 `BASE_URL`이 자동으로 붙습니다.
- 배포 전에는 계좌번호, 문구, RSVP 링크를 반드시 실데이터로 다시 확인해야 합니다.

## License
MIT
