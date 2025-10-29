import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import MessageView from './MessageView';
import MessageInput, { MessageInputRef } from './MessageInput';
import SqlEditor from '../SqlEditor';
import { useSqlChatStore } from '../../stores/useSqlChat';
import { sqlApiService } from '../../services/sqlApiService';
import { EDITOR_CONFIG, ERROR_MESSAGES, CHAT_CONFIG } from '../../config/constants';
import { LoadingSpinner, EmptyState } from '../common';
import type { ChatMessage, Connection } from '../../types';

interface Props {
  currentConnection?: Connection | null;
  selectedDatabase?: string | null;
}

export interface ConversationViewRef {
  insertText: (text: string) => void;
}

const ConversationView = forwardRef<ConversationViewRef, Props>(({ currentConnection, selectedDatabase }, ref) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<MessageInputRef>(null);
  const [showSqlEditor, setShowSqlEditor] = useState(false);
  const [sqlEditorValue, setSqlEditorValue] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  // 暴露插入文本的方法给父组件
  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      messageInputRef.current?.insertText(text);
    }
  }));
  
  const { 
    getCurrentSession, 
    sendMessage,
    addMessage, 
    isLoading, 
    error 
  } = useSqlChatStore();
  
  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];
  const displayMessages = messages.filter(m => m.role !== 'system');

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // 传递当前选中的数据库信息给 AI
    // 需要修改 sendMessage 的签名来接收 database 参数
    const database = selectedDatabase || currentConnection?.database;
    console.log('发送消息给 AI，使用数据库:', database);
    
    await sendMessage(message, currentConnection || undefined, database);
  };

  const handleExecuteSql = async () => {
    if (!sqlEditorValue.trim()) return;
    
    if (!currentConnection) {
      console.error(ERROR_MESSAGES.NO_CONNECTION);
      alert(ERROR_MESSAGES.NO_CONNECTION);
      return;
    }
    
    console.log('Execute SQL: 开始执行', sqlEditorValue);
    setIsExecuting(true);
    
    try {

      // 使用当前选中的数据库，如果没有则使用连接配置中的数据库
      const databaseToUse = selectedDatabase || currentConnection.database || '';
      
      if (!databaseToUse) {
        throw new Error('No database selected. Please select a database first.');
      }
      
      console.log('使用数据库:', databaseToUse);
      
      const execResult = await sqlApiService.executeQuery(
        currentConnection,
        databaseToUse,
        sqlEditorValue
      );
      
      const rows = execResult.rows || execResult.data || [];
      const columns = execResult.fields?.map((f: any) => f.name) || (rows[0] ? Object.keys(rows[0]) : []);
      const queryResult = {
        columns,
        rows,
        rowCount: Array.isArray(rows) ? rows.length : 0,
        executionTime: execResult.executionTime || 0,
        affectedRows: execResult.affectedRows
      };
      
      // 添加系统类结果消息（仅用于 ExecutionView 展示，不进入对话区）
      const resultMessage = {
        id: Date.now().toString() + '-result',
        role: 'system' as const,
        content: `SQL 执行完成，返回 ${queryResult.rowCount} 行数据`,
        sql: sqlEditorValue,
        result: queryResult,
        timestamp: new Date()
      };
      
      console.log('添加结果消息到 store:', resultMessage);
      addMessage(resultMessage);
      
      console.log(`查询成功，返回 ${queryResult.rowCount} 行数据, 结果:`, queryResult);
      
      // 触发一个事件或者回调来显示结果面板
      // 由于结果已经存储在store中，面板会自动更新
      
      // 清空编辑器（可选）
      // setSqlEditorValue('');
      
    } catch (error: any) {
      console.error('SQL execution error:', error);
      
      // 添加错误消息
      addMessage({
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: `查询失败: ${error.message || '未知错误'}`,
        timestamp: new Date()
      });
      
      console.error(error.message || 'SQL 执行失败');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSqlEditorChange = (value: string | undefined) => {
    setSqlEditorValue(value || '');
  };

  return (
    <div className="conversation-view flex flex-col h-full overflow-hidden">
      {/* SQL Editor Toggle Button */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-gray-700 dark:text-gray-300">SQL Console</span>
        </div>
        <button
          onClick={() => setShowSqlEditor(!showSqlEditor)}
          className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={showSqlEditor ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
          </svg>
          {showSqlEditor ? 'Hide' : 'Show'} SQL Editor
        </button>
      </div>

      {/* SQL Editor Panel */}
      {showSqlEditor && (
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Write and execute SQL queries directly
            </h3>
            <button
              onClick={handleExecuteSql}
              disabled={!sqlEditorValue.trim() || isExecuting || !currentConnection}
              className="px-4 py-1.5 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2">
              {isExecuting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Executing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Execute Query
                </>
              )}
            </button>
          </div>
          <div className="overflow-hidden">
            <SqlEditor
              value={sqlEditorValue}
              onChange={handleSqlEditorChange}
              onExecute={handleExecuteSql}
              height={EDITOR_CONFIG.DEFAULT_HEIGHT}
            />
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="message-list flex-1 overflow-y-auto">
            {displayMessages.length === 0 ? (
          <EmptyState
            icon={
              <svg 
                className="w-12 h-12"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            }
            title="开始对话"
            description="输入您的 SQL 查询需求，AI 将为您生成相应的 SQL 语句"
          />
        ) : (
          <>
            {displayMessages.map((message) => (
              <MessageView
                key={message.id}
                message={message}
                connection={currentConnection || undefined}
                database={selectedDatabase || currentConnection?.database}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start p-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex-shrink-0">
        <MessageInput 
          ref={messageInputRef}
          onSend={handleSendMessage} 
          disabled={isLoading || !currentSession}
        />
      </div>
    </div>
  );
});

ConversationView.displayName = 'ConversationView';

export default ConversationView;
