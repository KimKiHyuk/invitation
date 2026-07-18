import './style.css'
import { invitationData } from './data/invitation'
import { getPreferredMapLaunchHref, resolveMapLinkTemplate } from './lib/map-links'
import { readLargeTextPreference, writeLargeTextPreference } from './lib/text-size'

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void
      isInitialized: () => boolean
      Share?: {
        sendDefault: (settings: Record<string, unknown>) => void
      }
    }
    kakao?: {
      maps: {
        load: (callback: () => void) => void
        LatLng: new (latitude: number, longitude: number) => {
          getLat: () => number
          getLng: () => number
        }
        Size: new (width: number, height: number) => unknown
        Point: new (x: number, y: number) => unknown
        Map: new (container: HTMLElement, options: Record<string, unknown>) => unknown
        MarkerImage: new (src: string, size: unknown, options?: Record<string, unknown>) => unknown
        Marker: new (options: Record<string, unknown>) => {
          setMap: (map: unknown) => void
        }
        InfoWindow: new (options: Record<string, unknown>) => {
          open: (map: unknown, marker: unknown) => void
        }
      }
    }
  }
}

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('#app element not found')
}

const winterV2Theme = new URLSearchParams(window.location.search).get('theme') === 'winter-v2'
if (winterV2Theme) {
  document.documentElement.dataset.theme = 'winter-v2'
}

let largeTextEnabled = readLargeTextPreference(() => window.localStorage)
const syncLargeTextRoot = () => {
  if (largeTextEnabled) {
    document.documentElement.dataset.largeText = 'true'
  } else {
    delete document.documentElement.dataset.largeText
  }
}
syncLargeTextRoot()

const baseUrl = import.meta.env.BASE_URL
const weddingDate = new Date(invitationData.weddingInfo.eventDateTime)
const canonicalPageUrl = invitationData.seo.url
const kakaoShareJsKey = import.meta.env.VITE_KAKAO_SDK_JS_KEY?.trim()
const kakaoMapAppKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY?.trim() || kakaoShareJsKey

const withBase = (path: string) => {
  if (/^(https?:|data:|mailto:|tel:|#)/.test(path)) {
    return path
  }

  return `${baseUrl}${path.replace(/^\/+/, '')}`
}

const updateMeta = () => {
  document.title = invitationData.seo.title

  const setMeta = (selector: string, value: string) => {
    const element = document.querySelector<HTMLMetaElement>(selector)
    if (element) {
      element.content = value
    }
  }

  setMeta('meta[name="description"]', invitationData.seo.description)
  setMeta('meta[property="og:title"]', invitationData.seo.title)
  setMeta('meta[property="og:url"]', canonicalPageUrl)
  setMeta('meta[property="og:description"]', invitationData.seo.description)
  setMeta('meta[property="og:image"]', new URL('images/og-couple-placeholder.jpg', canonicalPageUrl).toString())
  setMeta('meta[name="twitter:title"]', invitationData.seo.title)
  setMeta('meta[name="twitter:description"]', invitationData.seo.description)
  setMeta('meta[name="twitter:image"]', new URL('images/og-couple-placeholder.jpg', canonicalPageUrl).toString())
}

const loadScript = async (selector: string, createScript: () => HTMLScriptElement) => {
  const existingScript = document.querySelector<HTMLScriptElement>(selector)
  if (!existingScript) {
    const script = createScript()

    const loaded = new Promise<boolean>((resolve) => {
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
    })

    document.head.append(script)
    return loaded
  }

  return new Promise<boolean>((resolve) => {
    if (selector.includes('kakao-sdk') && window.Kakao?.Share) {
      resolve(true)
      return
    }

    if (selector.includes('kakao-map-sdk') && window.kakao?.maps) {
      resolve(true)
      return
    }

    existingScript.addEventListener('load', () => resolve(true), { once: true })
    existingScript.addEventListener('error', () => resolve(false), { once: true })
  })
}

const loadKakaoSdk = async () => {
  if (!kakaoShareJsKey) return false

  if (window.Kakao?.Share) {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoShareJsKey)
    }

    return true
  }

  const loaded = await loadScript('script[data-kakao-sdk="true"]', () => {
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.0/kakao.min.js'
    script.crossOrigin = 'anonymous'
    script.dataset.kakaoSdk = 'true'
    return script
  })
  if (!loaded) return false

  if (!window.Kakao) return false
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoShareJsKey)
  }

  return Boolean(window.Kakao.Share)
}

