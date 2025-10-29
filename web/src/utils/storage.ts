import { normalizeString } from './normalize'

export class StorageError extends Error {
  constructor(message: string, public operation: 'get' | 'set' | 'remove', public key: string) {
    super(message)
    this.name = 'StorageError'
  }
}


export function getStorageItem(key: string): string | null {
  try {
    const value = localStorage.getItem(key)
    return normalizeString(value) || null
  } catch (error) {
    console.warn(`Failed to get localStorage item "${key}":`, error)
    throw new StorageError(`Failed to get item from localStorage`, 'get', key)
  }
}


export function setStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.warn(`Failed to set localStorage item "${key}":`, error)
    throw new StorageError(`Failed to set item to localStorage`, 'set', key)
  }
}


export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove localStorage item "${key}":`, error)
    throw new StorageError(`Failed to remove item from localStorage`, 'remove', key)
  }
}


export function getStorageJSON<T = any>(key: string): T | null {
  try {
    const value = getStorageItem(key)
    if (!value) return null
    
    return JSON.parse(value) as T
  } catch (error) {
    console.warn(`Failed to parse JSON from localStorage item "${key}":`, error)
    // 如果解析失败，清除无效数据
    try {
      removeStorageItem(key)
    } catch {
      // 忽略清除失败的错误
    }
    return null
  }
}


export function setStorageJSON<T = any>(key: string, value: T): void {
  try {
    const jsonString = JSON.stringify(value)
    setStorageItem(key, jsonString)
  } catch (error) {
    console.warn(`Failed to stringify and set localStorage item "${key}":`, error)
    throw new StorageError(`Failed to set JSON item to localStorage`, 'set', key)
  }
}


export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}


export function cleanupInvalidStorage(keys: string[]): void {
  keys.forEach(key => {
    try {
      const value = localStorage.getItem(key)
      if (value && !normalizeString(value)) {
        removeStorageItem(key)
      }
    } catch {
      // 忽略清理过程中的错误
    }
  })
}
