/**
 * 统一的错误提示组件
 */

import React from 'react'
import { StandardError, ErrorSeverity } from '@/utils/errors'

export interface ErrorMessageProps {
  message: string
  severity?: ErrorSeverity
  onDismiss?: () => void
  className?: string
  showIcon?: boolean
}

const severityStyles = {
  [ErrorSeverity.LOW]: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  [ErrorSeverity.MEDIUM]: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200',
  [ErrorSeverity.HIGH]: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  [ErrorSeverity.CRITICAL]: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100'
}

const severityIcons = {
  [ErrorSeverity.LOW]: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  [ErrorSeverity.MEDIUM]: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [ErrorSeverity.HIGH]: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [ErrorSeverity.CRITICAL]: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}

export default function ErrorMessage({
  message,
  severity = ErrorSeverity.MEDIUM,
  onDismiss,
  className = '',
  showIcon = true
}: ErrorMessageProps) {
  return (
    <div className={`border rounded-lg px-4 py-3 ${severityStyles[severity]} ${className}`}>
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0 mr-3">
            {severityIcons[severity]}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 hover:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * 简化的错误提示组件
 */
export function SimpleErrorMessage({ 
  message, 
  className = '' 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm ${className}`}>
      {message}
    </div>
  )
}

/**
 * 成功提示组件
 */
export function SuccessMessage({ 
  message, 
  onDismiss,
  className = '' 
}: { 
  message: string
  onDismiss?: () => void
  className?: string 
}) {
  return (
    <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 hover:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
