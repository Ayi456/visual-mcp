/**
 * 页面加载器组件
 * 用于路由懒加载时的加载状态展示
 */

import LoadingSpinner from './LoadingSpinner'

export interface PageLoaderProps {
  message?: string
  showLogo?: boolean
  className?: string
}

export default function PageLoader({ 
  message = '页面加载中...', 
  showLogo = true,
  className = ''
}: PageLoaderProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center ${className}`}>
      <div className="text-center">
        {showLogo && (
          <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        )}
        
        <LoadingSpinner size="lg" className="mb-4" />
        
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          {message}
        </p>
        
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

/**
 * 简化的页面加载器
 */
export function SimplePageLoader({ message = '加载中...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

/**
 * 内联加载器（用于组件内部）
 */
export function InlineLoader({ 
  message = '加载中...', 
  size = 'md',
  className = ''
}: { 
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  return (
    <div className={`flex items-center justify-center space-x-3 py-8 ${className}`}>
      <LoadingSpinner size={size} />
      <span className="text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  )
}
