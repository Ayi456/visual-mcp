import PlaceholderPage, { ChatIcon } from '@/components/ui/PlaceholderPage'

export default function ChatPage() {
  return (
    <PlaceholderPage
      title="AI 聊天助手"
      description="智能对话功能正在开发中，即将支持流式对话、代码高亮、Markdown 渲染等强大功能。"
      icon={<ChatIcon />}
      iconColor="from-green-500 to-emerald-600"
      features={[
        'SSE 流式输出',
        '代码语法高亮',
        '会话历史管理'
      ]}
    />
  )
}

