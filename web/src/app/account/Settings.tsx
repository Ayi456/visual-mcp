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
    <div className="space-y-6">
      {/* 成功提示 */}
      {showSuccess && (
        <SuccessMessage
          message="设置已保存成功！"
          onDismiss={() => {}}
        />
      )}

      {/* 个人信息设置 */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          个人信息
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">显示名称</label>
            <input
              type="text"
              className="input-modern w-full"
              value={settings.displayName}
              onChange={(e) => updateSettings({ displayName: e.target.value })}
              placeholder="输入您的显示名称"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邮箱地址</label>
            <input
              type="email"
              className="input-modern w-full"
              value={user.email}
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">邮箱地址不可修改</p>
          </div>
        </div>
      </div>

      {/* 安全设置 */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          安全设置
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">修改密码</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">定期更新密码以保护账户安全</div>
            </div>
            <button className="btn-secondary" onClick={() => setPwdModalOpen(true)}>修改密码</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">两步验证</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">为账户添加额外的安全保护</div>
            </div>
            <button className="btn-secondary opacity-50" disabled>即将推出</button>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z" />
          </svg>
          通知设置
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">短信通知</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">接收重要的账户和服务更新</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.emailNotifications}
                onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                disabled={isLoading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">配额提醒</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">当配额使用达到80%时提醒</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.quotaReminders}
                onChange={(e) => updateSettings({ quotaReminders: e.target.checked })}
                disabled={isLoading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>



      {/* 错误提示 */}
      {saveSettingsMutation.friendlyError && (
        <SimpleErrorMessage message={saveSettingsMutation.friendlyError} />
      )}

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          className="btn-gradient flex items-center"
          onClick={saveSettings}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" className="mr-2" />
              保存中...
            </>
          ) : '保存'}
        </button>
      </div>

      {/* 修改密码弹窗 */}
      {pwdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">修改密码</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">当前密码</label>
                <input type="password" className="input-modern w-full" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">新密码</label>
                <input type="password" className="input-modern w-full" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">确认新密码</label>
                <input type="password" className="input-modern w-full" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
              </div>
              {pwdError && (<SimpleErrorMessage message={pwdError} />)}
              <div className="flex justify-end space-x-3 pt-2">
                <button className="btn-secondary" onClick={() => setPwdModalOpen(false)}>取消</button>
                <button className="btn-gradient" onClick={handleChangePassword} disabled={pwdSaving}>
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
