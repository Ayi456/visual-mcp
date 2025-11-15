/**
 * Toast 通知 Hook
 * 提供全局的 Toast 通知功能
 */

import { create } from 'zustand';
import { ToastType } from '../components/Toast/Toast';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  success: (message, duration = 3000) => {
    useToastStore.getState().addToast({ type: 'success', message, duration });
  },

  error: (message, duration = 4000) => {
    useToastStore.getState().addToast({ type: 'error', message, duration });
  },

  warning: (message, duration = 3500) => {
    useToastStore.getState().addToast({ type: 'warning', message, duration });
  },

  info: (message, duration = 3000) => {
    useToastStore.getState().addToast({ type: 'info', message, duration });
  },
}));

// 导出便捷的 toast 函数
export const toast = {
  success: (message: string, duration?: number) => useToastStore.getState().success(message, duration),
  error: (message: string, duration?: number) => useToastStore.getState().error(message, duration),
  warning: (message: string, duration?: number) => useToastStore.getState().warning(message, duration),
  info: (message: string, duration?: number) => useToastStore.getState().info(message, duration),
};
