import useAuth from '@/store/useAuth'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '@/api/client'
import UserPanels from './UserPanels'
import Settings from './Settings'
import { useClipboard } from '@/hooks/useClipboard'
import { useUserQuota } from '@/hooks/useUserQuota'
import { useApiMutation } from '@/hooks/useApiMutation'
import { setStorageJSON } from '@/utils/storage'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { SimpleErrorMessage } from '@/components/ui/ErrorMessage'
import UsageGuideDialog from '@/components/guide/UsageGuideDialog'
import PlansDialog from '@/components/pricing/PlansDialog'

export default function Account() {
  const { user, accessKey, loadFromStorage, logout, setAuth } = useAuth()
  const { copyToClipboard, isCopied } = useClipboard()
  const { quotaData, loading } = useUserQuota(user)

  const [activeTab, setActiveTab] = useState<'overview' | 'panels' | 'settings'>('overview')
  const [showKey, setShowKey] = useState(false)
  const [refreshOpen, setRefreshOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [guideOpen, setGuideOpen] = useState(false)

  // 刷新访问密钥的 mutation
  const refreshKeyMutation = useApiMutation(
    async () => {
      if (!user?.email || !password) {
        throw new Error('请输入账户密码')
      }
      return apiPost('/api/auth/access-key/rotate', {
        email: user.email,
        password
      })
    },
    {
      onSuccess: (response) => {
        if (response.success && response.data?.accessKey) {
          // 清理 AccessKey 中的任何额外字符
          const cleanKey = String(response.data.accessKey).trim().replace(/[\r\n\t\s]/g, '')
          setStorageJSON('accessKey', cleanKey)
          setAuth(user!, cleanKey)
          setPassword('')
          setRefreshOpen(false)
        }
      }
    }
  )

  useEffect(() => {
    if (!user) {
      loadFromStorage()
    }
  }, [])

  if(!user){
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">请先登录以访问账户中心</p>
          <Link to="/auth" className="btn-gradient inline-block">立即登录</Link>
        </div>
      </div>
    )
  }

  const dailyPercent = quotaData ? Math.min(100, (quotaData.quota_used_today / quotaData.quota_daily) * 100) : 0
  const monthlyPercent = quotaData ? Math.min(100, (quotaData.quota_used_month / quotaData.quota_monthly) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-gray-900">
      {/* 顶部导航栏 */}
      <nav className="glass border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-4">
                <div className="w-11 h-11 bg-gray-900 dark:bg-white rounded-elegant-lg flex items-center justify-center shadow-elegant-sm">
                  <svg className="w-6 h-6 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-medium text-gradient">
                  MCP 控制台
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-2 ml-8">
                <Link to="/account" className="px-4 py-2.5 rounded-elegant bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium shadow-elegant-sm">
                  账户中心
                </Link>
                <Link to="/sql" className="px-4 py-2.5 rounded-elegant text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-elegant">
                  SQL 控制台
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-5">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 rounded-elegant flex items-center justify-center text-white dark:text-gray-900 font-semibold text-sm shadow-elegant-sm">
                  {(user.display_name || user.username)[0].toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user.display_name || user.username}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">
                    {user.plan === 'free' ? '免费版' : user.plan === 'basic' ? '基础版' : '高级版'}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-elegant transition-elegant"
                title="退出登录"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {/* 欢迎区域 - 极简优雅版 */}
        <div className="mb-10">
          <div className="relative overflow-hidden card-modern p-10 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-medium text-gray-900 dark:text-white mb-4 tracking-tight">
                  欢迎回来，{user.display_name || user.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-light">
                  {new Date().toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
                <div className="mt-6 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>最后登录: {(user as any).last_login_at ? new Date((user as any).last_login_at).toLocaleString('zh-CN') : '首次登录'}</span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-400 rounded-elegant-xl flex items-center justify-center text-white dark:text-gray-900 text-2xl font-semibold shadow-elegant-lg">
                  {(user.display_name || user.username)[0].toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 导航 - 优雅版 */}
        <div className="mb-10">
          <div className="flex space-x-2 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-elegant-lg backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 flex items-center justify-center px-5 py-3.5 rounded-elegant font-medium transition-elegant ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-elegant-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              概览
            </button>
            <button
              onClick={() => setActiveTab('panels')}
              className={`flex-1 flex items-center justify-center px-5 py-3.5 rounded-elegant font-medium transition-elegant ${
                activeTab === 'panels'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-elegant-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              我的面板
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center px-5 py-3.5 rounded-elegant font-medium transition-elegant ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-elegant-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              设置
            </button>
          </div>
        </div>

        {/* Tab 内容 */}
        {activeTab === 'overview' && (
          <>
            {/* 增强版配额统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* 今日调用卡片 */}
          <div className="group card-modern p-6 text-center hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {loading ? (
                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 mx-auto rounded"></div>
              ) : (
                quotaData ? quotaData.quota_used_today : '0'
              )}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">今日调用</div>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              {loading ? '' : quotaData ? `共 ${quotaData.quota_daily} 次` : ''}
            </div>
          </div>

          {/* 使用率卡片 */}
          <div className="group card-modern p-6 text-center hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {loading ? (
                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 mx-auto rounded"></div>
              ) : (
                quotaData ? Math.round((quotaData.quota_used_today / quotaData.quota_daily) * 100) : '0'
              )}%
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">今日使用率</div>
            {/* 进度条 */}
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: loading ? '0%' : quotaData ? `${Math.min((quotaData.quota_used_today / quotaData.quota_daily) * 100, 100)}%` : '0%'
                }}
              ></div>
            </div>
          </div>

          {/* 套餐卡片 */}
          <div className="group card-modern p-6 text-center hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {user.plan === 'free' ? '免费版' : user.plan === 'basic' ? '基础版' : user.plan === 'premium' ? '高级版' : '企业版'}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">当前套餐</div>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.plan === 'free'
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  : user.plan === 'basic'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              }`}>
                {(user.plan || 'free').toUpperCase()}
              </span>

              {user.plan !== 'premium' && (
                <button
                  className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                  onClick={() => setUpgradeOpen(true)}
                  aria-label="了解升级方案"
                >
                  了解升级方案
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

            </div>
          </div>

          {/* 剩余配额卡片 */}
          <div className="group card-modern p-6 text-center hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
              {loading ? (
                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 mx-auto rounded"></div>
              ) : (
                quotaData ? quotaData.quota_remaining_today : '0'
              )}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">今日剩余</div>
            <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
              {loading ? '' : quotaData ? `重置时间: 次日 00:00` : ''}
            </div>
          </div>
        </div>

        {user.plan !== 'premium' && quotaData && quotaData.quota_daily > 0 && (quotaData.quota_used_today / quotaData.quota_daily) > 0.7 && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/60 dark:border-yellow-800/60 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              今日配额已使用 {Math.round((quotaData.quota_used_today / quotaData.quota_daily) * 100)}%，升级以获得更高限额与更多功能。
            </div>
            <button className="btn-gradient" onClick={() => setUpgradeOpen(true)}>升级套餐</button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <div className="card-modern p-6 animate-fade-in h-full hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gradient">
                  个人信息
                </h3>
              </div>

              <div className="space-y-6">
                <div className="relative p-4 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25">
                      {(user.display_name || user.username)[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {user.display_name || user.username}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">{user.email}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 当前套餐 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">当前套餐</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                        {user.plan === 'free' ? '免费版' : user.plan === 'basic' ? '基础版' : '高级版'}
                      </span>
                      <button
                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setUpgradeOpen(true)}
                      >
                        升级
                      </button>
                    </div>
                  </div>

                  {/* 注册时间 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
                        </svg>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">注册时间</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '未知'}
                    </span>
                  </div>

                  {/* 最近登录 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">最近登录</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {(user as any).last_login_at ? new Date((user as any).last_login_at).toLocaleString('zh-CN') : '首次登录'}
                    </span>
                  </div>


                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2">
            <div className="card-modern p-6 animate-fade-in h-full">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                  </svg>
                  API 密钥管理
                </h3>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Access ID
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">用于标识您的API请求</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="code-block flex-1 bg-white dark:bg-gray-800">{user.access_id}</div>
                    <button
                      onClick={() => copyToClipboard(user.access_id, 'accessId')}
                      className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      title="复制 Access ID"
                    >
                      {isCopied('accessId') ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Access Key
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {accessKey ? '仅登录时显示，请妥善保管' : '已隐藏，刷新密钥可查看'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      readOnly
                      type={showKey ? 'text' : 'password'}
                      value={accessKey ? (showKey ? accessKey : '••••••••••••••••••••••••••••••••') : ''}
                      placeholder={accessKey ? '' : '••••••••••••••••••••••••••••••••'}
                      className="input-modern flex-1"
                    />
                    <button
                      onClick={() => setShowKey(v => !v)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      title={showKey ? '隐藏' : '显示'}
                    >
                      {showKey ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-4s1.57-1.66 3.938-2.988M6.136 6.136A10.554 10.554 0 0112 5c5 0 9 4 9 4s-.868.918-2.25 1.875M9.88 9.88A3 3 0 0115 12m-3 3a3 3 0 01-3-3" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4 0 10 3 10 7s-6 7-10 7-10-3-10-7z" />
                        </svg>
                      )}
                    </button>
                    {accessKey && (
                      <button
                        onClick={() => copyToClipboard(accessKey, 'accessKey')}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="复制 Access Key"
                      >
                        {isCopied('accessKey') ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 002 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setRefreshOpen(true)}
                      className="p-2 bg-purple-600 text-white rounded-lg border border-purple-700 hover:bg-purple-700 transition-colors"
                      title="刷新 Access Key"
                    >刷新密钥</button>
                  </div>
                </div>

                {/* API使用示例 */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    API 使用示例（通过 URL + Access ID + Access Key）
                  </h4>
                  <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded-lg text-sm font-mono text-gray-300 overflow-x-auto">
                    <div className="text-green-400"># 填写 API URL、Access ID、Access Key 后调用</div>
                    <div className="mt-1">
                      <span className="text-blue-400">URL </span>http://mcp.zha-ji.cn/mcp<br/>
                      <span className="ml-2 text-yellow-400">-</span> <span className="text-red-400">"AccessID: {user.access_id}"</span> \<br/>
                      <span className="ml-2 text-yellow-400">-</span> <span className="text-red-400">"AccessKey:{accessKey || 'YOUR_ACCESS_KEY'}"</span><br/>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-[15px] text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                    onClick={() => setGuideOpen(true)}
                    aria-label="查看快速使用指引"
                  >
                    查看快速使用指引
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使用统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card-modern p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">今日使用量</h3>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : quotaData ? `${quotaData.quota_used_today}` : '0'}
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>已使用</span>
                <span>{loading ? '...' : quotaData ? `${quotaData.quota_used_today} / ${quotaData.quota_daily}` : '0 / 0'}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${dailyPercent}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">每日 00:00 重置</p>
          </div>

          <div className="card-modern p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">本月使用量</h3>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? '...' : quotaData ? `${quotaData.quota_used_month}` : '0'}
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>已使用</span>
                <span>{loading ? '...' : quotaData ? `${quotaData.quota_used_month} / ${quotaData.quota_monthly}` : '0 / 0'}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${monthlyPercent}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">每月 1 号重置</p>
          </div>
        </div>

        {/* 快捷导航 */}
        <div className="mt-8">
          {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快捷功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">


            <Link to="/sql" className="card-modern p-4 hover:shadow-lg transition-all group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">SQL 控制台</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">数据库查询工具</div>
                </div>
              </div>
            </Link>

            <div className="card-modern p-4 opacity-50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-500 dark:text-gray-400">数据分析</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">即将推出</div>
                </div>
              </div>
            </div>

            <div className="card-modern p-4 opacity-50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-500 dark:text-gray-400">高级设置</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">即将推出</div>
                </div>
              </div>
            </div>

          </div> */}

        </div>
          </>
        )}

        {/* Panels Tab 内容 */}
        {activeTab === 'panels' && (
          <UserPanels />
        )}

        {/* Settings Tab 内容 */}
        {activeTab === 'settings' && (
          <Settings />
        )}

      </div>


      {guideOpen && (
        <UsageGuideDialog open={guideOpen} onClose={() => setGuideOpen(false)} />
      )}

      {/* 刷新密钥对话框 */}
      {refreshOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !refreshKeyMutation.isPending && setRefreshOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">刷新 Access Key</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              为保证安全，请输入账户密码以确认刷新操作。
            </p>

            <input
              type="password"
              className="input-modern w-full mb-2"
              placeholder="请输入账户密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={refreshKeyMutation.isPending}
            />

            {refreshKeyMutation.friendlyError && (
              <SimpleErrorMessage message={refreshKeyMutation.friendlyError} className="mb-2" />
            )}

            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setRefreshOpen(false)}
                disabled={refreshKeyMutation.isPending}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={() => refreshKeyMutation.mutate(undefined)}
                disabled={refreshKeyMutation.isPending}
                className="px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center"
              >
                {refreshKeyMutation.isPending ? (


                  <>
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    刷新中...
                  </>
                ) : '确认刷新'}
              </button>
            </div>
          </div>
        </div>
      )}

      {upgradeOpen && (
        <PlansDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      )}


    </div>
  )
}

