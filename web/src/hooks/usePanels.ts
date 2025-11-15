/**
 * React Query Hooks for Panels
 * 提供优化的数据获取和缓存管理
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiDelete } from '@/api/client'

// Types
export interface Panel {
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

export interface UserPanelsResult {
  panels: Panel[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface PanelQueryParams {
  userId: string
  page?: number
  limit?: number
  status?: 'all' | 'active' | 'expired'
  is_public?: boolean
}

export interface UpdatePanelData {
  title?: string
  description?: string
  is_public?: boolean
}

// Query Keys
export const panelKeys = {
  all: ['panels'] as const,
  lists: () => [...panelKeys.all, 'list'] as const,
  list: (params: PanelQueryParams) => [...panelKeys.lists(), params] as const,
  details: () => [...panelKeys.all, 'detail'] as const,
  detail: (id: string) => [...panelKeys.details(), id] as const,
}

/**
 * 获取用户的 Panels 列表
 */
export function useUserPanels(params: PanelQueryParams) {
  return useQuery({
    queryKey: panelKeys.list(params),
    queryFn: async () => {
      const res = await apiGet<UserPanelsResult>(
        `/api/users/${params.userId}/panels`,
        {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status || 'all',
          is_public: params.is_public
        }
      )

      if (!res.success || !res.data) {
        throw new Error(res.message || '获取面板列表失败')
      }

      return res.data
    },
    enabled: !!params.userId,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
    gcTime: 10 * 60 * 1000, // 缓存10分钟 (React Query v5 使用 gcTime 替代 cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * 获取单个 Panel 详情
 */
export function usePanelDetail(panelId: string | null) {
  return useQuery({
    queryKey: panelKeys.detail(panelId || ''),
    queryFn: async () => {
      const res = await apiGet<Panel>(`/api/panels/${panelId}`)

      if (!res.success || !res.data) {
        throw new Error('获取面板详情失败')
      }

      return res.data
    },
    enabled: !!panelId,
    staleTime: 10 * 60 * 1000, // 10分钟内不重新请求
  })
}

/**
 * 更新 Panel 信息
 */
export function useUpdatePanel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ panelId, data, userId }: {
      panelId: string
      data: UpdatePanelData
      userId: string
    }) => {
      const res = await apiPut(`/api/panels/${panelId}`, {
        ...data,
        user_id: userId
      })

      if (!res.success) {
        throw new Error(res.message || '更新失败')
      }

      return res
    },
    onSuccess: (_, variables) => {
      // 使缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(variables.panelId) })
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() })
    },
  })
}

/**
 * 删除 Panel
 */
export function useDeletePanel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ panelId, userId }: { panelId: string; userId: string }) => {
      const res = await apiDelete(`/api/panels/${panelId}`, { userId })

      if (!res.success) {
        throw new Error(res.message || '删除失败')
      }

      return res
    },
    onSuccess: () => {
      // 使缓存失效
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() })
    },
  })
}

/**
 * 预加载下一页数据
 */
export function usePrefetchNextPage(params: PanelQueryParams) {
  const queryClient = useQueryClient()

  return () => {
    const nextPage = (params.page || 1) + 1
    queryClient.prefetchQuery({
      queryKey: panelKeys.list({ ...params, page: nextPage }),
      queryFn: async () => {
        const res = await apiGet<UserPanelsResult>(
          `/api/users/${params.userId}/panels`,
          { ...params, page: nextPage }
        )
        return res.data!
      },
      staleTime: 5 * 60 * 1000,
    })
  }
}
