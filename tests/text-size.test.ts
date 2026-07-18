import { describe, expect, it, vi } from 'vitest'

import { LARGE_TEXT_STORAGE_KEY, readLargeTextPreference, writeLargeTextPreference } from '../src/lib/text-size'

describe('large text preference', () => {
  it('restores the enabled state from storage', () => {
    const storage = { getItem: vi.fn(() => 'on') }

    expect(readLargeTextPreference(() => storage)).toBe(true)
    expect(storage.getItem).toHaveBeenCalledWith(LARGE_TEXT_STORAGE_KEY)
  })

  it('falls back safely when storage is unavailable', () => {
    expect(
      readLargeTextPreference(() => {
        throw new Error('blocked')
      }),
    ).toBe(false)
  })

  it('stores both enabled and disabled states', () => {
    const storage = { setItem: vi.fn() }

    expect(writeLargeTextPreference(true, () => storage)).toBe(true)
    expect(writeLargeTextPreference(false, () => storage)).toBe(true)
    expect(storage.setItem).toHaveBeenNthCalledWith(1, LARGE_TEXT_STORAGE_KEY, 'on')
    expect(storage.setItem).toHaveBeenNthCalledWith(2, LARGE_TEXT_STORAGE_KEY, 'off')
  })
})
