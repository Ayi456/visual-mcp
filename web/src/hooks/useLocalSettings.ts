/**
 * 本地设置管理的自定义 Hook
 * 使用本地存储保存用户设置，不依赖后端API
 */

import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { User } from '@/types/auth'

export interface LocalSettings {
  // 个人信息
  displayName: string
  
  // 通知设置
  emailNotifications: boolean
  quotaReminders: boolean
  
  // 其他设置
  autoSave: boolean
}

const defaultSettings: LocalSettings = {
  displayName: '',
  emailNotifications: true,
  quotaReminders: true,
  autoSave: true
}

export function useLocalSettings(user: User | undefined) {
  // 使用本地存储保存设置
  const [localSettings, setLocalSettings] = useLocalStorage<LocalSettings>(
    'userSettings', 
    defaultSettings
  )
  
  const [hasChanges, setHasChanges] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // 合并用户信息和本地设置
  const settings: LocalSettings = {
    ...localSettings,
    displayName: localSettings.displayName || user?.display_name || user?.username || ''
  }

  // 更新设置
  const updateSettings = (newSettings: Partial<LocalSettings>) => {
    const updatedSettings = { ...localSettings, ...newSettings }
    setLocalSettings(updatedSettings)
    setHasChanges(true)
  }

  // 保存设置（实际上已经自动保存到本地存储了）
  const saveSettings = () => {
    setHasChanges(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // 重置设置
  const resetSettings = () => {
    const resetData = {
      ...defaultSettings,
      displayName: user?.display_name || user?.username || ''
    }
    setLocalSettings(resetData)
    setHasChanges(false)
    setShowSuccess(false)
  }

  // 检测是否有未保存的更改
  useEffect(() => {
    // 这里可以添加更复杂的变更检测逻辑
    // 目前简化处理
  }, [localSettings])

  return {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
    hasChanges,
    showSuccess,
    isLoading: false // 本地操作不需要加载状态
  }
}
