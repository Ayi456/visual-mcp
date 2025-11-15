/**
 * Dashboard API服务
 * 处理所有Dashboard相关的API请求
 */

import {
  Dashboard,
  DashboardListResponse,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  PublishDashboardResponse,
  ApiResponse
} from '../types/dashboard.types';

const API_BASE_URL = '/api/dashboard';

/**
 * 创建请求头
 */
function createHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json'
  };
}

/**
 * 处理API响应
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'API请求失败');
  }

  return data;
}

export const dashboardApiService = {
  /**
   * 获取Dashboard列表
   */
  async getDashboardList(userId?: string): Promise<DashboardListResponse[]> {
    const url = userId ? `${API_BASE_URL}?userId=${encodeURIComponent(userId)}` : API_BASE_URL;
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    const result = await handleResponse<DashboardListResponse[]>(response);
    return result.data || [];
  },

  /**
   * 获取Dashboard详情
   */
  async getDashboard(id: string, userId?: string): Promise<Dashboard> {
    const url = userId ? `${API_BASE_URL}/${id}?userId=${encodeURIComponent(userId)}` : `${API_BASE_URL}/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    const result = await handleResponse<Dashboard>(response);
    if (!result.data) {
      throw new Error('Dashboard不存在');
    }
    return result.data;
  },

  /**
   * 创建Dashboard
   */
  async createDashboard(data: CreateDashboardRequest & { userId?: string }): Promise<{ dashboardId: string; shareToken: string }> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{ dashboardId: string; shareToken: string }>(response);
    if (!result.data) {
      throw new Error('创建Dashboard失败');
    }
    return result.data;
  },

  /**
   * 更新Dashboard
   */
  async updateDashboard(id: string, data: UpdateDashboardRequest & { userId?: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });

    await handleResponse(response);
  },

  /**
   * 删除Dashboard
   */
  async deleteDashboard(id: string, userId?: string): Promise<void> {
    const url = userId ? `${API_BASE_URL}/${id}?userId=${encodeURIComponent(userId)}` : `${API_BASE_URL}/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: createHeaders(),
    });

    await handleResponse(response);
  },

  /**
   * 发布Dashboard（生成分享链接）
   */
  async publishDashboard(id: string, userId?: string): Promise<PublishDashboardResponse> {
    const response = await fetch(`${API_BASE_URL}/${id}/publish`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ userId }),
    });

    const result = await handleResponse<PublishDashboardResponse>(response);
    if (!result.data) {
      throw new Error('发布Dashboard失败');
    }
    return result.data;
  },

  /**
   * 获取Dashboard分享统计
   */
  async getDashboardStats(id: string): Promise<{ totalViews: number; uniqueVisitors: number; lastViewedAt: string | null }> {
    const response = await fetch(`${API_BASE_URL}/${id}/stats`, {
      method: 'GET',
      headers: createHeaders(),
    });

    const result = await handleResponse<{ totalViews: number; uniqueVisitors: number; lastViewedAt: string | null }>(response);
    if (!result.data) {
      throw new Error('获取统计数据失败');
    }
    return result.data;
  },

  /**
   * 记录Dashboard访问
   */
  async recordDashboardView(id: string, visitorId?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}/record-view`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({
        visitorId,
        userAgent: navigator.userAgent,
        referer: document.referrer,
      }),
    });

    await handleResponse(response);
  },
};
