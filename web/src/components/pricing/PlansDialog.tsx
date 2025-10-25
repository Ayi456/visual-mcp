import { Link } from 'react-router-dom'
import useAuth from '@/store/useAuth'
import { useMemo } from 'react'

export default function PlansDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()

  const plans = useMemo(() => ([
    {
      id: 'basic' as const,
      name: '基础版',
      price: '¥29/月',
      quota: { daily: 500, monthly: 15000 },
      features: [
        '每日 500 次 · 每月 15000 次',
        '优先队列',
        '配额提醒'
      ],
      ctaText: (loggedIn: boolean) => loggedIn ? '立即升级' : '立即开通',
      ctaHref: (loggedIn: boolean) => loggedIn ? '/account' : '/register'
    },
    {
      id: 'premium' as const,
      name: '高级版',
      price: '¥99/月',
      quota: { daily: 2000, monthly: 60000 },
      features: [
        '每日 2000 次 · 每月 60000 次',
        'VIP 优先',
        '高级功能',
        '专属支持'
      ],
      ctaText: (loggedIn: boolean) => loggedIn ? '立即升级' : '立即开通',
      ctaHref: (loggedIn: boolean) => loggedIn ? '/account' : '/register'
    },
    {
      id: 'enterprise' as const,
      name: '企业版',
      price: '按需报价',
      quota: { daily: '10,000+', monthly: '300,000+' },
      features: [
        '定制化方案',
        'SLA 保障',
        '企业能力'
      ],
      ctaText: () => '联系销售',
      ctaHref: () => 'mailto:sales@example.com'
    }
  ]), [])

  const accents: Record<'basic' | 'premium' | 'enterprise', string> = {
    basic: 'from-blue-500 to-indigo-600',
    premium: 'from-purple-500 to-pink-600',
    enterprise: 'from-amber-500 to-orange-600'
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">选择订阅计划</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">选择最适合您需求的订阅计划</p>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            onClick={onClose}
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {plans.map((p) => {
            const isCurrent = user?.plan === p.id
            const isEnterprise = p.id === 'enterprise'
            return (
              <div key={p.id} className="group relative overflow-hidden card-modern p-8 min-h-[420px] flex flex-col transform-gpu transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-black/20 hover:ring-1 hover:ring-blue-500/10 dark:hover:ring-blue-400/10">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accents[p.id]} opacity-90 transition-opacity duration-300 group-hover:opacity-100`}></div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{p.name}</h4>
                  {isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">当前套餐</span>
                  )}
                </div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{p.price}</div>
                <div className="my-3 h-px bg-gray-200 dark:bg-gray-800" />
                <div className="text-[15px] text-gray-600 dark:text-gray-400">每日 {p.quota.daily} · 每月 {p.quota.monthly}</div>
                <ul className="mt-4 text-[15px] text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isEnterprise ? (
                  <a
                    href={p.ctaHref(!!user)}
                    className={isCurrent
                      ? 'mt-auto w-full inline-flex items-center justify-center rounded-xl h-12 text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 cursor-default'
                      : `mt-auto w-full inline-flex items-center justify-center rounded-xl h-12 text-base text-white bg-gradient-to-r ${accents[p.id]} shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60`}
                    aria-disabled={isCurrent}
                    onClick={(e) => { if (isCurrent) e.preventDefault() }}
                  >
                    {isCurrent ? '已激活' : p.ctaText(!!user)}
                  </a>
                ) : (
                  <Link
                    to={p.ctaHref(!!user)}
                    className={isCurrent
                      ? 'mt-auto w-full inline-flex items-center justify-center rounded-xl h-12 text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 cursor-default'
                      : `mt-auto w-full inline-flex items-center justify-center rounded-xl h-12 text-base text-white bg-gradient-to-r ${accents[p.id]} shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60`}
                    aria-disabled={isCurrent}
                    onClick={(e) => { if (isCurrent) e.preventDefault() }}
                  >
                    {isCurrent ? '已激活' : p.ctaText(!!user)}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
