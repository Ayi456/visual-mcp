/**
 * 通用的占位符页面组件
 * 用于展示开发中的功能页面
 */

import React from 'react'

export interface PlaceholderPageProps {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  backUrl?: string
  backText?: string
  iconColor?: string
}

export default function PlaceholderPage({
  title,
  description,
  icon,
  features,
  backUrl = '/account',
  backText = '返回账户中心',
  iconColor = 'from-green-500 to-emerald-600'
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="card-modern p-12 text-center max-w-md animate-bounce-in">
          <div className={`w-20 h-20 bg-gradient-to-br ${iconColor} rounded-3xl mx-auto mb-6 flex items-center justify-center`}>
            {icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {description}
          </p>
          
          <div className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </div>
            ))}
          </div>
          
          <a href={backUrl} className="btn-gradient inline-block mt-6">
            {backText}
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * 预定义的图标组件
 */
export const ChatIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

export const DatabaseIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
  </svg>
)
