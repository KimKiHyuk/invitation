export const LARGE_TEXT_STORAGE_KEY = 'invitation:largeText'

type ReadableStorage = Pick<Storage, 'getItem'>
type WritableStorage = Pick<Storage, 'setItem'>

export const readLargeTextPreference = (getStorage: () => ReadableStorage) => {
  try {
    return getStorage().getItem(LARGE_TEXT_STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

export const writeLargeTextPreference = (enabled: boolean, getStorage: () => WritableStorage) => {
  try {
    getStorage().setItem(LARGE_TEXT_STORAGE_KEY, enabled ? 'on' : 'off')
    return true
  } catch {
    return false
  }
}
