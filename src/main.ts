import './style.css'
import { invitationData } from './data/invitation'
import { getPreferredMapLaunchHref, resolveMapLinkTemplate } from './lib/map-links'

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void
      isInitialized: () => boolean
      maps?: {
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
      Share?: {
        sendDefault: (settings: Record<string, unknown>) => void
      }
    }
  }
}

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('#app element not found')
}

const baseUrl = import.meta.env.BASE_URL
const weddingDate = new Date(invitationData.weddingInfo.eventDateTime)
const currentPageUrl = window.location.href.split('#')[0]
const kakaoSdkJsKey =
  import.meta.env.VITE_KAKAO_SDK_JS_KEY?.trim() || import.meta.env.VITE_KAKAO_MAP_APP_KEY?.trim()

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
  setMeta('meta[property="og:url"]', currentPageUrl)
  setMeta('meta[property="og:description"]', invitationData.seo.description)
  setMeta('meta[property="og:image"]', new URL(withBase('/images/og-image.jpg'), window.location.href).toString())
  setMeta('meta[name="twitter:title"]', invitationData.seo.title)
  setMeta('meta[name="twitter:description"]', invitationData.seo.description)
  setMeta('meta[name="twitter:image"]', new URL(withBase('/images/og-image.jpg'), window.location.href).toString())
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

    if (selector.includes('kakao-map-sdk') && window.Kakao?.maps) {
      resolve(true)
      return
    }

    existingScript.addEventListener('load', () => resolve(true), { once: true })
    existingScript.addEventListener('error', () => resolve(false), { once: true })
  })
}

const loadKakaoSdk = async () => {
  if (!kakaoSdkJsKey) return false

  if (window.Kakao?.Share) {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoSdkJsKey)
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
    window.Kakao.init(kakaoSdkJsKey)
  }

  return Boolean(window.Kakao.Share)
}

