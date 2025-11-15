import { useState } from 'react'
import useAuth from '@/store/useAuth'
import { useSettings } from '@/hooks/useSettings'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { SimpleErrorMessage, SuccessMessage } from '@/components/ui/ErrorMessage'
import { apiPost } from '@/api/client'

export default function Settings() {
  const { user } = useAuth()
  const { settings, updateSettings, saveSettings, saveSettingsMutation, showSuccess, isLoading } = useSettings(user)

  const [pwdModalOpen, setPwdModalOpen] = useState(false)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdSuccess, setPwdSuccess] = useState(false)

  const handleChangePassword = async () => {
    setPwdError(null)
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError('请填写完整的当前密码与新密码')
      return
    }
    if (newPwd.length < 6) {
      setPwdError('新密码长度至少6位')
      return
    }
    if (newPwd !== confirmPwd) {
      setPwdError('两次输入的新密码不一致')
      return
    }
    try {
      setPwdSaving(true)
      const res = await apiPost('/api/auth/change-password', {
        userId: user!.id,
        currentPassword: currentPwd,
        newPassword: newPwd,
      })
      if (!res.success) {
        setPwdError(res.message || '修改密码失败')
        return
      }
      // 成功
      setPwdModalOpen(false)
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
      setPwdSuccess(true)
      setTimeout(() => setPwdSuccess(false), 3000)
    } catch (e: any) {
      setPwdError(e?.message || '修改密码失败')
    } finally {
      setPwdSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 成功提示 - 增强视觉效果 */}
      {showSuccess && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 flex items-center gap-3 animate-slide-in shadow-lg shadow-green-500/10">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium">设置已保存成功！</span>
        </div>
      )}

      {pwdSuccess && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 flex items-center gap-3 animate-slide-in shadow-lg shadow-green-500/10">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium">密码修改成功！</span>
        </div>
      )}

      {/* 个人信息设置 */}
      <div className="group relative p-6 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* 装饰性背景 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/20 to-purple-100/20 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20 group-hover:scale-110 transition-transform"></div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-light text-gray-900 dark:text-white tracking-tight">
              个人信息
            </h3>
          </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">显示名称</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={settings.displayName}
              onChange={(e) => updateSettings({ displayName: e.target.value })}
              placeholder="输入您的显示名称"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">邮箱地址</label>
            <input
              type="email"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
              value={user.email}
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">邮箱地址不可修改</p>
          </div>
        </div>
        </div>
      </div>

      {/* 安全设置 */}
      <div className="group relative p-6 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* 装饰性背景 */}
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-green-100/20 to-emerald-100/20 dark:from-green-900/10 dark:to-emerald-900/10 rounded-full blur-3xl transform -translate-x-20 translate-y-20 group-hover:scale-110 transition-transform"></div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-light text-gray-900 dark:text-white tracking-tight">
              安全设置
            </h3>
          </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">修改密码</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">定期更新密码以保护账户安全</div>
            </div>
            <button className="text-sm text-sky-600 dark:text-sky-400 hover:underline" onClick={() => setPwdModalOpen(true)}>修改密码</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 opacity-50">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">两步验证</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">为账户添加额外的安全保护</div>
            </div>
            <span className="text-xs text-gray-400">即将推出</span>
          </div>
        </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="group relative p-6 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* 装饰性背景 */}
        <div className="absolute top-0 left-1/2 w-40 h-40 bg-gradient-to-br from-amber-100/20 to-orange-100/20 dark:from-amber-900/10 dark:to-orange-900/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-20 group-hover:scale-110 transition-transform"></div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-light text-gray-900 dark:text-white tracking-tight">
              通知设置
            </h3>
          </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">短信通知</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">接收重要的账户和服务更新</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.emailNotifications}
                onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                disabled={isLoading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">配额提醒</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">当配额使用达到80%时提醒</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.quotaReminders}
                onChange={(e) => updateSettings({ quotaReminders: e.target.checked })}
                disabled={isLoading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600"></div>
            </label>
          </div>
        </div>
        </div>
      </div>

      {/* 错误提示 */}
      {saveSettingsMutation.friendlyError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {saveSettingsMutation.friendlyError}
        </div>
      )}

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-sky-600 dark:bg-sky-500 text-white rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={saveSettings}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" className="mr-2 inline" />
              保存中...
            </>
          ) : '保存设置'}
        </button>
      </div>

      {/* 修改密码弹窗 */}
      {pwdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-light text-gray-900 dark:text-white mb-6 tracking-tight">修改密码</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">当前密码</label>
                <input type="password" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">新密码</label>
                <input type="password" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">确认新密码</label>
                <input type="password" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
              </div>
              {pwdError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  {pwdError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setPwdModalOpen(false)}>取消</button>
                <button className="px-4 py-2 text-sm bg-sky-600 dark:bg-sky-500 text-white rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleChangePassword} disabled={pwdSaving}>
                  {pwdSaving ? '保存中...' : '确认修改'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
