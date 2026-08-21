# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-08-21
- Primary product surfaces: Mobile invitation, large-text mode, Kakao sharing, map and account actions
- Evidence reviewed: `README.md`, `src/main.ts`, `src/style.css`, `src/lib/view-mode.ts`, `src/data/invitation.ts`, `tests/*`, `public/images/*`, current GitHub Pages deployment, [revfactory/wedding-letter](https://github.com/revfactory/wedding-letter), [juhonamnam/wedding-invitation](https://github.com/juhonamnam/wedding-invitation)

## Brand
- Personality: Quiet, sincere, warm winter evening, tactile paper invitation
- Trust signals: Real wedding details, restrained typography, legible actions, consistent spacing
- Avoid: Fantasy-poster excess, glassmorphism, ornamental pills, synthetic gold glow, competing display styles, generic AI-generated luxury cues

## Product goals
- Goals: Communicate the wedding details clearly, feel personal and winter-warm, support older guests, keep map/share/account actions obvious
- Non-goals: Replacing the existing winter and white themes, adding decorative media, creating a desktop-first microsite
- Success signals: No horizontal overflow at 320px, readable at default and large-text sizes, stable scroll position when text mode changes, no additional initial image payload for V2

## Personas and jobs
- Primary personas: Mobile guests aged 20-90, including guests with reduced visual acuity
- User jobs: Confirm date and venue, navigate to the hall, view family/account information, share the invitation
- Key contexts of use: Kakao in-app browser, mobile Safari/Chrome, intermittent mobile networks

## Information architecture
- Primary navigation: Single vertical document with fixed D-day and large-text controls
- Core routes/screens: One invitation route with `theme` and `audience` query variants
- Content hierarchy: Hero, invitation message, couple, date, gallery, location, accounts, share

## Design principles
- Paper before spectacle: Treat the page as a printed letter, not an animated poster
- Warmth through restraint: Use paper, evergreen, oxblood, and measured image treatment instead of glow and decoration
- Korean content first: Korean labels and wedding details lead; English is a small editorial accent only
- Accessibility is a mode, not a compromise: Large text keeps the same hierarchy and current reading position
- Tradeoffs: V2 reuses the existing winter hero image to avoid payload growth, but crops and tones it as a printed photograph to reduce its visual dominance

## Visual language
- Color: Canvas `#E8E0D2`, paper `#F7F2E8`, ink `#302D29`, soft ink `#6B6258`, evergreen `#29443A`, oxblood `#7C403A`, brass `#96784B`
- Typography: `Nanum Myeongjo` for Korean headings and names, `Pretendard` for utility/body text, `Cormorant Garamond` only for the hero editorial title
- Spacing/layout rhythm: 8px base rhythm, 72-80px section cadence, narrower text measure, deliberate whitespace
- Shape/radius/elevation: 0-4px utility corners, thin rules, one restrained page shadow; avoid stacked floating cards
- Motion: Existing reveal only; V2 uses the restrained snow profile (mobile cap 14, low-power cap 9) and honors reduced-motion settings
- Imagery/iconography: Existing winter hero treated as a desaturated printed photograph; map provider marks remain functional brand cues

## Components
- Existing components to reuse: Hero, calendar, gallery/lightbox, Kakao map with static fallback, map-app deep links, direction rows, account copy rows, Kakao share action, D-day banner
- New/changed components: V2 stationery skin, Korean V2 section labels, scroll-preserving large-text toggle
- Variants and states: `winter`, `white`, and additive `winter-v2`; each supports `standard` and `senior`
- Token/component ownership: Theme tokens and variants live in `src/style.css`; mode parsing and presentation live in `src/lib/view-mode.ts`

## Accessibility
- Target standard: WCAG 2.2 AA where applicable
- Keyboard/focus behavior: Visible focus rings on every action; text-mode control remains a real link
- Contrast/readability: Body contrast at least 4.5:1; default body 16px minimum; senior body 20px
- Screen-reader semantics: Descriptive mode-toggle labels and current-state semantics
- Reduced motion and sensory considerations: Existing snow/reveal behavior must stop or reduce under `prefers-reduced-motion`

## Responsive behavior
- Supported breakpoints/devices: 320px mobile minimum through 560px invitation card, then centered desktop presentation
- Layout adaptations: Senior mode stacks dense two-column content at small widths; V2 keeps edge padding at 20-28px
- Touch/hover differences: Minimum 44px actions; no hover-only information

## Interaction states
- Loading: Hero dimensions reserved to avoid layout shift; gallery images after the first stay lazy
- Empty: RSVP remains omitted when no link exists
- Error: Existing map fallback and disabled Kakao share behavior remain
- Success: Copy actions use toast and temporary button feedback
- Disabled: Existing muted share state remains
- Offline/slow network, if applicable: Static text and fallback map remain useful while external SDKs load

## Content voice
- Tone: Direct, affectionate, composed
- Terminology: Prefer familiar Korean wedding terms; avoid redundant English labels in V2
- Microcopy rules: Short nouns for section labels and actions; no technical wording for guests

## Implementation constraints
- Framework/styling system: Vite, TypeScript, one HTML entry, repo-native CSS
- Design-token constraints: Extend existing CSS variables; do not add a second styling framework
- Performance constraints: No new V2 image download; one theme hero per visit; snow remains capped and frame-limited
- Compatibility constraints: GitHub Pages static hosting, Kakao in-app browser, mobile Safari/Chrome
- Test/screenshot expectations: Unit tests for mode URLs; browser QA at 320x700 and 390x844 for standard/senior; verify scroll preservation and no overflow

## Open questions
- [ ] Replace the shared V2 hero with a real couple photograph when the final approved image is available / couple / visual authenticity
- [ ] Confirm whether V2 should replace the default QR destination after side-by-side review / couple / rollout only
