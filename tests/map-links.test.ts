import { describe, expect, it } from 'vitest'

import { invitationData } from '../src/data/invitation'
import { getPreferredMapLaunchHref, isAndroidDevice, resolveMapLinkTemplate } from '../src/lib/map-links'

describe('map link helpers', () => {
  it('injects the current app URL into templated map links', () => {
    const naverLink = invitationData.venue.links.find((link) => link.label === '네이버맵')

    expect(naverLink).toBeDefined()
    expect('appHref' in naverLink! && naverLink.appHref.includes('{APP_URL}')).toBe(true)

    const resolved = resolveMapLinkTemplate(naverLink!.appHref, 'https://kimkihyuk.github.io/invitation/')

    expect(resolved).toContain(
      'appname=https%3A%2F%2Fkimkihyuk.github.io%2Finvitation%2F',
    )
  })

  it('prefers Android intent links on Android devices', () => {
    const href = getPreferredMapLaunchHref({
      appHref: 'nmap://navigation?foo=bar',
      androidIntentHref: 'intent://navigation?foo=bar#Intent;scheme=nmap;end',
      userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 8)',
    })

    expect(href.startsWith('intent://')).toBe(true)
  })

  it('falls back to the app scheme on non-Android devices', () => {
    const href = getPreferredMapLaunchHref({
      appHref: 'nmap://navigation?foo=bar',
      androidIntentHref: 'intent://navigation?foo=bar#Intent;scheme=nmap;end',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
    })

    expect(href).toBe('nmap://navigation?foo=bar')
    expect(isAndroidDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe(false)
  })
})
