import { memo } from 'react'

// Types
interface Panel {
  id: string
  user_id?: string
  osspath: string
  title?: string
  description?: string
  is_public: boolean
  created_at: string
  expires_at: string
  visit_count: number
  status: 'active' | 'expired'
}

interface PanelCardProps {
  panel: Panel
  expired: boolean
  isCopied: boolean
  onCopy: (panelId: string) => void
  PANEL_BASE: string
}

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('zh-CN')
  } catch {
    return '无效日期'
  }
}

/**
 * 优化的 Panel 卡片组件
 * 使用 React.memo 避免不必要的重渲染
 */
const PanelCard = memo<PanelCardProps>(({
  panel,
  expired,
  isCopied,
  onCopy,
  PANEL_BASE
}) => {
  return (
    <div
      className={`group relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden ${
        expired
          ? 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 border-gray-200 dark:border-gray-700 opacity-60'
          : 'bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-sky-200 dark:hover:border-sky-900 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1'
      }`}
    >
      {/* 装饰性背景图案 */}
      {!expired && (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-sky-500">
            <rect x="10" y="50" width="15" height="40" rx="2"/>
            <rect x="30" y="30" width="15" height="60" rx="2"/>
            <rect x="50" y="20" width="15" height="70" rx="2"/>
            <rect x="70" y="40" width="15" height="50" rx="2"/>
          </svg>
        </div>
      )}

      {/* Status badges */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
          expired
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${expired ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
          {expired ? '已过期' : '有效'}
        </span>
      </div>

      {/* Panel info */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
            {panel.title || `Panel ${panel.id.slice(0, 8)}`}
          </h3>
        </div>
        {panel.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 ml-10">
            {panel.description}
          </p>
        )}
      </div>

      {/* Time info */}
      <div className="space-y-2 mb-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            创建时间
          </span>
          <span className="font-medium">{formatDate(panel.created_at)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            过期时间
          </span>
          <span className="font-medium">{formatDate(panel.expires_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 relative z-10">
        <a
          href={`${PANEL_BASE}/panel/${panel.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-sm py-2.5 px-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-50 text-white dark:text-gray-900 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-medium"
        >
          查看面板
        </a>
        <button
          onClick={() => onCopy(panel.id)}
          className={`p-2.5 rounded-xl transition-all ${
            isCopied
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 scale-110'
              : 'text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-110'
          }`}
          title={isCopied ? '已复制' : '复制链接'}
        >
          {isCopied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // 自定义比较逻辑：只有这些属性变化时才重新渲染
  return (
    prevProps.panel.id === nextProps.panel.id &&
    prevProps.expired === nextProps.expired &&
    prevProps.isCopied === nextProps.isCopied &&
    prevProps.PANEL_BASE === nextProps.PANEL_BASE
  )
})

PanelCard.displayName = 'PanelCard'

export default PanelCard
