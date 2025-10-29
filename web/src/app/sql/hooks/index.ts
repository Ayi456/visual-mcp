/**
 * SQL模块自定义Hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionStatus, Connection, QueryHistory } from '../types';
import { sqlApiService } from '../services/sqlApiService';
import { STORAGE_KEYS } from '../config/constants';

/**
 * 连接状态管理Hook
 */
export function useConnectionStatus(connection?: Connection | null) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!connection) {
      setStatus('idle');
      setMessage('');
      return;
    }

    let cancelled = false;
    const checkConnection = async () => {
      setStatus('testing');
      setMessage('');

      try {
        const isConnected = await sqlApiService.testConnection(connection);
        if (!cancelled) {
          setStatus(isConnected ? 'connected' : 'disconnected');
          setMessage(isConnected ? '' : '连接失败');
        }
      } catch (error: any) {
        if (!cancelled) {
          setStatus('disconnected');

          // 解析详细的错误信息，提供更人性化的提示
          let errorMessage = '连接失败';
          let errorType: 'auth' | 'network' | 'database' | 'config' | 'unknown' = 'unknown';

          // 1. 认证相关错误
          if (error?.response?.errorCode === 'INVALID_OR_EXPIRED_KEY') {
            errorMessage = '认证失败：AccessKey 已过期';
            errorType = 'auth';
          } else if (error?.response?.errorCode === 'MISSING_CREDENTIALS') {
            errorMessage = '认证失败：缺少 AccessID 或 AccessKey';
            errorType = 'auth';
          } else if (error?.response?.status === 401 || error?.message?.includes('401')) {
            errorMessage = '认证失败：AccessKey 无效或已过期';
            errorType = 'auth';
          } else if (error?.response?.status === 403) {
            errorMessage = '权限不足：您没有访问该数据库的权限';
            errorType = 'auth';
          }

          // 2. 网络相关错误
          else if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
            errorMessage = '连接超时：服务器响应时间过长';
            errorType = 'network';
          } else if (error?.message?.includes('fetch') || error?.message?.includes('Network')) {
            errorMessage = '网络错误：无法连接到服务器';
            errorType = 'network';
          } else if (error?.response?.status === 502 || error?.response?.status === 503) {
            errorMessage = '服务不可用：后端服务暂时无法访问';
            errorType = 'network';
          }

          // 3. 数据库相关错误
          else if (error?.message?.includes('ECONNREFUSED') || error?.message?.includes('连接被拒绝')) {
            errorMessage = '数据库拒绝连接：请检查数据库地址和端口是否正确';
            errorType = 'database';
          } else if (error?.message?.includes('Access denied') || error?.message?.includes('认证失败')) {
            errorMessage = '数据库认证失败：用户名或密码错误';
            errorType = 'database';
          } else if (error?.message?.includes('Unknown database')) {
            errorMessage = '数据库不存在：请检查数据库名称是否正确';
            errorType = 'database';
          } else if (error?.message?.includes('host') || error?.message?.includes('ENOTFOUND')) {
            errorMessage = '主机不可达：无法解析数据库地址';
            errorType = 'database';
          }

          // 4. 配置相关错误
          else if (error?.response?.status === 400) {
            errorMessage = '配置错误：连接参数不正确';
            errorType = 'config';
          }

          // 5. 其他错误
          else if (error?.message) {
            errorMessage = error.message;
            errorType = 'unknown';
          }

          // 保存错误类型到 message 中，供 UI 组件使用
          setMessage(JSON.stringify({
            message: errorMessage,
            type: errorType,
            hint: error?.response?.hint
          }));
        }
      }
    };

    checkConnection();
    return () => { cancelled = true; };
  }, [connection]);

  return { status, message };
}

/**
 * 本地存储Hook
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  const removeStoredValue = useCallback(() => {
    try {
      setValue(defaultValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeStoredValue];
}

/**
 * 查询历史记录Hook
 */
export function useQueryHistory(maxSize: number = 100) {
  const [history, setHistory] = useLocalStorage<QueryHistory[]>(
    STORAGE_KEYS.RECENT_QUERIES,
    []
  );

  const addQuery = useCallback((query: Omit<QueryHistory, 'id'>) => {
    const newQuery: QueryHistory = {
      ...query,
      id: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setHistory(prev => {
      const updated = [newQuery, ...prev];
      return updated.slice(0, maxSize);
    });
  }, [setHistory, maxSize]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const removeQuery = useCallback((id: string) => {
    setHistory(prev => prev.filter(q => q.id !== id));
  }, [setHistory]);

  return {
    history,
    addQuery,
    clearHistory,
    removeQuery,
  };
}

/**
 * 防抖Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 异步操作Hook
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  const [state, setState] = useState<{
    isLoading: boolean;
    error: string | null;
    data: T | null;
  }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(async () => {
    setState({ isLoading: true, error: null, data: null });
    
    try {
      const data = await asyncFunction();
      setState({ isLoading: false, error: null, data });
      return data;
    } catch (error: any) {
      setState({ 
        isLoading: false, 
        error: error?.message || 'An error occurred', 
        data: null 
      });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}

/**
 * 键盘快捷键Hook
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  deps: any[] = []
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const keys = key.toLowerCase().split('+');
      const isCtrl = keys.includes('ctrl');
      const isShift = keys.includes('shift');
      const isAlt = keys.includes('alt');
      const mainKey = keys[keys.length - 1];

      if (
        (isCtrl === event.ctrlKey || isCtrl === event.metaKey) &&
        isShift === event.shiftKey &&
        isAlt === event.altKey &&
        event.key.toLowerCase() === mainKey
      ) {
        event.preventDefault();
        callbackRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [key, ...deps]);
}

/**
 * 自动保存Hook
 */
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => void | Promise<void>,
  delay: number = 1000
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debouncedData = useDebounce(data, delay);

  useEffect(() => {
    if (debouncedData !== null && debouncedData !== undefined) {
      const save = async () => {
        setIsSaving(true);
        try {
          await saveFunction(debouncedData);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      };

      save();
    }
  }, [debouncedData, saveFunction]);

  return { isSaving, lastSaved };
}

/**
 * 复制到剪贴板Hook（兼容 HTTP 环境）
 */
export function useCopyToClipboard(timeout: number = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    try {
      // 使用 textarea + execCommand 方案（兼容 HTTP）
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // 隐藏元素但确保可以被选中
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), timeout);
          return true;
        }
        throw new Error('execCommand 复制失败');
      } catch (err) {
        document.body.removeChild(textArea);
        throw err;
      }
    } catch (err) {
      console.error('复制失败:', err);
      return false;
    }
  }, [timeout]);

  return { copied, copy };
}
