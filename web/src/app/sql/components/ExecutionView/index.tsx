import React, { useState } from 'react';
import DataTable from './DataTable';
import QueryStats from './QueryStats';
import { useSqlChatStore } from '../../stores/useSqlChat';
import { EmptyState, Badge } from '../common';

type TabType = 'results' | 'stats' | 'messages';

const ExecutionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('results');
  const { getCurrentSession } = useSqlChatStore();
  
  const currentSession = getCurrentSession();
  // 优先使用最新的系统/助手结果消息（执行器或 AI 返回的结果）
  const lastMessage = currentSession?.messages
    .filter(msg => !!msg.result)
    .pop();
  
  const result = lastMessage?.result;
  const sql = lastMessage?.sql;

  // 调试输出
  React.useEffect(() => {
    if (result) {
      console.log('ExecutionView: 有查询结果', {
        result,
        lastMessage,
        columns: result.columns,
        rows: result.rows,
        rowCount: result.rowCount
      });
    } else {
      console.log('ExecutionView: 没有查询结果', {
        messagesWithResult: currentSession?.messages.filter(msg => !!msg.result)
      });
    }
  }, [result, currentSession?.messages]);

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'results', label: '查询结果', count: result?.rowCount },
    { key: 'stats', label: '统计信息' },
    { key: 'messages', label: '消息' }
  ];

  return (
    <div className="execution-view">
      {/* 标签栏 */}
      <div className="result-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`result-tab ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <Badge variant="default" className="ml-2">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4 overflow-auto relative">
        {activeTab === 'results' && (
          <>
            {result ? (
              <DataTable data={result} />
            ) : (
              <EmptyState
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="暂无查询结果"
                description="执行 SQL 查询后，结果将显示在这里"
              />
            )}
          </>
        )}

        {activeTab === 'stats' && (
          <div className="w-full h-full">
            {result ? (
              <QueryStats result={result} sql={sql} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <EmptyState
                  icon={
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                  title="暂无统计信息"
                  description="执行查询后，统计信息将显示在这里"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="w-full h-full">
            {result ? (
              <div className="space-y-2">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">查询成功</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">返回 {result.rowCount} 行数据</p>
                      {result.executionTime && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">执行时间: {result.executionTime}ms</p>
                      )}
                      {result.affectedRows !== undefined && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">影响行数: {result.affectedRows}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <EmptyState
                  icon={
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  }
                  title="暂无消息"
                  description="执行查询后，消息将显示在这里"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionView;