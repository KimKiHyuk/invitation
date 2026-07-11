# Handoff: Mobile Wedding Invite Rebuild + GitHub Pages Deploy

## 목적
- 제공된 레퍼런스를 참고해 모바일 청첩장을 재구성했다.
- 정적 호스팅 대상은 `Vercel`이 아니라 `GitHub Pages`로 전환했다.
- 다음 세션에서는 `private GitHub repo 생성 -> push -> GitHub Pages 배포 확인`만 마무리하면 된다.

## 현재 상태
- UI/구조 리빌드: 완료
- GitHub Pages 정적 호스팅 대응: 완료
- 로컬 검증: 완료
- GitHub 인증: 완료
- Git 초기화 / remote 생성 / push / Pages 실제 배포: 미완료

## 이미 끝난 작업

### 1. 디자인 방향 재정의
- 기준 레퍼런스:
  - `https://revfactory.github.io/wedding-letter/`
  - `https://juhonamnam.github.io/wedding-invitation/`
- 실제 구현은 `revfactory/wedding-letter` 쪽에 더 가깝게 맞췄다.
  - 중앙 정렬 카드형
  - 아이보리/로지/세이지 톤
  - 종이 질감 느낌
  - `초대합니다 -> 신랑 신부 -> 예식일 -> 갤러리 -> 오시는 길 -> 마음 전하실 곳 -> RSVP -> 공유` 구조

### 2. 수정된 주요 파일
- [DESIGN.md](/Users/key/mobile-wedding-invite/DESIGN.md)
- [README.md](/Users/key/mobile-wedding-invite/README.md)
- [index.html](/Users/key/mobile-wedding-invite/index.html)
- [vite.config.ts](/Users/key/mobile-wedding-invite/vite.config.ts)
- [src/main.ts](/Users/key/mobile-wedding-invite/src/main.ts)
- [src/style.css](/Users/key/mobile-wedding-invite/src/style.css)
- [src/data/invitation.ts](/Users/key/mobile-wedding-invite/src/data/invitation.ts)
- [tests/invitation-data.test.ts](/Users/key/mobile-wedding-invite/tests/invitation-data.test.ts)
- [.github/workflows/deploy-pages.yml](/Users/key/mobile-wedding-invite/.github/workflows/deploy-pages.yml)
- [.gitignore](/Users/key/mobile-wedding-invite/.gitignore)

### 3. 정적 호스팅 전환 내용
- `vite.config.ts`에 `base: './'` 적용
- `index.html`의 asset/meta 경로를 `BASE_URL` 기준으로 정리
- `src/main.ts`에서 `withBase()`로 정적 자산 경로 처리
- RSVP는 서버리스 API 대신 외부 폼 링크 방식으로 변경
  - 현재 `src/data/invitation.ts`의 `rsvp.formHref`는 빈 문자열
  - 그래서 버튼은 현재 `참석 링크 준비 중` 상태

### 4. 로컬 검증 결과
- `npm run lint`: 통과
- `npm run test`: 통과
- `npm run build`: 통과
- 로컬 preview 확인 완료

## 중요 구현 포인트

### RSVP
- GitHub Pages는 정적 호스팅이라 저장형 RSVP API를 직접 운영하지 않음
- 실제 운영 시 아래만 채우면 됨:

```ts
rsvp: {
  title: '참석 의사 전달',
  description: '정적 배포에서는 외부 폼 링크를 연결해 참석 의사를 받을 수 있습니다.',
  ctaLabel: '참석 링크 열기',
  formHref: 'https://forms.gle/...',
  note: '외부 RSVP 폼 링크를 입력하면 버튼이 즉시 활성화됩니다.',
}
```

### 지도 링크
- 카카오맵 / 네이버맵 / 티맵 링크 유지
- 앱 딥링크 -> fallback 웹 링크 처리 로직 유지
- 별도 실시간 지도 SDK 의존은 제거하고 정적 preview 중심으로 정리

### 공유 / 복사
- 링크 복사 / 계좌 복사 동작함
- `navigator.share` 가능 시 시스템 공유 버튼 노출

## 현재 환경 상태

### GitHub CLI
- `gh` 설치됨
- 확인 결과:

```bash
gh --version
# gh version 2.96.0
```

### GitHub 인증
- 인증 완료됨
- 확인 결과:

```bash
gh auth status

# github.com
#   Logged in to github.com account KimKiHyuk (keyring)
#   Active account: true
#   Git operations protocol: https
```

### 현재 blocker
- 현재 폴더는 아직 git 저장소가 아님

```bash
git rev-parse --is-inside-work-tree
# fatal: not a git repository
```

## 다음 세션에서 해야 할 일

### 1. repo 이름 결정
- 사용자가 원하는 private repo 이름을 확인
- 예시: `mobile-wedding-invite`

### 2. git 초기화

```bash
cd /Users/key/mobile-wedding-invite
git init
git branch -M main
```

### 3. 첫 커밋

```bash
git add .
git commit -m "Rebuild wedding invitation for GitHub Pages"
```

## 주의
- 작업 폴더에 참고용 이미지와 임시 산출물이 많다.
- 아래 파일들은 repo에 넣지 않는 편이 좋다.
  - `local-preview-*.png`
  - `ref-*.png`
  - `salondeletter-*.png`
  - `.omx-*`
  - `.tmp-*`
- 필요하면 커밋 전에 `.gitignore`에 추가 정리할 것

권장 추가 ignore:

```gitignore
.omx*
.tmp-*
local-preview-*.png
ref-*.png
salondeletter-*.png
reports/
```

### 4. private repo 생성

#### repo 이름을 직접 지정하는 방식

```bash
gh repo create <REPO_NAME> \
  --private \
  --source=. \
  --remote=origin \
  --push
```

예시:

```bash
gh repo create mobile-wedding-invite \
  --private \
  --source=. \
  --remote=origin \
  --push
```

이 명령이 성공하면 초기 push까지 같이 처리된다.

### 5. GitHub Pages 설정 확인
- workflow 파일은 이미 존재:
  - [.github/workflows/deploy-pages.yml](/Users/key/mobile-wedding-invite/.github/workflows/deploy-pages.yml)
- repo 생성 후 GitHub 웹에서 확인:
  - `Settings -> Pages -> Source`
  - `GitHub Actions`로 잡혀 있는지 확인

### 6. Actions 배포 확인

```bash
gh run list
gh run view --log
```

또는 웹 UI에서 `Actions -> Deploy GitHub Pages` 확인

### 7. Pages URL 확인
- Private repo라도 Pages URL은 보통 생성됨
- 대개 형태는 아래 둘 중 하나:
  - `https://<owner>.github.io/<repo>/`
  - organization/project pages 형태

### 8. 배포 후 확인 포인트
- 첫 화면 hero 이미지 로드 정상 여부
- Google Fonts / Pretendard CDN 로드 정상 여부
- 갤러리 버튼 정상 동작
- 네이버/카카오/티맵 링크 정상
- 링크 복사 / 계좌 복사 정상
- `RSVP` 버튼이 의도대로 비활성 또는 외부 링크 활성 상태인지

## 실제 실행 순서 요약

```bash
cd /Users/key/mobile-wedding-invite

git init
git branch -M main

# 필요하면 .gitignore 정리 먼저

git add .
git commit -m "Rebuild wedding invitation for GitHub Pages"

gh repo create <REPO_NAME> \
  --private \
  --source=. \
  --remote=origin \
  --push
```

그 다음:
- GitHub 웹에서 `Settings -> Pages -> GitHub Actions` 확인
- Actions 배포 완료 확인
- Pages URL 접속 확인

## 권장 후속 수정
- `src/data/invitation.ts`의 실제 신랑/신부명, 문구, 계좌 정보 최종 반영
- `rsvp.formHref`에 실제 구글폼/타입폼 링크 반영
- 불필요한 참고 PNG와 리포트 파일은 repo에서 제외

## 메모
- 이 프로젝트는 현재 `.git`이 없어서 어떤 변경이 staged/unstaged인지 추적되지 않은 상태다.
- 다음 세션에서는 커밋 전에 `git status`로 불필요 파일이 섞이지 않았는지 반드시 확인할 것.
