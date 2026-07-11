# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-07-11
- Primary product surfaces: 모바일 청첩장 단일 페이지, 계좌 복사, 지도 앱 딥링크, 갤러리, 링크 공유
- Evidence reviewed:
  - `src/main.ts`, `src/style.css`, `src/data/invitation.ts`
  - `README.md`, `tests/*`
  - Reference: `https://juhonamnam.github.io/wedding-invitation/`
  - Reference: `https://revfactory.github.io/wedding-letter/`
  - Static-hosting constraint: GitHub Pages project page + private GitHub repo

## Brand
- Personality: 잔잔하고 정돈된 종이 청첩장, 과시적이지 않은 우아함, 모바일에서 읽기 쉬운 고전적 톤
- Trust signals: 일정과 장소의 즉시 노출, 길찾기 버튼의 선명한 우선순위, 계좌 복사 상태 피드백, 정적 호스팅에 맞는 안정적 동작
- Avoid: 서비스 대시보드 같은 밀도 높은 카드 UI, 과한 유리 효과, 스크롤 연출 중심 구조, 기능은 많은데 정적 배포에서 깨지는 경험

## Product goals
- Goals:
  - 첫 화면만으로 누구의 결혼식인지, 언제인지, 어디서 하는지 이해된다.
  - 종이 청첩장 같은 세로 흐름을 유지하면서도 모바일에서 정보 탐색이 쉽다.
  - 길찾기, 계좌 복사, 링크 공유가 분명한 액션으로 남는다.
  - GitHub Pages에서 서버 없이 안정적으로 동작한다.
- Non-goals:
  - 서버 저장이 필요한 RSVP/방명록 기능의 즉시 운영
  - 복잡한 애니메이션이나 스크롤 핀 인터랙션
  - 수십 장 갤러리 중심의 앨범형 경험
- Success signals:
  - Hero, 초대문, 예식일, 오시는 길, 계좌, 공유 순서가 자연스럽다.
  - 절대경로 없이 GitHub Pages 서브경로에서도 깨지지 않는다.
  - CTA는 적지만 명확하고, 비활성 기능은 오해 없게 처리된다.

## Personas and jobs
- Primary personas:
  - 모바일 메신저 링크로 유입된 하객
  - 길찾기와 일정만 빠르게 보려는 가족/지인
  - 멀리서 마음을 전하려는 사용자
- User jobs:
  - 예식 일시와 장소를 바로 본다.
  - 지도 앱을 열어 이동한다.
  - 계좌를 복사하거나 청첩장 링크를 공유한다.
- Key contexts of use:
  - 카카오톡/문자 인앱 브라우저
  - 한 손 스크롤
  - 예식 당일 재확인

## Information architecture
- Primary navigation: 단일 페이지 스크롤, 섹션 제목 중심, 하단 고정 CTA 보조
- Core routes/screens:
  - `#app` 단일 문서
  - 갤러리 라이트박스
- Content hierarchy:
  1. Hero cover: 이름, 날짜, 장소, 대표 사진
  2. Invitation: 짧은 초대 문구
  3. Couple: 양가 정보와 이름
  4. Calendar / D-day
  5. Gallery
  6. Venue / directions
  7. Gift accounts
  8. RSVP external CTA
  9. Share / footer

## Design principles
- Principle 1: 섹션은 카드가 아니라 한 장의 인쇄물처럼 이어진다.
- Principle 2: 정보 우선순위는 일정 → 장소 → 길찾기 → 계좌 → 공유다.
- Principle 3: 장식은 플로럴/종이 질감으로 제한하고 인터랙션은 최소화한다.
- Tradeoffs:
  - 서버가 필요한 기능은 정적 호스팅 친화적인 외부 링크 또는 준비 상태로 처리한다.
  - 화려한 모션보다 정적인 인상과 읽기 편한 여백을 선택한다.

