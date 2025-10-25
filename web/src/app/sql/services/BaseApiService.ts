/**
 * API服务基类
 * 提供统一的请求处理、错误处理和重试机制
 */

import { API_CONFIG, ERROR_MESSAGES } from '../config/constants';
import { ApiResponse } from '../types';

export interface RequestOptions extends RequestInit {
  retry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

export class BaseApiService {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * 获取认证headers
   */
  protected getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    try {
      // 从localStorage获取认证信息
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const accessId = userInfo.access_id;
      const accessKey = localStorage.getItem('accessKey');
      
      if (accessId && accessKey) {
        headers['AccessID'] = accessId;
        headers['AccessKey'] = accessKey;
      }
    } catch (error) {
      console.warn('Failed to get auth headers:', error);
    }
    
    return headers;
  }

  /**
   * 创建AbortController用于请求超时
   */
  private createTimeoutController(timeout: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 发送HTTP请求（带重试机制）
   */
  protected async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      retry = true,
      retryAttempts = API_CONFIG.RETRY_ATTEMPTS,
      retryDelay = API_CONFIG.RETRY_DELAY,
      timeout = API_CONFIG.TIMEOUT,
      ...fetchOptions
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;
    let attempts = retry ? retryAttempts : 1;

    for (let i = 0; i < attempts; i++) {
      try {
        const controller = this.createTimeoutController(timeout);
        
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            ...this.defaultHeaders,
            ...this.getAuthHeaders(),
            ...fetchOptions.headers,
          },
        });

        // 处理非2xx响应
        if (!response.ok) {
          const error = await this.parseErrorResponse(response);
          throw error;
        }

        // 解析响应
        const result = await this.parseResponse<T>(response);
        return result;
        
      } catch (error: any) {
        lastError = error;
        
        // 如果是最后一次尝试，或者错误不应该重试，则抛出错误
        if (i === attempts - 1 || !this.shouldRetry(error)) {
          throw this.normalizeError(error);
        }
        
        // 等待后重试
        await this.delay(retryDelay * (i + 1)); // 指数退避
      }
    }

    throw lastError || new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }

  /**
   * 解析错误响应
   */
  private async parseErrorResponse(response: Response): Promise<Error> {
    try {
      const data = await response.json();
      const error: any = new Error(data.message || data.error || `HTTP ${response.status}`);
      // 保存完整的响应数据以便上层使用
      error.response = {
        status: response.status,
        errorCode: data.errorCode,
        hint: data.hint,
        ...data
      };
      return error;
    } catch {
      return new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * 解析成功响应
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    try {
      const data = await response.json();
      
      // 如果响应有标准格式
      if ('success' in data) {
        const apiResponse = data as ApiResponse<T>;
        if (!apiResponse.success) {
          throw new Error(apiResponse.message || apiResponse.error || 'Operation failed');
        }
        return apiResponse.data as T;
      }
      
      // 直接返回数据
      return data as T;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Failed to parse response');
    }
  }

  /**
   * 判断错误是否应该重试
   */
  private shouldRetry(error: Error): boolean {
    // 网络错误和超时错误可以重试
    if (error.name === 'AbortError') return true;
    if (error.message.includes('fetch')) return true;
    if (error.message.includes('network')) return true;
    
    // 5xx服务器错误可以重试
    if (error.message.includes('HTTP 5')) return true;
    
    // 其他错误不重试
    return false;
  }

  /**
   * 规范化错误对象
   */
  private normalizeError(error: any): Error {
    if (error instanceof Error) return error;
    if (typeof error === 'string') return new Error(error);
    if (error?.message) return new Error(error.message);
    return new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }

  /**
   * GET请求
   */
  protected get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST请求
   */
  protected post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT请求
   */
  protected put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE请求
   */
  protected delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}