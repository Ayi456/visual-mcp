import { useState, useEffect } from 'react'
import { apiPost, apiGet } from '@/api/client'
import { useApiMutation } from './useApiMutation'
import { User } from '@/types/auth'
import useAuth from '@/store/useAuth'

export interface UserSettings {
  // 个人信息
  displayName: string

  // 通知设置
  emailNotifications: boolean
  quotaReminders: boolean

  // 其他设置
  autoSave: boolean
}

const defaultSettings: UserSettings = {
  displayName: '',
  emailNotifications: true,
  quotaReminders: true,
  autoSave: true
}

export function useSettings(user: User | undefined) {
  // 服务器设置状态
  const [serverSettings, setServerSettings] = useState<Partial<UserSettings>>({})
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  // 合并默认设置和服务器设置
  const settings: UserSettings = {
    ...defaultSettings,
    ...serverSettings,
    // 使用 ?? 避免空字符串被回退
    displayName: (serverSettings.displayName ?? user?.display_name ?? user?.username ?? '')
  }

  // 获取服务器设置
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchSettings = async () => {
      try {
        const response = await apiGet(`/api/users/${user.id}/settings`)
        if (response.success && response.data) {
          setServerSettings(response.data)
        }
      } catch (error) {
        console.warn('获取用户设置失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [user?.id])

  // 保存设置到服务器的 mutation
  const saveSettingsMutation = useApiMutation(
    async (newSettings: Partial<UserSettings>) => {
      if (!user) throw new Error('用户未登录')

      return apiPost(`/api/users/${user.id}/settings`, newSettings)
    },
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          setServerSettings(response.data)
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)

          // 同步刷新全局用户信息中的显示名称，确保账户页等处即时生效
          try {
            const { setAuth, user: currentUser, accessKey } = useAuth.getState()
            if (currentUser && typeof response.data.displayName === 'string') {
              setAuth({ ...currentUser, display_name: response.data.displayName }, accessKey)
            }
          } catch {}
        }
      }
    }
  )

  // 更新设置（仅本地，不自动保存）
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    // 仅更新本地编辑态，避免触发全局 user 变化导致的设置重载
    setServerSettings(prev => ({ ...prev, ...newSettings }))
  }

  // 手动保存到服务器
  const saveSettings = () => {
    const payload: Partial<UserSettings> = {
      displayName: settings.displayName,
      emailNotifications: settings.emailNotifications,
      quotaReminders: settings.quotaReminders,
    }
    saveSettingsMutation.mutate(payload)
  }

  return {
    settings,
    loading,
    updateSettings,
    saveSettings,
    saveSettingsMutation,
    showSuccess,
    isLoading: loading || saveSettingsMutation.isPending
  }
}