## Visual language
- Color: 아이보리, 로지 베이지, 세이지 그린, 잉크 브라운
- Typography:
  - Display: `Cormorant Garamond`
  - Korean serif accent: `Nanum Myeongjo`
  - Body sans: `Pretendard`
- Spacing/layout rhythm: 좁고 긴 모바일 카드 1장처럼 중앙 정렬, 28-64px 수직 리듬
- Shape/radius/elevation: 아주 얕은 곡면과 얇은 테두리, 과한 그림자 금지
- Motion: 꽃잎/패럴랙스 대신 fade-up, 갤러리 전환, 복사 피드백 정도만 허용
- Imagery/iconography: 실제 웨딩 사진 + 얕은 보태니컬 장식, 앱 아이콘은 기능성 우선

## Components
- Existing components to reuse:
  - `src/lib/map-links.ts`
  - 계좌/주소 복사 로직
  - 지도 앱 딥링크 fallback 처리
- New/changed components:
  - `hero cover`
  - `invitation prose`
  - `couple cards`
  - `calendar block`
  - `gallery carousel + lightbox`
  - `venue map preview`
  - `gift account rows`
  - `floating quick actions`
- Variants and states:
  - 계좌 복사 성공
  - 공유 링크 복사 성공
  - RSVP 링크 있음 / 없음
  - 갤러리 단일 이미지 / 다중 이미지
- Token/component ownership:
  - 모든 토큰은 `src/style.css`
  - 모든 렌더링은 `src/main.ts`

## Accessibility
- Target standard: WCAG 2.1 AA
- Keyboard/focus behavior: 갤러리, 복사, 링크, 외부 이동 버튼 모두 포커스 링 유지
- Contrast/readability: 사진 위 텍스트는 직접 겹치지 않고 별도 종이 레이어 안에 배치
- Screen-reader semantics: 섹션마다 제목, 캘린더 caption, 갤러리 aria-label 제공
- Reduced motion and sensory considerations: reveal/transition 최소화, 라이트박스는 즉시 닫기 가능

## Responsive behavior
- Supported breakpoints/devices:
  - 320-430px 우선
  - 431-768px 확장 모바일
- Layout adaptations:
  - 기본은 단일 컬럼
  - 640px 이상에서 일부 2열 가능
- Touch/hover differences:
  - hover 의존 금지
  - 버튼 높이 44px 이상

## Interaction states
- Loading: 없음이 기본. 정적 이미지 우선
- Empty:
  - RSVP 링크가 없으면 “링크 준비 중” 상태 표시
  - 계좌 정보가 없으면 해당 섹션 숨김
- Error: 외부 앱 링크 실패 시 웹 URL fallback
- Success: 복사 후 버튼 라벨 일시 변경 + `aria-live`
- Disabled: 아직 연결되지 않은 RSVP CTA
- Offline/slow network: 지도는 정적 preview 이미지로도 의미가 있어야 함

## Content voice
- Tone: 공손하고 짧다. 감성 문장은 길지 않게 유지
- Terminology:
  - `초대합니다`
  - `예식일`
  - `오시는 길`
  - `마음 전하실 곳`
  - `청첩장 공유`
- Microcopy rules:
  - 문단은 2-4줄 단위
  - CTA는 동사형
  - 기능이 준비 중이면 숨기지 말고 상태를 명시

## Implementation constraints
- Framework/styling system: Vite + TypeScript, frameworkless DOM rendering
- Design-token constraints: CSS 변수 기반
- Performance constraints: static image 중심, no heavy SDK required for first paint
- Compatibility constraints:
  - GitHub Pages project path 대응
  - 절대경로 금지
  - 서버리스 API 의존 제거
- Test/screenshot expectations:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
  - 모바일 기준 브라우저 확인

## Open questions
- [ ] GitHub private repo 이름과 owner는 무엇인지
- [ ] RSVP를 외부 폼 링크로 연결할지, 일단 비활성 상태로 둘지
- [ ] 실제 배포용 계좌/문구/연락처 최종값은 무엇인지
