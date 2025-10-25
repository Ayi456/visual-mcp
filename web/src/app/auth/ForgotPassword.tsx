import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '@/api/client'
import AuthLayout from '@/components/layout/AuthLayout'
import { SimpleErrorMessage } from '@/components/ui/ErrorMessage'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type Step = 'phone' | 'code' | 'password'

interface ForgotPasswordResponse {
  success: boolean
  message: string
  code?: string // 开发环境返回
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('phone')
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 发送验证码
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneOrEmail.trim()) {
      setError('请输入手机号或邮箱')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await apiPost<ForgotPasswordResponse>(
        '/api/auth/forget/send-code',
        { phoneOrEmail }
      )

      if (response.success) {
        setStep('code')
        setSuccessMessage(response.message || '验证码已发送')

        // 如果是开发环境，显示验证码
        if (response.data?.code) {
          setSuccessMessage(`验证码已发送（开发环境：${response.data.code}）`)
        }

        // 开始倒计时
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(response.message || '发送失败')
      }
    } catch (err: any) {
      setError(err.message || '网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 验证验证码
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (code.length !== 6) {
      setError('请输入6位验证码')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await apiPost<ForgotPasswordResponse>(
        '/api/auth/forget/verify-code',
        { phoneOrEmail, code }
      )

      if (response.success) {
        setStep('password')
        setSuccessMessage('验证成功，请设置新密码')
      } else {
        setError(response.message || '验证失败')
      }
    } catch (err: any) {
      setError(err.message || '网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      setError('密码长度至少6位')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await apiPost<ForgotPasswordResponse>(
        '/api/auth/forget/reset',
        { phoneOrEmail, code, newPassword }
      )

      if (response.success) {
        setSuccessMessage('密码重置成功！即将跳转到登录页...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(response.message || '重置失败')
      }
    } catch (err: any) {
      setError(err.message || '网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="忘记密码"
      subtitle="通过手机号或邮箱重置您的密码"
    >
      {/* 步骤指示器 */}
      <div className="flex justify-between mb-8">
        <div className={`flex-1 text-center ${step === 'phone' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${step === 'phone' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            1
          </div>
          <span className="text-xs">验证身份</span>
        </div>
        <div className={`flex-1 text-center ${step === 'code' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${step === 'code' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            2
          </div>
          <span className="text-xs">输入验证码</span>
        </div>
        <div className={`flex-1 text-center ${step === 'password' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${step === 'password' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            3
          </div>
          <span className="text-xs">设置新密码</span>
        </div>
      </div>

      {/* 错误和成功提示 */}
      {error && <SimpleErrorMessage message={error} />}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
          {successMessage}
        </div>
      )}

      {/* 步骤 1: 输入手机号/邮箱 */}
      {step === 'phone' && (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              手机号 / 邮箱
            </label>
            <input
              type="text"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="input-modern"
              placeholder="请输入注册时使用的手机号或邮箱"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" className="mr-3" />
                发送中...
              </div>
            ) : '发送验证码'}
          </button>
        </form>
      )}

      {/* 步骤 2: 输入验证码 */}
      {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              验证码
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-modern text-center text-2xl tracking-widest"
              placeholder="请输入6位验证码"
              maxLength={6}
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              验证码已发送至 {phoneOrEmail}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              返回上一步
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex-1 btn-gradient"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" className="mr-3" />
                  验证中...
                </div>
              ) : '下一步'}
            </button>
          </div>

          {countdown > 0 ? (
            <p className="text-center text-sm text-gray-500">
              {countdown}秒后可重新发送
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setCode('')
                setError('')
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              重新发送验证码
            </button>
          )}
        </form>
      )}

      {/* 步骤 3: 设置新密码 */}
      {step === 'password' && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              新密码
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-modern"
              placeholder="请输入新密码（至少6位）"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-modern"
              placeholder="请再次输入新密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
            className="btn-gradient w-full"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" className="mr-3" />
                重置中...
              </div>
            ) : '重置密码'}
          </button>
        </form>
      )}

      {/* 返回登录链接 */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/login')}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          ← 返回登录
        </button>
      </div>
    </AuthLayout>
  )
}
