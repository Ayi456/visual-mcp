import { useState } from 'react'

export default function UsageGuideDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'nl' | 'json'>('nl')
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const samplePrompt = `请用柱状图展示下列产品销量，并开启悬浮提示：\n\n产品A 1200台\n产品B 1500台\n产品C 800台\n产品D 2000台\n产品E 900台\n产品F 1100台\n\n图表标题：产品销量（台）`

  const sampleJson = {
    data: [
      ['产品A', 1200],
      ['产品B', 1500],
      ['产品C', 800],
      ['产品D', 2000],
      ['产品E', 900],
      ['产品F', 1100]
    ],
    schema: [
      { name: 'product', type: 'string', description: '产品名称' },
      { name: 'sales', type: 'number', description: '销售数量' }
    ],
    chartType: 'bar',
    title: '产品销量（台）',
    axisLabels: { x: '产品', y: '销量（台）' },
    style: { theme: 'business', animation: true }
  }

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">选择输入方式</h3>
            <p className="text-[16px] text-gray-500 dark:text-gray-400">自然语言（推荐）或 MCP JSON，一分钟生成可交互图表</p>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            onClick={onClose}
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          <button
            className={`px-3 py-1.5 rounded-lg text-[16px] ${tab === 'nl' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}
            onClick={() => setTab('nl')}
          >
            自然语言（推荐）
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-[16px] ${tab === 'json' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}
            onClick={() => setTab('json')}
          >
            MCP JSON
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {tab === 'nl'
            ? '推荐：用一句话描述想要的图表，并粘贴数据；系统可自动识别单位与类别。'
            : '适用于需要精确控制图表类型、字段与样式的场景。复制下方示例后按需修改。'}
        </div>


        {/* Content */}
        <div className="mt-3 relative">
          <button
            className="absolute right-2 top-2 z-10 px-2 py-1 rounded-md text-[15px] bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700"
            onClick={() => copyText(tab === 'nl' ? samplePrompt : JSON.stringify(sampleJson, null, 2))}
            title="复制示例到剪贴板"
          >
            {copied ? '已复制' : '复制示例'}
          </button>

          {tab === 'nl' ? (
            <pre className="code-block whitespace-pre-wrap !text-[12px] leading-relaxed">{samplePrompt}</pre>
          ) : (
            <pre className="code-block overflow-auto !text-[12px]">{JSON.stringify(sampleJson, null, 2)}</pre>
          )}
        </div>

      </div>
    </div>
  )
}
