import React, { useState } from 'react';
import type { ChatMessage } from '../../types';
import SqlHighlight from './SqlHighlight';
import { ErrorMessage } from '../common';
import { useSqlChatStore } from '../../stores/useSqlChat';
import { checkSqlSafety } from '../../utils/sqlSafety';

interface MessageViewProps {
  message: ChatMessage;
  connection?: any;
  database?: string;
}

const MessageView: React.FC<MessageViewProps> = ({ message, connection, database }) => {
  const isUser = message.role === 'user';
  const executeMessage = useSqlChatStore(state => state.executeMessage);
  const isLoading = useSqlChatStore(state => state.isLoading);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!message.sql || !connection || !database || isExecuting) return;

    setIsExecuting(true);
    try {
      await executeMessage(message.id, connection, database);
    } finally {
      setIsExecuting(false);
    }
  };

  const safetyCheck = message.sql ? checkSqlSafety(message.sql) : null;

  // 调试输出
  React.useEffect(() => {
    if (message.result) {
      console.log('MessageView: 消息包含结果', {
        messageId: message.id,
        role: message.role,
        executed: message.executed,
        autoExecuted: message.autoExecuted,
        result: message.result,
        columns: message.result.columns,
        rows: message.result.rows,
        rowCount: message.result.rowCount
      });
    }
  }, [message]);
  
  return (
    <div className={`message-item ${message.role}`}>
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`message-bubble ${message.role}`}>
          <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

          {message.sql && (
            <div className="mt-3">
              <SqlHighlight sql={message.sql} />

              {/* 执行控制按钮 */}
              <div className="flex items-center gap-2 mt-3">
                {!message.executed && connection && database && (
                  <button
                    onClick={handleExecute}
                    disabled={isExecuting || isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                    title="执行此 SQL 查询"
                  >
                    {isExecuting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        执行中...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        执行查询
                      </>
                    )}
                  </button>
                )}

                {message.executed && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {message.autoExecuted ? '已自动执行' : '已执行'}
                  </div>
                )}

                {safetyCheck && !safetyCheck.safe && (
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${
                    safetyCheck.dangerLevel === 'danger'
                      ? 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                      : 'text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400'
                  }`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {safetyCheck.dangerLevel === 'danger' ? '高危操作' : '写操作'}
                  </div>
                )}
              </div>
            </div>
          )}

          {message.result && (
            <div className="mt-3 text-sm">
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                查询结果: {message.result.rowCount} 行
              </p>
              {message.result.executionTime && (
                <p className="text-gray-500 dark:text-gray-400">
                  执行时间: {message.result.executionTime}ms
                </p>
              )}
            </div>
          )}

          {/* 错误信息 */}
          {message.error && (
            <ErrorMessage 
              message={message.error}
              className="mt-3"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageView;