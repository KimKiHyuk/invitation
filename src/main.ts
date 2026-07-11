import './style.css'
import { invitationData } from './data/invitation'
import { getPreferredMapLaunchHref, resolveMapLinkTemplate } from './lib/map-links'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('#app element not found')
}

const baseUrl = import.meta.env.BASE_URL
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const weddingDate = new Date(invitationData.weddingInfo.eventDateTime)
const currentPageUrl = window.location.href.split('#')[0]

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
  setMeta('meta[property="og:description"]', invitationData.seo.description)
  setMeta('meta[property="og:image"]', new URL(withBase('/images/og-image.jpg'), window.location.href).toString())
  setMeta('meta[name="twitter:title"]', invitationData.seo.title)
  setMeta('meta[name="twitter:description"]', invitationData.seo.description)
  setMeta('meta[name="twitter:image"]', new URL(withBase('/images/og-image.jpg'), window.location.href).toString())
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
  <main class="invitation-page">
    <section class="page-card">
      <div class="botanical-frame" aria-hidden="true">
        <div class="botanical-cluster botanical-cluster-top-left">
          <span class="botanical-stem"></span>
          <span class="botanical-leaf botanical-leaf-sage leaf-a"></span>
          <span class="botanical-leaf botanical-leaf-sage leaf-b"></span>
          <span class="botanical-leaf botanical-leaf-sand leaf-c"></span>
          <span class="botanical-petal petal-a"></span>
          <span class="botanical-petal petal-b"></span>
          <span class="botanical-petal petal-c"></span>
        </div>
        <div class="botanical-cluster botanical-cluster-top-right">
          <span class="botanical-stem"></span>
          <span class="botanical-leaf botanical-leaf-sage leaf-a"></span>
          <span class="botanical-leaf botanical-leaf-sage leaf-b"></span>
          <span class="botanical-leaf botanical-leaf-sand leaf-c"></span>
          <span class="botanical-petal petal-a"></span>
          <span class="botanical-petal petal-b"></span>
          <span class="botanical-petal petal-c"></span>
        </div>
        <div class="petal-drift drift-one"></div>
        <div class="petal-drift drift-two"></div>
        <div class="petal-drift drift-three"></div>
        <div class="petal-drift drift-four"></div>
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
          <strong>D - <span id="dday-value">0</span></strong>
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
          <img src="${withBase(invitationData.venue.mapPreviewSrc)}" alt="${invitationData.venue.name} 지도 미리보기" />
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

      <section class="section-block rsvp-section reveal-on-scroll">
        <p class="section-kicker">RSVP</p>
        <h2>${invitationData.rsvp.title}</h2>
        <p class="section-description">${invitationData.rsvp.description}</p>
        ${
          invitationData.rsvp.formHref
            ? `<a class="pill-button pill-button-solid" href="${invitationData.rsvp.formHref}" target="_blank" rel="noreferrer noopener">${invitationData.rsvp.ctaLabel}</a>`
            : `<button class="pill-button pill-button-muted" type="button" disabled>${invitationData.rsvp.ctaLabel}</button>`
        }
        <p class="section-note">${invitationData.rsvp.note}</p>
      </section>

      <section class="section-block share-section reveal-on-scroll">
        <p class="section-kicker">Share</p>
        <h2>${invitationData.share.title}</h2>
        <p class="section-description">${invitationData.share.description}</p>
        <div class="share-actions">
          <button class="pill-button pill-button-outline" type="button" data-copy="share-link" data-label="청첩장 링크 복사">
            링크 복사
          </button>
          <button class="pill-button pill-button-outline" type="button" id="native-share-button">
            시스템 공유
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
  if (liveRegion) {
    liveRegion.textContent = message
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

const nativeShareButton = document.querySelector<HTMLButtonElement>('#native-share-button')
if (nativeShareButton && navigator.share) {
  nativeShareButton.addEventListener('click', async () => {
    try {
      await navigator.share({
        title: invitationData.seo.title,
        text: invitationData.seo.description,
        url: window.location.href,
      })
    } catch {
      // Ignore cancellation and fallback to copy if needed.
    }
  })
} else if (nativeShareButton) {
  nativeShareButton.hidden = true
}

const setupReveal = () => {
  const targets = document.querySelectorAll<HTMLElement>('.reveal-on-scroll')

  if (prefersReducedMotion.matches) {
    targets.forEach((target) => target.dataset.revealed = 'true')
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-revealed', 'true')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.18 },
  )

  targets.forEach((target) => observer.observe(target))
}

setupReveal()
