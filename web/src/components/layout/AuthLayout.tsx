/**
 * 认证页面的统一布局组件
 */

import React from 'react'

export interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  showBackToHome?: boolean
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showBackToHome = true
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* 左侧装饰区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-gray-900 relative">
        <div className="flex flex-col justify-center px-12 text-gray-900 dark:text-white">
          <div className="mb-12">
            <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3">数据可视化与分享服务</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">数据可视化与链接管理平台</p>
          </div>

          <div className="space-y-6">
            <FeatureItem
              icon={
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="安全认证"
              description="AccessId/AccessKey双重认证"
            />

            <FeatureItem
              icon={
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="数据可视化"
              description="支持9种专业图表类型"
            />

            <FeatureItem
              icon={
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
              title="链接管理"
              description="安全的临时访问链接"
            />
          </div>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-gray-800">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* 返回首页链接 */}
            {showBackToHome && (
              <div className="mb-6">
                <a href="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回首页
                </a>
              </div>
            )}

            {/* Logo区域 */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl mx-auto mb-4 flex items-center justify-center lg:hidden">
                <svg className="w-6 h-6 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>

            {/* 表单内容 */}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 功能特性展示组件
 */
function FeatureItem({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mt-1">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  )
}