const loadKakaoMapSdk = async () => {
  if (!kakaoSdkJsKey) return false
  if (window.Kakao?.maps) return true

  const loaded = await loadScript('script[data-kakao-map-sdk="true"]', () => {
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(kakaoSdkJsKey)}&autoload=false`
    script.dataset.kakaoMapSdk = 'true'
    return script
  })
  if (!loaded || !window.Kakao?.maps) return false

  return new Promise<boolean>((resolve) => {
    window.Kakao?.maps?.load(() => resolve(true))
  })
}

const setupKakaoMap = async () => {
  const mapRoot = document.querySelector<HTMLElement>('[data-kakao-map]')
  if (!mapRoot) return

  const ready = await loadKakaoMapSdk()
  if (!ready || !window.Kakao?.maps) {
    mapRoot.innerHTML = '<p class="map-fallback-text">카카오 지도를 불러오지 못했습니다. 아래 길찾기 버튼을 이용해 주세요.</p>'
    return
  }

  const position = new window.Kakao.maps.LatLng(invitationData.venue.latitude, invitationData.venue.longitude)
  const map = new window.Kakao.maps.Map(mapRoot, {
    center: position,
    level: 3,
    draggable: true,
    scrollwheel: true,
  })

  const marker = new window.Kakao.maps.Marker({
    position,
  })
  marker.setMap(map)

  const infoWindow = new window.Kakao.maps.InfoWindow({
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
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), weddingDate.getDate())
  const oneDay = 24 * 60 * 60 * 1000
  return Math.ceil((target.getTime() - today.getTime()) / oneDay)
}

const renderMapLinks = () =>
  invitationData.venue.links
    .map((link) => {
      const appHref = 'appHref' in link ? resolveMapLinkTemplate(link.appHref, currentPageUrl) : ''
      const androidIntentHref =
        'androidIntentHref' in link ? resolveMapLinkTemplate(link.androidIntentHref, currentPageUrl) : ''

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
  <main class="invitation-page">
    <section class="page-card">
      <div class="seasonal-frame" aria-hidden="true">
        <div class="seasonal-glow seasonal-glow-left"></div>
        <div class="seasonal-glow seasonal-glow-right"></div>
        <div class="seasonal-garland">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <img class="seasonal-wreath" src="${withBase('/images/christmas-wreath.webp')}" alt="" />
        <div class="seasonal-tree">
          <span class="tree-star"></span>
          <span class="tree-tier tree-tier-top"></span>
          <span class="tree-tier tree-tier-mid"></span>
          <span class="tree-tier tree-tier-base"></span>
          <span class="tree-trunk"></span>
          <span class="tree-snow"></span>
        </div>
      </div>
      <section class="hero-section section-block" id="top">
        <div class="hero-ornament hero-ornament-left" aria-hidden="true"></div>
        <div class="hero-ornament hero-ornament-right" aria-hidden="true"></div>
        <p class="script-label">${invitationData.hero.eyebrow}</p>
        <p class="hero-date">${invitationData.hero.savedate}</p>
        <p class="hero-date-stamp">${invitationData.hero.dateStamp}</p>
        <div class="hero-photo-frame">
          <img src="${withBase(invitationData.hero.image.src)}" alt="${invitationData.hero.image.alt}" fetchpriority="high" />
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
              role="img"
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

  <div class="lightbox" id="gallery-lightbox" hidden>
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

const updateDday = () => {
  const target = document.querySelector<HTMLElement>('#dday-value')
  if (!target) return

  const dday = getDday()
  target.textContent = String(Math.max(dday, 0))
}

updateDday()
window.setInterval(updateDday, 60 * 60 * 1000)

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

    lightbox.hidden = false
    document.body.classList.add('lightbox-open')
    syncGallery(index)
  })
})

document.querySelector('.lightbox-close')?.addEventListener('click', () => {
  if (!lightbox) return
  lightbox.hidden = true
  document.body.classList.remove('lightbox-open')
})

document.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => {
  syncGallery(activeGalleryIndex - 1)
})

document.querySelector('[data-lightbox-next]')?.addEventListener('click', () => {
  syncGallery(activeGalleryIndex + 1)
})

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    lightbox.hidden = true
    document.body.classList.remove('lightbox-open')
  }
})

document.addEventListener('keydown', (event) => {
  if (!lightbox || lightbox.hidden) return

  if (event.key === 'Escape') {
    lightbox.hidden = true
    document.body.classList.remove('lightbox-open')
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
  if (prefersReducedMotion.matches) {
    canvas.style.display = 'none'
    return
  }

  const context = canvas.getContext('2d')
  if (!context) return
  const ctx = context

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let width = 0
  let height = 0
  let animationFrame = 0
  let flakes: Snowflake[] = []
  let running = true
  let lastNow = 0
  let spriteCanvas: HTMLCanvasElement | null = null

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
    sway = 0
    swayPhase = 0
    opacity = 0
    rotation = 0
    spin = 0

    constructor(initial: boolean) {
      this.reset(initial)
    }

    reset(initial: boolean) {
      this.x = Math.random() * width
      this.y = initial ? Math.random() * height : -32
      this.size = 7 + Math.random() * 9
      this.speed = 24 + Math.random() * 42
      this.sway = 4 + Math.random() * 12
      this.swayPhase = Math.random() * Math.PI * 2
      this.opacity = 0.3 + Math.random() * 0.36
      this.rotation = Math.random() * Math.PI * 2
      this.spin = (Math.random() - 0.5) * 0.0018
    }

    step(deltaSeconds: number) {
      this.y += this.speed * deltaSeconds
      this.rotation += this.spin

      if (this.y > height + 36) {
        this.reset(false)
      }
    }

    draw(now: number) {
      if (!spriteCanvas) return

      const driftX = Math.sin(now / 1400 + this.swayPhase) * this.sway
      const drawX = this.x + driftX
      const spriteSize = this.size * 2

      ctx.save()
      ctx.globalAlpha = this.opacity
      ctx.translate(drawX, this.y)
      ctx.rotate(this.rotation)
      ctx.drawImage(spriteCanvas, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize)
      ctx.restore()
    }
  }

  const resize = () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    spriteCanvas = createSnowflakeSprite()
    flakes = Array.from({ length: Math.max(18, Math.min(44, Math.floor(width / 32))) }, () => new Snowflake(true))
  }

  const loop = (now: number) => {
    if (!running) return
    const deltaSeconds = lastNow === 0 ? 1 / 60 : Math.min((now - lastNow) / 1000, 0.033)
    lastNow = now
    ctx.clearRect(0, 0, width, height)
    flakes.forEach((flake) => {
      flake.step(deltaSeconds)
      flake.draw(now)
    })
    animationFrame = window.requestAnimationFrame(loop)
  }

  resize()
  animationFrame = window.requestAnimationFrame(loop)

  const onVisibility = () => {
    running = document.visibilityState !== 'hidden'
    if (running) {
      lastNow = 0
      animationFrame = window.requestAnimationFrame(loop)
    } else {
      window.cancelAnimationFrame(animationFrame)
    }
  }

  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', onVisibility)
}

setupSnow()
void setupKakaoMap()

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
      const imageUrl = new URL(withBase('/images/og-image.jpg'), window.location.href).toString()

      window.Kakao?.Share?.sendDefault({
        objectType: 'feed',
        content: {
          title: invitationData.seo.title,
          description: invitationData.seo.description,
          imageUrl,
          link: {
            mobileWebUrl: currentPageUrl,
            webUrl: currentPageUrl,
          },
        },
        buttons: [
          {
            title: '청첩장 보기',
            link: {
              mobileWebUrl: currentPageUrl,
              webUrl: currentPageUrl,
            },
          },
        ],
      })
    })
  })
}
