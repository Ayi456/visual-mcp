import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiGet, API_BASE } from '@/api/client'
import useAuth from '@/store/useAuth'

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

interface UserPanelsResult {
  panels: Panel[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

type FilterStatus = 'all' | 'active' | 'expired'

// Constants
const PANELS_PER_PAGE = 10

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('zh-CN')
  } catch {
    return '无效日期'
  }
}

const isExpired = (expiresAt: string): boolean => {
  try {
    return new Date(expiresAt) < new Date()
  } catch {
    return true
  }
}

const getStatusStyles = (expired: boolean) => ({
  badge: expired
    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  card: expired ? 'opacity-75 bg-gray-50 dark:bg-gray-800/50' : ''
})

export default function UserPanels() {
  const { user } = useAuth()
  // Panel links must hit backend, not the Vite dev server. In dev (5173), force port 3000.
  const PANEL_BASE = useMemo(() => {
    try {
      if (typeof window !== 'undefined') {
        const { hostname, port, protocol } = window.location
        const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(hostname)
        if (isLocal && port === '5173') {
          return `${protocol}//localhost:3000`
        }
      }
    } catch {}
    return API_BASE
  }, [])
  const [panels, setPanels] = useState<Panel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  // Computed values
  const panelStats = useMemo(() => {
    const active = panels.filter(p => !isExpired(p.expires_at)).length
    const expired = panels.filter(p => isExpired(p.expires_at)).length
    return { active, expired }
  }, [panels])

  const paginationInfo = useMemo(() => ({
    start: (page - 1) * PANELS_PER_PAGE + 1,
    end: Math.min(page * PANELS_PER_PAGE, total)
  }), [page, total])

  // Load panels
  const loadPanels = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const res = await apiGet<UserPanelsResult>(
        `/api/users/${user.id}/panels`,
        { page, limit: PANELS_PER_PAGE, status: filter }
      )

      if (res.success && res.data) {
        setPanels(res.data.panels || [])
        setTotal(res.data.total || 0)
        setHasMore(res.data.has_more || false)
      } else {
        throw new Error('获取面板列表失败')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取面板失败'
      setError(errorMessage)
      console.error('获取Panels失败:', err)
      // Reset state on error
      setPanels([])
      setTotal(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [user?.id, page, filter])

  // Copy panel URL to clipboard
  const copyPanelUrl = useCallback(async (panelId: string) => {
    const url = `${PANEL_BASE}/panel/${panelId}`
    
    try {
      if (!navigator.clipboard) {
        throw new Error('剪贴板功能不可用')
      }
      
      await navigator.clipboard.writeText(url)
      setCopySuccess(panelId)

      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      // Fallback: Create a temporary textarea
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      
      try {
        document.execCommand('copy')
        setCopySuccess(panelId)
        setTimeout(() => setCopySuccess(null), 2000)
      } catch {
        alert('复制失败，请手动复制链接')
      } finally {
        document.body.removeChild(textarea)
      }
    }
  }, [])

  const handleFilterChange = useCallback((newFilter: FilterStatus) => {
    setFilter(newFilter)
    setPage(1) // Reset to first page when filter changes
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1) return
    if (newPage > 1 && !hasMore) return
    setPage(newPage)
  }, [hasMore])

  useEffect(() => {
    loadPanels()
  }, [loadPanels])

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        还没有可视化面板
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        使用 AI 聊天或 MCP 工具创建您的第一个数据可视化面板
      </p>
      <a href="/chat" className="btn-gradient inline-block">
        开始创建
      </a>
    </div>
  )

  const renderLoadingState = () => (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="mt-2 text-gray-500">加载中...</p>
    </div>
  )

  const renderErrorState = () => (
    <div className="text-center py-8">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={loadPanels}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          重试
        </button>
      </div>
    </div>
  )

  const renderPanelCard = (panel: Panel) => {
    const expired = isExpired(panel.expires_at)
    const styles = getStatusStyles(expired)
    const isCopied = copySuccess === panel.id

    return (
      <div
        key={panel.id}
        className={`card-modern p-6 transition-all hover:shadow-lg ${styles.card}`}
      >
        {/* Status badges */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles.badge}`}>
            {expired ? '已过期' : '有效'}
          </span>
        </div>

        {/* Panel info */}
        <div className="mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
            {panel.title || `Panel ${panel.id.slice(0, 8)}`}
          </h3>
          {panel.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {panel.description}
            </p>
          )}
        </div>

        {/* Time info */}
        <div className="space-y-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>创建时间:</span>
            <span>{formatDate(panel.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span>过期时间:</span>
            <span>{formatDate(panel.expires_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <a
            href={`${PANEL_BASE}/panel/${panel.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-gradient text-center text-sm py-2"
          >
            查看面板
          </a>
          <button
            onClick={() => copyPanelUrl(panel.id)}
            className={`p-2 rounded-lg transition-all ${
              isCopied 
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={isCopied ? '已复制!' : '复制链接'}
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
  }

  // Check if user is not logged in
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">请先登录查看您的可视化面板</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex items-center justify-between gap-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex-shrink-0">
          我的可视化面板
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">状态筛选:</span>
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as FilterStatus)}
            className="input-modern min-w-[120px]"
          disabled={loading}
        >
          <option value="all">全部</option>
          <option value="active">有效</option>
          <option value="expired">已过期</option>
        </select>
        </div>
      </div>

      {/* Statistics */}
      {!loading && !error && panels.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                总计 {total} 个面板
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {panelStats.active} 个有效，{panelStats.expired} 个已过期
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {error ? (
        renderErrorState()
      ) : loading ? (
        renderLoadingState()
      ) : panels.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {panels.map(renderPanelCard)}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && panels.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            显示第 {paginationInfo.start} - {paginationInfo.end} 项，共 {total} 项
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <span className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
              {page}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasMore}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
