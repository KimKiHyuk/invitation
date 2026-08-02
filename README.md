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

화면 구성은 동일하게 유지하고 `theme`과 `audience` 쿼리로 색감과 글자 크기를 고정합니다.

| 대상 | 겨울빛 모드 | 화이트 윈터 모드 |
| --- | --- | --- |
| 일반 글씨 | [`?theme=winter&audience=standard`](https://kimkihyuk.github.io/invitation/?theme=winter&audience=standard) | [`?theme=white&audience=standard`](https://kimkihyuk.github.io/invitation/?theme=white&audience=standard) |
| 큰글씨 | [`?theme=winter&audience=senior`](https://kimkihyuk.github.io/invitation/?theme=winter&audience=senior) | [`?theme=white&audience=senior`](https://kimkihyuk.github.io/invitation/?theme=white&audience=senior) |

카카오톡 공유는 현재 모드의 URL, 제목, 설명, 대표 이미지를 그대로 전달합니다. GitHub Pages는 쿼리별 정적 HTML 응답을 만들 수 없으므로 일반 링크 미리보기의 기본 OG 태그는 겨울빛 모드를 사용하고, 카카오 SDK 공유 데이터는 실행 시 모드별로 분기합니다.

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
