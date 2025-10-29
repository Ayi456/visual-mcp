import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import useAuth from '@/store/useAuth';
import ConversationView, { ConversationViewRef } from './components/ConversationView';
import ExecutionView from './components/ExecutionView';
import { ConnectionList } from './components/ConnectionList';
import QueryHistorySidebar from './components/QueryHistorySidebar';
import { useSqlChatStore } from './stores/useSqlChat';
import ResizablePanel from './components/ResizablePanel';
import { useConnectionStatus } from './hooks';
import { PANEL_CONFIG, STYLE_CLASSES } from './config/constants';
import { ConnectionStatusIndicator } from './components/common';
import type { Connection, Schema } from './types';
import './styles/sql-console.css';

const SqlConsole: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [showExecutionView, setShowExecutionView] = useState(true); // 默认显示结果面板
  const [showHistorySidebar, setShowHistorySidebar] = useState(false); // 默认隐藏历史侧边栏
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Schema | null>(null);
  const [showSettings, setShowSettings] = useState(false); // 设置面板

  // ConversationView 的 ref，用于插入表名
  const conversationViewRef = useRef<ConversationViewRef>(null);

  const { initSession, getCurrentSession, updateContext } = useSqlChatStore();
  const currentSession = getCurrentSession();
  const autoExecuteMode = currentSession?.context.preferences?.autoExecuteMode || 'manual';

  // 使用自定义Hook管理连接状态
  const { status: connStatus, message: connMessage } = useConnectionStatus(selectedConnection);

  // 处理数据库选择
  const handleDatabaseSelect = (database: string) => {
    setSelectedDatabase(database);
    console.log('已选择数据库:', database);
  };

  // 处理表选择（现在由 ConnectionList 直接处理）
  const handleTableSelect = (table: Schema) => {
    setSelectedTable(table);
    console.log('已选择表:', table.name, '列数:', table.columns?.length);
  };

  // 处理历史记录选择
  const handleSelectHistoryItem = (sql: string) => {
    // 通过ref将SQL插入到ConversationView的输入框中
    conversationViewRef.current?.insertText(sql);
    console.log('从历史记录选择SQL:', sql);
  };

  useEffect(() => {
    // 初始化
    const init = async () => {
      if (!user?.id) {
        // 未登录也允许进入页面（仅禁用需要用户的功能），避免无限 Loading
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // TODO: 加载用户连接
        // await loadConnections(user.id);
        // 初始化聊天会话
        await initSession(user.id);
      } catch (error) {
        console.error('Failed to initialize SQL Console:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [user?.id]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在初始化 SQL Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sql-console flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 左侧连接管理栏 */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 overflow-y-auto flex-shrink-0">
        <h2 className="text-lg font-semibold mb-4">数据库连接</h2>

        {/* 连接管理组件 */}
        <div className="flex-1 overflow-hidden">
          <ConnectionList
            onConnectionSelect={(conn) => {
              setSelectedConnection(conn);
              console.log('已选择连接:', conn);
            }}
            selectedConnectionId={selectedConnection?.id}
            onDatabaseSelect={handleDatabaseSelect}
            onTableSelect={handleTableSelect}
          />
        </div>
      </div>

      {/* 中间主要内容区 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 顶部工具栏 */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <button
                onClick={() => navigate(-1)}
                title="返回上一页"
                aria-label="返回上一页"
                className="px-2 py-1 inline-flex items-center gap-1 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">返回</span>
              </button>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex-shrink-0">
                SQL Chat
              </h1>

              {/* 连接状态 - 与标题并排 */}
              {selectedConnection ? (
                <div className="min-w-0 flex-1">
                  <ConnectionStatusIndicator
                    status={connStatus}
                    message={connStatus === 'connected'
                      ? `✓ ${selectedConnection.title} (${selectedConnection.host}:${selectedConnection.port}${selectedDatabase ? ` • ${selectedDatabase}` : ''})`
                      : connMessage
                    }
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-500 flex-shrink-0">
                  AI 驱动的 SQL 查询助手
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                  showHistorySidebar
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={showHistorySidebar ? '隐藏历史' : '显示历史'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                历史
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="设置"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                设置
              </button>
              <button
                onClick={() => setShowExecutionView(!showExecutionView)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {showExecutionView ? '隐藏结果' : '显示结果'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {showExecutionView ? (
            <ResizablePanel
              defaultTopHeight={PANEL_CONFIG.DEFAULT_TOP_HEIGHT}
              minTopHeight={PANEL_CONFIG.MIN_TOP_HEIGHT}
              maxTopHeight={PANEL_CONFIG.MAX_TOP_HEIGHT}
              storageKey={PANEL_CONFIG.STORAGE_KEY}
              topContent={
                <ConversationView 
                  ref={conversationViewRef}
                  currentConnection={selectedConnection}
                  selectedDatabase={selectedDatabase}
                />
              }
              bottomContent={
                <ExecutionView 
                  currentConnection={selectedConnection}
                />
              }
            />
          ) : (
            <ConversationView 
              ref={conversationViewRef}
              currentConnection={selectedConnection}
              selectedDatabase={selectedDatabase}
            />
          )}
        </div>
      </div>

      {/* 右侧查询历史侧边栏 */}
      {showHistorySidebar && (
        <QueryHistorySidebar
          onSelectHistoryItem={handleSelectHistoryItem}
          className="w-96 flex-shrink-0"
        />
      )}

      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SQL Chat 设置</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* SQL 自动执行模式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SQL 自动执行模式
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  控制 AI 生成 SQL 语句后的执行行为
                </p>
                <div className="space-y-2">
                  <label className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="radio"
                      name="autoExecuteMode"
                      value="manual"
                      checked={autoExecuteMode === 'manual'}
                      onChange={(e) => {
                        updateContext({
                          preferences: {
                            ...currentSession?.context.preferences,
                            autoExecuteMode: e.target.value as 'manual' | 'auto' | 'ask'
                          }
                        });
                      }}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">手动执行（推荐）</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        生成 SQL 后需要手动点击执行按钮，更安全可控
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="radio"
                      name="autoExecuteMode"
                      value="auto"
                      checked={autoExecuteMode === 'auto'}
                      onChange={(e) => {
                        updateContext({
                          preferences: {
                            ...currentSession?.context.preferences,
                            autoExecuteMode: e.target.value as 'manual' | 'auto' | 'ask'
                          }
                        });
                      }}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">自动执行</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        仅自动执行安全的 SELECT 查询，危险操作需手动确认
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors opacity-50">
                    <input
                      type="radio"
                      name="autoExecuteMode"
                      value="ask"
                      checked={autoExecuteMode === 'ask'}
                      onChange={(e) => {
                        updateContext({
                          preferences: {
                            ...currentSession?.context.preferences,
                            autoExecuteMode: e.target.value as 'manual' | 'auto' | 'ask'
                          }
                        });
                      }}
                      className="mt-1 mr-3"
                      disabled
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        询问模式
                        <span className="ml-2 text-xs text-gray-400">(即将推出)</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        每次生成 SQL 后弹窗询问是否执行
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 当前模式提示 */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>当前模式：</strong>
                    {autoExecuteMode === 'manual' && '手动执行'}
                    {autoExecuteMode === 'auto' && '自动执行'}
                    {autoExecuteMode === 'ask' && '询问模式'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SqlConsole;

