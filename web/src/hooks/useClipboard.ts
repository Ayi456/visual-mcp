
import { useState, useCallback } from 'react'

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState<string>('')

  const copyToClipboard = useCallback(async (text: string, type: string = 'default') => {
    try {
      // 优先使用现代 API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      setCopied(type)
      setTimeout(() => setCopied(''), timeout)
      return true
    } catch (error) {
      console.error('复制失败:', error)
      return false
    }
  }, [timeout])

  const isCopied = useCallback((type: string = 'default') => {
    return copied === type
  }, [copied])

  return {
    copyToClipboard,
    isCopied,
    copied
  }
}
