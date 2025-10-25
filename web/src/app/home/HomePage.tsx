import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '@/store/useAuth'

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "智能API管理",
    description: "统一管理所有API密钥，支持配额控制、使用统计和安全监控",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "AI 智能对话",
    description: "支持流式对话、代码高亮、Markdown渲染的智能聊天助手",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
    title: "SQL 控制台",
    description: "强大的数据库查询工具，支持语法高亮、结果可视化和查询历史",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "数据分析",
    description: "实时监控API使用情况，提供详细的数据分析和可视化报表",
    gradient: "from-purple-500 to-pink-500"
  }
]

const stats = [
  { label: "活跃用户", value: "10K+", icon: "👥" },
  { label: "API调用", value: "1M+", icon: "⚡" },
  { label: "正常运行时间", value: "99.9%", icon: "🚀" },
  { label: "响应时间", value: "<100ms", icon: "⏱️" }
]

export default function HomePage() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const { user, logout, loadFromStorage } = useAuth()

  useEffect(() => { if (!user) loadFromStorage() }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-gray-900">
      {/* 导航栏 */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-elegant-lg flex items-center justify-center shadow-elegant-sm">
              <svg className="w-7 h-7 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gradient">
              数据可视化与分享服务
            </span>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/account" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-elegant">
                  我的账户
                </Link>
                <button onClick={logout} className="btn-gradient px-6 py-2.5">退出</button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-elegant">
                  登录
                </Link>
                <Link to="/register" className="btn-gradient text-base px-10 py-3 inline-flex items-center justify-center">
                  免费注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-semibold mb-8 animate-fade-in leading-tight">
            <span className="text-gray-900 dark:text-white">
              数据可视化与分享服务
            </span>
          </h1>
          <p className="text-2xl md:text-2xl text-gray-600 dark:text-gray-400 mb-6 animate-slide-up font-light">
            数据可视化 · 链接管理 · MCP服务器
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500 mb-12 animate-slide-up max-w-2xl mx-auto leading-relaxed">
            基于模型上下文协议(MCP)构建的强大数据处理与交互平台，为AI应用提供专业的数据可视化和管理服务
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up">
            <Link to="/register" className="btn-gradient text-base px-12 py-4 inline-flex items-center justify-center">
              免费体验
            </Link>
            <Link to="/auth" className="px-12 py-4 text-base border border-gray-300/50 dark:border-gray-700/50 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-elegant inline-flex items-center justify-center backdrop-blur-sm shadow-elegant-sm">
              立即登录
            </Link>
          </div>

          {/* 快速导航 */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>免费注册</span>
            </span>
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>一键部署</span>
            </span>
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>企业级安全</span>
            </span>
          </div>
        </div>
      </section>

      {/* 我们能为您做什么？ */}
      <section className="px-6 py-16 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            我们能为您做什么？
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-modern p-6">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                MCP API 管理
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                统一管理您的MCP服务API密钥，支持AccessId/AccessKey认证、配额控制和使用监控，让API调用更安全可控。
              </p>
            </div>

            <div className="card-modern p-6">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                数据可视化工具
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                强大的通用数据可视化工具，支持9种图表类型（折线图、柱状图、饼图、散点图等），智能推荐最适合的图表类型。
              </p>
            </div>

            <div className="card-modern p-6">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                临时链接管理
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Panel短链管理系统，为可视化报告生成安全的临时访问链接，支持过期控制和访问统计。
              </p>
            </div>

            <div className="card-modern p-6">
              <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                企业级安全
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Argon2密码哈希、AccessKey安全存储、登录失败保护、配额控制等多重安全机制，保障您的数据安全。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 三步开始 */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            三步开始
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                注册账户
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                快速注册获取MCP服务访问权限，选择适合的配额套餐
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                获取API密钥
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                登录后获得专属的AccessId和AccessKey，用于MCP协议认证
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                连接AI应用
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                在Cherry Studio等AI应用中配置MCP服务，开始数据可视化
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="px-6 py-16 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            常见问题
          </h2>

          <div className="space-y-6">
            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                • 什么是MCP协议？
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                MCP（Model Context Protocol）是一种标准化协议，用于AI模型与外部工具和数据源的安全交互，让AI应用能够访问实时数据和执行复杂操作。
              </p>
            </div>

            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                • 支持哪些图表类型？
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                支持9种专业图表：折线图、柱状图、饼图、散点图、雷达图、面积图、气泡图、热力图，并提供智能推荐功能。
              </p>
            </div>

            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                • 如何集成到AI应用？
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                通过标准的MCP协议接口，AI应用（如Cherry Studio）可以直接调用我们的数据可视化工具，无需复杂的集成工作。
              </p>
            </div>

            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                • 数据安全如何保障？
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                采用Argon2密码哈希、AccessKey认证、临时链接过期控制等多重安全机制，确保您的数据和可视化结果安全可控。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 立即体验 */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card-modern p-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              立即体验
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              现在注册即可免费体验MCP数据可视化服务，开启您的智能数据分析之旅
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="btn-gradient text-lg px-10 py-4 inline-flex items-center justify-center">
                注册 / 体验
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="px-6 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10  bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">数据可视化与分享服务</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            © 2024 保持事实驱动·迭代至善.
          </p>
        </div>
      </footer>
    </div>
  )
}