const loadKakaoMapSdk = async () => {
  if (!kakaoMapAppKey) return false
  if (window.kakao?.maps) return true

  const loadMapScript = (key: string, variant: 'primary' | 'fallback') =>
    loadScript(`script[data-kakao-map-sdk="${variant}"]`, () => {
      const script = document.createElement('script')
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`
      script.dataset.kakaoMapSdk = variant
      return script
    })

  const loaded = await loadMapScript(kakaoMapAppKey, 'primary')
  if ((!loaded || !window.kakao?.maps) && kakaoShareJsKey && kakaoShareJsKey !== kakaoMapAppKey) {
    document.querySelector('script[data-kakao-map-sdk="primary"]')?.remove()
    await loadMapScript(kakaoShareJsKey, 'fallback')
  }

  if (!window.kakao?.maps) return false

  return new Promise<boolean>((resolve) => {
    window.kakao?.maps.load(() => resolve(true))
  })
}

const setupKakaoMap = async () => {
  const mapRoot = document.querySelector<HTMLElement>('[data-kakao-map]')
  if (!mapRoot) return

  const ready = await loadKakaoMapSdk()
  if (!ready || !window.kakao?.maps) {
    mapRoot.innerHTML = `
      <div class="map-fallback-card">
        <img src="${withBase(invitationData.venue.mapPreviewSrc)}" alt="${invitationData.venue.name} 지도 미리보기" />
        <div class="map-fallback-copy">
          <strong>카카오 지도를 불러오지 못했습니다</strong>
          <span>아래 길찾기 버튼으로 바로 이동해 주세요.</span>
        </div>
      </div>
    `
    return
  }

  const position = new window.kakao.maps.LatLng(invitationData.venue.latitude, invitationData.venue.longitude)
  const map = new window.kakao.maps.Map(mapRoot, {
    center: position,
    level: 3,
    draggable: true,
    scrollwheel: true,
  })

  const marker = new window.kakao.maps.Marker({
    position,
  })
  marker.setMap(map)

  const infoWindow = new window.kakao.maps.InfoWindow({
    content: `<div class="kakao-map-label">${invitationData.venue.name}</div>`,
  })
  infoWindow.open(map, marker)
}

const renderCalendar = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const leadingBlankDays = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const cells: Array<{ day?: number; active?: boolean }> = []

  for (let index = 0; index < leadingBlankDays; index += 1) {
    cells.push({})
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, active: day === date.getDate() })
  }

  while (cells.length % 7 !== 0) {
    cells.push({})
  }

  const rows = []
  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7))
  }

  return rows
    .map(
      (row) => `
        <tr>
          ${row
            .map((cell) => {
              if (!cell.day) return '<td class="calendar-empty" aria-hidden="true"></td>'

              return `<td class="${cell.active ? 'calendar-active' : ''}">${cell.day}</td>`
            })
            .join('')}
        </tr>
      `,
    )
    .join('')
}

const getDday = () => {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date())
    .split('-')
    .map(Number)
  const [year, month, day] = dateParts
  const [targetYear, targetMonth, targetDay] = invitationData.weddingInfo.eventDateTime
    .slice(0, 10)
    .split('-')
    .map(Number)
  const oneDay = 24 * 60 * 60 * 1000
  const todayInSeoul = Date.UTC(year, month - 1, day)
  const targetInSeoul = Date.UTC(targetYear, targetMonth - 1, targetDay)
  return Math.ceil((targetInSeoul - todayInSeoul) / oneDay)
}

const renderMapLinks = () =>
  invitationData.venue.links
    .map((link) => {
      const appHref = 'appHref' in link ? resolveMapLinkTemplate(link.appHref, canonicalPageUrl) : ''
      const androidIntentHref =
        'androidIntentHref' in link ? resolveMapLinkTemplate(link.androidIntentHref, canonicalPageUrl) : ''

      const extra =
        appHref.length > 0
          ? `data-app-link="${appHref}" data-fallback-link="${link.href}" ${
              androidIntentHref ? `data-android-intent-link="${androidIntentHref}"` : ''
            }`
          : ''

      return `
        <a class="map-link map-link-${link.tone}" href="${link.href}" target="_blank" rel="noreferrer noopener" ${extra}>
          <strong>${link.label}</strong>
          <span>${link.description}</span>
        </a>
      `
    })
    .join('')

const renderGiftAccounts = () => {
  const groupedAccounts = [
    {
      side: 'groom',
      label: '신랑측 계좌번호',
      accounts: invitationData.gift.accounts.filter((account) => account.side === 'groom'),
    },
    {
      side: 'bride',
      label: '신부측 계좌번호',
      accounts: invitationData.gift.accounts.filter((account) => account.side === 'bride'),
    },
  ]

  return groupedAccounts
    .map(
      (group, index) => `
        <details class="account-group" ${index === 0 ? 'open' : ''}>
          <summary>${group.label}</summary>
          <div class="account-group-body">
            ${group.accounts
              .map(
                (account) => `
                  <article class="account-row">
                    <div class="account-copy">
                      <p class="account-label">${account.label}</p>
                      <strong>${account.bank} ${account.accountNumber}</strong>
                      <span>예금주 ${account.holder}</span>
                    </div>
                    <button
                      class="pill-button pill-button-outline account-copy-button"
                      type="button"
                      data-copy="${account.copyValue}"
                      data-label="${account.label} 계좌 복사"
                    >
                      복사
                    </button>
                  </article>
                `,
              )
              .join('')}
          </div>
        </details>
      `,
    )
    .join('')
}

const renderGallerySlides = () =>
  invitationData.gallery.items
    .map(
      (item, index) => `
        <button class="gallery-slide ${index === 0 ? 'is-active' : ''}" type="button" data-gallery-index="${index}" aria-label="사진 ${index + 1} 크게 보기">
          <img src="${withBase(item.src)}" alt="${item.alt}" loading="${index === 0 ? 'eager' : 'lazy'}" />
        </button>
      `,
    )
    .join('')

const renderGalleryDots = () =>
  invitationData.gallery.items
    .map(
      (_, index) => `
        <button
          class="gallery-dot ${index === 0 ? 'is-active' : ''}"
          type="button"
          data-gallery-dot="${index}"
          aria-label="사진 ${index + 1} 보기"
        ></button>
      `,
    )
    .join('')

updateMeta()

app.innerHTML = `
  <div class="sr-only" aria-live="polite" id="global-status"></div>
  <div class="status-toast" id="status-toast" hidden></div>
  <canvas class="bg-snow" aria-hidden="true"></canvas>
  <button
    class="text-size-toggle"
    type="button"
    id="text-size-toggle"
    aria-pressed="${largeTextEnabled}"
    aria-label="${largeTextEnabled ? '큰 글씨 모드 끄기' : '큰 글씨 모드 켜기'}"
  >
    <span class="text-size-toggle-icon" data-text-size-icon aria-hidden="true">${largeTextEnabled ? '가−' : '가+'}</span>
    <span data-text-size-label>${largeTextEnabled ? '큰 글씨 켜짐' : '큰 글씨'}</span>
  </button>
  <main class="invitation-page">
    <section class="page-card">
      <section class="hero-section section-block" id="top">
        <div class="hero-cover">
          <img class="hero-cover-art" src="${withBase('/images/winter-forest-transition.webp')}" alt="" aria-hidden="true" />
          <div class="hero-cover-overlay" aria-hidden="true"></div>
          <div class="hero-cover-copy">
            <p class="script-label">${invitationData.hero.eyebrow}</p>
            <p class="hero-date">${invitationData.hero.savedate}</p>
            <p class="hero-date-stamp">${invitationData.hero.dateStamp}</p>
          </div>
        </div>
        <h1 class="hero-names">
          <span>${invitationData.hero.names[0]}</span>
          <em>&amp;</em>
          <span>${invitationData.hero.names[1]}</span>
        </h1>
        <p class="hero-summary">${invitationData.hero.summary.join('<br />')}</p>
        <div class="hero-actions">
          ${invitationData.hero.actions
            .map(
              (action) => `
                <a class="pill-button ${action.kind === 'primary' ? 'pill-button-solid' : 'pill-button-outline'}" href="${action.href}">
                  ${action.label}
                </a>
              `,
            )
            .join('')}
        </div>
      </section>

      <section class="section-block prose-section reveal-on-scroll">
        <p class="section-kicker">${invitationData.invitation.kicker}</p>
        <h2>${invitationData.invitation.title}</h2>
        <div class="section-divider" aria-hidden="true"></div>
        <div class="invitation-copy">
          ${invitationData.invitation.lines
            .map((line) => (line.length > 0 ? `<p>${line}</p>` : '<p class="copy-spacer" aria-hidden="true"></p>'))
            .join('')}
        </div>
        <p class="script-label script-footer">${invitationData.invitation.script}</p>
      </section>

      <section class="section-block couple-section reveal-on-scroll">
        <p class="section-kicker">The Couple</p>
        <h2>${invitationData.couple.title}</h2>
        <div class="couple-grid">
          <article class="person-card">
            <span class="person-role">${invitationData.couple.groom.role}</span>
            <strong>${invitationData.couple.groom.name}</strong>
            <p class="person-english">${invitationData.couple.groom.englishName}</p>
            <p class="person-parents">${invitationData.couple.groom.parents}</p>
            <p class="person-message">${invitationData.couple.groom.message}</p>
          </article>
          <article class="person-card">
            <span class="person-role">${invitationData.couple.bride.role}</span>
            <strong>${invitationData.couple.bride.name}</strong>
            <p class="person-english">${invitationData.couple.bride.englishName}</p>
            <p class="person-parents">${invitationData.couple.bride.parents}</p>
            <p class="person-message">${invitationData.couple.bride.message}</p>
          </article>
        </div>
      </section>

      <section class="section-block calendar-section reveal-on-scroll">
        <p class="section-kicker">The Day</p>
        <h2>${invitationData.weddingInfo.title}</h2>
        <p class="calendar-date-copy">${invitationData.weddingInfo.dateValue}</p>
        <table class="calendar-table" aria-label="${invitationData.weddingInfo.calendarMonthLabel}">
          <caption>${invitationData.weddingInfo.calendarMonthLabel}</caption>
          <thead>
            <tr>
              <th>SUN</th>
              <th>MON</th>
              <th>TUE</th>
              <th>WED</th>
              <th>THU</th>
              <th>FRI</th>
              <th>SAT</th>
            </tr>
          </thead>
          <tbody>${renderCalendar(weddingDate)}</tbody>
        </table>
        <div class="dday-panel">
          <span>민준 · 서연의 결혼식까지</span>
          <strong><span class="dday-prefix">D</span><span class="dday-separator">-</span><span id="dday-value">0</span></strong>
        </div>
      </section>

      <section class="section-block gallery-section reveal-on-scroll">
        <p class="section-kicker">Our Moments</p>
        <h2>${invitationData.gallery.title}</h2>
        <p class="gallery-copy">${invitationData.gallery.message.join('<br />')}</p>
        <div class="gallery-stage">
          <div class="gallery-viewport">
            <button class="gallery-nav gallery-nav-prev" type="button" data-gallery-prev aria-label="이전 사진">‹</button>
            <div class="gallery-track">${renderGallerySlides()}</div>
            <button class="gallery-nav gallery-nav-next" type="button" data-gallery-next aria-label="다음 사진">›</button>
          </div>
        </div>
        <div class="gallery-dots">${renderGalleryDots()}</div>
      </section>

      <section class="section-block location-section reveal-on-scroll" id="location">
        <p class="section-kicker">Location</p>
        <h2>${invitationData.venue.title}</h2>
        <p class="location-name">${invitationData.venue.name}</p>
        <p class="location-address">${invitationData.venue.address}</p>
        <div class="map-preview-card">
          <div class="map-embed-shell">
            <div
              class="map-embed-frame"
              data-kakao-map
              title="${invitationData.venue.name} 지도"
              role="region"
              aria-label="${invitationData.venue.name} 지도"
            ></div>
          </div>
        </div>
        <div class="map-link-grid">
          ${renderMapLinks()}
        </div>
        <div class="direction-list">
          ${invitationData.venue.directions
            .map(
              (item) => `
                <article class="direction-card">
                  <h3>${item.title}</h3>
                  ${item.details.map((detail) => `<p>${detail}</p>`).join('')}
                </article>
              `,
            )
            .join('')}
        </div>
        <button class="pill-button pill-button-outline location-copy" type="button" data-copy="${invitationData.venue.address}" data-label="예식장 주소 복사">
          주소 복사
        </button>
      </section>

      <section class="section-block gift-section reveal-on-scroll" id="gift">
        <p class="section-kicker">Gift</p>
        <h2>${invitationData.gift.title}</h2>
        <p class="section-description">${invitationData.gift.description}</p>
        <div class="account-list">
          ${renderGiftAccounts()}
        </div>
      </section>

      ${
        invitationData.rsvp.formHref
          ? `
            <section class="section-block rsvp-section reveal-on-scroll">
              <p class="section-kicker">RSVP</p>
              <h2>${invitationData.rsvp.title}</h2>
              <p class="section-description">${invitationData.rsvp.description}</p>
              <a class="pill-button pill-button-solid" href="${invitationData.rsvp.formHref}" target="_blank" rel="noreferrer noopener">${invitationData.rsvp.ctaLabel}</a>
              <p class="section-note">${invitationData.rsvp.note}</p>
            </section>
          `
          : ''
      }

      <section class="section-block share-section reveal-on-scroll">
        <p class="section-kicker">Share</p>
        <h2>${invitationData.share.title}</h2>
        <p class="section-description">${invitationData.share.description}</p>
        <div class="share-actions">
          <button class="pill-button pill-button-solid" type="button" id="kakao-share-button">
            ${invitationData.share.kakaoLabel}
          </button>
        </div>
      </section>

      <footer class="page-footer">
        <p>${invitationData.footer.note}</p>
        <strong>${invitationData.footer.signature}</strong>
      </footer>
    </section>
  </main>

  <div class="lightbox" id="gallery-lightbox" role="dialog" aria-modal="true" aria-label="웨딩 사진 크게 보기" tabindex="-1" hidden>
    <button class="lightbox-close" type="button" aria-label="사진 닫기">×</button>
    <button class="lightbox-nav" type="button" data-lightbox-prev aria-label="이전 사진">‹</button>
    <figure class="lightbox-figure">
      <img id="lightbox-image" alt="" />
      <figcaption id="lightbox-caption"></figcaption>
    </figure>
    <button class="lightbox-nav" type="button" data-lightbox-next aria-label="다음 사진">›</button>
  </div>
`

const setStatus = (message: string) => {
  const liveRegion = document.querySelector<HTMLElement>('#global-status')
  const toast = document.querySelector<HTMLElement>('#status-toast')
  if (liveRegion) {
    liveRegion.textContent = message
  }

  if (toast) {
    toast.textContent = message
    toast.hidden = false
    toast.classList.add('is-visible')

    window.clearTimeout(Number(toast.dataset.timeoutId || 0))
    const timeoutId = window.setTimeout(() => {
      toast.classList.remove('is-visible')
      window.setTimeout(() => {
        toast.hidden = true
      }, 180)
    }, 1800)

    toast.dataset.timeoutId = String(timeoutId)
  }
}

const textSizeToggle = document.querySelector<HTMLButtonElement>('#text-size-toggle')
const textSizeLabel = textSizeToggle?.querySelector<HTMLElement>('[data-text-size-label]')
const textSizeIcon = textSizeToggle?.querySelector<HTMLElement>('[data-text-size-icon]')

const syncLargeTextToggle = () => {
  if (!textSizeToggle || !textSizeLabel || !textSizeIcon) return

  textSizeToggle.setAttribute('aria-pressed', String(largeTextEnabled))
  textSizeToggle.setAttribute('aria-label', largeTextEnabled ? '큰 글씨 모드 끄기' : '큰 글씨 모드 켜기')
  textSizeLabel.textContent = largeTextEnabled ? '큰 글씨 켜짐' : '큰 글씨'
  textSizeIcon.textContent = largeTextEnabled ? '가−' : '가+'
}

const syncTextSizeToggleLayout = () => {
  textSizeToggle?.classList.toggle('is-compact', window.scrollY > 120)
}

syncTextSizeToggleLayout()
window.addEventListener('scroll', syncTextSizeToggleLayout, { passive: true })

textSizeToggle?.addEventListener('click', () => {
  const readingAnchor = document
    .elementFromPoint(window.innerWidth / 2, window.innerHeight * 0.45)
    ?.closest<HTMLElement>('.section-block, .page-footer')
  const anchorTop = readingAnchor?.getBoundingClientRect().top

  largeTextEnabled = !largeTextEnabled
  syncLargeTextRoot()
  syncLargeTextToggle()
  writeLargeTextPreference(largeTextEnabled, () => window.localStorage)

  window.requestAnimationFrame(() => {
    if (readingAnchor && anchorTop !== undefined) {
      window.scrollBy({ top: readingAnchor.getBoundingClientRect().top - anchorTop, behavior: 'instant' })
    }
  })

  setStatus(largeTextEnabled ? '큰 글씨 모드가 켜졌습니다.' : '큰 글씨 모드가 꺼졌습니다.')
})

const updateDday = () => {
  const target = document.querySelector<HTMLElement>('#dday-value')
  if (!target) return

  const dday = getDday()
  target.textContent = String(Math.max(dday, 0))
}

updateDday()
const scheduleDdayRefresh = () => {
  const now = new Date()
  const nextMidnight = new Date(now)
  nextMidnight.setHours(24, 0, 1, 0)
  window.setTimeout(() => {
    updateDday()
    scheduleDdayRefresh()
  }, nextMidnight.getTime() - now.getTime())
}
scheduleDdayRefresh()

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const rawValue = button.dataset.copy
    const label = button.dataset.label ?? '복사'
    if (!rawValue) return

    const value = rawValue === 'share-link' ? window.location.href : rawValue
    const originalText = button.textContent

    try {
      await navigator.clipboard.writeText(value)
      button.textContent = '복사 완료'
      setStatus(`${label} 완료`)
      window.setTimeout(() => {
        button.textContent = originalText
      }, 1600)
    } catch {
      window.alert(value)
    }
  })
})

document.querySelectorAll<HTMLAnchorElement>('[data-app-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const appHref = link.dataset.appLink
    const fallbackHref = link.dataset.fallbackLink
    const androidIntentHref = link.dataset.androidIntentLink

    if (!appHref || !fallbackHref) return

    event.preventDefault()

    const launchHref = getPreferredMapLaunchHref({
      appHref,
      androidIntentHref,
      userAgent: window.navigator.userAgent,
    })

    let didHide = false

    const markHidden = () => {
      didHide = true
    }

    const handleVisibility = () => {
      if (document.hidden) {
        markHidden()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility, { once: true })
    window.addEventListener('pagehide', markHidden, { once: true })
    window.location.href = launchHref

    window.setTimeout(() => {
      if (!didHide && !document.hidden) {
        window.location.href = fallbackHref
      }
    }, 1800)
  })
})

const gallerySlides = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-gallery-index]'))
const galleryDots = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-gallery-dot]'))
const lightbox = document.querySelector<HTMLDivElement>('#gallery-lightbox')
const lightboxImage = document.querySelector<HTMLImageElement>('#lightbox-image')
const lightboxCaption = document.querySelector<HTMLElement>('#lightbox-caption')
let activeGalleryIndex = 0
let lastGalleryTrigger: HTMLButtonElement | null = null

const syncGallery = (index: number) => {
  const total = invitationData.gallery.items.length
  activeGalleryIndex = (index + total) % total

  gallerySlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === activeGalleryIndex)
  })

  galleryDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === activeGalleryIndex)
  })

  if (lightbox && !lightbox.hidden && lightboxImage && lightboxCaption) {
    const item = invitationData.gallery.items[activeGalleryIndex]
    lightboxImage.src = withBase(item.src)
    lightboxImage.alt = item.alt
    lightboxCaption.textContent = `${activeGalleryIndex + 1} / ${invitationData.gallery.items.length}`
  }
}

syncGallery(0)

document.querySelector('[data-gallery-prev]')?.addEventListener('click', () => {
  syncGallery(activeGalleryIndex - 1)
})

document.querySelector('[data-gallery-next]')?.addEventListener('click', () => {
  syncGallery(activeGalleryIndex + 1)
})

galleryDots.forEach((dot, index) => {
  dot.addEventListener('click', () => syncGallery(index))
})

gallerySlides.forEach((slide, index) => {
  slide.addEventListener('click', () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return

    lastGalleryTrigger = slide
    lightbox.hidden = false
    document.body.classList.add('lightbox-open')
    syncGallery(index)
    lightbox.focus()
  })
})

const closeLightbox = () => {
  if (!lightbox) return
  lightbox.hidden = true
  document.body.classList.remove('lightbox-open')
  lastGalleryTrigger?.focus()
}

document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox)

document.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => {
  syncGallery(activeGalleryIndex - 1)
})

document.querySelector('[data-lightbox-next]')?.addEventListener('click', () => {
  syncGallery(activeGalleryIndex + 1)
})

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightbox()
  }
})

document.addEventListener('keydown', (event) => {
  if (!lightbox || lightbox.hidden) return

  if (event.key === 'Escape') {
    closeLightbox()
  }

  if (event.key === 'ArrowLeft') {
    syncGallery(activeGalleryIndex - 1)
  }

  if (event.key === 'ArrowRight') {
    syncGallery(activeGalleryIndex + 1)
  }
})

document.querySelectorAll<HTMLElement>('.reveal-on-scroll').forEach((target) => {
  target.dataset.revealed = 'true'
})

const setupSnow = () => {
  const canvas = document.querySelector<HTMLCanvasElement>('.bg-snow')
  if (!canvas) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const prefersCoarsePointer = window.matchMedia('(pointer: coarse)')
  if (prefersReducedMotion.matches) {
    canvas.style.display = 'none'
    return
  }

  const context = canvas.getContext('2d')
  if (!context) return
  const ctx = context

  const isMobileLikeDevice = prefersCoarsePointer.matches
  const deviceMemory = 'deviceMemory' in navigator ? navigator.deviceMemory : undefined
  const hardwareConcurrency = navigator.hardwareConcurrency || 4
  const lowPowerDevice =
    isMobileLikeDevice || hardwareConcurrency <= 4 || (typeof deviceMemory === 'number' && deviceMemory <= 4)
  const dpr = Math.min(window.devicePixelRatio || 1, lowPowerDevice ? 1 : 1.5)
  const targetFrameMs = lowPowerDevice ? 1000 / 18 : 1000 / 24
  let width = 0
  let height = 0
  let animationFrame = 0
  let flakes: Snowflake[] = []
  let running = true
  let lastNow = 0
  let lastRenderNow = 0
  let spriteCanvas: HTMLCanvasElement | null = null
  let resizeTimeout = 0
  let scrollResumeTimeout = 0
  let scrollPaused = false

  const drawSnowflakeShape = (
    target: CanvasRenderingContext2D,
    arm: number,
    stroke: string,
    centerFill: string,
    glow: string,
  ) => {
    const branch = arm * 0.34

    target.save()
    target.lineCap = 'round'
    target.strokeStyle = stroke
    target.shadowColor = glow
    target.shadowBlur = arm * 0.9
    target.lineWidth = Math.max(1, arm * 0.12)

    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI / 3) * index
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const endX = cos * arm
      const endY = sin * arm
      const branchBackX = cos * arm * 0.45
      const branchBackY = sin * arm * 0.45

      target.beginPath()
      target.moveTo(0, 0)
      target.lineTo(endX, endY)
      target.stroke()

      target.beginPath()
      target.moveTo(branchBackX, branchBackY)
      target.lineTo(
        branchBackX + Math.cos(angle - Math.PI / 4) * branch,
        branchBackY + Math.sin(angle - Math.PI / 4) * branch,
      )
      target.moveTo(branchBackX, branchBackY)
      target.lineTo(
        branchBackX + Math.cos(angle + Math.PI / 4) * branch,
        branchBackY + Math.sin(angle + Math.PI / 4) * branch,
      )
      target.stroke()
    }

    target.beginPath()
    target.fillStyle = centerFill
    target.arc(0, 0, Math.max(1, arm * 0.12), 0, Math.PI * 2)
    target.fill()
    target.restore()
  }

  const createSnowflakeSprite = () => {
    const spriteSize = 56
    const sprite = document.createElement('canvas')
    const spriteContext = sprite.getContext('2d')
    if (!spriteContext) return null

    sprite.width = spriteSize * dpr
    sprite.height = spriteSize * dpr
    sprite.style.width = `${spriteSize}px`
    sprite.style.height = `${spriteSize}px`
    spriteContext.setTransform(dpr, 0, 0, dpr, 0, 0)
    spriteContext.translate(spriteSize / 2, spriteSize / 2)
    drawSnowflakeShape(
      spriteContext,
      16,
      'rgba(216, 239, 255, 0.95)',
      'rgba(240, 250, 255, 0.96)',
      'rgba(255, 249, 230, 0.22)',
    )

    return sprite
  }

  class Snowflake {
    x = 0
    y = 0
    size = 0
    speed = 0
    drift = 0
    opacity = 0

    constructor(initial: boolean) {
      this.reset(initial)
    }

    reset(initial: boolean) {
      this.x = Math.random() * width
      this.y = initial ? Math.random() * height : -32
      this.size = lowPowerDevice ? 6 + Math.random() * 6 : 7 + Math.random() * 7
      this.speed = lowPowerDevice ? 18 + Math.random() * 28 : 22 + Math.random() * 34
      this.drift = (Math.random() - 0.5) * (lowPowerDevice ? 6 : 10)
      this.opacity = 0.26 + Math.random() * 0.28
    }

    step(deltaSeconds: number) {
      this.y += this.speed * deltaSeconds
      this.x += this.drift * deltaSeconds

      if (this.x < -24) this.x = width + 12
      if (this.x > width + 24) this.x = -12

      if (this.y > height + 36) {
        this.reset(false)
      }
    }

    draw() {
      if (!spriteCanvas) return

      const spriteSize = this.size * 2
      ctx.globalAlpha = this.opacity
      ctx.drawImage(spriteCanvas, this.x - spriteSize / 2, this.y - spriteSize / 2, spriteSize, spriteSize)
    }
  }

  const rebuildScene = () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    spriteCanvas = createSnowflakeSprite()
    const densityDivisor = lowPowerDevice ? (winterV2Theme ? 88 : 72) : winterV2Theme ? 70 : 58
    const mobileCap = lowPowerDevice ? (winterV2Theme ? 9 : 12) : winterV2Theme ? 14 : 18
    const desktopCap = lowPowerDevice ? (winterV2Theme ? 12 : 16) : winterV2Theme ? 18 : 24
    const cap = isMobileLikeDevice ? mobileCap : desktopCap
    const count = Math.max(winterV2Theme ? 5 : 7, Math.min(cap, Math.floor(width / densityDivisor)))
    flakes = Array.from({ length: count }, () => new Snowflake(true))
  }

  const resize = () => {
    window.clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(rebuildScene, 120)
  }

  const loop = (now: number) => {
    if (!running || scrollPaused) return
    if (lastRenderNow !== 0 && now - lastRenderNow < targetFrameMs) {
      animationFrame = window.requestAnimationFrame(loop)
      return
    }

    const deltaSeconds = lastNow === 0 ? 1 / 60 : Math.min((now - lastNow) / 1000, 0.033)
    lastNow = now
    lastRenderNow = now
    ctx.clearRect(0, 0, width, height)
    flakes.forEach((flake) => {
      flake.step(deltaSeconds)
      flake.draw()
    })
    ctx.globalAlpha = 1
    animationFrame = window.requestAnimationFrame(loop)
  }

  rebuildScene()
  animationFrame = window.requestAnimationFrame(loop)

  const onVisibility = () => {
    running = document.visibilityState !== 'hidden'
    if (running) {
      lastNow = 0
      lastRenderNow = 0
      animationFrame = window.requestAnimationFrame(loop)
    } else {
      window.cancelAnimationFrame(animationFrame)
    }
  }

  const onScroll = () => {
    if (scrollPaused) {
      window.clearTimeout(scrollResumeTimeout)
    } else {
      scrollPaused = true
      window.cancelAnimationFrame(animationFrame)
    }

    scrollResumeTimeout = window.setTimeout(() => {
      scrollPaused = false
      if (running) {
        lastNow = 0
        lastRenderNow = 0
        animationFrame = window.requestAnimationFrame(loop)
      }
    }, 140)
  }

  window.addEventListener('resize', resize)
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
}

setupSnow()

const mapTarget = document.querySelector<HTMLElement>('[data-kakao-map]')
if (mapTarget && 'IntersectionObserver' in window) {
  const mapObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      mapObserver.disconnect()
      void setupKakaoMap()
    },
    { rootMargin: '600px 0px' },
  )
  mapObserver.observe(mapTarget)
} else {
  void setupKakaoMap()
}

const kakaoShareButton = document.querySelector<HTMLButtonElement>('#kakao-share-button')

if (kakaoShareButton) {
  void loadKakaoSdk().then((ready) => {
    if (!ready) {
      kakaoShareButton.disabled = true
      kakaoShareButton.classList.remove('pill-button-solid')
      kakaoShareButton.classList.add('pill-button-muted')
      kakaoShareButton.textContent = '카카오톡 공유 준비 중'
      return
    }

    kakaoShareButton.addEventListener('click', () => {
      const imageUrl = new URL('images/og-couple-placeholder.jpg', canonicalPageUrl).toString()

      window.Kakao?.Share?.sendDefault({
        objectType: 'feed',
        content: {
          title: invitationData.seo.title,
          description: invitationData.seo.description,
          imageUrl,
          link: {
            mobileWebUrl: canonicalPageUrl,
            webUrl: canonicalPageUrl,
          },
        },
        buttons: [
          {
            title: '청첩장 보기',
            link: {
              mobileWebUrl: canonicalPageUrl,
              webUrl: canonicalPageUrl,
            },
          },
        ],
      })
    })
  })
}
