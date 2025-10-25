import { create } from 'zustand'
import { User, AuthState } from '@/types/auth'
import { getStorageJSON, setStorageJSON, removeStorageItem, cleanupInvalidStorage } from '@/utils/storage'
import { cleanAccessKey } from '@/utils/cleanAccessKey'

const useAuth = create<AuthState>((set) => ({
  user: undefined,
  accessKey: undefined,
  hydrated: false,

  setAuth: (user: User, accessKey?: string) => {
    // 清理和规范化 AccessKey（会去除所有空白字符和 Bearer 前缀）
    const normalizedAccessKey = cleanAccessKey(accessKey)

    // 保存到本地存储
    try {
      setStorageJSON('userInfo', user)
      if (normalizedAccessKey) {
        // 已经通过 cleanAccessKey 清理过了
        setStorageJSON('accessKey', normalizedAccessKey)
      }
    } catch (error) {
      console.warn('Failed to save auth data to storage:', error)
    }

    set(() => ({
      user,
      accessKey: normalizedAccessKey,
      hydrated: true
    }))
  },

  loadFromStorage: () => {
    try {
      // 清理无效的存储项
      cleanupInvalidStorage(['userInfo', 'accessKey'])

      const user = getStorageJSON<User>('userInfo')
      const accessKey = cleanAccessKey(getStorageJSON<string>('accessKey'))

      set(() => ({
        user: user || undefined,
        accessKey,
        hydrated: true
      }))
    } catch (error) {
      console.warn('Failed to load auth data from storage:', error)
      set(() => ({ hydrated: true }))
    }
  },

  logout: () => {
    try {
      removeStorageItem('userInfo')
      removeStorageItem('accessKey')
    } catch (error) {
      console.warn('Failed to clear auth data from storage:', error)
    }

    set(() => ({
      user: undefined,
      accessKey: undefined,
      hydrated: true
    }))

    window.location.href = '/auth'
  }
}))

export default useAuth
