import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '@/api/client'
import useAuth from '@/store/useAuth'
import { LoginRequest, LoginResponseData } from '@/types/auth'
import { ApiResponse } from '@/types/api'
import { useApiMutation } from '@/hooks/useApiMutation'
import AuthLayout from '@/components/layout/AuthLayout'
import { SimpleErrorMessage } from '@/components/ui/ErrorMessage'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const setAuth = useAuth((s) => s.setAuth)
  const navigate = useNavigate()

  const loginMutation = useApiMutation(
    async (): Promise<ApiResponse<LoginResponseData>> => {
      const loginData: LoginRequest = {
        identifier,
        password,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent
      }
      return apiPost<LoginResponseData>('/api/auth/login', loginData)
    },
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          const { user, accessKey } = response.data
          setAuth(user, accessKey)
          navigate('/account', { replace: true })
        }
      }
    }
  )

  return (
    <AuthLayout
      title="欢迎回来"
      subtitle="登录您的 MCP 控制台账户"
    >

      <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(undefined); }} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            手机号 / 邮箱
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="input-modern"
            placeholder="请输入手机号或邮箱"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-modern"
            placeholder="••••••••"
            required
          />
          <div className="mt-2 text-right">
            <a
              href="/forget"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              忘记密码？
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="btn-gradient w-full"
        >
          {loginMutation.isPending ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" color="white" className="mr-3" />
              登录中...
            </div>
          ) : '立即登录'}
        </button>

        {loginMutation.friendlyError && (
          <SimpleErrorMessage message={loginMutation.friendlyError} />
        )}
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          还没有账号？{' '}
          <a
            href="/register"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            立即注册
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
