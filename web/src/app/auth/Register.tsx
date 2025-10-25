import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '@/api/client'
import { RegisterResponseData } from '@/types/auth'
import { useApiMutation } from '@/hooks/useApiMutation'
import { setStorageJSON } from '@/utils/storage'
import AuthLayout from '@/components/layout/AuthLayout'
import { SimpleErrorMessage, SuccessMessage } from '@/components/ui/ErrorMessage'
import LoadingSpinner from '@/components/ui/LoadingSpinner'


export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    verifyCode: '',
    plan: 'basic'
  })
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 发送验证码
  const sendCodeMutation = useApiMutation(
    async () => {
      if (!formData.phone) {
        throw new Error('请输入手机号')
      }
      return apiPost<{ success: boolean; message: string }>('/api/sms/send-code', {
        phone: formData.phone
      })
    },
    {
      onSuccess: (response) => {
        if (response.success) {
          setCountdown(60) // 开始60秒倒计时
        }
      }
    }
  )

  // 注册（必须验证手机号）
  const registerMutation = useApiMutation(
    async () => {
      // 先验证验证码
      if (formData.phone && formData.verifyCode) {
        const verifyResult = await apiPost<{ success: boolean; message: string }>(
          '/api/sms/verify-code',
          { phone: formData.phone, code: formData.verifyCode }
        )
        if (!verifyResult.success) {
          throw new Error(verifyResult.message || '验证码验证失败')
        }
      }
      
      return apiPost<RegisterResponseData>('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        plan: formData.plan
      })
    },
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          // 保存访问密钥
          if (response.data.accessKey) {
            setStorageJSON('accessKey', response.data.accessKey)
          }
          setSuccess(true)
          // 延迟跳转到登录页
          setTimeout(() => navigate('/auth'), 1500)
        }
      }
    }
  )

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <AuthLayout title="注册成功" subtitle="正在跳转到登录页面...">
        <SuccessMessage message="注册成功！正在跳转到登录页面..." />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="创建账户" subtitle="加入 MCP 数据可视化平台">
      <form onSubmit={(e) => { e.preventDefault(); registerMutation.mutate(undefined); }} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            用户名
          </label>
          <input
            value={formData.username}
            onChange={(e) => updateField('username', e.target.value)}
            className="input-modern"
            placeholder="请输入用户名"
            required
            minLength={3}
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            邮箱地址
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="input-modern"
            placeholder="name@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            手机号
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="input-modern"
            placeholder="请输入手机号"
            pattern="1[3-9][0-9]{9}"
            required
            maxLength={11}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            验证码
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.verifyCode}
              onChange={(e) => updateField('verifyCode', e.target.value)}
              className="input-modern flex-1"
              placeholder="请输入验证码"
              required
              maxLength={6}
            />
            <button
              type="button"
              onClick={() => sendCodeMutation.mutate(undefined)}
              disabled={countdown > 0 || sendCodeMutation.isPending || !formData.phone}
              className="btn-secondary px-4 whitespace-nowrap"
            >
              {sendCodeMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : countdown > 0 ? (
                `${countdown}秒后重试`
              ) : (
                '获取验证码'
              )}
            </button>
          </div>
          {sendCodeMutation.friendlyError && (
            <p className="text-sm text-red-500 mt-1">{sendCodeMutation.friendlyError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            密码
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            className="input-modern"
            placeholder="至少6位字符"
            required
            minLength={6}
          />
        </div>


        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="btn-gradient w-full"
        >
          {registerMutation.isPending ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" color="white" className="mr-3" />
              创建中...
            </div>
          ) : '创建账户'}
        </button>

        {registerMutation.friendlyError && (
          <SimpleErrorMessage message={registerMutation.friendlyError} />
        )}
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          已有账号？{' '}
          <a
            href="/auth"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            立即登录
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
