import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '@/store/useAuth'

export default function HomePage() {
  const { user, logout, loadFromStorage } = useAuth()

  // 模板轮播：滚动容器引用与自动滚动逻辑
  const scrollerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const timer = setInterval(() => {
      if (!el) return
      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 16
      if (nearEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
      }
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const scrollLeft = () => {
    const el = scrollerRef.current
    if (el) el.scrollBy({ left: -el.clientWidth * 0.9, behavior: 'smooth' })
  }
  const scrollRight = () => {
    const el = scrollerRef.current
    if (el) el.scrollBy({ left: el.clientWidth * 0.9, behavior: 'smooth' })
  }

  // 精选模板数据（示意）
  const templates: { id: number; title: string; desc: string; tags: string[]; preview: 'bars'|'line'|'donut'|'mixed' }[] = [
    { id: 1, title: '运营总览', desc: '核心 KPI 一览', tags: ['KPI','增长','留存'], preview: 'mixed' },
    { id: 2, title: '销售漏斗', desc: '转化阶段分析', tags: ['销售','漏斗','转化'], preview: 'bars' },
    { id: 3, title: '用户增长', desc: '趋势与峰值', tags: ['用户','趋势'], preview: 'line' },
    { id: 4, title: '实时监控', desc: '告警与波动', tags: ['监控','实时'], preview: 'donut' },
    { id: 5, title: 'A/B 实验', desc: '版本对比', tags: ['实验','对照'], preview: 'mixed' }
  ]


  const TemplatePreview = ({ type }: { type: 'bars'|'line'|'donut'|'mixed' }) => {
    if (type === 'bars') {
      return (
        <svg viewBox="0 0 220 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="200" height="90" rx="10" fill="#F8FAFC" />
          <rect x="30" y="60" width="24" height="30" rx="5" className="bar-grow bar-delay-1" fill="#38BDF8"/>
          <rect x="70" y="45" width="24" height="45" rx="5" className="bar-grow bar-delay-2" fill="#0EA5E9"/>
          <rect x="110" y="35" width="24" height="55" rx="5" className="bar-grow bar-delay-3" fill="#38BDF8"/>
          <rect x="150" y="25" width="24" height="65" rx="5" className="bar-grow bar-delay-4" fill="#0EA5E9"/>
        </svg>
      )
    }
    if (type === 'line') {
      return (
        <svg viewBox="0 0 220 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="200" height="90" rx="10" fill="#F8FAFC" />
          <path d="M20 80 L60 50 L100 65 L140 40 L180 55" stroke="#38BDF8" strokeWidth="3" fill="none" className="animate-draw-line"/>
          <g fill="#fff" stroke="#0EA5E9" strokeWidth="2">
            <circle cx="20" cy="80" r="4"/>
            <circle cx="60" cy="50" r="4"/>
            <circle cx="100" cy="65" r="4"/>
            <circle cx="140" cy="40" r="4"/>
            <circle cx="180" cy="55" r="4"/>
          </g>
        </svg>
      )
    }
    if (type === 'donut') {
      return (
        <svg viewBox="0 0 220 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="200" height="90" rx="10" fill="#F8FAFC" />
          <g transform="translate(110,55)">
            <circle r="26" fill="#fff" />
            <circle r="26" fill="none" stroke="#E5E7EB" strokeWidth="10"/>
            <circle r="26" fill="none" stroke="#38BDF8" strokeWidth="10" strokeDasharray="120 200" className="animate-[spin_8s_linear_infinite]" strokeLinecap="round"/>
          </g>
        </svg>
      )
    }

    return (
      <svg viewBox="0 0 220 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="200" height="90" rx="10" fill="#F8FAFC" />
        <rect x="30" y="65" width="16" height="25" rx="4" className="bar-grow bar-delay-1" fill="#38BDF8"/>
        <rect x="54" y="55" width="16" height="35" rx="4" className="bar-grow bar-delay-2" fill="#0EA5E9"/>
        <rect x="78" y="45" width="16" height="45" rx="4" className="bar-grow bar-delay-3" fill="#38BDF8"/>
        <path d="M110 80 L140 55 L170 70 L200 45" stroke="#0EA5E9" strokeWidth="2" fill="none" className="animate-draw-line"/>
      </svg>
    )
  }

  useEffect(() => { if (!user) loadFromStorage() }, [])

  return (
    <div className="soft-blue-bg min-h-screen relative overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* 网格线装饰 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        {/* 数据可视化装饰元素 - 更多样化 */}
        <div className="absolute top-32 left-20 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="140" height="140" viewBox="0 0 100 100" className="text-sky-500 animate-float">
            <rect x="10" y="60" width="15" height="30" fill="currentColor" rx="3"/>
            <rect x="30" y="40" width="15" height="50" fill="currentColor" rx="3"/>
            <rect x="50" y="20" width="15" height="70" fill="currentColor" rx="3"/>
            <rect x="70" y="50" width="15" height="40" fill="currentColor" rx="3"/>
          </svg>
        </div>

        <div className="absolute top-1/3 right-24 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-blue-500 animate-float" style={{ animationDelay: '1s' }}>
            <path d="M10,80 L30,60 L50,40 L70,30 L90,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="80" r="4" fill="currentColor"/>
            <circle cx="30" cy="60" r="4" fill="currentColor"/>
            <circle cx="50" cy="40" r="4" fill="currentColor"/>
            <circle cx="70" cy="30" r="4" fill="currentColor"/>
            <circle cx="90" cy="20" r="4" fill="currentColor"/>
          </svg>
        </div>

        <div className="absolute bottom-32 right-32 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="160" height="160" viewBox="0 0 120 120" className="text-cyan-500 animate-float-delayed">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8,8"/>
            <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="2.5"/>
            <circle cx="60" cy="60" r="20" fill="currentColor" opacity="0.4"/>
          </svg>
        </div>

        <div className="absolute bottom-1/4 left-32 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="120" height="120" viewBox="0 0 100 100" className="text-blue-500 animate-float" style={{ animationDelay: '2s' }}>
            <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
            <path d="M50,30 L70,50 L50,70 L30,50 Z" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
      </div>

      {/* 导航栏*/}
      <nav className="border-b border-gray-100 dark:border-gray-900 relative z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center group" aria-label="主页">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 tracking-tight">
                数据可视化平台
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/70 shadow-sm transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1119 10v1m-7 4h8m0 0l-3-3m3 3l-3 3" />
                    </svg>
                    账户
                  </Link>
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all"
                    aria-label="退出登录"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                    </svg>
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-sky-200/60 text-sky-700 bg-white/60 hover:bg-white/80 dark:bg-gray-900/40 dark:text-sky-300 dark:border-sky-800/40 transition-all"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    开始使用
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - 亲和插画与轻动效 */}
      <section className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-block px-3 py-1 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 text-xs font-medium rounded-full mb-8">
              基于 MCP 协议
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
              AI 应用的一站式可视化服务
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-12 font-light leading-relaxed">
              模板、图表库与分享，一站式让数据一眼看懂
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                立即开始
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-sky-200/60 text-sky-700 bg-white/60 hover:bg-white/80 dark:bg-gray-900/40 dark:text-sky-300 dark:border-sky-800/40 transition-all"
              >
                登录
              </Link>
            </div>
          </div>

          {/* Hero 插画 */}
          <div className="hidden lg:block">
            <svg viewBox="0 0 500 400" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 背景装饰圆 - 更多层次 */}
              <circle cx="380" cy="100" r="80" fill="#E0F2FE" opacity="0.4" className="animate-float"/>
              <circle cx="380" cy="100" r="50" fill="#BAE6FD" opacity="0.3" className="animate-float"/>
              <circle cx="100" cy="280" r="60" fill="#DBEAFE" opacity="0.25" className="animate-float-delayed"/>
              <circle cx="100" cy="280" r="35" fill="#BAE6FD" opacity="0.2" className="animate-float-delayed"/>

              {/* 网格背景 */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F3F4F6" strokeWidth="1"/>
                </pattern>
                {/* 裁剪区域，防止动画时柱子越过坐标轴 */}
                <clipPath id="barsClip">
                  {/* 裁剪到坐标轴之上（y:160 到 y:338，略小于轴线 340，避免覆盖轴线） */}
                  <rect x="80" y="160" width="380" height="178" />
                </clipPath>
              </defs>
              <rect x="60" y="120" width="380" height="220" fill="url(#grid)" opacity="0.5"/>

              {/* 主图表区域 - 柱状图 */}
              <g clipPath="url(#barsClip)">
                {/* 柱子阴影 */}
                <rect x="105" y="255" width="35" height="85" rx="6" fill="#0EA5E9" opacity="0.1"/>
                <rect x="165" y="215" width="35" height="125" rx="6" fill="#0EA5E9" opacity="0.1"/>
                <rect x="225" y="235" width="35" height="105" rx="6" fill="#0EA5E9" opacity="0.1"/>
                <rect x="285" y="195" width="35" height="145" rx="6" fill="#0EA5E9" opacity="0.1"/>

                {/* 实际柱子 */}
                <defs>
                  <linearGradient id="barGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="1"/>
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="1"/>
                  </linearGradient>
                </defs>

                <rect x="100" y="250" width="35" height="85" rx="6" fill="url(#barGradient1)" className="bar-grow bar-delay-1"/>
                <rect x="160" y="210" width="35" height="125" rx="6" fill="url(#barGradient2)" className="bar-grow bar-delay-2"/>
                <rect x="220" y="230" width="35" height="105" rx="6" fill="url(#barGradient1)" className="bar-grow bar-delay-3"/>
                <rect x="280" y="190" width="35" height="145" rx="6" fill="url(#barGradient2)" className="bar-grow bar-delay-4"/>

                {/* 柱子顶部高光 */}
                <rect x="100" y="250" width="35" height="15" rx="6" fill="white" opacity="0.2"/>
                <rect x="160" y="210" width="35" height="15" rx="6" fill="white" opacity="0.2"/>
                <rect x="220" y="230" width="35" height="15" rx="6" fill="white" opacity="0.2"/>
                <rect x="280" y="190" width="35" height="15" rx="6" fill="white" opacity="0.2"/>
              </g>

              {/* 折线图 */}
              <g>
                {/* 折线阴影 */}
                <path d="M 350 270 L 385 230 L 420 250 L 455 210" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"/>

                {/* 主折线 */}
                <path d="M 350 265 L 385 225 L 420 245 L 455 205" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line"/>

                {/* 数据点 */}
                <circle cx="350" cy="265" r="6" fill="white" stroke="#0EA5E9" strokeWidth="2"/>
                <circle cx="385" cy="225" r="6" fill="white" stroke="#0EA5E9" strokeWidth="2"/>
                <circle cx="420" cy="245" r="6" fill="white" stroke="#0EA5E9" strokeWidth="2"/>
                <circle cx="455" cy="205" r="6" fill="white" stroke="#0EA5E9" strokeWidth="2"/>

                {/* 数据点内圈 */}
                <circle cx="350" cy="265" r="3" fill="#0EA5E9"/>
                <circle cx="385" cy="225" r="3" fill="#0EA5E9"/>
                <circle cx="420" cy="245" r="3" fill="#0EA5E9"/>
                <circle cx="455" cy="205" r="3" fill="#0EA5E9"/>
              </g>

              {/* 坐标轴 */}
              <line x1="80" y1="340" x2="460" y2="340" stroke="#D1D5DB" strokeWidth="2"/>
              <line x1="80" y1="340" x2="80" y2="160" stroke="#D1D5DB" strokeWidth="2"/>

              {/* 坐标轴刻度 */}
              <line x1="75" y1="250" x2="80" y2="250" stroke="#D1D5DB" strokeWidth="1"/>
              <line x1="75" y1="200" x2="80" y2="200" stroke="#D1D5DB" strokeWidth="1"/>
              <line x1="75" y1="150" x2="80" y2="150" stroke="#D1D5DB" strokeWidth="1"/>

              {/* 浮动数据卡片 1 - 主卡片 */}
              <g filter="url(#shadow1)" className="animate-float">
                <rect x="320" y="60" width="140" height="80" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>
                <text x="340" y="90" fill="#6B7280" fontSize="14" fontWeight="500">数据总览</text>
                <text x="340" y="120" fill="#0EA5E9" fontSize="28" fontWeight="700">1,234</text>
                <circle cx="430" cy="105" r="18" fill="#DBEAFE"/>
                <path d="M 425 105 L 428 108 L 435 100" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </g>

              {/* 浮动数据卡片 2 - 小卡片 */}
              <g filter="url(#shadow2)" className="animate-float-delayed">
                <rect x="100" y="140" width="100" height="60" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>
                <text x="115" y="165" fill="#6B7280" fontSize="12" fontWeight="500">本月增长</text>
                <text x="115" y="188" fill="#10B981" fontSize="20" fontWeight="700">+23%</text>
                <path d="M 172 175 L 177 170 L 182 172 L 187 167" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </g>

              {/* 阴影定义 */}
              <defs>
                <filter id="shadow1" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.1"/>
                </filter>
                <filter id="shadow2" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="6" floodOpacity="0.08"/>
                </filter>
              </defs>

              {/* 装饰性图标 */}
              <g opacity="0.6">
                <circle cx="140" cy="90" r="4" fill="#0EA5E9"/>
                <circle cx="400" cy="280" r="3" fill="#38BDF8"/>
                <circle cx="460" cy="160" r="3.5" fill="#0EA5E9"/>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* 精选模板 - 轮播预览 */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-6">
          <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">精选模板</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">按行业/场景快速创建仪表盘</p>
        </div>
        <div className="relative">
          {/* 滚动容器 */}
          <div ref={scrollerRef} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth py-2">
            {templates.map(t => (
              <div key={t.id} className="snap-center shrink-0 w-[320px]">
                <div className="card-modern h-[220px] p-5 group hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-base font-medium text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{t.title}</div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300">模板</span>
                  </div>
                  <div className="h-[120px] my-2">
                    <TemplatePreview type={t.preview} />
                  </div>
                  <div className="mt-2">
                    <div className="flex gap-2">
                      {t.tags.slice(0,2).map(tag => (
                        <span key={tag} className="text-[11px] text-gray-500 dark:text-gray-400">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* 左右控制按钮 */}
          <button aria-label="上一页" onClick={scrollLeft} className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-white dark:hover:bg-gray-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button aria-label="下一页" onClick={scrollRight} className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-white dark:hover:bg-gray-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </section>

      {/* 核心功*/}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-24 border-t border-gray-100 dark:border-gray-900 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
          <div className="group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40 transition-colors">
                <svg className="w-6 h-6 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="text-xs text-sky-500 dark:text-sky-400 tracking-wider uppercase font-medium">01</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              MCP API 管理
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
              统一管理 API 密钥，支持 AccessId/AccessKey 认证、配额控制和使用监控
            </p>
          </div>

          <div className="group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40 transition-colors">
                <svg className="w-6 h-6 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-xs text-sky-500 dark:text-sky-400 tracking-wider uppercase font-medium">02</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              数据可视化
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
              支持 9 种图表类型：折线图、柱状图、饼图、散点图、雷达图等，智能推荐最佳图表
            </p>
          </div>
        </div>
      </section>

      {/* 使用流程 */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-24 border-t border-gray-100 dark:border-gray-900 relative z-10">
        <div className="max-w-xl mb-16">
          <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-4 tracking-tight">
            使用流程
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
            三步即可开始使用
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 flex items-center justify-center text-sm font-medium group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40 transition-colors">
                1
              </div>
              <div className="text-xs text-sky-500 dark:text-sky-400 tracking-wider font-medium">STEP 01</div>
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              注册账户
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
              快速注册获取 MCP 服务访问权限
            </p>
          </div>

          <div className="space-y-4 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 flex items-center justify-center text-sm font-medium group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40 transition-colors">
                2
              </div>
              <div className="text-xs text-sky-500 dark:text-sky-400 tracking-wider font-medium">STEP 02</div>
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              获取 API 密钥
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
              获得专属 AccessId 和 AccessKey
            </p>
          </div>

          <div className="space-y-4 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 flex items-center justify-center text-sm font-medium group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40 transition-colors">
                3
              </div>
              <div className="text-xs text-sky-500 dark:text-sky-400 tracking-wider font-medium">STEP 03</div>
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              连接 AI 应用
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
              在 AI 应用中配置 MCP 服务
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-32 border-t border-gray-100 dark:border-gray-900 relative z-10">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
            开始使用数据可视化平台
          </h2>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            免费注册
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-gray-100 dark:border-gray-900 relative z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
            <span>数据可视化平台</span>
            <p>© 2025 保持事实驱动·迭代至善</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
