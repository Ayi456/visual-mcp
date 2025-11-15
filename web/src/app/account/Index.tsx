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
    <div className="soft-blue-bg min-h-screen relative overflow-hidden">

      {/* 装饰性背景元素 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* 网格线装饰 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        {/* 数据可视化装饰元素 - 更多样化 */}
        <div className="absolute top-32 left-20 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="140" height="140" viewBox="0 0 100 100" className="text-sky-500 animate-float">
            <rect x="10" y="60" width="15" height="30" fill="currentColor" rx="3"/>
            <rect x="30" y="40" width="15" height="50" fill="currentColor" rx="3"/>
            <rect x="50" y="20" width="15" height="70" fill="currentColor" rx="3"/>
            <rect x="70" y="50" width="15" height="40" fill="currentColor" rx="3"/>
          </svg>
        </div>

        <div className="absolute top-1/3 right-24 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-blue-500 animate-float" style={{ animationDelay: '1s' }}>
            <path d="M10,80 L30,60 L50,40 L70,30 L90,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="80" r="4" fill="currentColor"/>
            <circle cx="30" cy="60" r="4" fill="currentColor"/>
            <circle cx="50" cy="40" r="4" fill="currentColor"/>
            <circle cx="70" cy="30" r="4" fill="currentColor"/>
            <circle cx="90" cy="20" r="4" fill="currentColor"/>
          </svg>
        </div>

        <div className="absolute bottom-32 right-32 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="160" height="160" viewBox="0 0 120 120" className="text-cyan-500 animate-float-delayed">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8,8"/>
            <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="2.5"/>
            <circle cx="60" cy="60" r="20" fill="currentColor" opacity="0.4"/>
          </svg>
        </div>

        <div className="absolute bottom-1/4 left-32 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="120" height="120" viewBox="0 0 100 100" className="text-blue-500 animate-float" style={{ animationDelay: '2s' }}>
            <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
            <path d="M50,30 L70,50 L50,70 L30,50 Z" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
      </div>

      {/* 顶部导航栏 - 与首页一致 */}
      <nav className="border-b border-gray-100 dark:border-gray-900 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center group" aria-label="主页">
              <span className="text-base font-medium text-gray-700 dark:text-gray-300 tracking-tight">数据可视化平台</span>
            </Link>
            <div className="flex items-center gap-8">
              <Link to="/account" className="text-base text-sky-600 dark:text-sky-400 font-medium">
                账户中心
              </Link>
              <Link to="/dashboard" className="text-base text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                Dashboard
              </Link>
              <Link to="/sql" className="text-base text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                SQL 控制台
              </Link>
              <button onClick={logout} className="text-base text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>


      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 relative z-20">
        {/* 欢迎区域 - 增强视觉效果 */}
        <div className="mb-12 relative">
          <div className="flex items-center gap-6">
            {/* 用户头像 - 中性风格 */}
            <div className="relative">
              <div className="w-16 h-16 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center text-white dark:text-gray-900 font-semibold text-xl shadow-sm">
                {(user.display_name || user.username)[0].toUpperCase()}
              </div>
              {/* 在线状态指示器 */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-gray-950"></div>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                {user.display_name || user.username}
                {/* 套餐徽章：免费版不展示 */}
                {user.plan !== 'free' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                    {user.plan === 'basic' ? '⭐ 基础版' : user.plan === 'premium' ? '💎 高级版' : '🏢 企业版'}
                  </span>
                )}
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 font-light flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user.email}
              </p>
            </div>
          </div>

          {/* 分隔线（与首页风格） */}
          <div className="absolute -bottom-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>
        </div>

        {/* Tab 导航*/}
        <div className="mb-12">
          <div className="flex gap-2 p-1 bg-gray-100/80 dark:bg-gray-800/50 rounded-xl w-fit backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-lg text-base font-medium transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              概览
            </button>
            <button
              onClick={() => setActiveTab('panels')}
              className={`px-4 py-2.5 rounded-lg text-base font-medium transition-all flex items-center gap-2 ${
                activeTab === 'panels'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
              </svg>
              我的面板
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-lg text-base font-medium transition-all flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {/* 配额统计卡片 - 增强视觉效果 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {/* 今日调用 */}
          <div className="card-modern p-6 hover:shadow-xl transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">今日调用</div>
              </div>
              <div className="text-4xl font-semibold text-blue-600 dark:text-blue-400 mb-1">
                {loading ? (
                  <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-10 w-20 rounded"></div>
                ) : (
                  quotaData ? quotaData.quota_used_today : '0'
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '' : quotaData ? `共 ${quotaData.quota_daily} 次` : ''}
              </div>
            </div>
          </div>

          {/* 今日使用率 */}
          <div className="card-modern p-6 hover:shadow-xl transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">今日使用率</div>
              </div>
              <div className="text-4xl font-semibold text-purple-600 dark:text-purple-400 mb-3">
                {loading ? (
                  <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-10 w-20 rounded"></div>
                ) : (
                  `${quotaData ? Math.round((quotaData.quota_used_today / quotaData.quota_daily) * 100) : '0'}%`
                )}
              </div>
              {/* 进度条 */}
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: loading ? '0%' : quotaData ? `${Math.min((quotaData.quota_used_today / quotaData.quota_daily) * 100, 100)}%` : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* 当前套餐 */}
          <div className="card-modern p-6 hover:shadow-xl transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714-2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">当前套餐</div>
              </div>
              <div className="text-3xl font-semibold text-amber-600 dark:text-amber-400 mb-2">
                {user.plan === 'free' ? '免费版' : user.plan === 'basic' ? '基础版' : user.plan === 'premium' ? '高级版' : '企业版'}
              </div>
              {user.plan !== 'premium' && (
                <button
                  className="text-sm text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 group/btn font-medium"
                  onClick={() => setUpgradeOpen(true)}
                  aria-label="了解升级方案"
                >
                  了解升级方案
                  <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 今日剩余 */}
          <div className="card-modern p-6 hover:shadow-xl transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">今日剩余</div>
              </div>
              <div className="text-4xl font-semibold text-green-600 dark:text-green-400 mb-1">
                {loading ? (
                  <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-10 w-20 rounded"></div>
                ) : (
                  quotaData ? quotaData.quota_remaining_today : '0'
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                {loading ? '' : quotaData ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    重置时间: 次日 00:00
                  </>
                ) : ''}
              </div>
            </div>
          </div>
        </div>

        {user.plan !== 'premium' && quotaData && quotaData.quota_daily > 0 && (quotaData.quota_used_today / quotaData.quota_daily) > 0.7 && (
          <div className="mb-12 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              今日配额已使用 {Math.round((quotaData.quota_used_today / quotaData.quota_daily) * 100)}%，升级以获得更高限额
            </div>
            <button className="text-sm text-sky-600 dark:text-sky-400 hover:underline" onClick={() => setUpgradeOpen(true)}>升级套餐</button>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <div className="card-modern p-6 h-full">
              <div className="mb-6">
                <h3 className="text-lg font-light text-gray-900 dark:text-white tracking-tight">
                  个人信息
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center text-white dark:text-gray-900 font-medium text-lg">
                      {(user.display_name || user.username)[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {user.display_name || user.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* 当前套餐 */}
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">当前套餐</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user.plan === 'free' ? '免费版' : user.plan === 'basic' ? '基础版' : '高级版'}
                      </span>
                      <button
                        className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
                        onClick={() => setUpgradeOpen(true)}
                      >
                        升级
                      </button>
                    </div>
                  </div>

                  {/* 注册时间 */}
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">注册时间</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '未知'}
                    </span>
                  </div>

                  {/* 最近登录 */}
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">最近登录</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {(user as any).last_login_at ? new Date((user as any).last_login_at).toLocaleString('zh-CN') : '首次登录'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="card-modern p-6 h-full">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                  </svg>
                  API 密钥管理
                </h3>
              </div>

              <div className="space-y-6">
                {/* Access ID */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                        Access ID
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">用于标识您的 API 请求</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="code-block flex-1 text-sm">{user.access_id}</div>
                    <button
                      onClick={() => copyToClipboard(user.access_id, 'accessId')}
                      className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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

                {/* Access Key */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                        Access Key
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {accessKey ? '仅登录时显示，请妖善保管' : '已隐藏，刷新密钥可查看'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      type={showKey ? 'text' : 'password'}
                      value={accessKey ? (showKey ? accessKey : '••••••••••••••••••••••••••••••••') : ''}
                      placeholder={accessKey ? '' : '••••••••••••••••••••••••••••••••'}
                      className="input-modern flex-1 text-sm"
                    />
                    <button
                      onClick={() => setShowKey(v => !v)}
                      className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                        className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        title="复制 Access Key"
                      >
                        {isCopied('accessKey') ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setRefreshOpen(true)}
                      className="px-4 py-2 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      刷新密钥
                    </button>
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
                      <span className="ml-2 text-yellow-400">-</span> <span className="text-red-400">"AccessID:YOUR_ACCESSID"</span> \<br/>
                      <span className="ml-2 text-yellow-400">-</span> <span className="text-red-400">"AccessKey:YOUR_ACCESSKEY"</span><br/>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="card-modern p-6">
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

          <div className="card-modern p-6">
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

          {/* 快速操作 */}
          <div className="card-modern p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速操作</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/sql" className="inline-flex items-center justify-center h-11 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                SQL 控制台
              </Link>
              <button onClick={() => setUpgradeOpen(true)} className="inline-flex items-center justify-center h-11 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4m6 12l2.286-6.857L21 12l-5.714-2.143L13 3l-2.286 6.857L5 12l5.714 2.143L13 21z" />
                </svg>
                升级套餐
              </button>
              <button onClick={() => setGuideOpen(true)} className="inline-flex items-center justify-center h-11 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                使用指引
              </button>
            </div>
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

