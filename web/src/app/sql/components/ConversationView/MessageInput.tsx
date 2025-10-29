import React, { useState, useRef, KeyboardEvent, useImperativeHandle, forwardRef } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export interface MessageInputRef {
  insertText: (text: string) => void;
  focus: () => void;
}

const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(({ onSend, disabled = false }, ref) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      setMessage((prev) => {
        const newMessage = prev ? `${prev} ${text}` : text;
        return newMessage;
      });
      // 聚焦到输入框
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    },
    focus: () => {
      textareaRef.current?.focus();
    }
  }));

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const quickPrompts = [
    '显示所有表',
    '查询用户数量',
    '最近的订单',
    '数据统计'
  ];

  return (
    <div className="message-input-container">
      {message.length === 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setMessage(prompt)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? '请先初始化会话...' : '输入您的需求，例如：查询最近7天的订单...'}
          disabled={disabled}
          className="message-input flex-1 resize-none min-h-[44px] max-h-[200px]"
          rows={1}
        />
        
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            disabled || !message.trim()
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        按 Enter 发送，Shift+Enter 换行
      </p>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
