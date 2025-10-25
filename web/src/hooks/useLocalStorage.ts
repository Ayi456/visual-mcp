import { useState, useEffect, useCallback } from 'react'
import { getStorageJSON, setStorageJSON, removeStorageItem } from '@/utils/storage'

/**
 * 使用本地存储的 Hook
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = getStorageJSON<T>(key)
      return item !== null ? item : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // 设置值的函数
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // 允许传入函数来更新值
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      setStorageJSON(key, valueToStore)
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // 移除值的函数
  const removeValue = useCallback(() => {
    try {
      removeStorageItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * 监听本地存储变化的 Hook
 * @param key - 存储键名
 * @param callback - 变化回调函数
 */
export function useStorageListener<T>(
  key: string,
  callback: (newValue: T | null, oldValue: T | null) => void
) {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null
          const newValue = e.newValue ? JSON.parse(e.newValue) : null
          callback(newValue, oldValue)
        } catch (error) {
          console.warn(`Error parsing storage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, callback])
}

/**
 * 本地存储状态同步 Hook
 * 用于在多个组件间同步本地存储的状态
 */
export function useStorageState<T>(key: string, initialValue: T) {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue)

  // 监听其他标签页的存储变化
  useStorageListener<T>(key, (newValue) => {
    if (newValue !== null) {
      setValue(newValue)
    }
  })

  return [value, setValue, removeValue] as const
}

/**
 * 会话存储的 Hook（类似 useLocalStorage 但使用 sessionStorage）
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      sessionStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      sessionStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
