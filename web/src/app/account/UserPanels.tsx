import { useState, useCallback, useMemo, useEffect } from 'react'
import { API_BASE } from '@/api/client'
import useAuth from '@/store/useAuth'
import PanelCard from '@/components/PanelCard'
import { useUserPanels, usePrefetchNextPage } from '@/hooks/usePanels'

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

type FilterStatus = 'all' | 'active' | 'expired'

// Constants
const PANELS_PER_PAGE = 9

const isExpired = (expiresAt: string): boolean => {
  try {
    return new Date(expiresAt) < new Date()
  } catch {
    return true
  }
}

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

  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  // 使用 React Query 获取数据
  const { data, isLoading, error, refetch } = useUserPanels({
    userId: user?.id || '',
    page,
    limit: PANELS_PER_PAGE,
    status: filter
  })

  // 预加载下一页
  const prefetchNextPage = usePrefetchNextPage({
    userId: user?.id || '',
    page,
    limit: PANELS_PER_PAGE,
    status: filter
  })

  // 提取数据
  const panels = data?.panels || []
  const total = data?.total || 0
  const hasMore = data?.has_more || false

  // Computed values
  const panelStats = useMemo(() => {
    const active = panels.filter(p => !isExpired(p.expires_at)).length
    const expired = panels.filter(p => isExpired(p.expires_at)).length
    return { active, expired }
  }, [panels])

  const paginationInfo = useMemo(() => ({
    start: (page - 1) * PANELS_PER_PAGE + 1,
    end: Math.min(page * PANELS_PER_PAGE, total),
    totalPages: Math.ceil(total / PANELS_PER_PAGE)
  }), [page, total])

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
  }, [PANEL_BASE])

  const handleFilterChange = useCallback((newFilter: FilterStatus) => {
    setFilter(newFilter)
    setPage(1) // Reset to first page when filter changes
  }, [])

  const handlePageChange = useCallback((e: React.MouseEvent, newPage: number) => {
    e.preventDefault()
    const totalPages = Math.ceil(total / PANELS_PER_PAGE)

    // 只允许有效范围内的页码
    if (newPage < 1 || newPage > totalPages || isLoading) return

    setPage(newPage)

    // 平滑滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [total, isLoading])

  // 预加载下一页数据
  useEffect(() => {
    if (hasMore && !isLoading) {
      prefetchNextPage()
    }
  }, [hasMore, isLoading, prefetchNextPage])

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        使用AI聊天或MCP工具创建您的第一个数据可视化面板
      </p>
      <a href="/sql" className="text-blue-600 hover:text-blue-700 text-sm">
        去创建
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
        <p className="text-red-600 dark:text-red-400">
          {error instanceof Error ? error.message : '获取面板失败'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          重试
        </button>
      </div>
    </div>
  )

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light text-gray-900 dark:text-white tracking-tight">
          我的面板
        </h2>
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value as FilterStatus)}
          className="text-sm px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          disabled={isLoading}
        >
          <option value="all">全部</option>
          <option value="active">有效</option>
          <option value="expired">已过期</option>
        </select>
      </div>

      {/* Statistics */}
      {!isLoading && !error && panels.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          共 {total} 个面板，{panelStats.active} 个有效
        </div>
      )}

      {/* Content */}
      {error ? (
        renderErrorState()
      ) : isLoading ? (
        renderLoadingState()
      ) : panels.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="relative">
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-300 ease-out"
          >
            {panels.map(panel => (
              <PanelCard
                key={panel.id}
                panel={panel}
                expired={isExpired(panel.expires_at)}
                isCopied={copySuccess === panel.id}
                onCopy={copyPanelUrl}
                PANEL_BASE={PANEL_BASE}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && panels.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-900">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            显示第 {paginationInfo.start} - {paginationInfo.end} 项，共 {total} 项
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => handlePageChange(e, 1)}
              disabled={page === 1 || isLoading}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="首页"
            >
              首页
            </button>
            <button
              type="button"
              onClick={(e) => handlePageChange(e, page - 1)}
              disabled={page === 1 || isLoading}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              上一页
            </button>
            <span className="px-3 py-1.5 text-sm bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg font-medium">
              {page} / {paginationInfo.totalPages}
            </span>
            <button
              type="button"
              onClick={(e) => handlePageChange(e, page + 1)}
              disabled={page >= paginationInfo.totalPages || isLoading}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              下一页
            </button>
            <button
              type="button"
              onClick={(e) => handlePageChange(e, paginationInfo.totalPages)}
              disabled={page >= paginationInfo.totalPages || isLoading}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="末页"
            >
              末页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
